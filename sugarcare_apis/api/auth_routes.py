from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Header, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, EmailStr, Field, model_validator, field_validator
from sqlalchemy.orm import Session
from db import get_db
from db import models as dbm
from services.auth import hash_password, verify_password, create_access_token, create_refresh_token, decode_token, hash_token
from services.email_sender import smtp_health_check
from utils.email_utils import send_verification_email
from utils.validation import validate_password_strength, validate_full_name, check_failed_login_attempts, record_failed_login, check_otp_rate_limit, check_otp_verify_attempts
from api.response_models import SuccessResponse, ErrorResponse
import secrets
import logging
logger = logging.getLogger(__name__)

def build_profile_image_url(request: Request, filename: str) -> Optional[str]:
    if not filename:
        return None
    from services.utils import build_absolute_url
    return build_absolute_url(request, f'/static/images/profiles/{filename}')
auth_router = APIRouter(prefix='/api/v1/auth', tags=['Auth'])

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=256)
    confirm_password: str = Field(min_length=8, max_length=256)
    full_name: str = Field(min_length=1, max_length=100)
    gender: Optional[str] = Field(default=None, pattern='^(?i)(male|female|other)$')
    dob: Optional[str] = Field(default=None, max_length=20)
    age: Optional[int] = Field(default=None, ge=13, le=120)
    height_cm: Optional[int] = Field(default=None, ge=30, le=300)
    weight_kg: Optional[int] = Field(default=None, ge=10, le=500)
    diabetes_type: Optional[str] = Field(default=None, max_length=100)
    cholesterol_mg_dl: Optional[int] = Field(default=None, ge=50, le=400)
    using_insulin: Optional[bool] = False
    hba1c: Optional[float] = Field(default=None, ge=0, le=20, description='HbA1c level')
    diet_type: Optional[str] = Field(default='balanced', pattern='^(?i)(balanced|high_carb|low_carb)$', description='Diet type: balanced, high_carb, low_carb')
    activity_level: Optional[str] = Field(default='moderate', pattern='^(?i)(low|moderate|high)$', description='Activity level: low, moderate, high')

    @field_validator('email')
    def email_lowercase_only(cls, v):
        if v and any((c.isupper() for c in str(v))):
            raise ValueError('Email must not contain capital letters. Use lowercase only.')
        return v.lower() if v else v

    @field_validator('password')
    def validate_password(cls, v):
        is_valid, error_msg = validate_password_strength(v)
        if not is_valid:
            raise ValueError(error_msg)
        return v

    @field_validator('full_name')
    def validate_full_name_field(cls, v):
        is_valid, error_msg = validate_full_name(v)
        if not is_valid:
            raise ValueError(error_msg)
        return v

    @model_validator(mode='after')
    def validate_passwords_match(cls, values):
        if values.password != values.confirm_password:
            raise ValueError('Passwords do not match')
        if values.age is None and (values.dob is None or str(values.dob).strip() == ''):
            raise ValueError("At least one of 'age' or 'dob' must be provided")
        return values
    model_config = {'json_schema_extra': {'examples': [{'email': 'user@example.com', 'password': 'SecurePass123', 'confirm_password': 'SecurePass123', 'full_name': 'John Doe', 'age': 35, 'gender': 'male', 'height_cm': 175, 'weight_kg': 75, 'diabetes_type': 'Type 2', 'cholesterol_mg_dl': 180, 'using_insulin': False, 'hba1c': 6.4, 'diet_type': 'balanced', 'activity_level': 'moderate'}]}}

class AuthTokens(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = 'bearer'

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=256)

class RefreshRequest(BaseModel):
    refresh_token: str

class LogoutRequest(BaseModel):
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None

    @model_validator(mode='after')
    def validate_at_least_one_token(cls, values):
        if not values.access_token and (not values.refresh_token):
            raise ValueError('At least one token (access_token or refresh_token) is required')
        return values

class OTPSendRequest(BaseModel):
    purpose: Optional[str] = Field(default='reset_pw', pattern='^(email_verify|login|reset_pw)$')
    email: EmailStr

class OTPVerifyRequest(BaseModel):
    purpose: Optional[str] = Field(default='reset_pw', pattern='^(email_verify|login|reset_pw)$')
    email: EmailStr
    code: str = Field(min_length=6, max_length=6, pattern='^[0-9]{6}$')

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    new_password: str = Field(min_length=8, max_length=256)
    confirm_password: str = Field(min_length=8, max_length=256)

    @field_validator('new_password')
    def validate_password(cls, v):
        is_valid, error_msg = validate_password_strength(v)
        if not is_valid:
            raise ValueError(error_msg)
        return v

    @model_validator(mode='after')
    def validate_passwords_match(cls, values):
        if values.new_password != values.confirm_password:
            raise ValueError('Passwords do not match')
        return values
    model_config = {'json_schema_extra': {'examples': [{'email': 'user@example.com', 'new_password': 'NewSecurePass123', 'confirm_password': 'NewSecurePass123'}]}}

@auth_router.post('/register')
def register(request: Request, payload: RegisterRequest, db: Session=Depends(get_db)) -> JSONResponse:
    exists = db.query(dbm.User).filter(dbm.User.email == payload.email).first()
    if exists:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={'error': f'Email already exists: {payload.email}', 'success': False, 'message': 'Email already registered'})
    user = dbm.User(email=str(payload.email), password_hash=hash_password(payload.password), is_email_verified=1, created_at=datetime.now(timezone.utc), updated_at=datetime.now(timezone.utc))
    db.add(user)
    db.flush()
    diet_type_val = (payload.diet_type or 'balanced').lower()
    activity_level_val = (payload.activity_level or 'moderate').lower()
    profile = dbm.UserProfile(user_id=user.id, name=payload.full_name, gender=payload.gender, age=payload.age, height_cm=payload.height_cm, weight_kg=payload.weight_kg, diabetes_type=payload.diabetes_type, cholesterol_mg_dl=payload.cholesterol_mg_dl, using_insulin=bool(payload.using_insulin or False), hba1c=payload.hba1c, diet_type=diet_type_val, activity_level=activity_level_val)
    db.add(profile)
    session = dbm.Session(user_id=user.id, refresh_token_hash='', user_agent=None, ip=None, expires_at=datetime.now(timezone.utc) + timedelta(days=30), created_at=datetime.now(timezone.utc))
    db.add(session)
    db.commit()
    access = create_access_token(user.id, {'email': user.email})
    refresh = create_refresh_token(session.id, user.id)
    profile_image_url = None
    if profile and profile.profile_image:
        profile_image_url = f'/static/images/profiles/{profile.profile_image}'
    user_data = {'id': user.id, 'email': user.email, 'name': profile.name if profile else None, 'dob': profile.dob if profile else None, 'age': profile.age if profile else None, 'height_cm': profile.height_cm if profile else None, 'weight_kg': profile.weight_kg if profile else None, 'gender': profile.gender if profile else None, 'diabetes_type': profile.diabetes_type if profile else None, 'cholesterol_mg_dl': profile.cholesterol_mg_dl if profile else None, 'using_insulin': bool(profile.using_insulin) if profile else False, 'hba1c': profile.hba1c if profile else None, 'diet_type': profile.diet_type if profile else 'balanced', 'activity_level': profile.activity_level if profile else 'moderate', 'profile_image': profile_image_url, 'created_at': user.created_at.isoformat() if user.created_at else None, 'updated_at': user.updated_at.isoformat() if user.updated_at else None}
    return JSONResponse(status_code=status.HTTP_201_CREATED, content={'success': True, 'message': 'Account created successfully!', 'access_token': access, 'refresh_token': refresh, 'token_type': 'bearer', 'data': user_data})

@auth_router.post('/login')
def login(request: Request, payload: LoginRequest, db: Session=Depends(get_db)) -> JSONResponse:
    user = db.query(dbm.User).filter(dbm.User.email == str(payload.email)).first()
    if user:
        is_locked, lockout_msg = check_failed_login_attempts(user.id, db)
        if is_locked:
            return JSONResponse(status_code=status.HTTP_429_TOO_MANY_REQUESTS, content={'error': f'Account locked: {lockout_msg}', 'success': False, 'message': lockout_msg})
    if not user or not verify_password(payload.password, user.password_hash):
        if user:
            record_failed_login(user.id, db)
        error_detail = 'Invalid credentials: Email or password is incorrect'
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={'error': error_detail, 'success': False, 'message': 'Check your email or password.'})
    session = dbm.Session(user_id=user.id, refresh_token_hash='', user_agent=None, ip=None, expires_at=datetime.now(timezone.utc) + timedelta(days=30), created_at=datetime.now(timezone.utc))
    db.add(session)
    db.commit()
    access = create_access_token(user.id, {'email': user.email})
    refresh = create_refresh_token(session.id, user.id)
    profile = db.query(dbm.UserProfile).filter(dbm.UserProfile.user_id == user.id).first()
    profile_image_url = None
    if profile and profile.profile_image:
        profile_image_url = build_profile_image_url(request, profile.profile_image)
    user_data = {'id': user.id, 'email': user.email, 'name': profile.name if profile else None, 'dob': profile.dob if profile else None, 'age': profile.age if profile else None, 'height_cm': profile.height_cm if profile else None, 'weight_kg': profile.weight_kg if profile else None, 'gender': profile.gender if profile else None, 'diabetes_type': profile.diabetes_type if profile else None, 'cholesterol_mg_dl': profile.cholesterol_mg_dl if profile else None, 'using_insulin': bool(profile.using_insulin) if profile else False, 'hba1c': profile.hba1c if profile else None, 'diet_type': profile.diet_type if profile else 'balanced', 'activity_level': profile.activity_level if profile else 'moderate', 'profile_image': profile_image_url, 'created_at': user.created_at.isoformat() if user.created_at else None, 'updated_at': user.updated_at.isoformat() if user.updated_at else None}
    return JSONResponse(status_code=status.HTTP_200_OK, content={'success': True, 'message': 'Login successful', 'access_token': access, 'refresh_token': refresh, 'token_type': 'bearer', 'data': user_data})

@auth_router.post('/otp/send')
def send_otp(payload: OTPSendRequest, db: Session=Depends(get_db)) -> JSONResponse:
    user = db.query(dbm.User).filter(dbm.User.email == str(payload.email)).first()
    if not user:
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={'error': f'User not found: No account exists with email {payload.email}', 'success': False, 'message': 'User not exist'})
    is_rate_limited, error_msg = check_otp_rate_limit(user.id, db, max_requests=3, window_minutes=10)
    if is_rate_limited:
        return JSONResponse(status_code=status.HTTP_429_TOO_MANY_REQUESTS, content={'error': f'Rate limit exceeded: {error_msg}', 'success': False, 'message': error_msg})
    purpose = payload.purpose or 'reset_pw'
    db.query(dbm.OTPCode).filter(dbm.OTPCode.user_id == user.id, dbm.OTPCode.purpose == purpose).delete()
    code = f'{secrets.randbelow(1000000):06d}'
    code_hash = hash_password(code)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    otp = dbm.OTPCode(user_id=user.id, purpose=purpose, code_hash=code_hash, expires_at=expires_at, attempts=0, created_at=datetime.now(timezone.utc))
    db.add(otp)
    db.commit()
    try:
        ok = send_verification_email(str(payload.email), code)
        if not ok:
            logger.error(f'Failed to send password reset OTP email to {payload.email}. OTP code: {code}')
            return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content={'error': f'SMTP send failed: Unable to send OTP email to {payload.email}. Check SMTP configuration and credentials.', 'success': False, 'message': 'Failed to send OTP email. Please try again later.'})
    except Exception as e:
        logger.error(f'Exception while sending password reset OTP email to {payload.email}: {str(e)}', exc_info=True)
        return JSONResponse(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, content={'error': f'SMTP error: {str(e)}. Check SMTP server configuration, network connectivity, and credentials.', 'success': False, 'message': 'An error occurred while sending the OTP email. Please try again later.'})
    return JSONResponse(status_code=status.HTTP_200_OK, content={'success': True, 'message': 'OTP sent to your email for password reset (valid for 10 minutes).'})

@auth_router.post('/otp/verify')
def verify_otp(payload: OTPVerifyRequest, db: Session=Depends(get_db)) -> JSONResponse:
    user = db.query(dbm.User).filter(dbm.User.email == str(payload.email)).first()
    if not user:
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={'error': f'User not found: No account exists with email {payload.email}', 'success': False, 'message': 'User not exist'})
    purpose = payload.purpose or 'reset_pw'
    otp: Optional[dbm.OTPCode] = db.query(dbm.OTPCode).filter(dbm.OTPCode.user_id == user.id, dbm.OTPCode.purpose == purpose).order_by(dbm.OTPCode.created_at.desc()).first()
    if not otp:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={'error': f'No OTP code found for user {payload.email} with purpose {purpose}. Request a new OTP first.', 'success': False, 'message': 'No OTP found. Please request a new one for password reset.'})
    now = datetime.now(timezone.utc)
    expires_at = otp.expires_at if otp.expires_at.tzinfo else otp.expires_at.replace(tzinfo=timezone.utc)
    if expires_at < now:
        expired_minutes = int((now - expires_at).total_seconds() / 60)
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={'error': f'OTP expired: Code was valid until {expires_at.isoformat()}, but current time is {now.isoformat()} ({expired_minutes} minutes ago). Request a new OTP.', 'success': False, 'message': 'OTP has expired. Please request a new one for password reset.'})
    is_locked, error_msg = check_otp_verify_attempts(otp, max_attempts=3)
    if is_locked:
        return JSONResponse(status_code=status.HTTP_429_TOO_MANY_REQUESTS, content={'error': f'OTP verification attempts exceeded: {error_msg}', 'success': False, 'message': error_msg})
    otp.attempts += 1
    if not verify_password(payload.code, otp.code_hash):
        db.commit()
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={'error': f"Invalid OTP code: The provided code '{payload.code}' does not match the code sent to {payload.email}. Attempts remaining: {3 - otp.attempts}", 'success': False, 'message': 'Invalid OTP code. Please try again.'})
    db.query(dbm.OTPCode).filter(dbm.OTPCode.user_id == user.id, dbm.OTPCode.purpose == purpose).delete()
    db.commit()
    return JSONResponse(status_code=status.HTTP_200_OK, content={'success': True, 'message': 'OTP verified successfully. You can now reset your password.'})

@auth_router.post('/refresh')
def refresh_tokens(payload: RefreshRequest, db: Session=Depends(get_db)) -> JSONResponse:
    try:
        decoded = decode_token(payload.refresh_token)
    except Exception as e:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={'error': f'Token decode failed: {str(e)}. Token may be malformed, expired, or signed with wrong secret.', 'success': False, 'message': 'Invalid refresh token'})
    if decoded.get('type') != 'refresh':
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={'error': f"Invalid token type: Expected 'refresh' but got '{decoded.get('type')}'. This endpoint requires a refresh token.", 'success': False, 'message': 'Invalid token type'})
    token_hash = hash_token(payload.refresh_token)
    blacklisted = db.query(dbm.TokenBlacklist).filter(dbm.TokenBlacklist.token_hash == token_hash).first()
    if blacklisted:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={'error': f"Token revoked: Refresh token has been blacklisted (revoked at {(blacklisted.revoked_at.isoformat() if blacklisted.revoked_at else 'unknown')}). Please login again.", 'success': False, 'message': 'Token has been revoked. Please login again.'})
    session_id = decoded.get('sid')
    user_id = decoded.get('sub')
    session = db.query(dbm.Session).filter(dbm.Session.id == str(session_id), dbm.Session.user_id == str(user_id)).first()
    if not session:
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={'error': f'Session not found: Session with ID {session_id} for user {user_id} does not exist in database.', 'success': False, 'message': 'Session expired'})
    expires_at = session.expires_at
    if expires_at and expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at and expires_at < datetime.now(timezone.utc):
        expired_minutes = int((datetime.now(timezone.utc) - expires_at).total_seconds() / 60)
        return JSONResponse(status_code=status.HTTP_401_UNAUTHORIZED, content={'error': f'Session expired: Session expired at {expires_at.isoformat()} ({expired_minutes} minutes ago). Please login again.', 'success': False, 'message': 'Session expired'})
    access = create_access_token(user_id)
    refresh = create_refresh_token(session_id, user_id)
    return JSONResponse(status_code=status.HTTP_200_OK, content={'success': True, 'message': 'Tokens refreshed successfully', 'access_token': access, 'refresh_token': refresh, 'token_type': 'bearer'})

@auth_router.post('/logout')
def logout(payload: LogoutRequest, db: Session=Depends(get_db)) -> JSONResponse:
    user_id = None
    session_id = None
    if payload.refresh_token:
        try:
            decoded_refresh = decode_token(payload.refresh_token)
            if decoded_refresh.get('type') == 'refresh':
                session_id = decoded_refresh.get('sid')
                user_id = decoded_refresh.get('sub')
                if session_id:
                    db.query(dbm.Session).filter(dbm.Session.id == str(session_id)).delete()
                expires_at = datetime.fromtimestamp(decoded_refresh.get('exp', 0), tz=timezone.utc)
                token_hash = hash_token(payload.refresh_token)
                existing = db.query(dbm.TokenBlacklist).filter(dbm.TokenBlacklist.token_hash == token_hash).first()
                if not existing:
                    blacklist_entry = dbm.TokenBlacklist(token_hash=token_hash, token_type='refresh', user_id=str(user_id), expires_at=expires_at)
                    db.add(blacklist_entry)
        except Exception:
            pass
    if payload.access_token:
        try:
            decoded_access = decode_token(payload.access_token)
            if decoded_access.get('type') == 'access':
                if not user_id:
                    user_id = decoded_access.get('sub')
                expires_at = datetime.fromtimestamp(decoded_access.get('exp', 0), tz=timezone.utc)
                token_hash = hash_token(payload.access_token)
                existing = db.query(dbm.TokenBlacklist).filter(dbm.TokenBlacklist.token_hash == token_hash).first()
                if not existing:
                    blacklist_entry = dbm.TokenBlacklist(token_hash=token_hash, token_type='access', user_id=str(user_id), expires_at=expires_at)
                    db.add(blacklist_entry)
        except Exception:
            pass
        db.commit()
    return JSONResponse(status_code=status.HTTP_200_OK, content={'success': True, 'message': 'Logged out successfully. All tokens have been revoked.'})

def get_current_user(authorization: Optional[str]=Header(None), db: Session=Depends(get_db)) -> dbm.User:
    if not authorization or not authorization.lower().startswith('bearer '):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Missing token')
    token = authorization.split(' ', 1)[1]
    token_hash = hash_token(token)
    blacklisted = db.query(dbm.TokenBlacklist).filter(dbm.TokenBlacklist.token_hash == token_hash).first()
    if blacklisted:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token has been revoked. Please login again.')
    try:
        decoded = decode_token(token)
    except Exception:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token')
    if decoded.get('type') != 'access':
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token type')
    user_id = decoded.get('sub')
    user = db.query(dbm.User).filter(dbm.User.id == str(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='User not found')
    return user

class MeResponse(BaseModel):
    id: str
    email: EmailStr
    created_at: Optional[datetime] = Field(None, description='Account creation timestamp (ISO 8601 format: YYYY-MM-DDTHH:MM:SS.ffffffZ)')
    updated_at: Optional[datetime] = Field(None, description='Last update timestamp (ISO 8601 format: YYYY-MM-DDTHH:MM:SS.ffffffZ)')

@auth_router.get('/me')
def me(request: Request, user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    profile = db.query(dbm.UserProfile).filter(dbm.UserProfile.user_id == user.id).first()
    profile_image_url = None
    if profile and profile.profile_image:
        profile_image_url = build_profile_image_url(request, profile.profile_image)
    user_data = {'id': user.id, 'email': user.email, 'name': profile.name if profile else None, 'dob': profile.dob if profile else None, 'age': profile.age if profile else None, 'height_cm': profile.height_cm if profile else None, 'weight_kg': profile.weight_kg if profile else None, 'gender': profile.gender if profile else None, 'diabetes_type': profile.diabetes_type if profile else None, 'cholesterol_mg_dl': profile.cholesterol_mg_dl if profile else None, 'using_insulin': bool(profile.using_insulin) if profile else False, 'hba1c': profile.hba1c if profile else None, 'diet_type': profile.diet_type if profile else 'balanced', 'activity_level': profile.activity_level if profile else 'moderate', 'profile_image': profile_image_url, 'created_at': user.created_at.isoformat() if user.created_at else None, 'updated_at': user.updated_at.isoformat() if user.updated_at else None}
    return JSONResponse(status_code=status.HTTP_200_OK, content={'success': True, 'message': 'User information retrieved', 'data': user_data})

@auth_router.post('/reset-password')
def reset_password(payload: ResetPasswordRequest, db: Session=Depends(get_db)) -> JSONResponse:
    user = db.query(dbm.User).filter(dbm.User.email == str(payload.email)).first()
    if not user:
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={'error': f'User not found: No account exists with email {payload.email}', 'success': False, 'message': 'User not exist'})
    purpose = 'reset_pw'
    otp: Optional[dbm.OTPCode] = db.query(dbm.OTPCode).filter(dbm.OTPCode.user_id == user.id, dbm.OTPCode.purpose == purpose).order_by(dbm.OTPCode.created_at.desc()).first()
    if otp:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={'error': f'OTP not verified: OTP code for {payload.email} exists but has not been verified. Please call /api/v1/auth/otp/verify first.', 'success': False, 'message': 'Please verify OTP first using /api/v1/auth/otp/verify endpoint.'})
    if verify_password(payload.new_password, user.password_hash):
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={'error': 'Password unchanged: The new password is identical to the current password. Please choose a different password.', 'success': False, 'message': 'Your new password must be different from your previous password.'})
    user.password_hash = hash_password(payload.new_password)
    user.updated_at = datetime.now(timezone.utc)
    db.commit()
    return JSONResponse(status_code=status.HTTP_200_OK, content={'success': True, 'message': 'Password reset successfully. You can now login with your new password.'})

@auth_router.delete('/user/{user_id}')
def delete_user(user_id: str, db: Session=Depends(get_db)) -> JSONResponse:
    user = db.query(dbm.User).filter(dbm.User.id == user_id).first()
    if not user:
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content={'error': f'User not found: No user exists with ID {user_id}', 'success': False, 'message': 'User not found'})
    db.query(dbm.UserProfile).filter(dbm.UserProfile.user_id == user_id).delete()
    db.query(dbm.Session).filter(dbm.Session.user_id == user_id).delete()
    db.query(dbm.OTPCode).filter(dbm.OTPCode.user_id == user_id).delete()
    db.query(dbm.TokenBlacklist).filter(dbm.TokenBlacklist.user_id == user_id).delete()
    db.delete(user)
    db.commit()
    return JSONResponse(status_code=status.HTTP_200_OK, content={'success': True, 'message': 'User deleted successfully'})

@auth_router.get('/smtp-health')
def smtp_health() -> JSONResponse:
    ok = smtp_health_check()
    return JSONResponse(status_code=status.HTTP_200_OK, content={'success': True, 'message': 'SMTP health check completed', 'data': {'ok': ok}})
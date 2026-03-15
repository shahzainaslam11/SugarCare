from datetime import datetime, timezone
from typing import Optional, cast, Any
from pathlib import Path
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, model_validator, field_validator
from sqlalchemy.orm import Session
from PIL import Image
import io
from config import logger
from db import get_db
from db import models as dbm
from api.auth_routes import get_current_user
from api.response_models import SuccessResponse, ErrorResponse
from utils.validation import validate_full_name
from services.utils import build_absolute_url
profile_router = APIRouter(prefix='/api/v1/profile', tags=['User Profile'])

def build_profile_image_url(request: Request, filename: Optional[str]) -> Optional[str]:
    if not filename:
        return None
    return build_absolute_url(request, f'/static/images/profiles/{filename}')

class UserProfileResponse(BaseModel):
    id: str
    email: str
    name: Optional[str] = None
    dob: Optional[str] = None
    age: Optional[int] = None
    height_cm: Optional[int] = None
    weight_kg: Optional[int] = None
    gender: Optional[str] = None
    diabetes_type: Optional[str] = None
    cholesterol_mg_dl: Optional[int] = None
    using_insulin: bool = False
    hba1c: Optional[float] = None
    diet_type: Optional[str] = None
    activity_level: Optional[str] = None
    profile_image: Optional[str] = None
    created_at: Optional[datetime] = Field(None, description='Creation timestamp (ISO 8601 format: YYYY-MM-DDTHH:MM:SS.ffffffZ)')
    updated_at: Optional[datetime] = Field(None, description='Last update timestamp (ISO 8601 format: YYYY-MM-DDTHH:MM:SS.ffffffZ)')

class UpdateUserProfileRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=50)
    dob: Optional[str] = Field(default=None, max_length=20, description='Date of birth in YYYY-MM-DD format (Year-Month-Day, e.g., 1990-05-15)')
    age: Optional[int] = Field(default=None, ge=13, le=120)
    height_cm: Optional[int] = Field(default=None, ge=30, le=300)
    weight_kg: Optional[int] = Field(default=None, ge=10, le=500)
    gender: Optional[str] = Field(default=None, pattern='^(?i)(male|female|other)$')
    diabetes_type: Optional[str] = Field(default=None, max_length=100)
    cholesterol_mg_dl: Optional[int] = Field(default=None, ge=50, le=400)
    using_insulin: Optional[bool] = None
    hba1c: Optional[float] = Field(default=None, ge=0, le=20, description='HbA1c level')
    diet_type: Optional[str] = Field(default=None, pattern='^(?i)(balanced|high_carb|low_carb)$', description='Diet type: balanced, high_carb, low_carb')
    activity_level: Optional[str] = Field(default=None, pattern='^(?i)(low|moderate|high)$', description='Activity level: low, moderate, high')

    @field_validator('name')
    def validate_name_field(cls, v):
        if v is not None:
            is_valid, error_msg = validate_full_name(v)
            if not is_valid:
                raise ValueError(error_msg)
        return v

    @model_validator(mode='after')
    def validate_fields(cls, values):
        has_any_field = any([values.name is not None, values.dob is not None, values.age is not None, values.height_cm is not None, values.weight_kg is not None, values.gender is not None, values.diabetes_type is not None, values.cholesterol_mg_dl is not None, values.using_insulin is not None])
        if not has_any_field:
            raise ValueError('At least one field must be provided for update')
        if values.age is None and (values.dob is None or str(values.dob).strip() == ''):
            if values.age is not None or values.dob is not None:
                raise ValueError("At least one of 'age' or 'dob' must be provided")
        return values

@profile_router.get('/me')
def get_my_profile(request: Request, user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    profile = db.query(dbm.UserProfile).filter(dbm.UserProfile.user_id == user.id).first()
    profile_image_url = None
    if profile is not None and getattr(profile, 'profile_image', None):
        profile_image_url = build_profile_image_url(request, cast(Optional[str], getattr(profile, 'profile_image')))

    def _p(name: str) -> Any:
        return getattr(profile, name, None) if profile else None
    profile_data = UserProfileResponse(id=cast(str, user.id), email=cast(str, user.email), name=cast(Optional[str], _p('name')), dob=cast(Optional[str], _p('dob')), age=cast(Optional[int], _p('age')), height_cm=cast(Optional[int], _p('height_cm')), weight_kg=cast(Optional[int], _p('weight_kg')), gender=cast(Optional[str], _p('gender')), diabetes_type=cast(Optional[str], _p('diabetes_type')), cholesterol_mg_dl=cast(Optional[int], _p('cholesterol_mg_dl')), using_insulin=bool(_p('using_insulin')) if profile else False, hba1c=cast(Optional[float], _p('hba1c')), diet_type=cast(Optional[str], _p('diet_type')), activity_level=cast(Optional[str], _p('activity_level')), profile_image=profile_image_url, created_at=cast(Any, user.created_at), updated_at=cast(Any, user.updated_at))
    return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message='Profile retrieved successfully', data=profile_data.model_dump(mode='json')).model_dump())

@profile_router.put('/me')
def update_my_profile(request: Request, payload: UpdateUserProfileRequest, user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    profile = db.query(dbm.UserProfile).filter(dbm.UserProfile.user_id == user.id).first()
    if not profile:
        profile = dbm.UserProfile(user_id=user.id)
        db.add(profile)
    if payload.name is not None:
        setattr(profile, 'name', payload.name)
    if payload.dob is not None:
        setattr(profile, 'dob', payload.dob)
    if payload.age is not None:
        setattr(profile, 'age', payload.age)
    if payload.height_cm is not None:
        setattr(profile, 'height_cm', payload.height_cm)
    if payload.weight_kg is not None:
        setattr(profile, 'weight_kg', payload.weight_kg)
    if payload.gender is not None:
        setattr(profile, 'gender', payload.gender)
    if payload.diabetes_type is not None:
        setattr(profile, 'diabetes_type', payload.diabetes_type)
    if payload.cholesterol_mg_dl is not None:
        setattr(profile, 'cholesterol_mg_dl', payload.cholesterol_mg_dl)
    if payload.using_insulin is not None:
        setattr(profile, 'using_insulin', payload.using_insulin)
    if payload.hba1c is not None:
        setattr(profile, 'hba1c', payload.hba1c)
    if payload.diet_type is not None:
        setattr(profile, 'diet_type', payload.diet_type.lower())
    if payload.activity_level is not None:
        setattr(profile, 'activity_level', payload.activity_level.lower())
    setattr(user, 'updated_at', datetime.now(timezone.utc))
    db.commit()
    db.refresh(user)
    db.refresh(profile)
    profile_image_url = None
    if getattr(profile, 'profile_image', None):
        profile_image_url = build_profile_image_url(request, cast(Optional[str], getattr(profile, 'profile_image')))

    def _pv(name: str) -> Any:
        return getattr(profile, name, None)
    updated_profile = UserProfileResponse(id=cast(str, user.id), email=cast(str, user.email), name=cast(Optional[str], _pv('name')), dob=cast(Optional[str], _pv('dob')), age=cast(Optional[int], _pv('age')), height_cm=cast(Optional[int], _pv('height_cm')), weight_kg=cast(Optional[int], _pv('weight_kg')), hba1c=cast(Optional[float], _pv('hba1c')), gender=cast(Optional[str], _pv('gender')), diabetes_type=cast(Optional[str], _pv('diabetes_type')), cholesterol_mg_dl=cast(Optional[int], _pv('cholesterol_mg_dl')), using_insulin=bool(_pv('using_insulin')), diet_type=cast(Optional[str], _pv('diet_type')), activity_level=cast(Optional[str], _pv('activity_level')), profile_image=profile_image_url, created_at=cast(Any, user.created_at), updated_at=cast(Any, user.updated_at))
    return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message='Profile updated successfully', data=updated_profile.model_dump(mode='json')).model_dump())

@profile_router.post('/me/image')
async def upload_profile_image(request: Request, file: UploadFile=File(...), user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if file.content_type not in allowed_types:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=ErrorResponse(code='INVALID_FILE_TYPE', message='Only JPEG, PNG, and WebP images are allowed').model_dump())
    max_size = 5 * 1024 * 1024
    file_content = await file.read()
    if len(file_content) > max_size:
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=ErrorResponse(code='FILE_TOO_LARGE', message='Image file size must be less than 5MB').model_dump())
    try:
        profiles_dir = Path('static/images/profiles')
        profiles_dir.mkdir(parents=True, exist_ok=True)
        try:
            import os
            os.chmod(profiles_dir, 509)
        except (OSError, PermissionError):
            logger.warning(f'Could not set permissions on {profiles_dir}, continuing anyway')
        image = Image.open(io.BytesIO(file_content))
        if image.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')
        max_dimension = 800
        if image.width > max_dimension or image.height > max_dimension:
            image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
        file_extension = 'jpg'
        filename = f'{cast(str, user.id)}_{uuid.uuid4().hex[:8]}.{file_extension}'
        file_path = profiles_dir / filename
        image.save(file_path, 'JPEG', quality=85, optimize=True)
        profile = db.query(dbm.UserProfile).filter(dbm.UserProfile.user_id == user.id).first()
        if not profile:
            profile = dbm.UserProfile(user_id=user.id)
            db.add(profile)
        pimg = getattr(profile, 'profile_image', None)
        if pimg:
            old_file_path = profiles_dir / cast(str, pimg)
            if old_file_path.exists():
                try:
                    old_file_path.unlink()
                except Exception:
                    pass
        setattr(profile, 'profile_image', filename)
        setattr(user, 'updated_at', datetime.now(timezone.utc))
        db.commit()
        db.refresh(profile)
        profile_image_url = build_profile_image_url(request, filename)
        return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message='Profile image uploaded successfully', data={'profile_image': profile_image_url}).model_dump())
    except Exception as e:
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='IMAGE_UPLOAD_ERROR', message=f'Failed to process image: {str(e)}').model_dump())

@profile_router.delete('/me/image')
def delete_profile_image(user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    profile = db.query(dbm.UserProfile).filter(dbm.UserProfile.user_id == user.id).first()
    if not profile or not getattr(profile, 'profile_image', None):
        return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content=ErrorResponse(code='IMAGE_NOT_FOUND', message='No profile image found').model_dump())
    profiles_dir = Path('static/images/profiles')
    file_path = profiles_dir / cast(str, getattr(profile, 'profile_image', ''))
    if file_path.exists():
        try:
            file_path.unlink()
        except Exception:
            pass
    setattr(profile, 'profile_image', None)
    setattr(user, 'updated_at', datetime.now(timezone.utc))
    db.commit()
    return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message='Profile image deleted successfully').model_dump())
import datetime
from typing import Optional, Dict, Any
from passlib.context import CryptContext
import jwt
from config.settings import settings
pwd_context = CryptContext(schemes=['argon2'], deprecated='auto')

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def _jwt_now() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)

def create_access_token(subject: str, extra_claims: Optional[Dict[str, Any]]=None) -> str:
    to_encode = {'sub': subject, 'type': 'access', 'iat': int(_jwt_now().timestamp()), 'exp': int((_jwt_now() + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)).timestamp())}
    if extra_claims:
        to_encode.update(extra_claims)
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(session_id: str, subject: str) -> str:
    to_encode = {'sid': session_id, 'sub': subject, 'type': 'refresh', 'iat': int(_jwt_now().timestamp()), 'exp': int((_jwt_now() + datetime.timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)).timestamp())}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> Dict[str, Any]:
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

def hash_token(token: str) -> str:
    import hashlib
    return hashlib.sha256(token.encode('utf-8')).hexdigest()
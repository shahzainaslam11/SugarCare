import re
from datetime import datetime, timedelta, timezone
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, text
from db import models as dbm

def validate_password_strength(password: str) -> tuple[bool, str]:
    if len(password) < 8:
        return (False, 'Password must be at least 8 characters long.')
    if not re.search('[A-Z]', password):
        return (False, 'Password must contain at least one uppercase letter.')
    if not re.search('[0-9]', password):
        return (False, 'Password must contain at least one number.')
    if ' ' in password:
        return (False, 'Password cannot contain spaces.')
    return (True, '')

def validate_city(city: str) -> tuple[bool, str]:
    if not city or len(city.strip()) == 0:
        return (False, 'City is required.')
    if len(city) > 50:
        return (False, 'City name cannot exceed 50 characters.')
    pattern = '^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d ]{1,50}$'
    if not re.match(pattern, city):
        return (False, 'City must contain at least one letter and one number, with no special characters.')
    return (True, '')

def validate_full_name(name: str) -> tuple[bool, str]:
    if not name or len(name.strip()) == 0:
        return (False, 'Full name is required.')
    if len(name) > 50:
        return (False, 'Full name cannot exceed 50 characters.')
    if not re.match('^[A-Za-z\\s]+$', name):
        return (False, 'Full name can only contain letters and spaces.')
    return (True, '')

def check_failed_login_attempts(user_id: str, db: Session, max_attempts: int=5, lockout_minutes: int=15) -> tuple[bool, Optional[str]]:
    cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=lockout_minutes)
    failed_attempts = db.query(dbm.AuditLog).filter(and_(dbm.AuditLog.user_id == user_id, dbm.AuditLog.action == 'login_failed', dbm.AuditLog.created_at >= cutoff_time)).count()
    if failed_attempts >= max_attempts:
        return (True, f'Account temporarily locked due to {max_attempts} failed login attempts. Please try again in {lockout_minutes} minutes.')
    return (False, None)

def record_failed_login(user_id: str, db: Session):
    audit = dbm.AuditLog(user_id=user_id, action='login_failed', meta={'timestamp': datetime.now(timezone.utc).isoformat()}, created_at=datetime.now(timezone.utc))
    db.add(audit)
    db.commit()

def check_otp_rate_limit(user_id: str, db: Session, max_requests: int=3, window_minutes: int=10) -> tuple[bool, Optional[str]]:
    cutoff_time = datetime.now(timezone.utc) - timedelta(minutes=window_minutes)
    recent_otps = db.query(dbm.OTPCode).filter(and_(dbm.OTPCode.user_id == user_id, dbm.OTPCode.created_at >= cutoff_time)).count()
    if recent_otps >= max_requests:
        return (True, f'Too many OTP requests. Please wait {window_minutes} minutes before requesting another.')
    return (False, None)

def check_otp_verify_attempts(otp: dbm.OTPCode, max_attempts: int=3) -> tuple[bool, Optional[str]]:
    attempts = int(getattr(otp, 'attempts', 0) or 0)
    if attempts >= max_attempts:
        return (True, f'Too many verification attempts. Maximum {max_attempts} attempts allowed.')
    return (False, None)

def check_chatbot_rate_limit(user_id: str, message: str, db: Session, window_seconds: int=30) -> tuple[bool, Optional[str]]:
    cutoff_time = datetime.now(timezone.utc) - timedelta(seconds=window_seconds)
    recent_message = db.query(dbm.ChatbotMessage).filter(and_(dbm.ChatbotMessage.user_id == user_id, dbm.ChatbotMessage.message == message, dbm.ChatbotMessage.created_at >= cutoff_time)).first()
    if recent_message:
        return (True, f'Please wait {window_seconds} seconds before sending the same message again.')
    return (False, None)

def check_blog_post_limit(user_id: Optional[str], author_name: Optional[str], db: Session, max_posts: int=3) -> tuple[bool, Optional[str]]:
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    try:
        if user_id:
            result = db.execute(text('\n                    SELECT COUNT(*) \n                    FROM community_blogs \n                    WHERE user_id = :user_id AND created_at >= :today_start\n                '), {'user_id': user_id, 'today_start': today_start})
            today_posts = result.scalar() or 0
        elif author_name:
            result = db.execute(text('\n                    SELECT COUNT(*) \n                    FROM community_blogs \n                    WHERE author_name = :author_name AND created_at >= :today_start\n                '), {'author_name': author_name, 'today_start': today_start})
            today_posts = result.scalar() or 0
        else:
            return (False, None)
        if today_posts >= max_posts:
            return (True, f'Maximum {max_posts} blog posts per day. Please try again tomorrow.')
        return (False, None)
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.warning(f'Error checking blog post limit: {e}. Allowing post.')
        return (False, None)

def sanitize_html(text: str) -> str:
    import re
    return re.sub('<[^>]+>', '', text)
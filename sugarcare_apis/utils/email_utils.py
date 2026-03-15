import logging
from pathlib import Path
from typing import Optional
from utils.smtp_client import send_email, check_smtp_health
logger = logging.getLogger(__name__)

def send_verification_email(to_email: str, otp_code: str) -> bool:
    try:
        template_path = Path('templates/verification_email.html')
        if not template_path.exists():
            logger.error(f'Email template not found: {template_path}')
            return False
        html_body = template_path.read_text(encoding='utf-8').replace('{{OTP_CODE}}', otp_code)
    except Exception as e:
        logger.error(f'Failed to load email template: {e}')
        return False
    return send_email(to_email=to_email, subject='Your SugarCare Verification Code', body=html_body, body_type='html')

def smtp_health_check() -> bool:
    return check_smtp_health()
import logging
from typing import Optional
from utils.smtp_client import send_email as _send_email, check_smtp_health
logger = logging.getLogger(__name__)

def send_email(to_email: str, subject: str, body: str) -> bool:
    return _send_email(to_email, subject, body, body_type='plain')

def smtp_health_check() -> bool:
    return check_smtp_health()
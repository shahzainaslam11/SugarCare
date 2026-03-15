import logging
import smtplib
import ssl
import socket
from typing import Optional, Tuple, List
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from config.settings import settings
logger = logging.getLogger(__name__)
SMTP_TIMEOUT = 15
SMTP_PORT_STARTTLS = 587
SMTP_PORT_SSL = 465

class SMTPConnectionError(Exception):
    pass

def connect_to_smtp(host: str, port: int, use_tls: bool) -> smtplib.SMTP:
    context = ssl.create_default_context()
    strategies = _build_connection_strategies(port, use_tls)
    last_error = None
    for strategy_name, strategy_port, strategy_use_tls in strategies:
        try:
            server = _attempt_connection(host, strategy_port, strategy_name, strategy_use_tls, context)
            logger.info(f'SMTP connection established: {strategy_name} to {host}:{strategy_port}')
            return server
        except (socket.timeout, OSError) as e:
            last_error = e
            error_code = getattr(e, 'winerror', None) or getattr(e, 'errno', None)
            logger.debug(f'SMTP connection attempt failed ({strategy_name}): {e} (Error code: {error_code})')
            continue
        except Exception as e:
            last_error = e
            logger.debug(f'SMTP connection error ({strategy_name}): {e}')
            continue
    error_msg = f'Failed to connect to SMTP server {host}. Tried {len(strategies)} connection strategies. Last error: {last_error}'
    logger.error(error_msg)
    raise SMTPConnectionError(error_msg)

def _build_connection_strategies(port: int, use_tls: bool) -> List[Tuple[str, int, bool]]:
    strategies = []
    if use_tls and port == SMTP_PORT_STARTTLS:
        strategies.append(('STARTTLS', SMTP_PORT_STARTTLS, True))
    elif port == SMTP_PORT_SSL:
        strategies.append(('SSL', SMTP_PORT_SSL, False))
    else:
        strategies.append(('CUSTOM', port, use_tls))
    if port != SMTP_PORT_STARTTLS:
        strategies.append(('STARTTLS', SMTP_PORT_STARTTLS, True))
    if port != SMTP_PORT_SSL:
        strategies.append(('SSL', SMTP_PORT_SSL, False))
    return strategies

def _attempt_connection(host: str, port: int, strategy_name: str, use_tls: bool, context: ssl.SSLContext) -> smtplib.SMTP:
    logger.debug(f'Attempting SMTP connection: {strategy_name} to {host}:{port}')
    if strategy_name == 'SSL':
        server = smtplib.SMTP_SSL(host, port, timeout=SMTP_TIMEOUT, context=context)
        server.ehlo()
    elif strategy_name == 'STARTTLS':
        server = smtplib.SMTP(host, port, timeout=SMTP_TIMEOUT)
        server.ehlo()
        server.starttls(context=context)
        server.ehlo()
    elif use_tls:
        server = smtplib.SMTP(host, port, timeout=SMTP_TIMEOUT)
        server.ehlo()
        server.starttls(context=context)
        server.ehlo()
    else:
        server = smtplib.SMTP(host, port, timeout=SMTP_TIMEOUT)
        server.ehlo()
    return server

def send_email(to_email: str, subject: str, body: str, body_type: str='plain') -> bool:
    if not _validate_smtp_config():
        return False
    host = settings.SMTP_HOST
    username = settings.SMTP_USERNAME
    password = settings.SMTP_PASSWORD
    port = settings.SMTP_PORT or 587
    use_tls = settings.SMTP_USE_TLS
    if not host or not username or (not password):
        return False
    try:
        message = MIMEMultipart('alternative')
        message['Subject'] = subject
        message['From'] = username
        message['To'] = to_email
        message.attach(MIMEText(body, body_type, 'utf-8'))
        server = connect_to_smtp(host, port, use_tls)
        try:
            server.login(username, password)
            server.sendmail(username, [to_email], message.as_string())
            logger.info(f'Email sent successfully to {to_email}')
            return True
        finally:
            _safe_quit(server)
    except SMTPConnectionError as e:
        logger.error(f'SMTP connection failed: {e}')
        return False
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f'SMTP authentication failed for {username}: {e}. Check SMTP_USERNAME and SMTP_PASSWORD.')
        return False
    except smtplib.SMTPException as e:
        logger.error(f'SMTP protocol error: {e}')
        return False
    except Exception as e:
        logger.error(f'Unexpected error sending email to {to_email}: {e}', exc_info=True)
        return False

def check_smtp_health() -> bool:
    if not settings.SMTP_HOST:
        logger.warning('SMTP health check skipped: SMTP_HOST not configured')
        return False
    host = settings.SMTP_HOST
    username = settings.SMTP_USERNAME
    password = settings.SMTP_PASSWORD
    port = settings.SMTP_PORT
    use_tls = settings.SMTP_USE_TLS
    try:
        server = connect_to_smtp(host, port, use_tls)
        try:
            if username and password:
                server.login(username, password)
            server.noop()
            logger.info(f'SMTP health check passed for {host}:{port}')
            return True
        finally:
            _safe_quit(server)
    except SMTPConnectionError as e:
        logger.error(f'SMTP health check failed: {e}')
        return False
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f'SMTP health check failed: Authentication error for {username}. Check SMTP_USERNAME and SMTP_PASSWORD.')
        return False
    except Exception as e:
        logger.error(f'SMTP health check failed: {e}', exc_info=True)
        return False

def _validate_smtp_config() -> bool:
    if not settings.SMTP_HOST or not settings.SMTP_USERNAME or (not settings.SMTP_PASSWORD):
        logger.error('SMTP configuration incomplete. Please set SMTP_HOST, SMTP_USERNAME, and SMTP_PASSWORD in .env file.')
        return False
    return True

def _safe_quit(server: Optional[smtplib.SMTP]) -> None:
    if server:
        try:
            server.quit()
        except Exception:
            pass
from __future__ import annotations
import concurrent.futures
import json
import logging
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
import requests
from sqlalchemy.orm import Session
from db import models as dbm
from services.firebase_client import get_credentials_path
logger = logging.getLogger(__name__)
try:
    from google.oauth2 import service_account as google_sa
    from google.auth.transport import requests as google_auth_requests
    _HAS_GOOGLE_AUTH = True
except ImportError:
    _HAS_GOOGLE_AUTH = False
    google_sa = None
    google_auth_requests = None
import jwt as pyjwt
try:
    import firebase_admin
    FIREBASE_ADMIN_VERSION = getattr(firebase_admin, '__version__', 'unknown')
except Exception:
    firebase_admin = None
    FIREBASE_ADMIN_VERSION = 'not installed'
FCM_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging'
OAUTH2_TIMEOUT_SEC = 10
FCM_SEND_TIMEOUT_SEC = 90
FCM_MAX_WORKERS = 5
REACHABILITY_TIMEOUT_SEC = 8

def _new_http_session() -> requests.Session:
    s = requests.Session()
    s.trust_env = False
    return s

def _is_stale_token_error(err: str) -> bool:
    e = (err or '').upper()
    if ' UNREGISTERED' in e:
        return True
    if ' NOT_FOUND' in e:
        return True
    if ' INVALID_ARGUMENT' in e and 'REGISTRATION TOKEN' in e:
        return True
    return False

def _delete_device_tokens(db: Session, user_id: str, tokens: List[str]) -> int:
    if not tokens:
        return 0
    try:
        q = db.query(dbm.Device).filter(dbm.Device.user_id == str(user_id), dbm.Device.fcm_token.in_(tokens))
        deleted = q.delete(synchronize_session=False)
        db.commit()
        return int(deleted or 0)
    except Exception as e:
        logger.warning('FCM: failed to delete stale tokens for user %s: %s', user_id, e)
        try:
            db.rollback()
        except Exception:
            pass
        return 0

def _get_oauth2_token(cred_path: str, timeout: int=OAUTH2_TIMEOUT_SEC, errors: Optional[List[str]]=None) -> Optional[str]:
    err_list = errors if errors is not None else []
    if _HAS_GOOGLE_AUTH:

        def _refresh() -> Optional[str]:
            creds = google_sa.Credentials.from_service_account_file(cred_path, scopes=[FCM_SCOPE])
            with _new_http_session() as s:
                creds.refresh(google_auth_requests.Request(session=s))
            return (creds.token or '').strip() or None
        try:
            with concurrent.futures.ThreadPoolExecutor(max_workers=1) as ex:
                future = ex.submit(_refresh)
                token = future.result(timeout=timeout)
            if token:
                return token
        except concurrent.futures.TimeoutError:
            logger.warning('FCM: OAuth2 refresh timed out after %ss', timeout)
            err_list.append(f'OAuth2 timed out ({timeout}s)')
        except Exception as e:
            logger.warning('FCM: google-auth failed: %s', e)
            err_list.append(f'Google auth: {e}')
    try:
        with open(cred_path, 'r', encoding='utf-8') as f:
            cred = json.load(f)
    except Exception as e:
        err_list.append(f'Failed to load credentials: {e}')
        return None
    client_email = cred.get('client_email')
    private_key = (cred.get('private_key') or '').replace('\\n', '\n')
    if not client_email or not private_key:
        err_list.append('Credentials missing client_email or private_key')
        return None
    now = int(time.time())
    jwt_payload = {'iss': client_email, 'scope': FCM_SCOPE, 'aud': 'https://oauth2.googleapis.com/token', 'iat': now, 'exp': now + 3600}
    try:
        raw = pyjwt.encode(jwt_payload, private_key, algorithm='RS256')
        assertion = raw.decode('utf-8') if isinstance(raw, bytes) else str(raw)
    except Exception as e:
        err_list.append(f'JWT sign failed: {e}')
        return None
    try:
        with _new_http_session() as s:
            resp = s.post('https://oauth2.googleapis.com/token', data={'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer', 'assertion': assertion}, headers={'Content-Type': 'application/x-www-form-urlencoded'}, timeout=timeout)
        body = resp.json() if resp.text else {}
        if resp.status_code != 200:
            msg = body.get('error_description') or body.get('error') or resp.text[:200]
            err_list.append(f'OAuth2: {msg}')
            return None
        token = (body.get('access_token') or '').strip()
        return token or None
    except requests.exceptions.Timeout:
        err_list.append(f'OAuth2 timed out ({timeout}s)')
        return None
    except Exception as e:
        err_list.append(f'OAuth2: {e}')
        return None

def _send_one_fcm_message(access_token: str, project_id: str, device_token: str, title: str, body: str, data: Optional[Dict[str, str]]=None, timeout: int=FCM_SEND_TIMEOUT_SEC) -> Optional[str]:
    url = f'https://fcm.googleapis.com/v1/projects/{project_id}/messages:send'
    payload = {'message': {'token': device_token, 'notification': {'title': title, 'body': body}, 'data': data or {}, 'apns': {'headers': {'apns-push-type': 'alert', 'apns-priority': '10'}, 'payload': {'aps': {'sound': 'default'}}}, 'android': {'priority': 'HIGH'}}}
    bearer = (access_token or '').strip()
    if not bearer:
        return 'FCM: access token empty'
    try:
        with _new_http_session() as s:
            resp = s.post(url, json=payload, headers={'Authorization': f'Bearer {bearer}', 'Content-Type': 'application/json'}, timeout=timeout)
        if resp.status_code == 200:
            return None
        err_text = (resp.text or '')[:400]
        error_code: Optional[str] = None
        try:
            resp_body: Any = resp.json() if resp.text else {}
            err_obj = resp_body.get('error') if isinstance(resp_body, dict) else None
            details = err_obj.get('details') or [] if isinstance(err_obj, dict) else []
            for d in details:
                if isinstance(d, dict) and d.get('@type') == 'type.googleapis.com/google.firebase.fcm.v1.FcmError':
                    error_code = d.get('errorCode')
                    break
        except Exception:
            pass
        msg = f'HTTP {resp.status_code}'
        if error_code is not None:
            msg += f' {error_code}'
        msg += f': {err_text}'
        logger.warning('FCM send failed: %s', msg[:300])
        return msg
    except requests.exceptions.Timeout:
        return 'request timed out'
    except Exception as e:
        return str(e)

def _send_to_tokens_via_rest(tokens: List[str], title: str, body: str, data: Optional[Dict[str, Any]]=None, user_id: str='') -> Dict[str, Any]:
    out: Dict[str, Any] = {'success_count': 0, 'failure_count': 0, 'errors': []}
    if not tokens:
        return out
    cred_path = get_credentials_path()
    if not cred_path:
        out['errors'].append('Firebase credentials not found (firebase/serviceAccountKey.json)')
        return out
    try:
        with open(cred_path, 'r', encoding='utf-8') as f:
            cred = json.load(f)
    except Exception as e:
        out['errors'].append(f'Failed to load credentials: {e}')
        return out
    project_id = cred.get('project_id')
    if not project_id:
        out['errors'].append('project_id missing in credentials')
        return out
    access_token = _get_oauth2_token(cred_path, timeout=OAUTH2_TIMEOUT_SEC, errors=out['errors'])
    if not access_token:
        if not out['errors']:
            out['errors'].append('Could not obtain OAuth2 access token')
        return out
    data_str = {k: str(v) for k, v in (data or {}).items()}

    def _send_item(args: Tuple[int, str]) -> Tuple[int, Optional[str]]:
        index, token = args
        err = _send_one_fcm_message(access_token, project_id, token, title, body, data_str, timeout=FCM_SEND_TIMEOUT_SEC)
        return (index, err)
    stale_tokens: List[str] = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=FCM_MAX_WORKERS) as executor:
        for index, err in executor.map(_send_item, enumerate(tokens)):
            if err is None:
                out['success_count'] += 1
            else:
                out['failure_count'] += 1
                out['errors'].append(f'token[{index}]: {err}')
                if _is_stale_token_error(err):
                    stale_tokens.append(tokens[index])
    out['stale_tokens'] = stale_tokens
    logger.info('FCM: user %s — %d tokens, %d ok, %d fail', user_id or '?', len(tokens), out['success_count'], out['failure_count'])
    return out

def _get_user_device_tokens(db: Session, user_id: str) -> List[str]:
    result: List[str] = []
    for d in db.query(dbm.Device).filter(dbm.Device.user_id == str(user_id)).all():
        val: Any = getattr(d, 'fcm_token', None)
        if val:
            result.append(str(val))
    return result

def _send_push_to_tokens(tokens: List[str], title: str, body: str, data: Optional[Dict[str, Any]]=None, user_id: str='') -> None:
    if not tokens or not get_credentials_path():
        return
    _send_to_tokens_via_rest(tokens, title, body, data, user_id=user_id)

def send_push_notification_to_user(db: Session, user_id: str, title: str, body: str, data: Optional[Dict[str, Any]]=None) -> None:
    tokens = _get_user_device_tokens(db, user_id)
    if not tokens:
        logger.warning('FCM: no device tokens for user %s', user_id)
        return
    rest_out = _send_to_tokens_via_rest(tokens, title, body, data, user_id=str(user_id))
    stale = rest_out.get('stale_tokens') or []
    if stale:
        deleted = _delete_device_tokens(db, user_id, list(stale))
        logger.info('FCM: deleted %d stale tokens for user %s', deleted, user_id)

def send_push_notification_to_user_with_result(db: Session, user_id: str, title: str, body: str, data: Optional[Dict[str, Any]]=None) -> Dict[str, Any]:
    result: Dict[str, Any] = {'firebase_ready': False, 'tokens_count': 0, 'success_count': 0, 'failure_count': 0, 'generated_at': None, 'errors': []}
    tokens = _get_user_device_tokens(db, user_id)
    result['tokens_count'] = len(tokens)
    if not tokens:
        result['errors'].append('No device tokens for this user')
        return result
    cred_path = get_credentials_path()
    if not cred_path:
        result['errors'].append('Firebase credentials not found (firebase/serviceAccountKey.json)')
        return result
    result['firebase_ready'] = True
    result['generated_at'] = datetime.now(timezone.utc).isoformat()
    rest_out = _send_to_tokens_via_rest(tokens, title, body, data, user_id=str(user_id))
    result['success_count'] = rest_out.get('success_count', 0)
    result['failure_count'] = rest_out.get('failure_count', 0)
    result['errors'] = rest_out.get('errors', [])
    stale = rest_out.get('stale_tokens') or []
    if stale:
        deleted = _delete_device_tokens(db, user_id, list(stale))
        if deleted:
            result['errors'].append(f'Removed {deleted} stale device token(s). Please re-register token from the app.')
    return result

def send_push_to_single_token_with_result(device_token: str, title: str='Test', body: str='Test push from SugarCare') -> Dict[str, Any]:
    out: Dict[str, Any] = {'firebase_ready': False, 'success': False, 'error': None, 'generated_at': None}
    token = (device_token or '').strip()
    if not token or len(token) < 10:
        out['error'] = 'Valid fcm_token required (min 10 characters)'
        return out
    cred_path = get_credentials_path()
    if not cred_path:
        out['error'] = 'Firebase credentials not found (firebase/serviceAccountKey.json)'
        return out
    out['firebase_ready'] = True
    out['generated_at'] = datetime.now(timezone.utc).isoformat()
    try:
        with open(cred_path, 'r', encoding='utf-8') as f:
            cred = json.load(f)
    except Exception as e:
        out['error'] = f'Failed to load credentials: {e}'
        return out
    project_id = cred.get('project_id')
    if not project_id:
        out['error'] = 'project_id missing in credentials'
        return out
    access_token = _get_oauth2_token(cred_path, timeout=OAUTH2_TIMEOUT_SEC)
    if not access_token:
        out['error'] = 'Could not obtain OAuth2 access token'
        return out
    err = _send_one_fcm_message(access_token, project_id, token, title, body, None, timeout=FCM_SEND_TIMEOUT_SEC)
    if err is None:
        out['success'] = True
        logger.info('FCM: single token send OK')
    else:
        out['success'] = False
        out['error'] = err
        logger.warning('FCM: single token send failed: %s', err[:200] if isinstance(err, str) else err)
    return out

def get_push_diagnostics(db: Session, user_id: str) -> Dict[str, Any]:
    out: Dict[str, Any] = {'firebase_admin_version': FIREBASE_ADMIN_VERSION, 'firebase_ready': False, 'tokens_count': 0, 'fcm_reachable': None, 'oauth2_reachable': None, 'suggestions': []}
    try:
        out['tokens_count'] = len(_get_user_device_tokens(db, user_id))
    except Exception as e:
        out['suggestions'].append(f'Could not read device tokens: {e}')
        return out
    cred_path = get_credentials_path()
    out['firebase_ready'] = cred_path is not None
    if not cred_path:
        out['suggestions'].append('Add firebase/serviceAccountKey.json for push.')
        return out
    try:
        with _new_http_session() as s:
            s.get('https://fcm.googleapis.com', timeout=REACHABILITY_TIMEOUT_SEC)
        out['fcm_reachable'] = True
    except Exception as e:
        out['fcm_reachable'] = False
        out['suggestions'].append(f'Cannot reach FCM: {e}. Check outbound HTTPS.')
    try:
        with _new_http_session() as s:
            s.get('https://oauth2.googleapis.com', timeout=REACHABILITY_TIMEOUT_SEC)
        out['oauth2_reachable'] = True
    except Exception:
        out['oauth2_reachable'] = False
        out['suggestions'].append('Cannot reach oauth2.googleapis.com. Check outbound HTTPS.')
    if out['tokens_count'] == 0:
        out['suggestions'].append('No device tokens. Call POST /api/v1/notifications/device_token from the app.')
    return out
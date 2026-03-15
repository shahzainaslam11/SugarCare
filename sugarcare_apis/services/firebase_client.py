import logging
import os
from typing import Optional
import firebase_admin
from firebase_admin import credentials
logger = logging.getLogger(__name__)
_firebase_app: Optional[firebase_admin.App] = None
_firebase_init_attempted = False

def get_credentials_path() -> Optional[str]:
    return _get_credentials_path()

def _get_credentials_path() -> Optional[str]:
    env_path = os.getenv('FIREBASE_CREDENTIALS_PATH')
    if env_path and os.path.exists(env_path):
        return env_path
    if env_path:
        logger.warning('FIREBASE_CREDENTIALS_PATH set but file not found: %s', env_path)
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    for path in (os.path.join(base_dir, 'firebase', 'serviceAccountKey.json'), os.path.join(base_dir, 'serviceAccountKey.json')):
        if os.path.exists(path):
            return path
    logger.warning('Firebase credentials not found; tried firebase/serviceAccountKey.json and root serviceAccountKey.json')
    return None

def get_firebase_app() -> Optional[firebase_admin.App]:
    global _firebase_app, _firebase_init_attempted
    if _firebase_app is not None:
        return _firebase_app
    if _firebase_init_attempted:
        return None
    _firebase_init_attempted = True
    try:
        try:
            _firebase_app = firebase_admin.get_app()
            return _firebase_app
        except ValueError:
            pass
        cred_path = _get_credentials_path()
        if not cred_path:
            return None
        cred = credentials.Certificate(cred_path)
        _firebase_app = firebase_admin.initialize_app(cred)
        logger.info('Firebase app initialized for FCM (credentials: %s)', cred_path)
        return _firebase_app
    except Exception as e:
        logger.exception('Firebase initialization failed: %s', e)
        return None
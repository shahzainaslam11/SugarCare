import os
from typing import Dict, List, Optional, Any
from pathlib import Path
import logging
from datetime import timedelta
from dotenv import load_dotenv
load_dotenv()
logger = logging.getLogger(__name__)

class Settings:
    APP_NAME: str = 'SugarCare Backend API'
    APP_VERSION: str = '1.0.0'
    DEBUG: bool = os.getenv('DEBUG', 'False').lower() == 'true'
    ENVIRONMENT: str = os.getenv('ENVIRONMENT', 'development')
    API_HOST: str = os.getenv('API_HOST', '0.0.0.0')
    API_PORT: int = int(os.getenv('API_PORT', '8000'))
    API_PREFIX: str = '/api/v1'
    CORS_ORIGINS: List[str] = os.getenv('CORS_ORIGINS', '*').split(',')
    CORS_METHODS: List[str] = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    CORS_HEADERS: List[str] = ['*']
    DATABASE_URL: str = os.getenv('DATABASE_URL', 'sqlite:///data/sugarcare.db')
    DATABASE_ECHO: bool = os.getenv('DATABASE_ECHO', 'False').lower() == 'true'
    DATABASE_POOL_SIZE: int = int(os.getenv('DATABASE_POOL_SIZE', '10'))
    REDIS_URL: str = os.getenv('REDIS_URL', 'redis://localhost:6379')
    REDIS_DB: int = int(os.getenv('REDIS_DB', '0'))
    REDIS_PASSWORD: Optional[str] = os.getenv('REDIS_PASSWORD')
    MODELS_DIR: str = os.getenv('MODELS_DIR', 'models')
    MODEL_CACHE_SIZE: int = int(os.getenv('MODEL_CACHE_SIZE', '1000'))
    PRELOAD_MODELS: bool = os.getenv('PRELOAD_MODELS', 'True').lower() == 'true'
    DATA_DIR: str = os.getenv('DATA_DIR', 'data')
    RAW_DATA_DIR: str = os.path.join(DATA_DIR, 'raw')
    PROCESSED_DATA_DIR: str = os.path.join(DATA_DIR, 'processed')
    FEATURES_DIR: str = os.path.join(DATA_DIR, 'features')
    LOG_LEVEL: str = os.getenv('LOG_LEVEL', 'INFO')
    LOG_FILE: str = os.getenv('LOG_FILE', 'logs/sugarcare.log')
    LOG_FORMAT: str = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    LOG_DATE_FORMAT: str = '%Y-%m-%d %H:%M:%S'
    SECRET_KEY: str = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production')
    ADMIN_SECRET: Optional[str] = os.getenv('ADMIN_SECRET')
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv('ACCESS_TOKEN_EXPIRE_MINUTES', '30'))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv('REFRESH_TOKEN_EXPIRE_DAYS', '7'))
    ALGORITHM: str = 'HS256'
    GOOGLE_API_KEY: Optional[str] = os.getenv('GOOGLE_API_KEY')
    AWS_ACCESS_KEY_ID: Optional[str] = os.getenv('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY: Optional[str] = os.getenv('AWS_SECRET_ACCESS_KEY')
    AWS_REGION: str = os.getenv('AWS_REGION', 'us-east-1')
    MAX_FILE_SIZE: int = int(os.getenv('MAX_FILE_SIZE', '10485760'))
    ALLOWED_EXTENSIONS: List[str] = ['jpg', 'jpeg', 'png', 'gif', 'bmp']
    UPLOAD_DIR: str = os.getenv('UPLOAD_DIR', 'uploads')
    RATE_LIMIT_PER_MINUTE: int = int(os.getenv('RATE_LIMIT_PER_MINUTE', '60'))
    RATE_LIMIT_BURST: int = int(os.getenv('RATE_LIMIT_BURST', '10'))
    FOOD_MODEL_CONFIDENCE_THRESHOLD: float = float(os.getenv('FOOD_MODEL_CONFIDENCE_THRESHOLD', '0.7'))
    SUGAR_FORECAST_HORIZON_HOURS: int = int(os.getenv('SUGAR_FORECAST_HORIZON_HOURS', '24'))
    RISK_FORECAST_HORIZON_DAYS: int = int(os.getenv('RISK_FORECAST_HORIZON_DAYS', '30'))
    ENABLE_NOTIFICATIONS: bool = os.getenv('ENABLE_NOTIFICATIONS', 'True').lower() == 'true'
    SMTP_HOST: Optional[str] = os.getenv('SMTP_HOST')
    SMTP_PORT: int = int(os.getenv('SMTP_PORT', '587'))
    SMTP_USERNAME: Optional[str] = os.getenv('SMTP_USERNAME')
    SMTP_PASSWORD: Optional[str] = os.getenv('SMTP_PASSWORD')
    SMTP_USE_TLS: bool = os.getenv('SMTP_USE_TLS', 'True').lower() == 'true'
    ENABLE_METRICS: bool = os.getenv('ENABLE_METRICS', 'True').lower() == 'true'
    METRICS_PORT: int = int(os.getenv('METRICS_PORT', '9090'))
    HEALTH_CHECK_INTERVAL: int = int(os.getenv('HEALTH_CHECK_INTERVAL', '30'))

    @classmethod
    def get_database_config(cls) -> Dict[str, Any]:
        return {'url': cls.DATABASE_URL, 'echo': cls.DATABASE_ECHO, 'pool_size': cls.DATABASE_POOL_SIZE, 'pool_timeout': 30, 'pool_recycle': 3600, 'pool_pre_ping': True}

    @classmethod
    def get_redis_config(cls) -> Dict[str, Any]:
        config = {'url': cls.REDIS_URL, 'db': cls.REDIS_DB, 'decode_responses': True, 'socket_timeout': 5, 'socket_connect_timeout': 5, 'retry_on_timeout': True}
        if cls.REDIS_PASSWORD:
            config['password'] = cls.REDIS_PASSWORD
        return config

    @classmethod
    def get_model_config(cls) -> Dict[str, Any]:
        return {'models_dir': cls.MODELS_DIR, 'cache_size': cls.MODEL_CACHE_SIZE, 'preload_models': cls.PRELOAD_MODELS, 'confidence_thresholds': {'food_recognition': cls.FOOD_MODEL_CONFIDENCE_THRESHOLD, 'sugar_forecast': 0.8, 'risk_forecast': 0.7, 'meal_recommender': 0.6, 'chatbot': 0.5}}

    @classmethod
    def get_logging_config(cls) -> Dict[str, Any]:
        return {'level': cls.LOG_LEVEL, 'file': cls.LOG_FILE, 'format': cls.LOG_FORMAT, 'date_format': cls.LOG_DATE_FORMAT, 'max_bytes': 10485760, 'backup_count': 5}

    @classmethod
    def get_security_config(cls) -> Dict[str, Any]:
        return {'secret_key': cls.SECRET_KEY, 'algorithm': cls.ALGORITHM, 'access_token_expire_minutes': cls.ACCESS_TOKEN_EXPIRE_MINUTES, 'refresh_token_expire_days': cls.REFRESH_TOKEN_EXPIRE_DAYS, 'password_min_length': 8, 'password_require_special': True, 'password_require_numbers': True, 'password_require_uppercase': True}

    @classmethod
    def get_file_upload_config(cls) -> Dict[str, Any]:
        return {'max_file_size': cls.MAX_FILE_SIZE, 'allowed_extensions': cls.ALLOWED_EXTENSIONS, 'upload_dir': cls.UPLOAD_DIR, 'create_thumbnails': True, 'thumbnail_size': (224, 224), 'compress_images': True, 'compression_quality': 85}

    @classmethod
    def get_rate_limit_config(cls) -> Dict[str, Any]:
        return {'per_minute': cls.RATE_LIMIT_PER_MINUTE, 'burst': cls.RATE_LIMIT_BURST, 'window_size': 60, 'enabled': True}

    @classmethod
    def get_notification_config(cls) -> Dict[str, Any]:
        return {'enabled': cls.ENABLE_NOTIFICATIONS, 'smtp': {'host': cls.SMTP_HOST, 'port': cls.SMTP_PORT, 'username': cls.SMTP_USERNAME, 'password': cls.SMTP_PASSWORD, 'use_tls': cls.SMTP_USE_TLS}, 'templates': {'glucose_alert': 'templates/glucose_alert.html', 'meal_reminder': 'templates/meal_reminder.html', 'risk_warning': 'templates/risk_warning.html'}}

    @classmethod
    def get_monitoring_config(cls) -> Dict[str, Any]:
        return {'enabled': cls.ENABLE_METRICS, 'metrics_port': cls.METRICS_PORT, 'health_check_interval': cls.HEALTH_CHECK_INTERVAL, 'endpoints': {'health': '/health', 'metrics': '/metrics', 'ready': '/ready'}}

    @classmethod
    def validate_config(cls) -> List[str]:
        errors = []
        required_dirs = [cls.DATA_DIR, cls.MODELS_DIR, cls.UPLOAD_DIR]
        for directory in required_dirs:
            if not os.path.exists(directory):
                try:
                    os.makedirs(directory, exist_ok=True)
                    logger.info(f'Created directory: {directory}')
                except Exception as e:
                    errors.append(f'Cannot create directory {directory}: {str(e)}')
        if cls.ENVIRONMENT == 'production':
            if not cls.SECRET_KEY or cls.SECRET_KEY == 'your-secret-key-change-in-production':
                errors.append('SECRET_KEY must be set in production')
        if not cls.DATABASE_URL:
            errors.append('DATABASE_URL must be set')
        if cls.MAX_FILE_SIZE <= 0:
            errors.append('MAX_FILE_SIZE must be positive')
        if not cls.ALLOWED_EXTENSIONS:
            errors.append('ALLOWED_EXTENSIONS cannot be empty')
        return errors

    @classmethod
    def create_directories(cls):
        directories = [cls.DATA_DIR, cls.RAW_DATA_DIR, cls.PROCESSED_DATA_DIR, cls.FEATURES_DIR, cls.MODELS_DIR, cls.UPLOAD_DIR, 'logs', 'templates', 'static']
        for directory in directories:
            try:
                os.makedirs(directory, exist_ok=True)
                logger.info(f'Ensured directory exists: {directory}')
            except Exception as e:
                logger.error(f'Error creating directory {directory}: {str(e)}')

class ModelPaths:
    FOOD_RECOGNITION_MODEL = 'models/food_recognition_model.pkl'
    SUGAR_FORECAST_MODEL = 'models/sugar_forecast_model.pkl'
    RISK_FORECAST_MODEL = 'models/risk_forecast_model.pkl'
    MEAL_RECOMMENDER_MODEL = 'models/meal_recommender_model.pkl'
    CHATBOT_MODEL = 'models/chatbot_model.pkl'
    FOOD_MODEL_METADATA = 'models/food_model_metadata.json'
    SUGAR_MODEL_METADATA = 'models/sugar_model_metadata.json'
    RISK_MODEL_METADATA = 'models/risk_model_metadata.json'
    MEAL_MODEL_METADATA = 'models/meal_model_metadata.json'
    CHATBOT_MODEL_METADATA = 'models/chatbot_model_metadata.json'
    FOOD_PREPROCESSOR = 'models/food_preprocessor.pkl'
    GLUCOSE_PREPROCESSOR = 'models/glucose_preprocessor.pkl'
    TEXT_PREPROCESSOR = 'models/text_preprocessor.pkl'
    FOOD_FEATURES = 'data/features/food_features.json'
    GLUCOSE_FEATURES = 'data/features/glucose_features.json'
    USER_FEATURES = 'data/features/user_features.json'

    @classmethod
    def get_all_model_paths(cls) -> Dict[str, str]:
        return {'food_recognition': cls.FOOD_RECOGNITION_MODEL, 'sugar_forecast': cls.SUGAR_FORECAST_MODEL, 'risk_forecast': cls.RISK_FORECAST_MODEL, 'meal_recommender': cls.MEAL_RECOMMENDER_MODEL, 'chatbot': cls.CHATBOT_MODEL}

    @classmethod
    def get_model_metadata_paths(cls) -> Dict[str, str]:
        return {'food_recognition': cls.FOOD_MODEL_METADATA, 'sugar_forecast': cls.SUGAR_MODEL_METADATA, 'risk_forecast': cls.RISK_MODEL_METADATA, 'meal_recommender': cls.MEAL_MODEL_METADATA, 'chatbot': cls.CHATBOT_MODEL_METADATA}

class Constants:
    GLUCOSE_NORMAL_MIN = 70
    GLUCOSE_NORMAL_MAX = 180
    GLUCOSE_HYPO_THRESHOLD = 70
    GLUCOSE_HYPER_THRESHOLD = 180
    GLUCOSE_CRITICAL_LOW = 54
    GLUCOSE_CRITICAL_HIGH = 250
    HBA1C_NORMAL_MAX = 5.7
    HBA1C_PREDIABETES_MAX = 6.4
    HBA1C_DIABETES_MIN = 6.5
    BMI_UNDERWEIGHT_MAX = 18.5
    BMI_NORMAL_MAX = 24.9
    BMI_OVERWEIGHT_MAX = 29.9
    HOURS_PER_DAY = 24
    MINUTES_PER_HOUR = 60
    SECONDS_PER_MINUTE = 60
    BREAKFAST_HOURS = (6, 10)
    LUNCH_HOURS = (11, 14)
    DINNER_HOURS = (17, 20)
    SNACK_HOURS = (15, 16)
    EXERCISE_INTENSITY_LOW = 'low'
    EXERCISE_INTENSITY_MODERATE = 'moderate'
    EXERCISE_INTENSITY_HIGH = 'high'
    DIABETES_TYPE_1 = 'type1'
    DIABETES_TYPE_2 = 'type2'
    DIABETES_PREDIABETES = 'prediabetes'
    DIABETES_GESTATIONAL = 'gestational'
    RISK_LEVEL_LOW = 0
    RISK_LEVEL_MEDIUM = 1
    RISK_LEVEL_HIGH = 2
    SUCCESS_CODE = 200
    CREATED_CODE = 201
    BAD_REQUEST_CODE = 400
    UNAUTHORIZED_CODE = 401
    FORBIDDEN_CODE = 403
    NOT_FOUND_CODE = 404
    INTERNAL_ERROR_CODE = 500
    MAX_IMAGE_SIZE_MB = 10
    MAX_CSV_SIZE_MB = 50
    MAX_JSON_SIZE_MB = 5
    CACHE_TTL_SHORT = 300
    CACHE_TTL_MEDIUM = 1800
    CACHE_TTL_LONG = 3600
    CACHE_TTL_VERY_LONG = 86400
settings = Settings()
model_paths = ModelPaths()
constants = Constants()

def get_setting(key: str, default: Any=None) -> Any:
    return getattr(settings, key, default)

def is_production() -> bool:
    return settings.ENVIRONMENT == 'production'

def is_debug() -> bool:
    return settings.DEBUG

def get_model_path(model_name: str) -> str:
    paths = model_paths.get_all_model_paths()
    return paths.get(model_name, '')

def validate_glucose_level(glucose: float) -> str:
    if glucose < constants.GLUCOSE_CRITICAL_LOW:
        return 'critical_low'
    elif glucose < constants.GLUCOSE_HYPO_THRESHOLD:
        return 'low'
    elif glucose <= constants.GLUCOSE_NORMAL_MAX:
        return 'normal'
    elif glucose <= constants.GLUCOSE_HYPER_THRESHOLD:
        return 'high'
    else:
        return 'critical_high'

def get_meal_type_by_hour(hour: int) -> str:
    if constants.BREAKFAST_HOURS[0] <= hour <= constants.BREAKFAST_HOURS[1]:
        return 'breakfast'
    elif constants.LUNCH_HOURS[0] <= hour <= constants.LUNCH_HOURS[1]:
        return 'lunch'
    elif constants.DINNER_HOURS[0] <= hour <= constants.DINNER_HOURS[1]:
        return 'dinner'
    elif constants.SNACK_HOURS[0] <= hour <= constants.SNACK_HOURS[1]:
        return 'snack'
    else:
        return 'other'
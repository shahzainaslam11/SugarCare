import logging
import logging.handlers
import os
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime

def setup_logging(config: Dict[str, Any]) -> None:
    log_file = config.get('file', 'logs/sugarcare.log')
    log_dir = Path(log_file).parent
    log_dir.mkdir(parents=True, exist_ok=True)
    level = getattr(logging, config.get('level', 'INFO').upper())
    formatter = logging.Formatter(config.get('format', '%(asctime)s - %(name)s - %(levelname)s - %(message)s'), datefmt=config.get('date_format', '%Y-%m-%d %H:%M:%S'))
    root_logger = logging.getLogger()
    root_logger.setLevel(level)
    root_logger.handlers.clear()
    console_handler = logging.StreamHandler()
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)
    if log_file:
        file_handler = logging.handlers.RotatingFileHandler(log_file, maxBytes=config.get('max_bytes', 10485760), backupCount=config.get('backup_count', 5))
        file_handler.setLevel(level)
        file_handler.setFormatter(formatter)
        root_logger.addHandler(file_handler)
    configure_model_loggers()
    configure_api_loggers()
    logging.info(f"Logging configured - Level: {config.get('level', 'INFO')}, File: {log_file}")

def configure_model_loggers():
    model_loggers = ['models.food_model', 'models.sugar_forecast_model', 'models.risk_forecast_model', 'models.meal_recommender_model', 'models.chatbot_model', 'models.community_analysis']
    for logger_name in model_loggers:
        logger = logging.getLogger(logger_name)
        logger.setLevel(logging.INFO)

def configure_api_loggers():
    api_loggers = ['api.food_recognition', 'api.sugar_forecast', 'api.risk_forecast', 'api.meal_recommender', 'api.chatbot', 'api.community_insights']
    for logger_name in api_loggers:
        logger = logging.getLogger(logger_name)
        logger.setLevel(logging.INFO)

def get_logger(name: str) -> logging.Logger:
    return logging.getLogger(name)

def log_model_performance(logger: logging.Logger, model_name: str, metrics: Dict[str, Any]):
    logger.info(f'Model {model_name} performance metrics:')
    for metric, value in metrics.items():
        logger.info(f'  {metric}: {value}')

def log_api_request(logger: logging.Logger, endpoint: str, method: str, user_id: Optional[str]=None, response_time: Optional[float]=None, status_code: Optional[int]=None):
    log_data = {'endpoint': endpoint, 'method': method, 'user_id': user_id, 'response_time': f'{response_time:.3f}s' if response_time is not None else None, 'status_code': status_code, 'timestamp': datetime.now().isoformat()}
    logger.info(f'API Request: {log_data}')

def log_prediction(logger: logging.Logger, model_name: str, input_data: Any, prediction: Any, confidence: Optional[float]=None):
    log_data = {'model': model_name, 'input_shape': str(input_data.shape) if hasattr(input_data, 'shape') else str(type(input_data)), 'prediction': str(prediction), 'confidence': confidence, 'timestamp': datetime.now().isoformat()}
    logger.info(f'Model Prediction: {log_data}')

def log_error(logger: logging.Logger, error: Exception, context: Optional[str]=None):
    log_data = {'error_type': type(error).__name__, 'error_message': str(error), 'context': context, 'timestamp': datetime.now().isoformat()}
    logger.error(f'Error occurred: {log_data}', exc_info=True)

def log_data_processing(logger: logging.Logger, operation: str, input_size: int, output_size: int, processing_time: Optional[float]=None):
    log_data = {'operation': operation, 'input_size': input_size, 'output_size': output_size, 'processing_time': f'{processing_time:.3f}s' if processing_time is not None else None, 'timestamp': datetime.now().isoformat()}
    logger.info(f'Data Processing: {log_data}')

def log_user_action(logger: logging.Logger, user_id: str, action: str, details: Optional[Dict[str, Any]]=None):
    log_data = {'user_id': user_id, 'action': action, 'details': details, 'timestamp': datetime.now().isoformat()}
    logger.info(f'User Action: {log_data}')

def log_system_event(logger: logging.Logger, event: str, severity: str='INFO', details: Optional[Dict[str, Any]]=None):
    log_data = {'event': event, 'severity': severity, 'details': details, 'timestamp': datetime.now().isoformat()}
    if severity.upper() == 'ERROR':
        logger.error(f'System Event: {log_data}')
    elif severity.upper() == 'WARNING':
        logger.warning(f'System Event: {log_data}')
    else:
        logger.info(f'System Event: {log_data}')

def log_performance(logger_name: Optional[str]=None):

    def decorator(func):

        def wrapper(*args, **kwargs):
            logger = get_logger(logger_name or func.__module__)
            start_time = datetime.now()
            try:
                result = func(*args, **kwargs)
                end_time = datetime.now()
                processing_time = (end_time - start_time).total_seconds()
                logger.info(f'Function {func.__name__} completed in {processing_time:.3f}s')
                return result
            except Exception as e:
                end_time = datetime.now()
                processing_time = (end_time - start_time).total_seconds()
                logger.error(f'Function {func.__name__} failed after {processing_time:.3f}s: {str(e)}')
                raise
        return wrapper
    return decorator

class LoggingContext:

    def __init__(self, logger: logging.Logger, operation: str, **context):
        self.logger = logger
        self.operation = operation
        self.context = context
        self.start_time: Optional[datetime] = None

    def __enter__(self):
        self.start_time = datetime.now()
        self.logger.info(f'Starting {self.operation}', extra=self.context)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        end_time = datetime.now()
        start = self.start_time
        duration = (end_time - start).total_seconds() if start is not None else 0.0
        if exc_type is None:
            self.logger.info(f'Completed {self.operation} in {duration:.3f}s', extra=self.context)
        else:
            self.logger.error(f'Failed {self.operation} after {duration:.3f}s: {exc_val}', extra=self.context)
_default_logger = get_logger('sugarcare')
warning = _default_logger.warning
info = _default_logger.info
error = _default_logger.error
debug = _default_logger.debug

def initialize_logging():
    default_config = {'level': 'INFO', 'file': 'logs/sugarcare.log', 'format': '%(asctime)s - %(name)s - %(levelname)s - %(message)s', 'date_format': '%Y-%m-%d %H:%M:%S', 'max_bytes': 10485760, 'backup_count': 5}
    setup_logging(default_config)
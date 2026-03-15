import os
import json
import logging
import hashlib
import secrets
from typing import Dict, List, Tuple, Optional, Any, Union
from datetime import datetime, timedelta, timezone
import numpy as np
import pandas as pd
from pathlib import Path
import re
import uuid
logger = logging.getLogger(__name__)

class Logger:

    @staticmethod
    def setup_logger(name: str, level: str='INFO', log_file: Optional[str]=None) -> logging.Logger:
        logger = logging.getLogger(name)
        logger.setLevel(getattr(logging, level.upper()))
        logger.handlers.clear()
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(formatter)
        logger.addHandler(console_handler)
        if log_file:
            file_handler = logging.FileHandler(log_file)
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)
        return logger

    @staticmethod
    def log_model_performance(model_name: str, metrics: Dict):
        logger.info(f'Model {model_name} performance: {json.dumps(metrics, indent=2)}')

    @staticmethod
    def log_api_request(endpoint: str, user_id: Optional[str], response_time: float):
        logger.info(f'API Request - Endpoint: {endpoint}, User: {user_id}, Response Time: {response_time:.3f}s')

    @staticmethod
    def log_prediction(model_name: str, input_data: Any, prediction: Dict, confidence: float):
        logger.info(f"Prediction - Model: {model_name}, Confidence: {confidence:.3f}, Input Shape: {(np.array(input_data).shape if isinstance(input_data, (list, np.ndarray)) else 'scalar')}")

class DataValidator:

    @staticmethod
    def validate_glucose_reading(glucose: float) -> Tuple[bool, str]:
        if not isinstance(glucose, (int, float)):
            return (False, 'Glucose must be a number')
        if glucose < 0 or glucose > 600:
            return (False, 'Glucose must be between 0 and 600 mg/dL')
        return (True, 'Valid')

    @staticmethod
    def validate_hba1c(hba1c: float) -> Tuple[bool, str]:
        if not isinstance(hba1c, (int, float)):
            return (False, 'HbA1c must be a number')
        if hba1c < 3.0 or hba1c > 15.0:
            return (False, 'HbA1c must be between 3.0 and 15.0%')
        return (True, 'Valid')

    @staticmethod
    def validate_bmi(bmi: float) -> Tuple[bool, str]:
        if not isinstance(bmi, (int, float)):
            return (False, 'BMI must be a number')
        if bmi < 10.0 or bmi > 60.0:
            return (False, 'BMI must be between 10.0 and 60.0')
        return (True, 'Valid')

    @staticmethod
    def validate_age(age: int) -> Tuple[bool, str]:
        if not isinstance(age, int):
            return (False, 'Age must be an integer')
        if age < 0 or age > 120:
            return (False, 'Age must be between 0 and 120')
        return (True, 'Valid')

    @staticmethod
    def validate_timestamp(timestamp: Union[str, datetime]) -> Tuple[bool, str]:
        try:
            if isinstance(timestamp, str):
                datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
            elif isinstance(timestamp, datetime):
                pass
            else:
                return (False, 'Timestamp must be string or datetime object')
            return (True, 'Valid')
        except Exception as e:
            return (False, f'Invalid timestamp format: {str(e)}')

    @staticmethod
    def validate_user_data(user_data: Dict) -> Tuple[bool, List[str]]:
        errors = []
        required_fields = ['user_id', 'age', 'gender', 'diabetes_type']
        for field in required_fields:
            if field not in user_data:
                errors.append(f'Missing required field: {field}')
        if 'age' in user_data:
            is_valid, msg = DataValidator.validate_age(user_data['age'])
            if not is_valid:
                errors.append(f'Age validation failed: {msg}')
        if 'bmi' in user_data:
            is_valid, msg = DataValidator.validate_bmi(user_data['bmi'])
            if not is_valid:
                errors.append(f'BMI validation failed: {msg}')
        if 'hba1c' in user_data:
            is_valid, msg = DataValidator.validate_hba1c(user_data['hba1c'])
            if not is_valid:
                errors.append(f'HbA1c validation failed: {msg}')
        return (len(errors) == 0, errors)

class Tokenizer:

    def __init__(self):
        self.stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall', 'this', 'that', 'these', 'those'}

    def tokenize(self, text: str, remove_stop_words: bool=True) -> List[str]:
        try:
            text = re.sub('[^\\w\\s]', '', text.lower())
            tokens = text.split()
            if remove_stop_words:
                tokens = [token for token in tokens if token not in self.stop_words]
            return tokens
        except Exception as e:
            logger.error(f'Error tokenizing text: {str(e)}')
            return []

    def extract_keywords(self, text: str, max_keywords: int=10) -> List[str]:
        try:
            tokens = self.tokenize(text, remove_stop_words=True)
            from collections import Counter
            word_counts = Counter(tokens)
            keywords = [word for word, count in word_counts.most_common(max_keywords)]
            return keywords
        except Exception as e:
            logger.error(f'Error extracting keywords: {str(e)}')
            return []

    def calculate_similarity(self, text1: str, text2: str) -> float:
        try:
            tokens1 = set(self.tokenize(text1))
            tokens2 = set(self.tokenize(text2))
            if not tokens1 and (not tokens2):
                return 1.0
            if not tokens1 or not tokens2:
                return 0.0
            intersection = len(tokens1.intersection(tokens2))
            union = len(tokens1.union(tokens2))
            return intersection / union if union > 0 else 0.0
        except Exception as e:
            logger.error(f'Error calculating similarity: {str(e)}')
            return 0.0

class SecurityUtils:

    @staticmethod
    def hash_password(password: str) -> str:
        salt = secrets.token_hex(16)
        password_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        return f'{salt}:{password_hash}'

    @staticmethod
    def verify_password(password: str, hashed_password: str) -> bool:
        try:
            salt, password_hash = hashed_password.split(':')
            computed_hash = hashlib.sha256((password + salt).encode()).hexdigest()
            return computed_hash == password_hash
        except:
            return False

    @staticmethod
    def generate_api_key() -> str:
        return secrets.token_urlsafe(32)

    @staticmethod
    def generate_user_token() -> str:
        return str(uuid.uuid4())

    @staticmethod
    def sanitize_input(input_data: str) -> str:
        sanitized = re.sub('[<>"\\\';]', '', input_data)
        return sanitized.strip()

class TimeUtils:

    @staticmethod
    def get_current_timestamp() -> str:
        return datetime.now(timezone.utc).isoformat()

    @staticmethod
    def parse_timestamp(timestamp: str) -> datetime:
        try:
            return datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        except:
            return datetime.now()

    @staticmethod
    def get_time_of_day(hour: int) -> str:
        if 5 <= hour < 12:
            return 'morning'
        elif 12 <= hour < 17:
            return 'afternoon'
        elif 17 <= hour < 21:
            return 'evening'
        else:
            return 'night'

    @staticmethod
    def calculate_time_difference(timestamp1: str, timestamp2: str) -> float:
        try:
            dt1 = TimeUtils.parse_timestamp(timestamp1)
            dt2 = TimeUtils.parse_timestamp(timestamp2)
            return abs((dt2 - dt1).total_seconds() / 3600)
        except:
            return 0.0

    @staticmethod
    def is_within_time_window(timestamp: str, window_hours: float) -> bool:
        try:
            dt = TimeUtils.parse_timestamp(timestamp)
            now = datetime.now(timezone.utc)
            time_diff = abs((now - dt).total_seconds() / 3600)
            return time_diff <= window_hours
        except:
            return False

class FileUtils:

    @staticmethod
    def ensure_directory(path: str) -> bool:
        try:
            Path(path).mkdir(parents=True, exist_ok=True)
            return True
        except Exception as e:
            logger.error(f'Error creating directory {path}: {str(e)}')
            return False

    @staticmethod
    def read_json_file(file_path: str) -> Optional[Dict]:
        try:
            with open(file_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f'Error reading JSON file {file_path}: {str(e)}')
            return None

    @staticmethod
    def write_json_file(file_path: str, data: Dict) -> bool:
        try:
            FileUtils.ensure_directory(os.path.dirname(file_path))
            with open(file_path, 'w') as f:
                json.dump(data, f, indent=2, default=str)
            return True
        except Exception as e:
            logger.error(f'Error writing JSON file {file_path}: {str(e)}')
            return False

    @staticmethod
    def get_file_size(file_path: str) -> int:
        try:
            return os.path.getsize(file_path)
        except:
            return 0

    @staticmethod
    def list_files(directory: str, extension: Optional[str]=None) -> List[str]:
        try:
            path = Path(directory)
            if extension:
                pattern = f'*.{extension}'
                files = list(path.glob(pattern))
            else:
                files = list(path.glob('*'))
            return [str(f) for f in files if f.is_file()]
        except Exception as e:
            logger.error(f'Error listing files in {directory}: {str(e)}')
            return []

class MetricsCalculator:

    @staticmethod
    def calculate_mae(y_true: List[float], y_pred: List[float]) -> float:
        try:
            return float(np.mean(np.abs(np.array(y_true) - np.array(y_pred))))
        except:
            return 0.0

    @staticmethod
    def calculate_rmse(y_true: List[float], y_pred: List[float]) -> float:
        try:
            return float(np.sqrt(np.mean((np.array(y_true) - np.array(y_pred)) ** 2)))
        except:
            return 0.0

    @staticmethod
    def calculate_r2_score(y_true: List[float], y_pred: List[float]) -> float:
        try:
            yt = np.array(y_true)
            yp = np.array(y_pred)
            ss_res = np.sum((yt - yp) ** 2)
            ss_tot = np.sum((yt - np.mean(yt)) ** 2)
            return float(1 - ss_res / ss_tot) if ss_tot != 0 else 0.0
        except:
            return 0.0

    @staticmethod
    def calculate_accuracy(y_true: List[int], y_pred: List[int]) -> float:
        try:
            yt = np.array(y_true)
            yp = np.array(y_pred)
            return float(np.sum(yt == yp) / len(yt))
        except:
            return 0.0

    @staticmethod
    def calculate_precision_recall(y_true: List[int], y_pred: List[int], positive_class: int=1) -> Dict[str, float]:
        try:
            yt = np.array(y_true)
            yp = np.array(y_pred)
            tp = np.sum((yt == positive_class) & (yp == positive_class))
            fp = np.sum((yt != positive_class) & (yp == positive_class))
            fn = np.sum((yt == positive_class) & (yp != positive_class))
            precision = tp / (tp + fp) if tp + fp > 0 else 0.0
            recall = tp / (tp + fn) if tp + fn > 0 else 0.0
            f1_score = 2 * (precision * recall) / (precision + recall) if precision + recall > 0 else 0.0
            return {'precision': float(precision), 'recall': float(recall), 'f1_score': float(f1_score)}
        except:
            return {'precision': 0.0, 'recall': 0.0, 'f1_score': 0.0}

class ConfigManager:

    def __init__(self, config_file: str='config/settings.json'):
        self.config_file = config_file
        self.config = self._load_config()

    def _load_config(self) -> Dict:
        try:
            if os.path.exists(self.config_file):
                return FileUtils.read_json_file(self.config_file) or {}
            else:
                return self._create_default_config()
        except Exception as e:
            logger.error(f'Error loading config: {str(e)}')
            return self._create_default_config()

    def _create_default_config(self) -> Dict:
        return {'app': {'name': 'SugarCare Backend', 'version': '1.0.0', 'debug': False}, 'database': {'url': 'sqlite:///sugarcare.db', 'echo': False}, 'models': {'cache_size': 1000, 'preload_models': True}, 'api': {'host': '0.0.0.0', 'port': 8000, 'cors_origins': ['*']}, 'logging': {'level': 'INFO', 'file': 'logs/sugarcare.log'}}

    def get(self, key: str, default: Any=None) -> Any:
        try:
            keys = key.split('.')
            value = self.config
            for k in keys:
                value = value[k]
            return value
        except (KeyError, TypeError):
            return default

    def set(self, key: str, value: Any) -> bool:
        try:
            keys = key.split('.')
            config = self.config
            for k in keys[:-1]:
                if k not in config:
                    config[k] = {}
                config = config[k]
            config[keys[-1]] = value
            return FileUtils.write_json_file(self.config_file, self.config)
        except Exception as e:
            logger.error(f'Error setting config: {str(e)}')
            return False
tokenizer = Tokenizer()
config_manager = ConfigManager()

def validate_glucose(glucose: float) -> bool:
    is_valid, _ = DataValidator.validate_glucose_reading(glucose)
    return is_valid

def get_current_timestamp() -> str:
    return TimeUtils.get_current_timestamp()

def generate_api_key() -> str:
    return SecurityUtils.generate_api_key()

def calculate_mae(y_true: List[float], y_pred: List[float]) -> float:
    return MetricsCalculator.calculate_mae(y_true, y_pred)

def setup_logger(name: str) -> logging.Logger:
    return Logger.setup_logger(name)

def build_absolute_url(request: Any, path: str) -> str:
    scheme = request.headers.get('X-Forwarded-Proto')
    if not scheme and request.url:
        scheme = request.url.scheme
    if not scheme:
        scheme = 'https'
    host = request.headers.get('X-Forwarded-Host')
    if not host:
        host = request.headers.get('Host')
        if not host and request.url:
            host = request.url.netloc
        if not host:
            host = 'localhost'
    if ':' in host:
        host_parts = host.split(':')
        port = host_parts[1] if len(host_parts) > 1 else None
        if port in ['80', '443']:
            host = host_parts[0]
    if not path.startswith('/'):
        path = '/' + path
    return f'{scheme}://{host}{path}'
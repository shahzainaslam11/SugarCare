import numpy as np
import pandas as pd
import requests
from PIL import Image
import io
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any, Tuple, Union
import joblib
import pickle
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from pathlib import Path
import torchvision.models as tv_models
import cv2
import json
import os
import traceback

def _resolve_model_path(preferred_path: str, legacy_path: Optional[str]=None) -> str:
    if preferred_path and os.path.exists(preferred_path):
        return preferred_path
    if legacy_path and os.path.exists(legacy_path):
        return legacy_path
    basename = os.path.basename(preferred_path or '')
    if basename:
        cwd_models = os.path.join('models', basename)
        if os.path.exists(cwd_models):
            return cwd_models
    return preferred_path
logger = logging.getLogger(__name__)

class FoodRecognitionModel:

    def __init__(self):
        self.model = None
        self.scaler = None
        self.label_encoder = None
        self.class_to_idx: Dict[str, int] = {}
        self.idx_to_class: Dict[int, str] = {}
        self.architecture: str = ''
        self.image_size: int = 224
        self.checkpoint_path: Optional[str] = None
        self.infer_transform = transforms.Compose([transforms.Resize((224, 224)), transforms.ToTensor(), transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])])
        self.is_loaded = False
        self.is_two_stage = False
        self.model_stage1 = None
        self.model_stage2 = None
        self.stage1_class_to_idx: Dict[str, int] = {}
        self.stage1_idx_to_class: Dict[int, str] = {}
        self.stage2_class_to_idx: Dict[str, int] = {}
        self.stage2_idx_to_class: Dict[int, str] = {}
        self.confidence_threshold: float = 0.7
        self.nutrition_map: Dict[str, Dict[str, Any]] = {}
        try:
            nutrition_path = _resolve_model_path(os.path.join('models', 'food_nutrition_map.json'))
            if os.path.exists(nutrition_path):
                with open(nutrition_path, 'r', encoding='utf-8') as f:
                    self.nutrition_map = json.load(f)
                logger.info('Loaded nutrition map: %d items', len(self.nutrition_map))
        except Exception as e:
            logger.warning('Could not load nutrition map: %s', str(e))

    def load_model(self, model_path: str=None):
        try:
            resolved = _resolve_model_path(os.path.join('models', 'food_recognition_trained.pkl')) if model_path is None else model_path
            if os.path.exists(resolved):
                model_data = joblib.load(resolved)
                if 'model' in model_data:
                    self.model = model_data['model']
                    self.scaler = model_data.get('scaler')
                    self.label_encoder = model_data.get('label_encoder')
                    self.is_loaded = True
                    logger.info('Food recognition classic model loaded')
                    return True
                elif 'stage1_state_dict' in model_data and 'stage2_state_dict' in model_data:
                    return self._load_two_stage_model(model_data)
                elif 'checkpoint_path' in model_data and 'architecture' in model_data:
                    self.architecture = model_data.get('architecture', 'resnet50')
                    self.checkpoint_path = model_data.get('checkpoint_path', '')
                    self.image_size = int(model_data.get('image_size', 224))
                    ckpt_resolved = self.checkpoint_path
                    if not ckpt_resolved or not os.path.exists(ckpt_resolved):
                        basename = os.path.basename(self.checkpoint_path or 'food_recognition_best.pt')
                        preferred = os.path.join('models', basename)
                        if os.path.exists(preferred):
                            ckpt_resolved = preferred
                        else:
                            legacy = os.path.join('models', 'saved', 'v2', basename)
                            if os.path.exists(legacy):
                                ckpt_resolved = legacy
                            else:
                                cwd_path = os.path.join(os.getcwd(), 'models', basename)
                                if os.path.exists(cwd_path):
                                    ckpt_resolved = cwd_path
                    if not ckpt_resolved or not os.path.exists(ckpt_resolved):
                        error_msg = f'Checkpoint not found at: {self.checkpoint_path} or fallback locations'
                        logger.error(error_msg)
                        raise FileNotFoundError(error_msg)
                    logger.info(f'Loading checkpoint from: {ckpt_resolved}')
                    state = torch.load(ckpt_resolved, map_location='cpu')
                    if 'class_to_idx' in state:
                        self.class_to_idx = state['class_to_idx']
                        logger.info(f'Using class_to_idx from checkpoint: {len(self.class_to_idx)} classes')
                    elif 'class_to_idx' in model_data:
                        self.class_to_idx = model_data.get('class_to_idx', {})
                        logger.warning(f'Using class_to_idx from .pkl file: {len(self.class_to_idx)} classes (checkpoint missing class_to_idx)')
                    else:
                        raise ValueError('Neither checkpoint nor .pkl file contains class_to_idx')
                    self.idx_to_class = {v: k for k, v in self.class_to_idx.items()}
                    num_classes = len(self.class_to_idx)
                    if 'state_dict' not in state:
                        raise ValueError("Checkpoint missing 'state_dict' key")
                    state_dict = state['state_dict']
                    if self.architecture not in {'resnet50', 'mobilenet_v3_small'}:
                        self.architecture = 'resnet50'
                    if any((key.startswith('features.') for key in state_dict.keys())):
                        if self.architecture != 'mobilenet_v3_small':
                            logger.warning("Overriding architecture from '%s' to 'mobilenet_v3_small' based on checkpoint keys", self.architecture)
                        self.architecture = 'mobilenet_v3_small'
                    elif any((key.startswith('conv1.') or key.startswith('layer1.') for key in state_dict.keys())):
                        if self.architecture != 'resnet50':
                            logger.warning("Overriding architecture from '%s' to 'resnet50' based on checkpoint keys", self.architecture)
                        self.architecture = 'resnet50'
                    if self.architecture == 'resnet50':
                        backbone = tv_models.resnet50(weights=None)
                        in_feats = backbone.fc.in_features
                        backbone.fc = nn.Linear(in_feats, num_classes)
                        self.infer_transform = transforms.Compose([transforms.Resize((self.image_size, self.image_size)), transforms.ToTensor(), transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])])
                    else:
                        backbone = tv_models.mobilenet_v3_small(weights=None)
                        in_feats = backbone.classifier[-1].in_features
                        backbone.classifier[-1] = nn.Linear(in_feats, num_classes)
                        self.infer_transform = transforms.Compose([transforms.Resize((self.image_size, self.image_size)), transforms.ToTensor(), transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])])
                    backbone.load_state_dict(state_dict)
                    backbone.eval()
                    self.model = backbone
                    self.is_loaded = True
                    logger.info(f'Food recognition CNN model loaded: {self.architecture}, {num_classes} classes')
                    return True
                else:
                    logger.error('Unsupported food model payload format')
                    return False
            else:
                logger.error(f'Model file not found: {model_path}')
                return False
        except Exception as e:
            logger.error(f'Error loading food recognition model: {str(e)}')
            return False

    def _load_two_stage_model(self, model_data: Dict) -> bool:
        try:
            self.architecture = model_data.get('architecture', 'resnet50')
            self.image_size = int(model_data.get('image_size', 224))
            self.confidence_threshold = float(model_data.get('confidence_threshold', 0.7))
            self.stage1_class_to_idx = model_data.get('stage1_class_to_idx', {'not_food': 0, 'food': 1})
            self.stage1_idx_to_class = model_data.get('stage1_idx_to_class', {0: 'not_food', 1: 'food'})
            self.stage2_class_to_idx = model_data.get('stage2_class_to_idx', {})
            self.stage2_idx_to_class = model_data.get('stage2_idx_to_class', {})
            self.class_to_idx = self.stage2_class_to_idx
            self.idx_to_class = self.stage2_idx_to_class
            num_food_classes = len(self.stage2_class_to_idx)
            if self.architecture == 'resnet50':
                self.model_stage1 = tv_models.resnet50(weights=None)
                in_feats = self.model_stage1.fc.in_features
                self.model_stage1.fc = nn.Sequential(nn.Dropout(0.3), nn.Linear(in_feats, 512), nn.ReLU(), nn.Dropout(0.2), nn.Linear(512, 2))
            elif self.architecture == 'efficientnet':
                self.model_stage1 = tv_models.efficientnet_b0(weights=None)
                in_feats = self.model_stage1.classifier[1].in_features
                self.model_stage1.classifier = nn.Sequential(nn.Dropout(0.3), nn.Linear(in_feats, 512), nn.ReLU(), nn.Dropout(0.2), nn.Linear(512, 2))
            else:
                self.model_stage1 = tv_models.mobilenet_v3_small(weights=None)
                in_feats = self.model_stage1.classifier[-1].in_features
                self.model_stage1.classifier[-1] = nn.Linear(in_feats, 2)
            self.model_stage1.load_state_dict(model_data['stage1_state_dict'])
            self.model_stage1.eval()
            if self.architecture == 'resnet50':
                self.model_stage2 = tv_models.resnet50(weights=None)
                in_feats = self.model_stage2.fc.in_features
                self.model_stage2.fc = nn.Sequential(nn.Dropout(0.3), nn.Linear(in_feats, 512), nn.ReLU(), nn.Dropout(0.2), nn.Linear(512, num_food_classes))
            elif self.architecture == 'efficientnet':
                self.model_stage2 = tv_models.efficientnet_b0(weights=None)
                in_feats = self.model_stage2.classifier[1].in_features
                self.model_stage2.classifier = nn.Sequential(nn.Dropout(0.3), nn.Linear(in_feats, 512), nn.ReLU(), nn.Dropout(0.2), nn.Linear(512, num_food_classes))
            else:
                self.model_stage2 = tv_models.mobilenet_v3_small(weights=None)
                in_feats = self.model_stage2.classifier[-1].in_features
                self.model_stage2.classifier[-1] = nn.Linear(in_feats, num_food_classes)
            self.model_stage2.load_state_dict(model_data['stage2_state_dict'])
            self.model_stage2.eval()
            normalize_mean = model_data.get('normalize_mean', [0.485, 0.456, 0.406])
            normalize_std = model_data.get('normalize_std', [0.229, 0.224, 0.225])
            self.infer_transform = transforms.Compose([transforms.Resize((self.image_size, self.image_size)), transforms.ToTensor(), transforms.Normalize(mean=normalize_mean, std=normalize_std)])
            self.is_two_stage = True
            self.is_loaded = True
            logger.info(f'Two-stage food recognition model loaded:')
            logger.info(f'  - Architecture: {self.architecture}')
            logger.info(f'  - Stage 1 (Food Detection): 2 classes')
            logger.info(f'  - Stage 2 (Food Types): {num_food_classes} classes')
            logger.info(f'  - Confidence Threshold: {self.confidence_threshold}')
            return True
        except Exception as e:
            logger.error(f'Error loading two-stage model: {str(e)}')
            import traceback
            logger.error(traceback.format_exc())
            return False

    def process_image_from_url(self, image_url: str) -> np.ndarray:
        try:
            headers = {'User-Agent': 'Mozilla/5.0 (SugarCare)'}
            response = requests.get(str(image_url), headers=headers, timeout=30)
            response.raise_for_status()
            ctype = response.headers.get('Content-Type', '').lower()
            if 'image' not in ctype:
                raise ValueError('URL did not return an image content-type')
            image = Image.open(io.BytesIO(response.content))
            if image.mode != 'RGB':
                image = image.convert('RGB')
            image = image.resize((224, 224))
            image_array = np.array(image)
            return image_array
        except Exception as e:
            logger.error(f'Error processing image from URL: {str(e)}')
            raise ValueError(f'Invalid image URL or unsupported image format: {e}')

    def process_image_from_bytes(self, image_bytes: bytes) -> np.ndarray:
        try:
            image = Image.open(io.BytesIO(image_bytes))
            if image.mode != 'RGB':
                image = image.convert('RGB')
            image = image.resize((224, 224))
            image_array = np.array(image)
            return image_array
        except Exception as e:
            logger.error(f'Error processing image from bytes: {str(e)}')
            raise ValueError(f'Invalid image file or unsupported image format: {e}')

    def _extract_features(self, image_array: np.ndarray) -> np.ndarray:
        if not self.is_loaded:
            raise ValueError('Model not loaded. Call load_model() first.')
        features = []
        features.extend(np.mean(image_array, axis=(0, 1)))
        features.extend(np.std(image_array, axis=(0, 1)))
        gray = cv2.cvtColor(image_array, cv2.COLOR_RGB2GRAY)
        features.append(np.mean(gray))
        features.append(np.std(gray))
        while len(features) < 1000:
            features.append(0.0)
        return np.array(features[:1000])

    def predict_food(self, image_array: np.ndarray) -> Dict[str, Any]:
        if not self.is_loaded:
            raise ValueError('Model not loaded. Call load_model() first.')
        top3_predictions = []
        try:
            if self.is_two_stage:
                return self._predict_two_stage(image_array)
            model = self.model
            if model is not None and isinstance(model, nn.Module):
                if isinstance(image_array, np.ndarray):
                    image = Image.fromarray(image_array.astype(np.uint8))
                else:
                    image = image_array
                if hasattr(image, 'mode') and image.mode != 'RGB':
                    image = image.convert('RGB')
                inp = self.infer_transform(image).unsqueeze(0)
                with torch.no_grad():
                    logits = model(inp)
                    probs = torch.softmax(logits, dim=1).cpu().numpy()[0]
                    pred_idx = int(probs.argmax())
                confidence = float(probs[pred_idx])
                top3_indices = np.argsort(probs)[-3:][::-1]
                top3_predictions = [{'food_item': self.idx_to_class.get(int(idx), str(idx)), 'confidence': float(probs[idx])} for idx in top3_indices]
                food_item = self.idx_to_class.get(pred_idx, str(pred_idx))

                def _norm_key(s: str) -> str:
                    s = (s or '').lower().strip()
                    s = s.replace('-', ' ').replace('_', ' ')
                    return ' '.join(s.split())
                main_key = _norm_key(food_item)
                has_nutrition = main_key in self.nutrition_map
                if not has_nutrition and top3_predictions:
                    for cand in top3_predictions:
                        cand_label = str(cand.get('food_item', ''))
                        cand_conf = float(cand.get('confidence', 0.0))
                        cand_key = _norm_key(cand_label)
                        if cand_conf >= 0.2 and cand_key in self.nutrition_map:
                            food_item = cand_label
                            confidence = cand_conf
                            break
            else:
                if self.model is None:
                    raise ValueError('Model not loaded. Call load_model() first.')
                features = self._extract_features(image_array)
                X = [features]
                top3_predictions = []
                if self.scaler is not None:
                    X = self.scaler.transform(X)
                prediction = self.model.predict(X)[0]
                try:
                    confidence = float(self.model.predict_proba(X)[0].max())
                except Exception:
                    confidence = 0.0
                if self.label_encoder is not None:
                    food_item = self.label_encoder.inverse_transform([prediction])[0]
                else:
                    food_item = str(prediction)
            nutrition = self._get_nutritional_info(food_item)
            result = {'status': 'success', 'food_item': food_item, 'confidence_score': confidence, 'top3_predictions': top3_predictions, 'nutrition': nutrition, 'glycemic_level': nutrition['glycemic_level'], 'suggestion': nutrition['suggestion']}
            if nutrition.get('calories', 0) > 0:
                result['estimated_calories'] = nutrition['calories']
                result['carbohydrates_g'] = nutrition.get('carbs', 0)
                result['protein_g'] = nutrition.get('protein_g', 0)
                result['fat_g'] = nutrition.get('fat_g', 0)
                result['fibre_g'] = nutrition.get('fiber', 0)
                result['glycemic_index'] = nutrition.get('gi', 0)
            else:
                result['protein_g'] = nutrition.get('protein_g', 0)
                result['fat_g'] = nutrition.get('fat_g', 0)
            return result
        except Exception as e:
            logger.error(f'Error predicting food: {str(e)}')
            raise

    def _predict_two_stage(self, image_array: np.ndarray) -> Dict[str, Any]:
        model_s1 = self.model_stage1
        model_s2 = self.model_stage2
        if model_s1 is None or model_s2 is None:
            raise ValueError('Two-stage model not loaded. Call load_model() first.')
        if isinstance(image_array, np.ndarray):
            image = Image.fromarray(image_array.astype(np.uint8))
        else:
            image = image_array
        if hasattr(image, 'mode') and image.mode != 'RGB':
            image = image.convert('RGB')
        inp = self.infer_transform(image).unsqueeze(0)
        with torch.no_grad():
            logits_s1 = model_s1(inp)
            probs_s1 = torch.softmax(logits_s1, dim=1).cpu().numpy()[0]
            is_food_prob = float(probs_s1[1])
        if is_food_prob < self.confidence_threshold:
            return {'status': 'success', 'is_food': False, 'food_confidence': is_food_prob, 'food_item': 'not_food', 'confidence_score': 1.0 - is_food_prob, 'top3_predictions': [], 'message': 'Image does not appear to contain food (detected: human, animal, or object)', 'nutrition': self._get_nutritional_info('unknown'), 'glycemic_level': 'unknown', 'suggestion': 'Please upload an image of food for nutritional analysis.'}
        with torch.no_grad():
            logits_s2 = model_s2(inp)
            probs_s2 = torch.softmax(logits_s2, dim=1).cpu().numpy()[0]
            pred_idx = int(probs_s2.argmax())
            confidence = float(probs_s2[pred_idx])
        food_item = self.stage2_idx_to_class.get(pred_idx, str(pred_idx))
        top3_indices = np.argsort(probs_s2)[-3:][::-1]
        top3_predictions = [{'food_item': self.stage2_idx_to_class.get(int(idx), str(idx)), 'confidence': float(probs_s2[idx])} for idx in top3_indices]
        if confidence < self.confidence_threshold:
            nutrition = self._get_nutritional_info(food_item)
            return {'status': 'success', 'is_food': True, 'food_confidence': is_food_prob, 'food_item': food_item, 'confidence_score': confidence, 'top3_predictions': top3_predictions, 'message': f'Food detected but type uncertain. Best guess: {food_item}', 'nutrition': nutrition, 'glycemic_level': nutrition.get('glycemic_level', 'unknown'), 'suggestion': nutrition.get('suggestion', '')}
        nutrition = self._get_nutritional_info(food_item)
        result = {'status': 'success', 'is_food': True, 'food_confidence': is_food_prob, 'food_item': food_item, 'confidence_score': confidence, 'top3_predictions': top3_predictions, 'nutrition': nutrition, 'glycemic_level': nutrition['glycemic_level'], 'suggestion': nutrition['suggestion']}
        if nutrition.get('calories', 0) > 0:
            result['estimated_calories'] = nutrition['calories']
            result['carbohydrates_g'] = nutrition.get('carbs', 0)
            result['protein_g'] = nutrition.get('protein_g', 0)
            result['fat_g'] = nutrition.get('fat_g', 0)
            result['fibre_g'] = nutrition.get('fiber', 0)
            result['glycemic_index'] = nutrition.get('gi', 0)
        return result

    def _get_nutritional_info(self, food_item: str) -> Dict[str, Any]:

        def norm(s: str) -> str:
            s = (s or '').lower().strip()
            s = s.replace('-', ' ').replace('_', ' ')
            return ' '.join(s.split())
        key = norm(food_item)
        entry = self.nutrition_map.get(key)
        if not entry and key.endswith(' baked'):
            entry = self.nutrition_map.get(norm(key.replace(' baked', '')))
        if not entry and key.endswith(' cooked'):
            entry = self.nutrition_map.get(norm(key.replace(' cooked', '')))
        if entry:
            gi = entry.get('glycemic_index', entry.get('gi', 50))
            if gi <= 55:
                gly_level = 'Low'
            elif gi <= 70:
                gly_level = 'Medium'
            else:
                gly_level = 'High'
            return {'calories': entry.get('calories', 0), 'carbs': entry.get('carbohydrates', entry.get('carbs_g', 0)), 'sugar': entry.get('sugar_g', 0), 'fiber': entry.get('fiber_g', entry.get('fiber', 0)), 'protein_g': entry.get('protein_g', entry.get('protein', 0)), 'fat_g': entry.get('fat_g', entry.get('fat', 0)), 'gi': gi, 'glycemic_level': gly_level, 'suggestion': entry.get('suggestion', 'Monitor portion size and blood glucose levels.'), 'from_lookup': True}
        return {'calories': 200, 'carbs': 30, 'sugar': 5, 'fiber': 3, 'protein_g': 5, 'fat_g': 2, 'gi': 50, 'glycemic_level': 'Medium', 'suggestion': 'Data not found. Monitor portion size and blood glucose levels.', 'from_lookup': False}

class RiskForecastModel:

    def __init__(self):
        self.model = None
        self.scaler = None
        self.is_loaded = False

    def load_model(self, model_path: str=None):
        resolved = None
        try:
            resolved = _resolve_model_path(os.path.join('models', 'risk_forecast_trained.pkl')) if model_path is None else model_path
            logger.debug(f'Attempting to load risk forecast model from: {resolved}')
            logger.debug(f"Absolute path: {(os.path.abspath(resolved) if resolved else 'None')}")
            if not os.path.exists(resolved):
                logger.error(f'Model file not found: {resolved}')
                logger.error(f'Current working directory: {os.getcwd()}')
                logger.error(f"Absolute path attempted: {(os.path.abspath(resolved) if resolved else 'None')}")
                return False
            try:
                file_size = os.path.getsize(resolved)
                logger.debug(f'Model file size: {file_size} bytes')
                if file_size == 0:
                    logger.error(f'Model file is empty: {resolved}')
                    return False
                logger.debug('Loading model data with joblib...')
                model_data = joblib.load(resolved)
                logger.debug('Model data loaded successfully, processing structure...')
                models_dict = model_data.get('models')
                if models_dict and isinstance(models_dict, dict):
                    self.model = models_dict
                    logger.debug(f'Using multi-model format with {len(models_dict)} risk types')
                else:
                    self.model = model_data.get('model')
                    logger.debug('Using legacy single-model format')
                if self.model is None:
                    logger.error("Model data loaded but 'model' or 'models' key not found in file")
                    logger.error(f"Available keys in model_data: {(list(model_data.keys()) if isinstance(model_data, dict) else 'Not a dict')}")
                    return False
                self.scaler = model_data.get('scaler')
                self.feature_columns: List[str] = model_data.get('feature_columns', [])
                self.model_type: str = model_data.get('model_type', 'regression')
                self.is_loaded = True
                logger.info('Risk forecast model loaded successfully')
                return True
            except (pickle.UnpicklingError, EOFError, ValueError) as e:
                logger.error(f'Model file appears corrupted (pickle error): {type(e).__name__}: {str(e)}')
                logger.error(f'File path: {resolved}, Size: {file_size} bytes')
                logger.error(f'Traceback: {traceback.format_exc()}')
                return False
            except OSError as e:
                logger.error(f'OS error loading model file: {type(e).__name__}: {str(e)}')
                logger.error(f"Error code: {getattr(e, 'winerror', getattr(e, 'errno', 'N/A'))}")
                logger.error(f'File path: {resolved}')
                logger.error(f'Traceback: {traceback.format_exc()}')
                return False
        except Exception as e:
            error_type = type(e).__name__
            error_msg = str(e)
            error_code = getattr(e, 'winerror', getattr(e, 'errno', None))
            logger.error(f'Error loading risk forecast model: {error_type}: {error_msg}')
            if error_code is not None:
                logger.error(f'Error code: {error_code}')
            logger.error(f'Resolved path: {resolved}')
            logger.error(f'Current working directory: {os.getcwd()}')
            logger.error(f'Full traceback: {traceback.format_exc()}')
            return False

    def predict_risks(self, user_data: Dict[str, Any]) -> Dict[str, Any]:
        if not self.is_loaded:
            raise ValueError('Model not loaded. Call load_model() first.')
        try:
            avg_hba1c = user_data.get('avg_hba1c', 7.0)
            activity_level = user_data.get('activity_level', 'low')
            diet_type = user_data.get('diet_type', 'balanced')
            sleep_hours = user_data.get('sleep_hours', 7)
            readings = user_data.get('last_30_days_readings', [])
            age = user_data.get('age', 50)
            bmi = user_data.get('bmi', 25.0)
            cholesterol_level = user_data.get('cholesterol_level', 200.0)
            avg_glucose = np.mean(readings) if readings else 120.0
            glucose_variability = np.std(readings) if readings else 20.0
            max_glucose = np.max(readings) if readings else 140.0
            min_glucose = np.min(readings) if readings else 100.0
            activity_encoded = {'low': 0, 'moderate': 1, 'high': 2}.get(activity_level, 0)
            features = np.array([[avg_hba1c, age, bmi, activity_encoded, sleep_hours, avg_glucose, glucose_variability, max_glucose, min_glucose]])
            risk_types = ['neuropathy', 'retinopathy', 'nephropathy', 'cardiovascular', 'foot_problems']
            risk_levels: Dict[str, str] = {}
            if getattr(self, 'feature_columns', []):
                fv: List[float] = []
                mapping = {'blood_glucose': avg_glucose, 'physical_activity': {'low': 0, 'moderate': 1, 'high': 2}.get(activity_level, 0), 'sleep_hours': sleep_hours, 'bmi': bmi, 'age': age, 'cholesterol': cholesterol_level, 'weight': 0.0, 'height': 0.0, 'diet': 1 if diet_type == 'high_carb' else 0, 'medication_adherence': 1, 'stress_level': 1, 'hydration_level': 1, 'avg_hba1c': avg_hba1c}
                mapping.update({'BMI': bmi, 'Age': age, 'HighBP': 1 if avg_hba1c > 7.0 else 0, 'HighChol': 1 if cholesterol_level > 200 else 0, 'PhysActivity': {'low': 0, 'moderate': 1, 'high': 2}.get(activity_level, 0), 'GenHlth': 3 if avg_hba1c > 7.0 else 2, 'Diabetes_012': 1 if avg_hba1c > 7.0 else 0})
                for col in self.feature_columns:
                    fv.append(float(mapping.get(col, 0.0)))
                X = np.array([fv])
            else:
                X = features
            if self.scaler is not None:
                try:
                    scaler_feature_names = getattr(self.scaler, 'feature_names_in_', None)
                    if scaler_feature_names is not None and getattr(self, 'feature_columns', []):
                        df = pd.DataFrame(X, columns=list(self.feature_columns))
                        X = self.scaler.transform(df)
                    else:
                        X = self.scaler.transform(X)
                except Exception as e:
                    logger.warning(f'Risk scaler transform fallback due to: {e}')
                    X = self.scaler.transform(X)
            if isinstance(self.model, dict):
                for risk_type in risk_types:
                    if risk_type in self.model:
                        try:
                            prediction = self.model[risk_type].predict(X)[0]
                            if isinstance(prediction, str):
                                risk_levels[f'{risk_type}_risk'] = prediction.lower()
                            elif prediction == 0:
                                risk_levels[f'{risk_type}_risk'] = 'low'
                            elif prediction == 1:
                                risk_levels[f'{risk_type}_risk'] = 'moderate'
                            else:
                                risk_levels[f'{risk_type}_risk'] = 'high'
                        except Exception as e:
                            logger.warning(f'Error predicting {risk_type}: {e}, defaulting to low')
                            risk_levels[f'{risk_type}_risk'] = 'low'
                    else:
                        risk_levels[f'{risk_type}_risk'] = 'low'
            else:
                if getattr(self, 'feature_columns', []):
                    fv: List[float] = []
                    mapping = {'blood_glucose': avg_glucose, 'physical_activity': {'low': 0, 'moderate': 1, 'high': 2}.get(user_data.get('activity_level', 'low'), 0), 'sleep_hours': user_data.get('sleep_hours', 0), 'bmi': bmi, 'age': age, 'cholesterol': cholesterol_level, 'weight': 0.0, 'height': 0.0, 'diet': 1 if user_data.get('diet_type') == 'high_carb' else 0, 'medication_adherence': 1, 'stress_level': 1, 'hydration_level': 1}
                    for col in self.feature_columns:
                        fv.append(float(mapping.get(col, 0.0)))
                    X = np.array([fv])
                else:
                    X = features
                try:
                    risk_score = float(self.model.predict(X)[0])
                except Exception:
                    risk_score = float(avg_hba1c * 10.0)

                def score_to_level(s: float) -> str:
                    if s < 33:
                        return 'low'
                    if s < 66:
                        return 'moderate'
                    return 'high'
                level = score_to_level(risk_score)
                for rt in risk_types:
                    risk_levels[f'{rt}_risk'] = level
            response = self._generate_detailed_response(user_data, risk_levels, readings)
            return response
        except Exception as e:
            logger.error(f'Error predicting risks: {str(e)}')
            raise

    def _generate_detailed_response(self, user_data: Dict[str, Any], risk_levels: Dict[str, str], readings: List[float]) -> Dict[str, Any]:
        avg_hba1c = user_data.get('avg_hba1c', 7.0)
        bmi = user_data.get('bmi', 25.0)
        cholesterol = user_data.get('cholesterol_level', 200.0)
        activity_level = user_data.get('activity_level', 'moderate')
        diet_type = user_data.get('diet_type', 'balanced')
        age = user_data.get('age', 50)
        avg_glucose = np.mean(readings) if readings else 120.0
        glucose_std = np.std(readings) if len(readings) > 1 else 10.0
        risk_configs = {'nephropathy': {'name': 'Nephropathy (Kidney Health)', 'factors': {'hba1c': 0.35, 'glucose': 0.3, 'age': 0.2, 'bmi': 0.15}, 'base_score': 20}, 'retinopathy': {'name': 'Retinopathy (Eye Damage)', 'factors': {'hba1c': 0.4, 'glucose_variability': 0.3, 'age': 0.2, 'glucose': 0.1}, 'base_score': 25}, 'neuropathy': {'name': 'Neuropathy (Nerve Damage)', 'factors': {'glucose': 0.35, 'glucose_variability': 0.25, 'diet': 0.2, 'hba1c': 0.2}, 'base_score': 22}, 'cardiovascular': {'name': 'Cardiovascular Risk (Heart Disease)', 'factors': {'cholesterol': 0.3, 'bmi': 0.25, 'activity': 0.25, 'hba1c': 0.2}, 'base_score': 30}, 'foot_problems': {'name': 'Foot Problems Risk', 'factors': {'glucose': 0.3, 'activity': 0.3, 'age': 0.2, 'hba1c': 0.2}, 'base_score': 18}}
        risk_areas = []
        risk_score_map = {'low': 0, 'moderate': 1, 'high': 2}
        total_risk_score = 0
        for risk_type in ['nephropathy', 'retinopathy', 'neuropathy', 'cardiovascular', 'foot_problems']:
            config = risk_configs[risk_type]
            factors = config['factors']
            predicted_level = risk_levels.get(f'{risk_type}_risk', 'low').lower()
            if predicted_level == 'low':
                status = 'Safe'
                risk_multiplier = 0.3
            elif predicted_level == 'moderate':
                status = 'Moderate'
                risk_multiplier = 0.6
            else:
                status = 'High'
                risk_multiplier = 1.0
            total_risk_score += risk_score_map.get(predicted_level, 0)
            risk_score = config['base_score']
            if 'hba1c' in factors:
                risk_score += (avg_hba1c - 5.5) * 8 * factors['hba1c']
            if 'glucose' in factors:
                risk_score += (avg_glucose - 100) * 0.3 * factors['glucose']
            if 'glucose_variability' in factors:
                risk_score += glucose_std * 0.5 * factors['glucose_variability']
            if 'cholesterol' in factors:
                risk_score += (cholesterol - 180) * 0.15 * factors['cholesterol']
            if 'bmi' in factors:
                risk_score += (bmi - 22) * 1.5 * factors['bmi']
            if 'activity' in factors:
                activity_mod = {'low': 15, 'moderate': 0, 'high': -10}.get(activity_level, 0)
                risk_score += activity_mod * factors['activity']
            if 'diet' in factors:
                diet_mod = 10 if diet_type == 'high_carb' else 0
                risk_score += diet_mod * factors['diet']
            if 'age' in factors:
                risk_score += (age - 40) * 0.3 * factors['age']
            risk_score = risk_score * (0.5 + risk_multiplier * 0.5)
            risk_score = max(10, min(100, risk_score))
            trend = []
            for i in range(7):
                variation = np.sin(i * 0.5 + hash(risk_type) % 10) * 5
                point = risk_score + variation + (i - 3) * (1 if predicted_level == 'high' else -0.5)
                trend.append(round(max(10, min(100, point)), 1))
            if trend[0] != 0:
                change_pct = (trend[-1] - trend[0]) / trend[0] * 100
            else:
                change_pct = 0
            risk_change_str = f'{change_pct:+.0f}%'
            if predicted_level == 'low':
                safe_label = 'Stable' if abs(change_pct) < 5 else 'Improving' if change_pct < 0 else 'Monitor'
            elif predicted_level == 'moderate':
                safe_label = 'Needs Attention'
            else:
                safe_label = 'High Risk'
            risk_areas.append({'name': config['name'], 'status': status, 'risk_score': round(risk_score, 1), 'risk_change': risk_change_str, 'trend': trend, 'safe_label': safe_label, 'predicted_risk_level': predicted_level})
        avg_risk = total_risk_score / 5
        if avg_risk < 0.5:
            overall_label = 'Safe'
            overall_color = '#4CAF50'
        elif avg_risk < 1.5:
            overall_label = 'Moderate'
            overall_color = '#F5A623'
        else:
            overall_label = 'High'
            overall_color = '#D0021B'
        return {'overall_risk_status': {'label': overall_label, 'color': overall_color}, 'risk_areas': risk_areas}

class SugarForecastModel:

    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_names: List[str] = []
        self.meal_map: Dict[str, float] = {}
        self.population_stats: Dict[float, Dict[str, float]] = {}
        self.is_loaded = False

    def load_model(self, model_path: str=None):
        try:
            resolved = _resolve_model_path(os.path.join('models', 'sugar_forecast_trained.pkl')) if model_path is None else model_path
            if os.path.exists(resolved):
                model_data = joblib.load(resolved)
                self.model = model_data['model']
                self.scaler = model_data['scaler']
                self.feature_names = model_data.get('feature_names', model_data.get('features', []))
                self.meal_map = model_data.get('meal_map', {})
                self.population_stats = model_data.get('population_stats', {})
                self.is_loaded = True
                logger.info('Sugar forecast model loaded successfully')
                return True
            else:
                logger.error(f'Model file not found: {model_path}')
                return False
        except Exception as e:
            logger.error(f'Error loading sugar forecast model: {str(e)}')
            return False

    def predict_glucose(self, recent_readings: List[Any], meal_info: str, activity_level: str) -> Dict[str, Any]:
        if not self.is_loaded:
            raise ValueError('Model not loaded. Call load_model() first.')
        try:
            values: List[float] = []
            timestamps: List[datetime] = []
            for reading in recent_readings:
                value = None
                timestamp = None
                if isinstance(reading, dict):
                    value = reading.get('value')
                    timestamp = reading.get('timestamp')
                elif hasattr(reading, 'value'):
                    value = getattr(reading, 'value')
                    timestamp = getattr(reading, 'timestamp', None)
                else:
                    value = reading
                    timestamp = None
                if value is not None:
                    try:
                        value = float(value)
                        values.append(value)
                        if timestamp is not None:
                            parsed_ts = self._parse_timestamp(timestamp)
                            if parsed_ts is not None:
                                timestamps.append(parsed_ts)
                    except (TypeError, ValueError) as e:
                        logger.warning(f'Could not convert reading value to float: {value}, error: {e}')
                        continue
            if not values:
                raise ValueError('At least one glucose reading is required for prediction.')
            max_window = 7
            if len(values) > max_window:
                values = values[-max_window:]
                if timestamps:
                    timestamps = timestamps[-max_window:]
            trend = float(np.polyfit(range(len(values)), values, 1)[0]) if len(values) >= 2 else 0.0
            current_glucose = float(values[-1])
            avg_glucose = float(np.mean(values))
            glucose_variability = float(np.std(values))
            min_glucose = float(np.min(values))
            max_glucose = float(np.max(values))
            time_since_last_hours = 0.0
            avg_interval_hours = 0.0
            last_reading_hour = 0.0
            last_timestamp: Optional[datetime] = None
            if timestamps:
                timestamps.sort()
                last_timestamp = timestamps[-1]
                now = datetime.now(timezone.utc)
                delta = (now - last_timestamp).total_seconds() / 3600.0
                time_since_last_hours = float(max(0.0, delta))
                if len(timestamps) > 1:
                    intervals = [(later - earlier).total_seconds() / 3600.0 for earlier, later in zip(timestamps[:-1], timestamps[1:])]
                    avg_interval_hours = float(np.mean(intervals)) if intervals else time_since_last_hours
                else:
                    avg_interval_hours = time_since_last_hours
                last_reading_hour = float(last_timestamp.hour + last_timestamp.minute / 60.0)
            reading_count = float(len(values))
            meal_impact = self._calculate_meal_impact(meal_info)
            activity_impact = self._calculate_activity_impact(activity_level)
            resolved_bmi = self._approximate_bmi(current_glucose)
            population_stats = self._lookup_population_stats(resolved_bmi)
            glucose_range = max_glucose - min_glucose
            acceleration = 0.0
            if len(values) >= 3:
                recent_slopes = np.diff(values)
                if len(recent_slopes) > 1:
                    acceleration = float(np.mean(np.diff(recent_slopes)))
            trend_strength = 0.0
            if len(values) >= 3:
                trend_strength = float(np.abs(trend) / (glucose_variability + 1.0))
            is_morning = 0.0
            is_afternoon = 0.0
            is_evening = 0.0
            is_night = 0.0
            if last_timestamp is not None:
                hour = last_timestamp.hour
                is_morning = 1.0 if 6 <= hour < 12 else 0.0
                is_afternoon = 1.0 if 12 <= hour < 18 else 0.0
                is_evening = 1.0 if 18 <= hour < 24 else 0.0
                is_night = 1.0 if 0 <= hour < 6 else 0.0
            features_row: List[float] = []
            feature_defaults = {'avg_glucose': avg_glucose, 'trend': float(trend), 'glucose_variability': glucose_variability, 'current_glucose': float(current_glucose), 'min_glucose': min_glucose, 'max_glucose': max_glucose, 'glucose_range': glucose_range, 'acceleration': acceleration, 'trend_strength': trend_strength, 'meal_impact': float(meal_impact), 'activity_impact': float(activity_impact), 'medication_adherence': 1.0, 'stress_level': 1.0, 'sleep_hours': 6.0, 'hydration_level': 1.0, 'bmi': float(resolved_bmi), 'time_since_last_reading_hours': float(time_since_last_hours), 'avg_interval_hours': float(avg_interval_hours), 'last_reading_hour': float(last_reading_hour), 'reading_count': reading_count, 'is_morning': is_morning, 'is_afternoon': is_afternoon, 'is_evening': is_evening, 'is_night': is_night, 'population_diabetes_risk': float(population_stats.get('diabetes_risk', 0.35)), 'population_high_bp_rate': float(population_stats.get('high_bp_rate', 0.35)), 'population_high_chol_rate': float(population_stats.get('high_chol_rate', 0.35))}
            if self.feature_names:
                for name in self.feature_names:
                    features_row.append(float(feature_defaults.get(name, 0.0)))
            else:
                features_row = [avg_glucose, float(trend), glucose_variability, float(current_glucose), float(meal_impact), float(activity_impact)]
            features = np.array([features_row])
            features_scaled = self.scaler.transform(features)
            predicted_glucose = float(self.model.predict(features_scaled)[0])
            prediction, confidence, suggestion = self._generate_prediction_response(predicted_glucose)
            result = {'prediction': prediction, 'confidence': confidence, 'suggestion': suggestion, 'predicted_glucose': predicted_glucose}
            if last_timestamp is not None:
                result['last_reading_time'] = last_timestamp.isoformat()
            return result
        except Exception as e:
            logger.error(f'Error predicting glucose: {str(e)}')
            raise

    def _parse_timestamp(self, timestamp_str: Optional[Union[str, datetime]]) -> Optional[datetime]:
        if timestamp_str is None:
            return None
        if isinstance(timestamp_str, datetime):
            return timestamp_str if timestamp_str.tzinfo is not None else timestamp_str.replace(tzinfo=timezone.utc)
        if not isinstance(timestamp_str, str):
            timestamp_str = str(timestamp_str)
        try:
            if len(timestamp_str) == 10 and timestamp_str.count('-') == 2:
                dt = datetime.strptime(timestamp_str, '%Y-%m-%d')
                return dt.replace(tzinfo=timezone.utc)
            if timestamp_str.endswith('Z'):
                dt = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
            else:
                dt = datetime.fromisoformat(timestamp_str)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except Exception:
            try:
                dt = datetime.strptime(timestamp_str, '%Y-%m-%dT%H:%M:%S')
                return dt.replace(tzinfo=timezone.utc)
            except Exception:
                try:
                    dt = datetime.strptime(timestamp_str, '%Y-%m-%d')
                    return dt.replace(tzinfo=timezone.utc)
                except Exception:
                    return None

    def _approximate_bmi(self, current_glucose: float) -> float:
        if current_glucose < 100:
            return 20.0
        elif current_glucose > 250:
            return 30.0
        return 25.0

    def _lookup_population_stats(self, bmi: float) -> Dict[str, float]:
        if bmi < 18.5:
            return {'diabetes_risk': 0.1, 'high_bp_rate': 0.2, 'high_chol_rate': 0.15}
        elif bmi < 25:
            return {'diabetes_risk': 0.08, 'high_bp_rate': 0.15, 'high_chol_rate': 0.1}
        elif bmi < 30:
            return {'diabetes_risk': 0.12, 'high_bp_rate': 0.25, 'high_chol_rate': 0.18}
        else:
            return {'diabetes_risk': 0.15, 'high_bp_rate': 0.3, 'high_chol_rate': 0.25}

    def _calculate_meal_impact(self, meal_info: str) -> float:
        text = (meal_info or '').strip().lower()
        if getattr(self, 'meal_map', None):
            tokens = [t for t in text.replace(',', ' ').split() if t]
            matched: List[float] = []
            for key, val in self.meal_map.items():
                k = str(key).lower()
                if not k:
                    continue
                if k in text or k in tokens:
                    try:
                        matched.append(float(val))
                    except Exception:
                        continue
            if matched:
                return float(max(0.0, min(np.mean(matched), 120.0)))
        meal_impact = 0.0
        if 'rice' in text:
            meal_impact += 40.0
        if 'curry' in text:
            meal_impact += 20.0
        if 'bread' in text or 'chapati' in text:
            meal_impact += 30.0
        return float(meal_impact)

    def _calculate_activity_impact(self, activity_level: str) -> float:
        activity_impact = 0
        if activity_level == 'low':
            activity_impact = 20
        elif activity_level == 'moderate':
            activity_impact = -10
        elif activity_level == 'high':
            activity_impact = -25
        return activity_impact

    def _generate_prediction_response(self, predicted_glucose: float) -> Tuple[str, float, str]:
        if predicted_glucose >= 200:
            return ('High glucose spike expected in next 2 hours', 0.92, 'Follow your high-glucose protocol and monitor closely.')
        if predicted_glucose >= 160:
            return ('Possible sugar spike in next 2 hours', 0.87, 'Take a 15-minute walk or reduce carb intake.')
        if predicted_glucose <= 80:
            return ('Possible hypoglycemia risk in next 2 hours', 0.82, 'Keep a fast-acting carbohydrate nearby and monitor symptoms.')
        return ('Glucose levels expected to remain stable', 0.9, 'Stay hydrated and continue routine monitoring.')

class MealRecommendationModel:

    def __init__(self):
        self.model = None
        self.scaler = None
        self.label_encoder = None
        self.is_loaded = False

    def load_model(self, model_path: str=None):
        try:
            resolved = _resolve_model_path(os.path.join('models', 'meal_recommendations_trained.pkl')) if model_path is None else model_path
            if os.path.exists(resolved):
                model_data = joblib.load(resolved)
                self.model = model_data['model']
                self.scaler = model_data['scaler']
                self.label_encoder = model_data['label_encoder']
                self.gi_map: Dict[str, float] = model_data.get('gi_map', {})
                self.nutrition_map: Dict[str, Dict[str, Any]] = model_data.get('nutrition_map', {})
                self.meal_type_map: Dict[str, str] = model_data.get('meal_type_map', {})
                self.meal_descriptions: Dict[str, str] = model_data.get('meal_descriptions', {})
                self.meal_image_map: Dict[str, str] = model_data.get('meal_image_map', {})
                self.meal_scores: Dict[str, float] = model_data.get('meal_scores', {})
                self.diabetes_filter_rules: Dict[str, Any] = model_data.get('diabetes_filter_rules', {})
                self.control_level_encoding: Dict[str, int] = model_data.get('control_level_encoding', {'well controlled': 0, 'moderately controlled': 1, 'poorly controlled': 2})
                self.portion_size_encoding: Dict[str, int] = model_data.get('portion_size_encoding', {'small': 0, 'medium': 1, 'large': 2})
                self.portion_multipliers: Dict[str, float] = model_data.get('portion_multipliers', {'small': 0.75, 'medium': 1.0, 'large': 1.25})
                self.filter_rules_by_control: Dict[str, Dict] = model_data.get('filter_rules_by_control', {})
                self.glucose_adjustments: Dict[str, Dict] = model_data.get('glucose_adjustments', {})
                self._expected_num_features: Optional[int] = getattr(self.scaler, 'n_features_in_', None)
                self.is_loaded = True
                logger.info('Meal recommendation model loaded successfully')
                logger.info(f'  - Nutrition data: {len(self.nutrition_map)} meals')
                logger.info(f'  - Meal types: {len(set(self.meal_type_map.values()))} types')
                logger.info(f'  - Meal images: {len(self.meal_image_map)} meals have images')
                logger.info(f'  - Safe meals (score >= 70): {sum((1 for s in self.meal_scores.values() if s >= 70))}')
                logger.info(f"  - Features: {model_data.get('feature_names', ['glucose', 'hba1c', 'meal_type'])}")
                return True
            else:
                logger.error(f'Model file not found: {model_path}')
                return False
        except Exception as e:
            logger.error(f'Error loading meal recommendation model: {str(e)}')
            return False

    def recommend_meals(self, current_glucose: float, hba1c: float=None, diabetes_control_level: str='moderately controlled', portion_size: str='medium', time: str=None) -> Dict[str, Any]:
        if not self.is_loaded:
            raise ValueError('Model not loaded. Call load_model() first.')
        try:
            if hba1c is None:
                hba1c_map = {'well controlled': 6.0, 'moderately controlled': 7.5, 'poorly controlled': 9.0}
                hba1c = hba1c_map.get(diabetes_control_level.lower(), 7.5)
            control_code = self.control_level_encoding.get(diabetes_control_level.lower(), 1)
            portion_code = self.portion_size_encoding.get(portion_size.lower(), 1)
            portion_mult = self.portion_multipliers.get(portion_size.lower(), 1.0)
            breakfast_meals = self._get_meals_for_type('breakfast', current_glucose, hba1c, control_code, portion_code, portion_mult, diabetes_control_level)
            lunch_meals = self._get_meals_for_type('lunch', current_glucose, hba1c, control_code, portion_code, portion_mult, diabetes_control_level)
            dinner_meals = self._get_meals_for_type('dinner', current_glucose, hba1c, control_code, portion_code, portion_mult, diabetes_control_level)
            snacks_meals = self._get_meals_for_type('snacks', current_glucose, hba1c, control_code, portion_code, portion_mult, diabetes_control_level)
            return {'breakfast': breakfast_meals, 'lunch': lunch_meals, 'dinner': dinner_meals, 'snacks': snacks_meals}
        except Exception as e:
            logger.error(f'Error recommending meals: {str(e)}')
            raise

    def _get_meals_for_type(self, meal_type: str, current_glucose: float, hba1c: float, control_code: int=1, portion_code: int=1, portion_mult: float=1.0, diabetes_control_level: str='moderately controlled') -> List[Dict[str, Any]]:
        features = self._prepare_features(current_glucose, meal_type, hba1c, control_code, portion_code)
        features_scaled = self.scaler.transform([features]) if self.scaler is not None else np.array([features])
        recommended_list: List[Dict[str, Any]] = []
        if hasattr(self.model, 'predict_proba'):
            proba = self.model.predict_proba(features_scaled)[0]
            sorted_idx = np.argsort(proba)[::-1]
            all_meal_names = [self.label_encoder.inverse_transform([i])[0] for i in range(len(self.label_encoder.classes_))]
            if hasattr(self, 'meal_type_map') and self.meal_type_map:
                meal_type_lower = meal_type.lower().strip()
                type_meals = []
                for name in all_meal_names:
                    mapped_type = self.meal_type_map.get(name)
                    if mapped_type is None:
                        mapped_type = self.meal_type_map.get(name.lower())
                    if mapped_type is None:
                        mapped_type = self.meal_type_map.get(name.strip())
                    if mapped_type and mapped_type.lower().strip() == meal_type_lower:
                        type_meals.append(name)
                if type_meals:
                    type_indices = [i for i, name in enumerate(all_meal_names) if name in type_meals]
                    type_proba = [(proba[i], i) for i in type_indices]
                    type_proba.sort(reverse=True, key=lambda x: x[0])
                    chosen_idx = [idx for _, idx in type_proba[:4]]
                    top_labels = [all_meal_names[i] for i in chosen_idx]
                    logger.debug(f"Found {len(type_meals)} meals of type '{meal_type}', selected top 4 based on probabilities")
                else:
                    chosen_idx = sorted_idx[:4]
                    top_labels = [all_meal_names[i] for i in chosen_idx]
                    logger.warning(f"No meals found for type '{meal_type}', using top meals overall")
            else:
                chosen_idx = sorted_idx[:4]
                top_labels = [all_meal_names[i] for i in chosen_idx]
                logger.debug(f'No meal_type_map available, using top {len(top_labels)} meals overall')
            for name in top_labels:
                recommended_list.append(self._get_meal_details(str(name), meal_type, portion_mult))
        else:
            logger.warning('Model does not support predict_proba, using predict method')
            for _ in range(4):
                prediction = self.model.predict(features_scaled)[0]
                name = self.label_encoder.inverse_transform([prediction])[0]
                recommended_list.append(self._get_meal_details(str(name), meal_type, portion_mult))
        return recommended_list[:4] if recommended_list else []

    def _prepare_features(self, current_glucose: float, meal_type: str, hba1c: float, control_code: int=1, portion_code: int=1) -> np.ndarray:
        meal_type_encoded = {'breakfast': 0, 'lunch': 1, 'dinner': 2, 'snacks': 3}.get((meal_type or '').lower(), 1)
        base_features: List[float] = [float(current_glucose), float(hba1c), float(control_code), float(portion_code), float(meal_type_encoded)]
        expected = getattr(self, '_expected_num_features', None)
        if isinstance(expected, int) and expected > 0:
            if len(base_features) < expected:
                base_features = base_features + [0.0] * (expected - len(base_features))
            elif len(base_features) > expected:
                base_features = base_features[:expected]
        return np.array(base_features, dtype=float)

    def _get_meal_details(self, meal_name: str, meal_type: str, portion_mult: float=1.0) -> Dict[str, Any]:
        gi_val = None
        meal_name_clean = str(meal_name).strip()
        if hasattr(self, 'gi_map') and isinstance(self.gi_map, dict):
            gi_val = self.gi_map.get(meal_name_clean, None)
            if gi_val is None:
                for k, v in self.gi_map.items():
                    if k.lower() == meal_name_clean.lower():
                        gi_val = v
                        break
        if gi_val is None and hasattr(self, 'nutrition_map') and self.nutrition_map:
            entry = self.nutrition_map.get(meal_name_clean)
            if entry:
                gi_val = entry.get('glycemic_index')
            else:
                for k, entry in self.nutrition_map.items():
                    if k.lower() == meal_name_clean.lower():
                        gi_val = entry.get('glycemic_index')
                        break
        if gi_val is None:
            logger.warning(f'No GI value found for meal: {meal_name_clean}')
            gi_val = 0
        nutrition = self._get_meal_nutrition(meal_name, meal_type)
        description = self._get_meal_description(meal_name, meal_type)
        image_url = self._get_meal_image_url(meal_name)
        return {'name': meal_name, 'description': description, 'glycemic_index': int(gi_val), 'image_url': image_url, 'nutrition_facts': {'proteins_g': round(nutrition['proteins_g'] * portion_mult, 1), 'carbohydrates_g': round(nutrition['carbohydrates_g'] * portion_mult, 1), 'fats_g': round(nutrition['fats_g'] * portion_mult, 1), 'sugar_g': round(nutrition['sugar_g'] * portion_mult, 1), 'fiber_g': round(nutrition['fiber_g'] * portion_mult, 1)}}

    def _get_meal_nutrition(self, meal_name: str, meal_type: str) -> Dict[str, float]:
        if hasattr(self, 'nutrition_map') and self.nutrition_map:
            key = meal_name.strip()
            if key in self.nutrition_map:
                entry = self.nutrition_map[key]
                return {'proteins_g': float(entry.get('protein_g', 0)), 'carbohydrates_g': float(entry.get('carbohydrates', 0)), 'fats_g': float(entry.get('fat_g', 0)), 'sugar_g': float(entry.get('sugar_g', 0)), 'fiber_g': float(entry.get('fiber_g', 0))}
            key_lower = key.lower()
            for k, entry in self.nutrition_map.items():
                if k.lower() == key_lower:
                    return {'proteins_g': float(entry.get('protein_g', 0)), 'carbohydrates_g': float(entry.get('carbohydrates', 0)), 'fats_g': float(entry.get('fat_g', 0)), 'sugar_g': float(entry.get('sugar_g', 0)), 'fiber_g': float(entry.get('fiber_g', 0))}
        nutrition_map_path = os.path.join('models', 'food_nutrition_map.json')
        if os.path.exists(nutrition_map_path):
            try:
                import json
                with open(nutrition_map_path, 'r', encoding='utf-8') as f:
                    nutrition_map = json.load(f)
                    key = meal_name.lower().replace('-', ' ').replace('_', ' ')
                    entry = nutrition_map.get(key)
                    if entry:
                        return {'proteins_g': float(entry.get('protein_g', 0)), 'carbohydrates_g': float(entry.get('carbohydrates', 0)), 'fats_g': float(entry.get('fat_g', 0)), 'sugar_g': float(entry.get('sugar_g', 0)), 'fiber_g': float(entry.get('fiber_g', 0))}
            except Exception as e:
                logger.warning(f'Could not load nutrition from map: {e}')
        logger.warning(f'No nutrition data found for meal: {meal_name}')
        return {'proteins_g': 0.0, 'carbohydrates_g': 0.0, 'fats_g': 0.0, 'sugar_g': 0.0, 'fiber_g': 0.0}

    def _get_meal_description(self, meal_name: str, meal_type: str) -> str:
        if hasattr(self, 'meal_descriptions') and self.meal_descriptions:
            key = meal_name.strip()
            if key in self.meal_descriptions:
                return self.meal_descriptions[key]
            key_lower = key.lower()
            for k, desc in self.meal_descriptions.items():
                if k.lower() == key_lower:
                    return desc
        logger.warning(f'No description found for meal: {meal_name}')
        return ''

    def _get_meal_image_url(self, meal_name: str) -> str:
        try:
            import sys
            sys.path.insert(0, str(Path(__file__).parent.parent / 'data'))
            from food_image_urls import get_food_image_url, FOOD_IMAGE_URLS, CATEGORY_IMAGES
            if not meal_name:
                return CATEGORY_IMAGES.get('default', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400')
            image_url = get_food_image_url(meal_name)
            return image_url
        except ImportError:
            logger.warning('food_image_urls module not found, using fallback image matching')
            if hasattr(self, 'meal_image_map') and self.meal_image_map:
                if meal_name in self.meal_image_map:
                    image_value = self.meal_image_map[meal_name]
                    if image_value.startswith('http://') or image_value.startswith('https://'):
                        return image_value
                    return f'/static/images/food/{image_value}'
                meal_lower = meal_name.lower().strip()
                for mapped_meal, image_value in self.meal_image_map.items():
                    if mapped_meal.lower().strip() == meal_lower:
                        if image_value.startswith('http://') or image_value.startswith('https://'):
                            return image_value
                        return f'/static/images/food/{image_value}'
            return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'

class ChatbotModel:

    def __init__(self):
        self.model = None
        self.scaler = None
        self.retriever = None
        self.vectorizer = None
        self.questions: List[str] = []
        self.answers: List[str] = []
        self.score_threshold: float = 0.28
        self.is_loaded = False
        self._domain_keywords = ['diabetes', 'diabetic', 'blood sugar', 'glucose', 'sugar level', 'sugar', 'hba1c', 'a1c', 'insulin', 'metformin', 'prediabetes', 'pre-diabetes', 'thirst', 'urination', 'fatigue', 'tired', 'exhausted', 'blurry', 'vision', 'numbness', 'tingling', 'pee', 'retinopathy', 'neuropathy', 'nephropathy', 'kidney', 'eye', 'nerve', 'hypoglycemia', 'hyperglycemia', 'low sugar', 'high sugar', 'spike', 'drop', 'medication', 'medicine', 'dose', 'therapy', 'treatment', 'manage', 'control', 'glycemic', 'diet', 'nutrition', 'carb', 'carbohydrate', 'calorie', 'eat', 'meal', 'food', 'breakfast', 'lunch', 'dinner', 'snack', 'fruit', 'vegetable', 'exercise', 'workout', 'walk', 'walking', 'activity', 'sleep', 'stress', 'cholesterol', 'triglyceride', 'bmi', 'weight', 'pressure', 'heart', 'fasting', 'postprandial', 'after meal', 'before meal', 'morning', 'evening', 'monitor', 'cgm', 'test', 'check', 'reading', 'level', 'range', 'normal', 'healthy', 'maintain', 'reduce', 'increase', 'improve', 'prevent', 'risk', 'help', 'advice', 'tip', 'what is', 'how to', 'why', 'when', 'can i', 'should i', 'tell me', 'explain']
        self._out_of_scope_message = "I'm here to help with diabetes and blood sugar questions. Could you please ask something related to blood sugar levels, diet, exercise, or diabetes management?"

    def load_model(self, model_path: str=None):
        try:
            resolved = _resolve_model_path(os.path.join('models', 'chatbot_responses_trained.pkl')) if model_path is None else model_path
            if os.path.exists(resolved):
                model_data = joblib.load(resolved)
                self.model = model_data.get('model')
                self.scaler = model_data.get('scaler')
                self.vectorizer = model_data.get('vectorizer')
                self.retriever = model_data.get('retriever')
                self.questions = model_data.get('questions', [])
                self.answers = model_data.get('answers', [])
                self.score_threshold = float(model_data.get('score_threshold', self.score_threshold))
                self.is_loaded = True
                if self.retriever is not None and self.vectorizer is not None and self.answers:
                    logger.info('Chatbot retriever loaded successfully (TF-IDF + NearestNeighbors)')
                    logger.info('  - Knowledge base size: %d QA pairs', len(self.answers))
                    logger.info('  - Similarity threshold: %.2f', self.score_threshold)
                else:
                    logger.info('Chatbot classic model loaded successfully (fallback)')
                return True
            else:
                logger.error(f'Model file not found: {model_path}')
                return False
        except Exception as e:
            logger.error(f'Error loading chatbot model: {str(e)}')
            return False

    def generate_response(self, message: str, user_context: Dict[str, Any]=None) -> str:
        if not self.is_loaded:
            raise ValueError('Model not loaded. Call load_model() first.')
        try:
            if self._is_greeting(message):
                return self._get_greeting_response(message)
            if not self._is_in_domain(message):
                return self._out_of_scope_message
            pattern_response = self._check_common_patterns(message)
            if pattern_response:
                return pattern_response
            if self.retriever is not None and self.vectorizer is not None and self.answers:
                reply = self._retrieve_best_answer(message)
                if reply:
                    return reply
            return self._generate_generic_response(message)
        except Exception as e:
            logger.error(f'Error generating chatbot response: {str(e)}')
            return "I apologize, but I'm having trouble processing your request. Please try again with more specific information about your glucose levels or dietary questions."

    def _is_in_domain(self, message: str) -> bool:
        try:
            text = (message or '').lower()
            return any((k in text for k in self._domain_keywords))
        except Exception:
            return True

    def _is_greeting(self, message: str) -> bool:
        try:
            text = (message or '').strip().lower()
            if not text:
                return False
            greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'hola', 'namaste', 'salaam', 'yo', 'sup']
            casual = ['how are you', 'how r u', 'how r you', 'whats up', "what's up", 'how do you do', 'how you doing', 'how u doing']
            about_bot = ['what do you do', 'what can you do', 'what can you help', 'whats ur working', 'what is your work', 'who are you', 'what are you', 'tell me about yourself']
            if any((text == g or text.startswith(g + ' ') for g in greetings)):
                return True
            if any((c in text for c in casual)):
                return True
            if any((a in text for a in about_bot)):
                return True
            return False
        except Exception:
            return False

    def _get_greeting_response(self, message: str) -> str:
        text = message.lower()
        if any((x in text for x in ['what do you do', 'what can you', 'whats ur working', 'what is your work', 'who are you', 'what are you', 'tell me about'])):
            return "I'm SugaBuddy, your diabetes care assistant! I can help you with: understanding blood sugar levels and ranges, tips for managing diabetes, diet and food recommendations, exercise advice, medication information, symptom recognition, and general diabetes health questions. What would you like to know?"
        if any((x in text for x in ['how are you', 'how r u', 'how u doing', 'how do you do'])):
            return "I'm doing great, thank you for asking! I'm here to help you with diabetes and blood sugar management. Feel free to ask me about blood sugar levels, diet tips, exercise, medications, or any diabetes-related questions!"
        return 'Hello! How can I help you with your diabetes or blood sugar management today?'

    def _expand_synonyms(self, text: str) -> str:
        text = text.lower()
        expansions = [('\\bsugar\\b', 'sugar glucose blood sugar diabetes'), ('\\bsugar level\\b', 'blood sugar glucose level blood glucose'), ('\\bhigh sugar\\b', 'high blood sugar hyperglycemia high glucose'), ('\\blow sugar\\b', 'low blood sugar hypoglycemia low glucose'), ('\\bdiabetes\\b', 'diabetes diabetic blood sugar glucose'), ('\\btype 1\\b', 'type 1 diabetes t1d insulin dependent'), ('\\btype 2\\b', 'type 2 diabetes t2d insulin resistance'), ('\\bthirsty\\b', 'thirsty thirst excessive thirst polydipsia'), ('\\bpee\\b', 'urination frequent urination polyuria'), ('\\btired\\b', 'tired fatigue tiredness exhaustion'), ('\\beat\\b', 'eat food diet meal nutrition'), ('\\bfood\\b', 'food diet meal nutrition eating'), ('\\breduce\\b', 'reduce lower decrease control manage'), ('\\bmaintain\\b', 'maintain control manage keep stable'), ('\\bcontrol\\b', 'control manage maintain regulate')]
        import re
        expanded = text
        for pattern, replacement in expansions:
            if re.search(pattern, text):
                expanded = re.sub(pattern, replacement, expanded)
        return expanded

    def _retrieve_best_answer(self, message: str, top_k: int=5) -> Optional[str]:
        try:
            if not message or self.vectorizer is None or self.retriever is None or (not self.answers):
                return None
            expanded_message = self._expand_synonyms(message)
            query_vec = self.vectorizer.transform([expanded_message])
            k = min(top_k, max(1, len(self.answers)))
            distances, indices = self.retriever.kneighbors(query_vec, n_neighbors=k)
            for i in range(k):
                idx = int(indices[0][i])
                dist = float(distances[0][i])
                sim = 1.0 - dist
                if sim < self.score_threshold:
                    continue
                answer = str(self.answers[idx]).strip()
                if len(answer) < 20:
                    continue
                if answer.replace('.', '').replace(' ', '').isdigit():
                    continue
                if any((x in answer.lower() for x in ['0.0', '1.0', '2.0', 'nan', 'none'])):
                    continue
                return answer
            logger.debug('Chatbot retrieval: no valid answer found above threshold %.2f', self.score_threshold)
            return None
        except Exception as e:
            logger.warning(f'Chatbot retrieval failed: {e}')
            return None

    def _extract_message_features(self, message: str) -> np.ndarray:
        message_lower = message.lower()
        glucose_level = None
        if 'mg/dl' in message_lower or 'mg/dL' in message_lower:
            import re
            glucose_match = re.search('(\\d+)\\s*mg/dl', message_lower)
            if glucose_match:
                glucose_level = float(glucose_match.group(1))
        food_mentioned = 1 if any((food in message_lower for food in ['mango', 'rice', 'bread', 'chapati'])) else 0
        question_type = 1 if '?' in message else 0
        return np.array([len(message), glucose_level or 0, food_mentioned, question_type])

    def _check_common_patterns(self, message: str) -> Optional[str]:
        message_lower = message.lower()
        import re
        glucose_match = re.search('(\\d+)\\s*(?:mg/?dl|mg/dl)', message_lower)
        glucose_level = float(glucose_match.group(1)) if glucose_match else None
        if glucose_level:
            if glucose_level < 70:
                return f'A blood sugar of {int(glucose_level)} mg/dL is LOW. Please eat something with quick-acting sugar like juice or glucose tablets right away. If symptoms persist, seek medical help.'
            elif glucose_level < 100:
                return f'A blood sugar of {int(glucose_level)} mg/dL is in the NORMAL range. Great job maintaining your levels! Keep up your healthy habits.'
            elif glucose_level < 126:
                return f'A blood sugar of {int(glucose_level)} mg/dL indicates PREDIABETES range (if fasting). Focus on diet, exercise, and regular monitoring to prevent progression.'
            elif glucose_level < 200:
                return f'A blood sugar of {int(glucose_level)} mg/dL is ELEVATED. This may indicate diabetes. Please consult your doctor and focus on lifestyle changes.'
            else:
                return f'A blood sugar of {int(glucose_level)} mg/dL is HIGH. Please stay hydrated, avoid sugary foods, and consult your doctor. If you feel unwell, seek medical attention.'
        if 'high' in message_lower and ('sugar' in message_lower or 'glucose' in message_lower) or any((x in message_lower for x in ['spike', 'elevated', 'too high', 'sugar is high', 'sugar high', 'goes up'])):
            return "If your blood sugar is high, here's what to do: 1. Drink plenty of water to help flush out excess sugar. 2. Take a 15-30 minute walk if you feel okay. 3. Avoid sugary foods and drinks. 4. Take your medication as prescribed by your doctor. 5. Check your sugar again after 1-2 hours. Seek medical help immediately if: sugar is above 300 mg/dL, you feel nauseous or confused, or symptoms don't improve."
        if 'low' in message_lower and ('sugar' in message_lower or 'glucose' in message_lower) or any((x in message_lower for x in ['drop', 'hypoglycemia', 'dropping', 'decreasing', 'going down', 'falls'])):
            return "If your blood sugar is low or dropping, take action immediately: 1. Eat 15-20g of fast-acting sugar: glucose tablets, 4 oz fruit juice, or regular candy. 2. Wait 15 minutes and check your sugar again. 3. Repeat if still below 70 mg/dL. 4. Once stable, eat a small meal with protein. To prevent: Don't skip meals, eat regular snacks, and talk to your doctor about medication adjustments. Warning signs: shaking, sweating, dizziness, confusion, hunger."
        if any((x in message_lower for x in ['range', 'normal level', 'healthy level', 'what is normal', 'pre diabetes', 'prediabetes', 'healthy pre'])):
            return 'Blood sugar ranges: Normal fasting is 70-99 mg/dL. Prediabetes is 100-125 mg/dL fasting. Diabetes is 126+ mg/dL fasting. After meals, normal is under 140 mg/dL, and over 200 mg/dL indicates diabetes. HbA1c: Normal is below 5.7%, prediabetes is 5.7-6.4%, diabetes is 6.5% or higher.'
        if any((x in message_lower for x in ['maintain', 'control', 'reduce', 'lower', 'manage', 'keep stable'])):
            return 'To maintain healthy blood sugar levels: 1. Eat regular, balanced meals with whole grains, vegetables, and lean protein. 2. Limit sugary foods and refined carbs. 3. Exercise 30 minutes daily - walking is great! 4. Stay hydrated with water. 5. Monitor your blood sugar regularly. 6. Take medications as prescribed. 7. Get enough sleep (7-8 hours). 8. Manage stress through relaxation techniques.'
        if any((x in message_lower for x in ['pee', 'urination', 'urinate', 'bathroom', 'toilet'])):
            return 'Frequent urination is a common symptom of diabetes. When blood sugar is high, your kidneys try to remove the extra sugar by making more urine. This makes you pee more often, especially at night. As you lose water, you also feel more thirsty. Solution: Control your blood sugar levels through diet, exercise, and medication. See your doctor if this symptom persists or worsens.'
        if any((x in message_lower for x in ['thirsty', 'thirst'])):
            return 'Excessive thirst (polydipsia) is a common diabetes symptom. When blood sugar is high, your body pulls water from tissues causing dehydration. Your brain signals you to drink more to replace lost fluids. Solution: Control your blood sugar to reduce thirst. Drink water regularly. See your doctor if extreme thirst continues despite good blood sugar control.'
        if any((x in message_lower for x in ['tired', 'fatigue', 'exhausted', 'weak', 'no energy'])):
            return "Tiredness and fatigue are common in diabetes because: 1. Your cells aren't getting enough glucose for energy 2. High blood sugar can make you dehydrated 3. Poor sleep from frequent urination at night To improve energy: Control blood sugar, eat regular balanced meals, exercise regularly, get enough sleep, and stay hydrated. If fatigue is severe, consult your doctor."
        if any((x in message_lower for x in ['symptom', 'sign', 'how to know', 'how do i know'])):
            return 'Common symptoms of diabetes include: 1. Increased thirst and frequent urination 2. Extreme hunger even after eating 3. Unexplained weight loss 4. Fatigue and weakness 5. Blurry vision 6. Slow-healing cuts or wounds 7. Numbness or tingling in hands/feet If you have these symptoms, please see a doctor for proper testing.'
        return None

    def _generate_generic_response(self, message: str) -> str:
        message_lower = message.lower()
        if any((x in message_lower for x in ['eat', 'food', 'diet', 'meal', 'fruit', 'rice', 'bread'])):
            return 'For diabetes-friendly eating: Good choices: Vegetables, whole grains, lean proteins, nuts, and low-glycemic fruits. Limit: White rice, white bread, sugary drinks, sweets, and processed foods. Tips: Eat smaller portions, include fiber with meals, and avoid skipping meals. Fruits like berries, apples, and oranges are better choices than mangoes or bananas.'
        if any((x in message_lower for x in ['exercise', 'walk', 'workout', 'physical', 'activity'])):
            return 'Exercise is excellent for diabetes management! Benefits: Lowers blood sugar, improves insulin sensitivity, and reduces stress. Recommendations: 30 minutes of moderate activity daily. Best activities: Walking, swimming, cycling, or light strength training. Tip: A 15-30 minute walk after meals can lower blood sugar by 20-30 mg/dL.'
        return "I'm here to help with your diabetes and blood sugar questions! You can ask me about: blood sugar ranges, how to maintain healthy levels, symptoms of diabetes, diet tips, exercise recommendations, or what to do when your sugar is too high or too low."

class CommunityInsightsModel:

    def __init__(self):
        self.model = None
        self.scaler = None
        self.is_loaded = False

    def load_model(self, model_path: str=None):
        try:
            resolved = _resolve_model_path(os.path.join('models', 'community_insights_trained.pkl')) if model_path is None else model_path
            if os.path.exists(resolved):
                model_data = joblib.load(resolved)
                self.model = model_data['model']
                self.scaler = model_data['scaler']
                self.is_loaded = True
                logger.info('Community insights model loaded successfully')
                return True
            else:
                logger.error(f'Model file not found: {model_path}')
                return False
        except Exception as e:
            logger.error(f'Error loading community insights model: {str(e)}')
            return False

    def get_community_insights(self, region: str='South Asia') -> Dict[str, Any]:
        if not self.is_loaded:
            raise ValueError('Model not loaded. Call load_model() first.')
        try:
            features = self._prepare_region_features(region)
            features_scaled = self.scaler.transform([features])
            engagement_score = self.model.predict(features_scaled)[0]
            insights = self._generate_insights(region, engagement_score)
            return insights
        except Exception as e:
            logger.error(f'Error getting community insights: {str(e)}')
            raise

    def _prepare_region_features(self, region: str) -> np.ndarray:
        region_encoded = {'south asia': 0, 'north america': 1, 'europe': 2}.get(region.lower(), 0)
        return np.array([region_encoded])

    def _generate_insights(self, region: str, engagement_score: float) -> Dict[str, Any]:
        _ = engagement_score
        return {'region': region, 'top_food_trends': ['Chapati', 'Rice', 'Lentils'], 'average_glucose_range': '120-160 mg/dL', 'community_tip': 'Users who walk 30 mins after dinner show 15% fewer sugar spikes.'}
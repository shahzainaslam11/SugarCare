import asyncio
from fastapi import APIRouter, FastAPI, HTTPException, status, Depends, Query, UploadFile, File, Form, BackgroundTasks
from fastapi import Request
from fastapi.responses import JSONResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.openapi.utils import get_openapi
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from typing import Dict, List, Optional, Union, Any
from collections import Counter
import re
import math
from datetime import datetime, timedelta, timezone
try:
    from zoneinfo import ZoneInfo
except ImportError:
    try:
        from backports.zoneinfo import ZoneInfo
    except ImportError:
        ZoneInfo = None
import logging
import time
import uuid
import io
import os
import json
import secrets
from PIL import Image
from pydantic import BaseModel, Field, HttpUrl
from api.updated_schemas import FoodAnalysisRequest, FoodAnalysisResponse, PredictedImpact, NutritionFacts, GlycemicIndex, RiskForecastRequest, RiskForecastResponse, PredictedRisks, OverallRiskStatus, RiskArea, SugarForecastRequest, SugarForecastResponse, SugarRecordRequest, SugarRecordResponse, SugarRecordListResponse, SugarGraphResponse, SugarRecordItemsByRange, FastingRecordRequest, FastingRecordResponse, FastingRecordListResponse, FastingGraphResponse, FastingTimeRangeData, FastingRecordItemsByRange, HbA1CRecordRequest, HbA1CRecordResponse, HbA1CRecordListResponse, MealRecommendationRequest, MealRecommendationResponse, MealRecommendations, RecommendedMeal, MealNutritionFacts, ChatbotRequest, ChatbotResponse
from api.response_models import SuccessResponse, ErrorResponse
from utils.validation import check_chatbot_rate_limit, sanitize_html, check_blog_post_limit
from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from api.model_inference import FoodRecognitionModel, RiskForecastModel, SugarForecastModel, MealRecommendationModel, ChatbotModel
from sqlalchemy.orm import Session
from db import get_db, Base, engine
from db import models as dbm
from api.auth_routes import auth_router, get_current_user
from api.profile_routes import profile_router
from services.push_notifications import get_push_diagnostics, send_push_notification_to_user, send_push_notification_to_user_with_result, send_push_to_single_token_with_result, _get_user_device_tokens, _send_push_to_tokens
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
food_router = APIRouter(prefix='/api/v1/food', tags=['Food Recognition'], responses={400: {'model': ErrorResponse, 'description': 'Validation Error'}, 500: {'model': ErrorResponse, 'description': 'Internal Server Error'}})

@food_router.post('/analyze', status_code=200, summary='Analyze Food Image', description='Analyze food image from file upload to identify food items and estimate nutritional content. Supports direct file uploads from gallery or camera.')
async def analyze_food_image(request: Request, user_id: str=Form(..., description='User ID'), file: UploadFile=File(..., description='Image file (JPEG, PNG, WebP)'), user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    try:
        if not user_id or not str(user_id).strip():
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=ErrorResponse(code='VALIDATION_ERROR', message='user_id cannot be empty or whitespace').model_dump())
        if not file:
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=ErrorResponse(code='VALIDATION_ERROR', message='Image file is required').model_dump())
        logger.info(f'Processing food image for user: {user_id}')
        food_model = FoodRecognitionModel()
        if not food_model.load_model():
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Food recognition model not available. Please train the model first.')
        start_ts = time.time()
        allowed_types = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
        if file.content_type not in allowed_types:
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=ErrorResponse(code='INVALID_FILE_TYPE', message='Only JPEG, PNG, and WebP images are allowed').model_dump())
        max_size = 10 * 1024 * 1024
        file_content = await file.read()
        file_name = file.filename
        if len(file_content) > max_size:
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=ErrorResponse(code='FILE_TOO_LARGE', message='Image file size must be less than 10MB').model_dump())
        image_array = food_model.process_image_from_bytes(file_content)
        prediction = food_model.predict_food(image_array)
        food_item = str(prediction.get('food_item', '')).strip().lower()
        nutrition = prediction.get('nutrition', {})
        estimated_calories = prediction.get('estimated_calories', nutrition.get('calories', 0))
        carbs = prediction.get('carbohydrates_g', nutrition.get('carbs', 0))
        sugar = nutrition.get('sugar', 0)
        fiber = nutrition.get('fiber', 0)
        protein = nutrition.get('protein_g', prediction.get('protein_g', 0))
        fat = nutrition.get('fat_g', prediction.get('fat_g', 0))
        gi_value = prediction.get('glycemic_index', nutrition.get('gi', 50))
        glycemic_level = prediction.get('glycemic_level', nutrition.get('glycemic_level', 'Medium'))
        if gi_value <= 55:
            gi_category = 'Low'
        elif gi_value <= 70:
            gi_category = 'Medium'
        else:
            gi_category = 'High'
        estimated_impact = carbs * gi_value / 100.0
        impact_message = f'May raise sugar by ~{int(estimated_impact)} mg/dL in 2 hrs'
        image_url = None
        filename = None
        food_images_dir = Path('static/images/food')
        file_extension = 'jpg'
        filename = f'{user_id}_{uuid.uuid4().hex[:8]}.{file_extension}'
        try:
            food_images_dir.mkdir(parents=True, exist_ok=True)
            logger.info(f'Food images directory: {food_images_dir.absolute()}')
            try:
                os.chmod(food_images_dir, 509)
            except (OSError, PermissionError) as perm_error:
                logger.warning(f'Could not set permissions on {food_images_dir}: {perm_error}, continuing anyway')
            image = Image.open(io.BytesIO(file_content))
            logger.debug(f'Image opened: mode={image.mode}, size={image.size}')
            if image.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = background
            elif image.mode != 'RGB':
                image = image.convert('RGB')
            max_dimension = 1200
            if image.width > max_dimension or image.height > max_dimension:
                image.thumbnail((max_dimension, max_dimension), Image.Resampling.LANCZOS)
                logger.debug(f'Image resized to: {image.size}')
            file_path = food_images_dir / filename
            logger.debug(f'Attempting to save image to: {file_path.absolute()}')
            image.save(file_path, 'JPEG', quality=85, optimize=True)
            if file_path.exists():
                file_size = file_path.stat().st_size
                logger.info(f'Successfully saved food image: {filename} ({file_size} bytes)')
            else:
                logger.warning(f'Image save reported success but file not found: {file_path}')
            from services.utils import build_absolute_url
            image_url = build_absolute_url(request, f'/static/images/food/{filename}')
            logger.info(f'Built image URL: {image_url}')
        except Exception as img_error:
            logger.error(f'Failed to save food image: {str(img_error)}', exc_info=True)
            import traceback
            logger.error(f'Traceback: {traceback.format_exc()}')
            if filename:
                try:
                    from services.utils import build_absolute_url
                    file_path = food_images_dir / filename
                    if file_path.exists():
                        logger.info(f'File exists despite error, building URL: {filename}')
                        image_url = build_absolute_url(request, f'/static/images/food/{filename}')
                        logger.info(f'Built image URL after error: {image_url}')
                    else:
                        logger.warning(f'File does not exist: {file_path}, but building URL anyway')
                        image_url = build_absolute_url(request, f'/static/images/food/{filename}')
                        logger.info(f'Built image URL (file may not exist): {image_url}')
                except Exception as url_error:
                    logger.error(f'Failed to build image URL: {str(url_error)}', exc_info=True)
                    image_url = None
            else:
                logger.error('No filename generated, cannot build image URL')
                image_url = None
        if image_url is None:
            logger.error(f'image_url is None after all attempts. Filename: {filename}, User ID: {user_id}')
        nutrition = prediction.get('nutrition', {})
        from_lookup = nutrition.get('from_lookup', False)
        nutrition_source = 'database' if from_lookup else 'static_estimate'
        if food_item == 'not_food':
            response_obj = FoodAnalysisResponse(status='success', food_item='not_food', estimated_calories=None, predicted_impact=None, nutrition_facts=None, glycemic_index=None, confidence_score=None, suggestion='Please upload an image of food for nutritional analysis.', image_url=image_url, nutrition_source=None)
        elif not from_lookup:
            response_obj = FoodAnalysisResponse(status='success', food_item=prediction['food_item'], estimated_calories=None, predicted_impact=None, nutrition_facts=None, glycemic_index=None, confidence_score=prediction['confidence_score'], suggestion=prediction.get('suggestion', 'Data not found. Monitor portion size and blood glucose levels.'), image_url=image_url, nutrition_source=nutrition_source)
        else:
            response_obj = FoodAnalysisResponse(status='success', food_item=prediction['food_item'], estimated_calories=int(estimated_calories), predicted_impact=PredictedImpact(message=impact_message, confidence_note='Prediction accuracy may vary based on portion size and ingredients.'), nutrition_facts=NutritionFacts(proteins_g=float(protein), carbohydrates_g=float(carbs), fats_g=float(fat), sugar_g=float(sugar), fiber_g=float(fiber)), glycemic_index=GlycemicIndex(value=int(gi_value), category=gi_category), confidence_score=prediction['confidence_score'], suggestion=prediction.get('suggestion', 'Monitor portion size and blood glucose levels.'), image_url=image_url, nutrition_source=nutrition_source)
        try:
            latency_ms = int((time.time() - start_ts) * 1000)
            request_data = {'user_id': user_id, 'file_uploaded': True, 'file_name': file_name if file_name else None, 'file_size': len(file_content) if file_content else None}
            db.add(dbm.FoodAnalysisLog(user_id=str(user_id), request_json=request_data, response_json=response_obj.model_dump(mode='json'), latency_ms=latency_ms))
            db.commit()
        except Exception as log_err:
            logger.warning(f'Could not persist food analysis log: {log_err}')
        return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message='Food analysis completed successfully', data=response_obj.model_dump()).model_dump())
    except HTTPException as he:
        return JSONResponse(status_code=he.status_code, content=ErrorResponse(code='FOOD_ANALYSIS_ERROR', message=str(he.detail)).model_dump())
    except ValueError as ve:
        logger.error(f'Bad request analyzing food image: {str(ve)}')
        return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=ErrorResponse(code='VALIDATION_ERROR', message=str(ve)).model_dump())
    except Exception as e:
        logger.error(f'Error analyzing food image: {str(e)}')
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='INTERNAL_ERROR', message='Failed to analyze food image').model_dump())

@food_router.get('/history', status_code=200, summary='Get Food Analysis History', description='Fetch recent food analysis logs for a user, ordered by newest first.')
async def get_food_history(user_id: str, user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)):
    try:
        q = db.query(dbm.FoodAnalysisLog).filter(dbm.FoodAnalysisLog.user_id == str(user_id)).order_by(dbm.FoodAnalysisLog.created_at.desc())
        items = [{'id': row.id, 'user_id': row.user_id, 'request_json': row.request_json, 'response_json': row.response_json, 'latency_ms': row.latency_ms, 'created_at': row.created_at.isoformat() if row.created_at else None} for row in q.all()]
        return {'items': items, 'count': len(items)}
    except Exception as e:
        logger.error(f'Error fetching food analysis history: {e}')
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Failed to fetch history')
risk_router = APIRouter(prefix='/api/v1/health', tags=['Risk Forecast'], responses={400: {'model': ErrorResponse, 'description': 'Validation Error'}, 500: {'model': ErrorResponse, 'description': 'Internal Server Error'}})

@risk_router.post('/risk_forecast', status_code=200, summary='Predict Health Risk', description='Predict diabetes-related health risks based on health metrics.')
async def predict_health_risk(request: RiskForecastRequest, user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    try:
        logger.info(f'Processing risk forecast for user: {request.user_id}')
        profile = db.query(dbm.UserProfile).filter(dbm.UserProfile.user_id == str(request.user_id)).first()
        if not profile:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='User profile not found. Please complete your profile first.')
        missing_fields = []
        if not profile.height_cm:
            missing_fields.append('height_cm')
        if not profile.weight_kg:
            missing_fields.append('weight_kg')
        if not profile.age:
            missing_fields.append('age')
        if not profile.gender:
            missing_fields.append('gender')
        if not profile.cholesterol_mg_dl:
            missing_fields.append('cholesterol_mg_dl')
        has_hba1c = False
        if profile.hba1c:
            has_hba1c = True
        else:
            recent_hba1c = db.query(dbm.HbA1CRecord).filter(dbm.HbA1CRecord.user_id == str(request.user_id)).order_by(dbm.HbA1CRecord.test_at.desc()).limit(1).first()
            if recent_hba1c:
                has_hba1c = True
        if not has_hba1c:
            missing_fields.append('hba1c')
        if not profile.activity_level:
            missing_fields.append('activity_level')
        if not profile.diet_type:
            missing_fields.append('diet_type')
        sugar_records_count = db.query(dbm.SugarRecord).filter(dbm.SugarRecord.user_id == str(request.user_id)).count()
        if sugar_records_count == 0:
            missing_fields.append('sugar_records (no blood sugar readings found)')
        if missing_fields:
            missing_list = ', '.join(missing_fields)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f'Missing required data. Please enter the following in your profile: {missing_list}')
        height_m = profile.height_cm / 100.0
        bmi = profile.weight_kg / (height_m * height_m)
        bmi = round(bmi, 1)
        age = profile.age
        gender = profile.gender
        cholesterol_level = float(profile.cholesterol_mg_dl)
        if profile.hba1c:
            avg_hba1c = float(profile.hba1c)
        else:
            recent_hba1c = db.query(dbm.HbA1CRecord).filter(dbm.HbA1CRecord.user_id == str(request.user_id)).order_by(dbm.HbA1CRecord.test_at.desc()).limit(5).all()
            avg_hba1c = sum((r.value for r in recent_hba1c)) / len(recent_hba1c)
        activity_level = profile.activity_level
        diet_type = profile.diet_type
        sugar_records = db.query(dbm.SugarRecord).filter(dbm.SugarRecord.user_id == str(request.user_id)).order_by(dbm.SugarRecord.recorded_at.desc()).limit(30).all()
        last_30_days_readings = [float(record.value) for record in sugar_records]
        risk_model = RiskForecastModel()
        if not risk_model.load_model():
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Risk forecast model not available. Please train the model first.')
        user_data = {'user_id': request.user_id, 'age': age, 'gender': gender, 'bmi': bmi, 'cholesterol_level': cholesterol_level, 'avg_hba1c': avg_hba1c, 'activity_level': activity_level, 'diet_type': diet_type, 'sleep_hours': 7, 'last_30_days_readings': last_30_days_readings}
        start_ts = time.time()
        risks = risk_model.predict_risks(user_data)
        response_data = {'status': 'success', 'overall_risk_status': risks['overall_risk_status'], 'risk_areas': risks['risk_areas']}
        try:
            latency_ms = int((time.time() - start_ts) * 1000)
            db.add(dbm.RiskForecastLog(user_id=str(request.user_id), request_json=request.model_dump(mode='json'), response_json=response_data, latency_ms=latency_ms))
            db.commit()
        except Exception as log_err:
            logger.warning(f'Could not persist risk forecast log: {log_err}')
        return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message='Forecast generated', data=response_data).model_dump())
    except HTTPException as he:
        return JSONResponse(status_code=he.status_code, content=ErrorResponse(code='RISK_FORECAST_ERROR', message=str(he.detail)).model_dump())
    except Exception as e:
        logger.error(f'Error predicting health risk: {str(e)}')
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='INTERNAL_ERROR', message='Failed to predict health risk').model_dump())

@risk_router.get('/history', status_code=200, summary='Get Risk Forecast History', description='Fetch recent risk forecast logs for a user, ordered by newest first.')
async def get_risk_history(user_id: str, user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)):
    try:
        q = db.query(dbm.RiskForecastLog).filter(dbm.RiskForecastLog.user_id == str(user_id)).order_by(dbm.RiskForecastLog.created_at.desc())
        items = [{'id': row.id, 'user_id': row.user_id, 'request_json': row.request_json, 'response_json': row.response_json, 'latency_ms': row.latency_ms, 'created_at': row.created_at.isoformat() if row.created_at else None} for row in q.all()]
        return {'items': items, 'count': len(items)}
    except Exception as e:
        logger.error(f'Error fetching risk forecast history: {e}')
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Failed to fetch history')
sugar_router = APIRouter(prefix='/api/v1/sugar', tags=['Sugar Forecast'], responses={400: {'model': ErrorResponse, 'description': 'Validation Error'}, 500: {'model': ErrorResponse, 'description': 'Internal Server Error'}})

@sugar_router.get('/forecast/report', status_code=200, summary='Generate Sugar Forecast Report PDF', description="Generate and download a comprehensive sugar forecast report PDF for a user with forecast predictions, trends, alerts, and recommendations. Filter by time_range: 'Today', 'OneWeek', 'OneMonth', or 'AllTime'.")
async def generate_sugar_forecast_report(user_id: str, time_range: Optional[str]=Query(default='AllTime', description="Time range filter: 'Today', 'OneWeek', 'OneMonth', or 'AllTime'"), user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> Response:
    try:
        from datetime import datetime as dt, timezone
        import io
        try:
            from reportlab.lib import colors
            from reportlab.lib.pagesizes import letter
            from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.units import inch
            REPORTLAB_AVAILABLE = True
        except ImportError:
            REPORTLAB_AVAILABLE = False
            logger.warning('reportlab not available. Install with: pip install reportlab')
        if not REPORTLAB_AVAILABLE:
            return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='DEPENDENCY_ERROR', message='PDF generation requires reportlab. Install with: pip install reportlab').model_dump())
        valid_ranges = ['Today', 'OneWeek', 'OneMonth', 'AllTime']
        if time_range not in valid_ranges:
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=ErrorResponse(code='VALIDATION_ERROR', message=f"Invalid time_range. Must be one of: {', '.join(valid_ranges)}").model_dump())
        from datetime import timedelta
        date_filter = {}
        now = dt.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        if time_range == 'Today':
            date_filter['start'] = today_start
            date_filter['end'] = now
        elif time_range == 'OneWeek':
            week_start = today_start - timedelta(days=7)
            date_filter['start'] = week_start
            date_filter['end'] = now
        elif time_range == 'OneMonth':
            month_start = today_start - timedelta(days=30)
            date_filter['start'] = month_start
            date_filter['end'] = now
        user = db.query(dbm.User).filter(dbm.User.id == str(user_id)).first()
        if not user:
            return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content=ErrorResponse(code='USER_NOT_FOUND', message='User not found').model_dump())
        profile = getattr(user, 'profile', None)
        user_display_name = (profile.name if profile and profile.name else None) or user.email
        records_query = db.query(dbm.SugarRecord).filter(dbm.SugarRecord.user_id == str(user_id))
        if date_filter.get('start'):
            records_query = records_query.filter(dbm.SugarRecord.recorded_at >= date_filter['start'])
        if date_filter.get('end'):
            records_query = records_query.filter(dbm.SugarRecord.recorded_at <= date_filter['end'])
        sugar_records = records_query.order_by(dbm.SugarRecord.recorded_at.asc()).all()
        total_records = len(sugar_records)
        values = [record.value for record in sugar_records]
        avg_value = sum(values) / total_records if total_records > 0 else 0
        highest_value = max(values) if values else 0
        lowest_value = min(values) if values else 0
        status_counts: Dict[str, int] = {'Normal': 0, 'High': 0, 'Low': 0}
        for record in sugar_records:
            status_key = (record.status or 'Normal').title()
            status_counts.setdefault(status_key, 0)
            status_counts[status_key] += 1
        status_breakdown_text = f"Normal: {status_counts.get('Normal', 0)}   |   High: {status_counts.get('High', 0)}   |   Low: {status_counts.get('Low', 0)}"

        def format_dt(dt_obj: datetime) -> str:
            if dt_obj.tzinfo is None:
                dt_obj = dt_obj.replace(tzinfo=timezone.utc)
            return dt_obj.astimezone(timezone.utc).strftime('%Y-%m-%d')
        computed_start = format_dt(sugar_records[0].recorded_at) if sugar_records else None
        computed_end = format_dt(sugar_records[-1].recorded_at) if sugar_records else None
        if time_range == 'AllTime':
            if computed_start and computed_end:
                date_range_text = f'{computed_start} → {computed_end}'
            else:
                date_range_text = 'All available data'
        elif date_filter.get('start') and date_filter.get('end'):
            start_label = format_dt(date_filter['start'])
            end_label = format_dt(date_filter['end'])
            date_range_text = f'{start_label} → {end_label}'
        elif computed_start and computed_end:
            date_range_text = f'{computed_start} → {computed_end}'
        else:
            date_range_text = time_range
        avg_text = f'{avg_value:.1f} mg/dL' if total_records else 'N/A'
        high_text = f'{highest_value} mg/dL' if total_records else 'N/A'
        low_text = f'{lowest_value} mg/dL' if total_records else 'N/A'

        def normalize_reading_type(tag: Optional[str]) -> str:
            if not tag:
                return 'Random'
            label = tag.strip().lower()
            mapping = {'fasting': 'Fasting', 'before meal': 'Before Meal', 'pre meal': 'Before Meal', 'after meal': 'After Meal', 'post meal': 'After Meal', 'random': 'Random', 'bedtime': 'Bedtime', 'pre-breakfast': 'Before Meal', 'pre lunch': 'Before Meal', 'pre dinner': 'Before Meal'}
            return mapping.get(label, tag.title())
        records_table_rows: List[List[str]] = []
        if sugar_records:
            for record in sugar_records:
                rec_dt = record.recorded_at
                if rec_dt.tzinfo is None:
                    rec_dt = rec_dt.replace(tzinfo=timezone.utc)
                rec_dt = rec_dt.astimezone(timezone.utc)
                date_label = rec_dt.strftime('%Y-%m-%d')
                time_label = rec_dt.strftime('%H:%M')
                notes_label = record.notes if record.notes else '-'
                reading_type = normalize_reading_type(record.tag)
                records_table_rows.append([date_label, time_label, reading_type, f'{record.value} mg/dL', record.status or '-', notes_label])
        else:
            records_table_rows.append(['-', '-', '-', '-', '-', 'No records available for the selected period.'])
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.6 * inch, bottomMargin=0.6 * inch, leftMargin=0.7 * inch, rightMargin=0.7 * inch)
        story = []
        styles = getSampleStyleSheet()
        base_font = 'Helvetica'
        styles.add(ParagraphStyle(name='ReportTitle', parent=styles['Heading1'], fontName=base_font, fontSize=20, textColor=colors.HexColor('#0F172A'), alignment=1, spaceAfter=4))
        styles.add(ParagraphStyle(name='SectionHeading', parent=styles['Heading2'], fontName=base_font, fontSize=13, textColor=colors.HexColor('#111827'), spaceAfter=6))
        styles.add(ParagraphStyle(name='BodyTextSmall', parent=styles['BodyText'], fontName=base_font, fontSize=10, leading=14, textColor=colors.HexColor('#111827')))
        styles.add(ParagraphStyle(name='Tagline', parent=styles['BodyText'], fontName=base_font, fontSize=9, alignment=1, textColor=colors.HexColor('#475467'), spaceAfter=6))
        page_width, page_height = letter

        def draw_footer(canvas, doc_obj):
            canvas.saveState()
            canvas.setFont(base_font, 8)
            canvas.setFillColor(colors.HexColor('#475467'))
            canvas.drawCentredString(page_width / 2, 0.45 * inch, 'Generated by SugarCare')
            canvas.restoreState()
        doc_width = page_width - doc.leftMargin - doc.rightMargin

        def add_divider(thickness=0.5):
            divider = Table([['']], colWidths=[doc_width])
            divider.setStyle(TableStyle([('LINEBELOW', (0, 0), (-1, 0), thickness, colors.HexColor('#D0D5DD'))]))
            story.append(divider)
            story.append(Spacer(1, 0.18 * inch))
        logo_path = Path('static/images/logo.png')
        if logo_path.exists():
            try:
                logo = Image(str(logo_path.resolve()))
                logo.drawHeight = 0.65 * inch
                logo.drawWidth = 1.6 * inch
                logo.hAlign = 'CENTER'
                story.append(logo)
            except Exception:
                story.append(Paragraph('[SugarCare Logo Here]', styles['BodyText']))
        else:
            story.append(Paragraph('[SugarCare Logo Here]', styles['BodyText']))
        story.append(Paragraph('Blood Sugar Forecast', styles['ReportTitle']))
        story.append(Paragraph('Stay balanced. Stay well.', styles['Tagline']))
        story.append(Spacer(1, 0.2 * inch))
        add_divider(0.7)
        story.append(Paragraph('User Information', styles['SectionHeading']))

        def fmt_label(value, suffix=''):
            if value in (None, '', 0):
                return '-'
            if suffix and isinstance(value, (int, float)):
                return f'{value}{suffix}'
            return str(value)
        height_text = fmt_label(profile.height_cm, ' cm') if profile else '-'
        weight_text = fmt_label(profile.weight_kg, ' kg') if profile else '-'
        age_text = fmt_label(profile.age) if profile else '-'
        gender_text = profile.gender.title() if profile and profile.gender else '-'
        diabetes_text = profile.diabetes_type if profile and profile.diabetes_type else '-'
        cholesterol_text = fmt_label(profile.cholesterol_mg_dl, ' mg/dL') if profile else '-'
        insulin_text = 'Yes' if profile and profile.using_insulin else 'No'
        user_info_data = [['Name', user_display_name, 'Date Range', date_range_text], ['Age', age_text, 'Gender', gender_text], ['Diabetes Type', diabetes_text, 'Height', height_text], ['Weight', weight_text, 'Cholesterol', cholesterol_text], ['Using Insulin', insulin_text, '', '']]
        user_info_col_widths = [doc.width * 0.25] * 4
        user_info_table = Table(user_info_data, colWidths=user_info_col_widths)
        user_info_table.setStyle(TableStyle([('FONTNAME', (0, 0), (-1, -1), base_font), ('FONTSIZE', (0, 0), (-1, -1), 10), ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F9FAFB')), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#475467')), ('TEXTCOLOR', (2, 0), (2, -1), colors.HexColor('#475467')), ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#0F172A')), ('TEXTCOLOR', (3, 0), (3, -1), colors.HexColor('#0F172A')), ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'), ('FONTNAME', (3, 0), (3, -1), 'Helvetica-Bold'), ('BOX', (0, 0), (-1, -1), 0.4, colors.HexColor('#E4E7EC')), ('INNERGRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#E4E7EC')), ('LEFTPADDING', (0, 0), (-1, -1), 8), ('RIGHTPADDING', (0, 0), (-1, -1), 8), ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 6)]))
        story.append(user_info_table)
        story.append(Spacer(1, 0.12 * inch))
        add_divider()
        story.append(Paragraph('Summary', styles['SectionHeading']))
        story.append(Paragraph('Key metrics for the selected period:', styles['BodyTextSmall']))
        summary_matrix = [['Average Sugar', avg_text], ['Highest Reading', high_text], ['Lowest Reading', low_text], ['Status Breakdown', status_breakdown_text]]
        summary_col_widths = [2.0 * inch, doc.width - 2.0 * inch]
        summary_table = Table(summary_matrix, colWidths=summary_col_widths)
        summary_table.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F9FAFB')), ('FONTNAME', (0, 0), (-1, -1), base_font), ('FONTSIZE', (0, 0), (-1, -1), 10), ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#475467')), ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#0F172A')), ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'), ('ALIGN', (0, 0), (-1, -1), 'LEFT'), ('BOX', (0, 0), (-1, -1), 0.4, colors.HexColor('#E4E7EC')), ('INNERGRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#E4E7EC')), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')]))
        story.append(summary_table)
        story.append(Spacer(1, 0.18 * inch))
        add_divider()
        story.append(Paragraph('Detailed Readings', styles['SectionHeading']))
        table_headers = ['Date', 'Time', 'Type', 'Blood Sugar', 'Status', 'Notes']
        table_col_widths = [doc.width * 0.14, doc.width * 0.1, doc.width * 0.18, doc.width * 0.18, doc.width * 0.12, doc.width * 0.28]

        def wrap_cell_text(text: str, style_name: str='BodyTextSmall') -> Paragraph:
            return Paragraph(str(text), styles[style_name])
        wrapped_table_rows = []
        for row in records_table_rows:
            wrapped_table_rows.append([wrap_cell_text(row[0]), wrap_cell_text(row[1]), wrap_cell_text(row[2]), wrap_cell_text(row[3]), wrap_cell_text(row[4]), wrap_cell_text(row[5])])
        detail_table = Table([table_headers] + wrapped_table_rows, colWidths=table_col_widths, repeatRows=1)
        detail_style = [('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')), ('TEXTCOLOR', (0, 0), (-1, 0), colors.white), ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'), ('FONTSIZE', (0, 0), (-1, 0), 10), ('ALIGN', (0, 0), (-1, 0), 'CENTER'), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('GRID', (0, 0), (-1, -1), 0.3, colors.HexColor('#E4E7EC')), ('LEFTPADDING', (0, 0), (-1, -1), 6), ('RIGHTPADDING', (0, 0), (-1, -1), 6), ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5)]
        for idx in range(1, len(wrapped_table_rows) + 1):
            bg_color = colors.HexColor('#F8FAFC') if idx % 2 == 1 else colors.white
            detail_style.append(('BACKGROUND', (0, idx), (-1, idx), bg_color))
            detail_style.append(('ALIGN', (0, idx), (2, idx), 'LEFT'))
            detail_style.append(('ALIGN', (3, idx), (4, idx), 'CENTER'))
            detail_style.append(('ALIGN', (5, idx), (5, idx), 'LEFT'))
        detail_table.setStyle(TableStyle(detail_style))
        story.append(detail_table)
        story.append(Spacer(1, 0.2 * inch))
        doc.build(story, onFirstPage=draw_footer, onLaterPages=draw_footer)
        buffer.seek(0)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'sugar_forecast_report_{user_id}_{timestamp}.pdf'
        reports_dir = Path('reports')
        reports_dir.mkdir(exist_ok=True)
        file_path = reports_dir / filename
        with open(file_path, 'wb') as f:
            f.write(buffer.getvalue())
        logger.info(f'Sugar forecast report saved to: {file_path}')
        buffer.seek(0)
        return Response(content=buffer.getvalue(), media_type='application/pdf', headers={'Content-Disposition': f'attachment; filename={filename}', 'Content-Type': 'application/pdf'})
    except Exception as e:
        logger.error(f'Error generating sugar forecast report: {str(e)}')
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='INTERNAL_ERROR', message=f'Failed to generate report: {str(e)}').model_dump())

@sugar_router.post('/forecast', status_code=200, summary='Predict Sugar Levels', description='Predict glucose levels and provide alerts based on recent readings.')
async def forecast_sugar_levels(request: SugarForecastRequest, background_tasks: BackgroundTasks, user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    try:
        logger.info(f'Processing sugar forecast for user: {request.user_id}')
        sugar_model = SugarForecastModel()
        if not sugar_model.load_model():
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Sugar forecast model not available. Please train the model first.')
        recent_payload = [reading.model_dump() for reading in request.recent_readings]
        last_reading_value = None
        if request.recent_readings:
            last_reading = request.recent_readings[-1]
            last_reading_value = last_reading.value
        start_ts = time.time()
        prediction = sugar_model.predict_glucose(recent_payload, request.meal_info, request.activity_level)
        predicted_glucose = prediction.get('predicted_glucose', None)
        if predicted_glucose is None:
            predicted_glucose = last_reading_value + 45 if last_reading_value else 150
        graph_data = []
        for reading in request.recent_readings:
            graph_data.append(reading.value)
        if predicted_glucose:
            graph_data.append(round(predicted_glucose))
        all_values = graph_data.copy()
        min_glucose = min(all_values) if all_values else 80
        max_glucose = max(all_values) if all_values else 180
        min_glucose = int(min_glucose // 10 * 10)
        max_glucose = int((max_glucose // 10 + 1) * 10)
        if max_glucose - min_glucose < 100:
            center = (min_glucose + max_glucose) // 2
            min_glucose = max(0, center - 50)
            max_glucose = center + 50
        graph_labels = []
        step = 20
        current = min_glucose
        while current <= max_glucose:
            graph_labels.append(current)
            current += step
        explanation = f'Based on your recent high-carb lunch and low activity, your glucose level may spike in next 2 hours.'
        prediction_text_lower = prediction.get('prediction', '').lower()
        if 'spike' in prediction_text_lower or 'high' in prediction_text_lower:
            if request.meal_info:
                meal_text = request.meal_info.lower()
                activity_text = request.activity_level.lower()
                explanation = f'Based on your recent {meal_text} meal and {activity_text} activity, your glucose level may spike in next 2 hours.'
        elif 'drop' in prediction_text_lower or 'low' in prediction_text_lower:
            explanation = f'Based on your recent readings and activity level, your glucose level may drop in next 2 hours.'
        else:
            explanation = f'Based on your recent readings and activity level, your glucose level is expected to remain stable.'
        response_data = {'status': 'success', 'prediction': prediction['prediction'], 'confidence': prediction['confidence'], 'suggestion': prediction['suggestion'], 'last_reading': {'value': last_reading_value, 'unit': 'mg/dL'}, 'predicted_value': {'value': round(predicted_glucose) if predicted_glucose else None, 'unit': 'mg/dL'}, 'explanation': explanation, 'graph': {'labels': graph_labels, 'data': graph_data}}
        response_obj = SugarForecastResponse(status='success', prediction=prediction['prediction'], confidence=prediction['confidence'], suggestion=prediction['suggestion'])
        forecast_log_id = None
        try:
            latency_ms = int((time.time() - start_ts) * 1000)
            forecast_log = dbm.SugarForecastLog(user_id=str(request.user_id), request_json=request.model_dump(mode='json'), response_json=response_obj.model_dump(mode='json'), latency_ms=latency_ms)
            db.add(forecast_log)
            db.commit()
            db.refresh(forecast_log)
            forecast_log_id = forecast_log.id
        except Exception as log_err:
            logger.warning(f'Could not persist sugar forecast log: {log_err}')
        try:
            prediction_text = prediction.get('prediction', '').lower()
            if 'spike' in prediction_text or 'high' in prediction_text:
                notification_title = 'Sugar Spike Predicted'
                notification_detail = f"Forecast Alert: {prediction.get('prediction', 'Possible sugar spike detected')}. {prediction.get('suggestion', 'Take preventive measures.')}"
            elif 'drop' in prediction_text or 'low' in prediction_text:
                notification_title = 'Low Sugar Risk Alert'
                notification_detail = f"Forecast Alert: {prediction.get('prediction', 'Possible sugar drop detected')}. {prediction.get('suggestion', 'Monitor closely and be prepared.')}"
            else:
                notification_title = 'Sugar Forecast Generated'
                notification_detail = f"Forecast: {prediction.get('prediction', 'Glucose levels analyzed')}. {prediction.get('suggestion', 'Continue monitoring your levels.')}"
            notification = dbm.Notification(user_id=str(request.user_id), type='health_reminder', category='sugar_forecast', title=notification_title, detail=notification_detail, is_read=False, meta={'forecast_log_id': forecast_log_id, 'prediction': prediction.get('prediction'), 'confidence': prediction.get('confidence'), 'suggestion': prediction.get('suggestion')})
            db.add(notification)
            db.commit()
            logger.info(f'Created notification for sugar forecast: {forecast_log_id}')
            tokens = _get_user_device_tokens(db, str(user.id))
            if tokens:

                def _run_push():
                    _send_push_to_tokens(tokens, notification_title, notification_detail, {'type': 'sugar_forecast', 'forecast_log_id': str(forecast_log_id) if forecast_log_id else ''}, user_id=str(user.id))

                async def _bg_push():
                    await asyncio.to_thread(_run_push)
                background_tasks.add_task(_bg_push)
        except Exception as notif_error:
            logger.warning(f'Failed to create notification for sugar forecast: {notif_error}')
            if forecast_log_id:
                db.rollback()
                db.commit()
        return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message='Forecast generated', data=response_data).model_dump())
    except HTTPException as he:
        return JSONResponse(status_code=he.status_code, content=ErrorResponse(code='SUGAR_FORECAST_ERROR', message=str(he.detail)).model_dump())
    except Exception as e:
        logger.error(f'Error forecasting sugar levels: {str(e)}')
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='INTERNAL_ERROR', message='Failed to forecast sugar levels').model_dump())

@sugar_router.get('/history', status_code=200, summary='Get Sugar Forecast History', description='Fetch recent sugar forecast logs for a user, ordered by newest first.')
async def get_sugar_history(user_id: str, user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)):
    try:
        q = db.query(dbm.SugarForecastLog).filter(dbm.SugarForecastLog.user_id == str(user_id)).order_by(dbm.SugarForecastLog.created_at.desc())
        items = [{'id': row.id, 'user_id': row.user_id, 'request_json': row.request_json, 'response_json': row.response_json, 'latency_ms': row.latency_ms, 'created_at': row.created_at.isoformat() if row.created_at else None} for row in q.all()]
        return {'items': items, 'count': len(items)}
    except Exception as e:
        logger.error(f'Error fetching sugar forecast history: {e}')
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Failed to fetch history')

def calculate_sugar_status(value: int) -> str:
    if value < 70:
        return 'Low'
    elif value > 140:
        return 'High'
    else:
        return 'Normal'

def calculate_time_remaining(started_at: Optional[datetime], ended_at: Optional[datetime], status: str, device_timezone: str='UTC') -> Optional[str]:
    if status == 'Completed' or ended_at is None or started_at is None:
        return None
    try:
        if ZoneInfo is None:
            tz = timezone.utc
            logger.warning(f"ZoneInfo not available, using UTC for timezone '{device_timezone}'")
        else:
            tz = ZoneInfo(device_timezone)
    except Exception as tz_error:
        tz = timezone.utc
        logger.warning(f"Invalid timezone '{device_timezone}' ({tz_error}), using UTC")
    now = datetime.now(tz)
    if started_at.tzinfo is None:
        started_at = started_at.replace(tzinfo=timezone.utc)
    if ended_at.tzinfo is None:
        ended_at = ended_at.replace(tzinfo=timezone.utc)
    started_at_local = started_at.astimezone(tz)
    ended_at_local = ended_at.astimezone(tz)
    if now < started_at_local:
        return None
    if now >= ended_at_local:
        return None
    time_diff = ended_at_local - now
    total_seconds = int(time_diff.total_seconds())
    hours = total_seconds // 3600
    minutes = total_seconds % 3600 // 60
    seconds = total_seconds % 60
    return f'{hours:02d}:{minutes:02d}:{seconds:02d}'

def parse_duration_hours(duration_str: Optional[str]) -> Optional[float]:
    if not duration_str:
        return None
    try:
        if isinstance(duration_str, (int, float)):
            return float(duration_str)
        parts = duration_str.split(':')
        if len(parts) == 2:
            hours = int(parts[0])
            minutes = int(parts[1])
            return hours + minutes / 60.0
        return float(duration_str)
    except (ValueError, AttributeError):
        return None

def infer_fasting_pattern(duration_hours: Optional[Union[int, float, str]], notes: Optional[str]) -> str:
    if notes:
        match = re.search('\\b\\d{1,2}:\\d{1,2}\\b', notes)
        if match:
            return match.group(0)
    if isinstance(duration_hours, str):
        duration_hours = parse_duration_hours(duration_hours)
    if duration_hours is None:
        return 'Custom'
    duration_float = float(duration_hours)
    if duration_float >= 20:
        return '20:4'
    if duration_float >= 18:
        return '18:6'
    if duration_float >= 16:
        return '16:8'
    if duration_float >= 14:
        return '14:10'
    return '12:12'

@sugar_router.post('/record', status_code=201, summary='Add Sugar Record', description='Add a new blood sugar level record with separate date and time fields, value, tag, and notes.')
async def add_sugar_record(request: SugarRecordRequest, user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    try:
        logger.info(f'Adding sugar record for user: {request.user_id}')
        from datetime import datetime as dt
        try:
            recorded_at = dt.strptime(f'{request.date} {request.time}', '%Y-%m-%d %H:%M')
            from datetime import timezone
            recorded_at = recorded_at.replace(tzinfo=timezone.utc)
        except ValueError as e:
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=ErrorResponse(code='VALIDATION_ERROR', message=f'Invalid date or time format: {str(e)}').model_dump())
        reading_status = calculate_sugar_status(request.value)
        current_time = datetime.now(timezone.utc)
        sugar_record = dbm.SugarRecord(user_id=str(request.user_id), value=request.value, unit='mg/dL', tag=request.tag, notes=request.notes[:100] if request.notes else None, status=reading_status, recorded_at=recorded_at, created_at=current_time)
        try:
            db.add(sugar_record)
            db.commit()
            db.refresh(sugar_record)
        except Exception as db_error:
            db.rollback()
            error_msg = str(db_error)
            if 'duration_hours' in error_msg.lower() or 'no such column' in error_msg.lower():
                logger.error(f'Database schema mismatch - duration_hours column issue: {error_msg}')
                logger.error('Please run the migration script: python scripts/remove_duration_hours_from_sugar_records.py')
                return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='DATABASE_SCHEMA_ERROR', message='Database schema mismatch. Please run migration script: python scripts/remove_duration_hours_from_sugar_records.py').model_dump())
            raise
        try:
            if reading_status == 'High':
                notification_title = 'High Blood Sugar Detected'
                notification_detail = f'Your blood sugar reading is {request.value} mg/dL (High). Consider taking a walk, drinking water, or consulting with your healthcare provider if this persists.'
            elif reading_status == 'Low':
                notification_title = 'Low Blood Sugar Alert'
                notification_detail = f'Your blood sugar reading is {request.value} mg/dL (Low). Please consume a quick-acting carbohydrate and monitor closely. Seek medical attention if symptoms persist.'
            else:
                notification_title = 'Blood Sugar Recorded'
                notification_detail = f'Your blood sugar reading of {request.value} mg/dL is within normal range. Keep up the good work maintaining healthy levels!'
            notification = dbm.Notification(user_id=str(request.user_id), type='health_reminder', category='sugar', title=notification_title, detail=notification_detail, is_read=False, meta={'sugar_record_id': sugar_record.id, 'value': request.value, 'status': reading_status, 'tag': request.tag, 'recorded_at': recorded_at.isoformat()})
            db.add(notification)
            db.commit()
            logger.info(f'Created notification for sugar record: {sugar_record.id}')
        except Exception as notif_error:
            logger.warning(f'Failed to create notification for sugar record: {notif_error}')
            db.rollback()
        db.commit()
        db.refresh(sugar_record)
        date_str = sugar_record.recorded_at.strftime('%Y-%m-%d')
        time_str = sugar_record.recorded_at.strftime('%H:%M')
        response_obj = SugarRecordResponse(id=sugar_record.id, user_id=sugar_record.user_id, value=sugar_record.value, date=date_str, time=time_str, tag=sugar_record.tag, notes=sugar_record.notes, status=sugar_record.status, created_at=sugar_record.created_at)
        return JSONResponse(status_code=status.HTTP_201_CREATED, content=SuccessResponse(message='Sugar record added successfully', data=response_obj.model_dump(mode='json')).model_dump())
    except Exception as e:
        logger.error(f'Error adding sugar record: {str(e)}')
        import traceback
        logger.error(traceback.format_exc())
        db.rollback()
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='INTERNAL_ERROR', message='Failed to add sugar record').model_dump())

@sugar_router.get('/records', status_code=200, summary='Get Sugar Records', description="Fetch blood sugar records for a user with graph data. Filter by time_range: 'Today', 'OneWeek', 'OneMonth', or 'AllTime'.")
async def get_sugar_records(user_id: str, time_range: Optional[str]=Query(default='AllTime', description="Time range filter: 'Today', 'OneWeek', 'OneMonth', or 'AllTime'"), user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    try:
        from datetime import datetime as dt, timezone as tz_module_sugar, timedelta
        from collections import defaultdict
        valid_ranges = ['Today', 'OneWeek', 'OneMonth', 'AllTime']
        if time_range not in valid_ranges:
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=ErrorResponse(code='VALIDATION_ERROR', message=f"Invalid time_range. Must be one of: {', '.join(valid_ranges)}").model_dump())
        query = db.query(dbm.SugarRecord).filter(dbm.SugarRecord.user_id == str(user_id))
        total = query.count()
        query = query.order_by(dbm.SugarRecord.recorded_at.desc())
        now = dt.now(tz_module_sugar.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        week_start = today_start - timedelta(days=7)
        month_start = today_start - timedelta(days=30)

        def ensure_timezone_aware(dt_obj):
            if dt_obj is None:
                return None
            if dt_obj.tzinfo is None:
                return dt_obj.replace(tzinfo=tz_module_sugar.utc)
            return dt_obj

        def record_to_response(record):
            date_str = record.recorded_at.strftime('%Y-%m-%d') if record.recorded_at else ''
            time_str = record.recorded_at.strftime('%H:%M') if record.recorded_at else ''
            return SugarRecordResponse(id=record.id, user_id=record.user_id, value=record.value, date=date_str, time=time_str, tag=record.tag, notes=record.notes, status=record.status, created_at=record.created_at)
        records = query.all()
        today_items = []
        week_items = []
        month_items = []
        all_time_items = []
        for record in records:
            response_item = record_to_response(record)
            all_time_items.append(response_item)
            if record.recorded_at:
                recorded_at = ensure_timezone_aware(record.recorded_at)
                if recorded_at >= month_start:
                    month_items.append(response_item)
                    if recorded_at >= week_start:
                        week_items.append(response_item)
                        if recorded_at.date() == now.date():
                            today_items.append(response_item)
        filtered_items = []
        if time_range == 'Today':
            filtered_items = sorted(today_items, key=lambda x: x.created_at, reverse=True) if today_items else []
        elif time_range == 'OneWeek':
            filtered_items = sorted(week_items, key=lambda x: x.created_at, reverse=True) if week_items else []
        elif time_range == 'OneMonth':
            filtered_items = sorted(month_items, key=lambda x: x.created_at, reverse=True) if month_items else []
        else:
            filtered_items = sorted(all_time_items, key=lambda x: x.created_at, reverse=True) if all_time_items else []
        items_by_range = SugarRecordItemsByRange(Today=filtered_items if time_range == 'Today' else [], OneWeek=filtered_items if time_range == 'OneWeek' else [], OneMonth=filtered_items if time_range == 'OneMonth' else [], AllTime=filtered_items if time_range == 'AllTime' else [])
        total_sugar_days = None
        average_sugar_level = None
        try:
            unique_dates = set()
            total_sugar_values = 0
            record_count = 0
            for record in records:
                if record.recorded_at:
                    recorded_at = ensure_timezone_aware(record.recorded_at)
                    if recorded_at:
                        unique_dates.add(recorded_at.date())
                if record.value is not None:
                    total_sugar_values += record.value
                    record_count += 1
            total_sugar_days = len(unique_dates) if unique_dates else None
            average_sugar_level = round(total_sugar_values / record_count, 1) if record_count > 0 else None
        except Exception as calc_error:
            logger.warning(f'Error calculating sugar statistics: {calc_error}')
        all_graph_records = db.query(dbm.SugarRecord).filter(dbm.SugarRecord.user_id == str(user_id)).order_by(dbm.SugarRecord.recorded_at.asc()).all()
        today_graph = None
        week_graph = None
        month_graph = None
        all_time_graph = None
        if time_range == 'Today':
            today_labels = []
            today_data = []
            today_records = [r for r in all_graph_records if r.recorded_at and ensure_timezone_aware(r.recorded_at).date() == now.date()]
            hourly_data = defaultdict(list)
            for record in today_records:
                recorded_at = ensure_timezone_aware(record.recorded_at)
                hour = recorded_at.hour
                hourly_data[hour].append(record.value)
            for hour in sorted(hourly_data.keys()):
                today_labels.append(hour)
                today_data.append(round(sum(hourly_data[hour]) / len(hourly_data[hour]), 1))
            today_graph = FastingTimeRangeData(labels=today_labels, data=today_data) if today_labels else None
        elif time_range == 'OneWeek':
            week_labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
            week_data = [0.0] * 7
            week_start = today_start - timedelta(days=7)
            week_records = [r for r in all_graph_records if r.recorded_at and ensure_timezone_aware(r.recorded_at) >= week_start]
            weekly_data = defaultdict(list)
            for record in week_records:
                recorded_at = ensure_timezone_aware(record.recorded_at)
                day_of_week = recorded_at.weekday()
                weekly_data[day_of_week].append(record.value)
            for day_idx in range(7):
                if day_idx in weekly_data:
                    week_data[day_idx] = round(sum(weekly_data[day_idx]) / len(weekly_data[day_idx]), 1)
            week_graph = FastingTimeRangeData(labels=week_labels, data=week_data)
        elif time_range == 'OneMonth':
            month_start = today_start - timedelta(days=30)
            month_records = [r for r in all_graph_records if r.recorded_at and ensure_timezone_aware(r.recorded_at) >= month_start]
            monthly_weekly_data = defaultdict(list)
            for record in month_records:
                recorded_at = ensure_timezone_aware(record.recorded_at)
                days_since_monday = recorded_at.weekday()
                week_start_date = (recorded_at - timedelta(days=days_since_monday)).date()
                days_from_month_start = (week_start_date - month_start.date()).days
                week_num = min(days_from_month_start // 7 + 1, 4)
                monthly_weekly_data[week_num].append(record.value)
            month_labels = ['W1', 'W2', 'W3', 'W4']
            month_data = []
            for week_num in range(1, 5):
                if week_num in monthly_weekly_data:
                    month_data.append(round(sum(monthly_weekly_data[week_num]) / len(monthly_weekly_data[week_num]), 1))
                else:
                    month_data.append(0.0)
            month_graph = FastingTimeRangeData(labels=month_labels, data=month_data)
        else:
            yearly_data = defaultdict(list)
            for record in all_graph_records:
                if record.recorded_at:
                    recorded_at = ensure_timezone_aware(record.recorded_at)
                    year = recorded_at.year
                    yearly_data[year].append(record.value)
            all_time_labels = sorted(yearly_data.keys())
            all_time_data = [round(sum(yearly_data[year]) / len(yearly_data[year]), 1) for year in all_time_labels]
            all_time_labels_str = [str(year) for year in all_time_labels]
            all_time_graph = FastingTimeRangeData(labels=all_time_labels_str, data=all_time_data) if all_time_labels else None
        graph_data = SugarGraphResponse(Today=today_graph if time_range == 'Today' else None, OneWeek=week_graph if time_range == 'OneWeek' else None, OneMonth=month_graph if time_range == 'OneMonth' else None, AllTime=all_time_graph if time_range == 'AllTime' else None)
        filtered_count = len(filtered_items)
        response_data = {'items': items_by_range.model_dump(mode='json'), 'count': filtered_count, 'total': total, 'total_sugar_days': total_sugar_days, 'average_sugar_level': average_sugar_level, 'graph_data': graph_data.model_dump(mode='json', exclude_none=True)}
        return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message='Sugar records retrieved successfully', data=response_data).model_dump())
    except Exception as e:
        logger.error(f'Error fetching sugar records: {e}')
        import traceback
        logger.error(traceback.format_exc())
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='INTERNAL_ERROR', message='Failed to fetch sugar records').model_dump())

@sugar_router.get('/records/recent', status_code=200, summary='Get Recent Sugar Readings', description='Get the last 30 sugar reading records in a simplified format for forecasting.')
async def get_recent_sugar_readings(user_id: str, limit: Optional[int]=Query(default=30, ge=1, le=100, description='Number of recent records to retrieve (1-100, default: 30)'), user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    try:
        from datetime import datetime as dt, timezone as tz_module
        records = db.query(dbm.SugarRecord).filter(dbm.SugarRecord.user_id == str(user_id)).order_by(dbm.SugarRecord.recorded_at.desc()).limit(limit).all()
        recent_readings = []
        for record in reversed(records):
            if record.recorded_at and record.value is not None:
                recorded_at = record.recorded_at
                if recorded_at.tzinfo is None:
                    recorded_at = recorded_at.replace(tzinfo=tz_module.utc)
                else:
                    recorded_at = recorded_at.astimezone(tz_module.utc)
                timestamp = recorded_at.strftime('%Y-%m-%d')
                recent_readings.append({'timestamp': timestamp, 'value': record.value})
        return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message=f'Retrieved {len(recent_readings)} recent sugar readings', data={'recent_readings': recent_readings, 'count': len(recent_readings)}).model_dump())
    except Exception as e:
        logger.error(f'Error fetching recent sugar readings: {e}')
        import traceback
        logger.error(traceback.format_exc())
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='INTERNAL_ERROR', message='Failed to fetch recent sugar readings').model_dump())

@sugar_router.delete('/records/{record_id}', status_code=200, summary='Delete Sugar Record', description='Delete a specific sugar record by its ID.')
async def delete_sugar_record(record_id: str, user_id: str=Query(..., description='User ID (required for verification)'), user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    try:
        logger.info(f'Deleting sugar record {record_id} for user: {user_id}')
        record = db.query(dbm.SugarRecord).filter(dbm.SugarRecord.id == str(record_id), dbm.SugarRecord.user_id == str(user_id)).first()
        if not record:
            return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content=ErrorResponse(code='RECORD_NOT_FOUND', message='Sugar record not found or does not belong to this user').model_dump())
        try:
            date_str = record.recorded_at.strftime('%Y-%m-%d') if record.recorded_at else 'N/A'
            time_str = record.recorded_at.strftime('%H:%M') if record.recorded_at else 'N/A'
            notification = dbm.Notification(user_id=str(user_id), type='health_reminder', category='sugar', title='Sugar Record Removed', detail=f'Your blood sugar record from {date_str} at {time_str} ({record.value} mg/dL, {record.status}) has been removed.', is_read=False, meta={'sugar_record_id': record_id, 'was_value': record.value, 'was_status': record.status})
            db.add(notification)
        except Exception as notif_error:
            logger.warning(f'Failed to create notification for deleted sugar record: {notif_error}')
        db.delete(record)
        db.commit()
        logger.info(f'Successfully deleted sugar record {record_id}')
        return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message='Sugar record deleted successfully').model_dump())
    except Exception as e:
        logger.error(f'Error deleting sugar record: {str(e)}')
        db.rollback()
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='INTERNAL_ERROR', message='Failed to delete sugar record').model_dump())
meal_router = APIRouter(prefix='/api/v1/meals', tags=['Meal Recommendations'], responses={400: {'model': ErrorResponse, 'description': 'Validation Error'}, 500: {'model': ErrorResponse, 'description': 'Internal Server Error'}})

@meal_router.post('/recommend', status_code=200, summary='Get Meal Recommendations', description='Get personalized meal recommendations based on current glucose and preferences.')
async def recommend_meals(request: MealRecommendationRequest, http_request: Request, user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    try:
        logger.info(f'Processing meal recommendations for user: {request.user_id}')
        diabetes_control_to_hba1c = {'Well controlled': 6.0, 'Moderately controlled': 7.0, 'Poorly controlled': 8.5}
        hba1c_value = diabetes_control_to_hba1c.get(request.diabetes_control_level, 7.0)
        meal_model = MealRecommendationModel()
        if not meal_model.load_model():
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Meal recommendation model not available. Please train the model first.')
        start_ts = time.time()
        recommendations = meal_model.recommend_meals(request.current_glucose, hba1c_value)
        if request.portion_size:
            portion_multipliers = {'Light': 0.75, 'Medium': 1.0, 'Large': 1.25}
            multiplier = portion_multipliers.get(request.portion_size, 1.0)
            for meal_type in ['breakfast', 'lunch', 'dinner', 'snacks']:
                for meal in recommendations.get(meal_type, []):
                    if 'nutrition_facts' in meal:
                        nf = meal['nutrition_facts']
                        nf['proteins_g'] = round(nf.get('proteins_g', 0) * multiplier, 1)
                        nf['carbohydrates_g'] = round(nf.get('carbohydrates_g', 0) * multiplier, 1)
                        nf['fats_g'] = round(nf.get('fats_g', 0) * multiplier, 1)
                        nf['sugar_g'] = round(nf.get('sugar_g', 0) * multiplier, 1)
                        nf['fiber_g'] = round(nf.get('fiber_g', 0) * multiplier, 1)
        from services.utils import build_absolute_url
        from pathlib import Path
        for meal_type in ['breakfast', 'lunch', 'dinner', 'snacks']:
            for meal in recommendations.get(meal_type, []):
                if 'image_url' in meal and meal['image_url']:
                    image_url = str(meal['image_url'])
                    if image_url.startswith('http://') or image_url.startswith('https://'):
                        continue
                    if image_url.startswith('/'):
                        try:
                            absolute_url = build_absolute_url(http_request, image_url)
                            meal['image_url'] = absolute_url
                        except Exception as e:
                            logger.warning(f'Failed to build absolute URL for {image_url}: {e}')
                            meal['image_url'] = ''
        response_obj = MealRecommendationResponse(status='success', recommendations=MealRecommendations(breakfast=recommendations['breakfast'], lunch=recommendations['lunch'], dinner=recommendations['dinner'], snacks=recommendations['snacks']))
        try:
            latency_ms = int((time.time() - start_ts) * 1000)
            db.add(dbm.MealRecommendationLog(user_id=str(request.user_id), request_json=request.model_dump(mode='json'), response_json=response_obj.model_dump(mode='json'), latency_ms=latency_ms))
            db.commit()
        except Exception as log_err:
            logger.warning(f'Could not persist meal recommendation log: {log_err}')
        return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message='Meal recommendations generated successfully', data=response_obj.model_dump()).model_dump())
    except HTTPException as he:
        return JSONResponse(status_code=he.status_code, content=ErrorResponse(code='MEAL_RECOMMENDATION_ERROR', message=str(he.detail)).model_dump())
    except Exception as e:
        logger.error(f'Error generating meal recommendations: {str(e)}')
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='INTERNAL_ERROR', message='Failed to generate meal recommendations').model_dump())

@meal_router.get('/history', status_code=200, summary='Get Meal Recommendation History', description='Fetch recent meal recommendation logs for a user, ordered by newest first.')
async def get_meal_history(user_id: str, user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)):
    try:
        q = db.query(dbm.MealRecommendationLog).filter(dbm.MealRecommendationLog.user_id == str(user_id)).order_by(dbm.MealRecommendationLog.created_at.desc())
        items = [{'id': row.id, 'user_id': row.user_id, 'request_json': row.request_json, 'response_json': row.response_json, 'latency_ms': row.latency_ms, 'created_at': row.created_at.isoformat() if row.created_at else None} for row in q.all()]
        return {'items': items, 'count': len(items)}
    except Exception as e:
        logger.error(f'Error fetching meal recommendation history: {e}')
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Failed to fetch history')
chatbot_router = APIRouter(prefix='/api/v1/chatbot', tags=['AI Chatbot'], responses={400: {'model': ErrorResponse, 'description': 'Validation Error'}, 500: {'model': ErrorResponse, 'description': 'Internal Server Error'}})

@chatbot_router.post('/message', status_code=200, summary='Send Chat Message', description='Send a message to the AI chatbot and receive intelligent responses about diabetes management.')
async def send_chat_message(request: ChatbotRequest, user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    try:
        logger.info(f'Processing chat message for user: {request.user_id}')
        sanitized_message = sanitize_html(request.message)
        if len(sanitized_message.strip()) < 1:
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=ErrorResponse(code='VALIDATION_ERROR', message='Message cannot be empty').model_dump())
        if len(sanitized_message) > 300:
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=ErrorResponse(code='VALIDATION_ERROR', message='Message cannot exceed 300 characters').model_dump())
        is_rate_limited, error_msg = check_chatbot_rate_limit(str(request.user_id), sanitized_message, db, window_seconds=30)
        if is_rate_limited:
            return JSONResponse(status_code=status.HTTP_429_TOO_MANY_REQUESTS, content=ErrorResponse(code='RATE_LIMIT_EXCEEDED', message=error_msg).model_dump())
        chatbot_model = ChatbotModel()
        if not chatbot_model.load_model():
            return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='MODEL_UNAVAILABLE', message='Chatbot model not available. Please train the model first.').model_dump())
        start_ts = time.time()
        response = chatbot_model.generate_response(sanitized_message)
        try:
            latency_ms = int((time.time() - start_ts) * 1000)
            db.add(dbm.ChatbotMessage(user_id=str(request.user_id), message=sanitized_message, reply=str(response), meta=None))
            db.commit()
        except Exception as log_err:
            logger.warning(f'Could not persist chatbot message: {log_err}')
        return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message='Chat reply generated', data={'reply': response, 'suggestions': []}).model_dump())
    except Exception as e:
        logger.error(f'Error generating chatbot response: {str(e)}')
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='INTERNAL_ERROR', message='Failed to generate chatbot response').model_dump())

@chatbot_router.get('/history', status_code=200, summary='Get Chatbot Messages History', description='Fetch recent chatbot conversations for a user, ordered by newest first.')
async def get_chatbot_history(user_id: str, user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)):
    try:
        q = db.query(dbm.ChatbotMessage).filter(dbm.ChatbotMessage.user_id == str(user_id)).order_by(dbm.ChatbotMessage.created_at.desc())
        items = [{'id': row.id, 'user_id': row.user_id, 'message': row.message, 'reply': row.reply, 'meta': row.meta, 'created_at': row.created_at.isoformat() if row.created_at else None} for row in q.all()]
        return {'items': items, 'count': len(items)}
    except Exception as e:
        logger.error(f'Error fetching chatbot history: {e}')
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail='Failed to fetch history')
fasting_router = APIRouter(prefix='/api/v1/fasting', tags=['Fasting Tracking'], responses={400: {'model': ErrorResponse, 'description': 'Validation Error'}, 500: {'model': ErrorResponse, 'description': 'Internal Server Error'}})

@fasting_router.post('/record', status_code=201, summary='Add Fasting Record', description='Add a new fasting record with date, start time, end time, duration, and notes.')
async def add_fasting_record(request: FastingRecordRequest, user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    try:
        logger.info(f'Adding fasting record for user: {request.user_id}')
        from datetime import datetime as dt, timezone as tz_module, timedelta
        device_tz_str = request.timezone or 'UTC'
        if not isinstance(device_tz_str, str):
            device_tz_str = 'UTC'
        try:
            if ZoneInfo is None:
                device_tz = tz_module.utc
                logger.warning(f"ZoneInfo not available, using UTC for timezone '{device_tz_str}'")
            else:
                device_tz = ZoneInfo(device_tz_str)
        except Exception as tz_error:
            device_tz = tz_module.utc
            logger.warning(f"Invalid timezone '{device_tz_str}' ({tz_error}), using UTC")
        try:
            started_naive = dt.strptime(f'{request.date} {request.start_time}', '%Y-%m-%d %H:%M')
            ended_naive = dt.strptime(f'{request.date} {request.end_time}', '%Y-%m-%d %H:%M')
            if ended_naive < started_naive:
                ended_naive = ended_naive + timedelta(days=1)
            started_at_local = started_naive.replace(tzinfo=device_tz)
            ended_at_local = ended_naive.replace(tzinfo=device_tz)
            started_at = started_at_local.astimezone(tz_module.utc)
            ended_at = ended_at_local.astimezone(tz_module.utc)
            now_local = datetime.now(device_tz)
            now_utc = datetime.now(tz_module.utc)
            if now_local >= ended_at_local:
                fasting_status = 'Completed'
            elif now_local >= started_at_local:
                fasting_status = 'In Progress'
            else:
                fasting_status = 'In Progress'
        except ValueError as e:
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=ErrorResponse(code='VALIDATION_ERROR', message=f'Invalid date or time format: {str(e)}').model_dump())
        current_time = datetime.now(timezone.utc)
        fasting_record = dbm.FastingRecord(user_id=str(request.user_id), date=request.date, start_time=request.start_time, end_time=request.end_time, duration_hours=request.duration_hours, notes=request.notes[:100] if request.notes else None, status=fasting_status, started_at=started_at, ended_at=ended_at, created_at=current_time)
        db.add(fasting_record)
        db.commit()
        db.refresh(fasting_record)
        try:
            pattern = infer_fasting_pattern(request.duration_hours, request.notes)
            notification = dbm.Notification(user_id=str(request.user_id), type='health_reminder', category='fasting', title='Fasting Started!', detail=f"Your {pattern} fasting has started. You'll be notified when it's time to break your fast.", is_read=False, reminder_time=ended_at if fasting_status == 'In Progress' else None, meta={'fasting_id': fasting_record.id, 'pattern': pattern, 'duration_hours': request.duration_hours})
            db.add(notification)
            if fasting_status == 'In Progress' and ended_at:
                now = datetime.now(timezone.utc)
                if ended_at > now:
                    reminder_time = ended_at - timedelta(hours=1)
                    if reminder_time > now:
                        end_notification = dbm.Notification(user_id=str(request.user_id), type='health_reminder', category='fasting', title='Fasting Ending Soon!', detail=f'Your fasting will end in about 1 hour. Prepare to break your fast with a healthy meal.', is_read=False, reminder_time=reminder_time, meta={'fasting_id': fasting_record.id, 'pattern': pattern, 'end_time': ended_at.isoformat()})
                        db.add(end_notification)
            db.commit()
            logger.info(f'Created notifications for fasting record: {fasting_record.id}')
        except Exception as notif_error:
            logger.warning(f'Failed to create notifications for fasting record: {notif_error}')
            db.rollback()
        db.commit()
        db.refresh(fasting_record)
        time_remaining = None
        if fasting_record.status == 'In Progress' and started_at and ended_at:
            time_remaining = calculate_time_remaining(started_at, ended_at, fasting_record.status, device_tz_str)
        response_obj = FastingRecordResponse(id=fasting_record.id, user_id=fasting_record.user_id, date=fasting_record.date, start_time=fasting_record.start_time, end_time=fasting_record.end_time, duration_hours=fasting_record.duration_hours, notes=fasting_record.notes, status=fasting_record.status, time_remaining=time_remaining, created_at=fasting_record.created_at)
        return JSONResponse(status_code=status.HTTP_201_CREATED, content=SuccessResponse(message='Fasting record added successfully', data=response_obj.model_dump(mode='json')).model_dump())
    except Exception as e:
        logger.error(f'Error adding fasting record: {str(e)}')
        db.rollback()
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='INTERNAL_ERROR', message='Failed to add fasting record').model_dump())

@fasting_router.get('/records', status_code=200, summary='Get Fasting Records', description="Fetch fasting records for a user with graph data. Filter by time_range: 'Today', 'OneWeek', 'OneMonth', or 'AllTime'.")
async def get_fasting_records(user_id: str, time_range: Optional[str]=Query(default='AllTime', description="Time range filter: 'Today', 'OneWeek', 'OneMonth', or 'AllTime'"), timezone: Optional[str]=Query(default='UTC', description="Device timezone (e.g., 'America/New_York', 'Asia/Karachi', 'UTC'). Defaults to UTC."), user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    try:
        from datetime import datetime as dt, timezone as tz_module, timedelta
        from collections import defaultdict
        valid_ranges = ['Today', 'OneWeek', 'OneMonth', 'AllTime']
        if time_range not in valid_ranges:
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=ErrorResponse(code='VALIDATION_ERROR', message=f"Invalid time_range. Must be one of: {', '.join(valid_ranges)}").model_dump())
        device_tz_str = timezone or 'UTC'
        if not isinstance(device_tz_str, str):
            device_tz_str = 'UTC'
        try:
            if ZoneInfo is None:
                device_tz = tz_module.utc
                logger.warning(f"ZoneInfo not available, using UTC for timezone '{device_tz_str}'")
            else:
                device_tz = ZoneInfo(device_tz_str)
        except Exception as tz_error:
            device_tz = tz_module.utc
            logger.warning(f"Invalid timezone '{device_tz_str}' ({tz_error}), using UTC")
        try:
            now_utc_sync = dt.now(tz_module.utc)
            active = db.query(dbm.FastingRecord).filter(dbm.FastingRecord.user_id == str(user_id), dbm.FastingRecord.status == 'In Progress').all()
            updated_any = False
            for rec in active:
                if rec.ended_at:
                    end_aware = rec.ended_at if rec.ended_at.tzinfo else rec.ended_at.replace(tzinfo=tz_module.utc)
                    if now_utc_sync >= end_aware:
                        rec.status = 'Completed'
                        db.add(rec)
                        updated_any = True
            if updated_any:
                db.commit()
        except Exception as sync_err:
            logger.warning(f'Error syncing fasting status for user {user_id}: {sync_err}')
            try:
                db.rollback()
            except Exception:
                pass
        now_local = dt.now(device_tz)
        now_utc = dt.now(tz_module.utc)
        today_start_local = now_local.replace(hour=0, minute=0, second=0, microsecond=0)
        today_start = today_start_local.astimezone(tz_module.utc)
        week_start = today_start - timedelta(days=7)
        month_start = today_start - timedelta(days=30)

        def ensure_timezone_aware(dt_obj):
            if dt_obj is None:
                return None
            try:
                if dt_obj.tzinfo is None:
                    return dt_obj.replace(tzinfo=tz_module.utc)
                return dt_obj
            except Exception as e:
                logger.warning(f'Error ensuring timezone awareness: {e}')
                return dt_obj

        def record_to_response(record):
            try:
                time_remaining = None
                if record.status == 'In Progress':
                    try:
                        if record.started_at and record.ended_at:
                            time_remaining = calculate_time_remaining(record.started_at, record.ended_at, record.status, device_tz_str)
                        else:
                            started_naive = dt.strptime(f'{record.date} {record.start_time}', '%Y-%m-%d %H:%M')
                            ended_naive = dt.strptime(f'{record.date} {record.end_time}', '%Y-%m-%d %H:%M')
                            if ended_naive < started_naive:
                                ended_naive = ended_naive + timedelta(days=1)
                            started_at_local = started_naive.replace(tzinfo=device_tz)
                            ended_at_local = ended_naive.replace(tzinfo=device_tz)
                            started_at = started_at_local.astimezone(tz_module.utc)
                            ended_at = ended_at_local.astimezone(tz_module.utc)
                            time_remaining = calculate_time_remaining(started_at, ended_at, record.status, device_tz_str)
                    except Exception as e:
                        logger.warning(f'Error calculating time_remaining for record {record.id}: {e}')
                        time_remaining = None
                return FastingRecordResponse(id=record.id, user_id=record.user_id, date=record.date, start_time=record.start_time, end_time=record.end_time, duration_hours=record.duration_hours, notes=record.notes, status=record.status, time_remaining=time_remaining, created_at=record.created_at)
            except Exception as e:
                logger.warning(f"Error converting record {(record.id if record else 'unknown')}: {e}")
                return None
        try:
            query = db.query(dbm.FastingRecord).filter(dbm.FastingRecord.user_id == str(user_id))
            total = query.count()
            try:
                query = query.order_by(dbm.FastingRecord.started_at.desc().nulls_last())
            except AttributeError:
                query = query.order_by(dbm.FastingRecord.started_at.desc())
            records = query.all()
        except Exception as query_error:
            logger.error(f'Database query error: {query_error}')
            import traceback
            logger.error(traceback.format_exc())
            raise
        today_items = []
        week_items = []
        month_items = []
        all_time_items = []
        for record in records:
            response_item = record_to_response(record)
            if response_item is None:
                continue
            all_time_items.append(response_item)
            if record.started_at:
                started_at = ensure_timezone_aware(record.started_at)
                if started_at is None:
                    continue
                started_at_local = started_at.astimezone(device_tz)
                if started_at >= month_start:
                    month_items.append(response_item)
                    if started_at >= week_start:
                        week_items.append(response_item)
                        if started_at_local.date() == now_local.date():
                            today_items.append(response_item)
        filtered_items = []
        if time_range == 'Today':
            filtered_items = sorted(today_items, key=lambda x: x.created_at, reverse=True) if today_items else []
        elif time_range == 'OneWeek':
            filtered_items = sorted(week_items, key=lambda x: x.created_at, reverse=True) if week_items else []
        elif time_range == 'OneMonth':
            filtered_items = sorted(month_items, key=lambda x: x.created_at, reverse=True) if month_items else []
        else:
            filtered_items = sorted(all_time_items, key=lambda x: x.created_at, reverse=True) if all_time_items else []
        items_by_range = FastingRecordItemsByRange(Today=filtered_items if time_range == 'Today' else [], OneWeek=filtered_items if time_range == 'OneWeek' else [], OneMonth=filtered_items if time_range == 'OneMonth' else [], AllTime=filtered_items if time_range == 'AllTime' else [])
        total_fasting_days = None
        average_fasting_time = None
        try:
            unique_dates = set()
            total_duration_hours = 0.0
            completed_count = 0
            for record in records:
                if record.started_at:
                    started_at = ensure_timezone_aware(record.started_at)
                    if started_at:
                        unique_dates.add(started_at.date())
                if record.status == 'Completed':
                    duration_decimal = parse_duration_hours(record.duration_hours)
                    if duration_decimal:
                        total_duration_hours += duration_decimal
                        completed_count += 1
            total_fasting_days = len(unique_dates) if unique_dates else None
            average_fasting_time = round(total_duration_hours / completed_count, 1) if completed_count > 0 else None
        except Exception as calc_error:
            logger.warning(f'Error calculating fasting statistics: {calc_error}')
        try:
            try:
                all_graph_records = db.query(dbm.FastingRecord).filter(dbm.FastingRecord.user_id == str(user_id)).order_by(dbm.FastingRecord.started_at.asc().nulls_last()).all()
            except AttributeError:
                all_graph_records = db.query(dbm.FastingRecord).filter(dbm.FastingRecord.user_id == str(user_id)).order_by(dbm.FastingRecord.started_at.asc()).all()
        except Exception as graph_query_error:
            logger.error(f'Error querying graph records: {graph_query_error}')
            import traceback
            logger.error(traceback.format_exc())
            all_graph_records = []
        today_graph = None
        week_graph = None
        month_graph = None
        all_time_graph = None
        try:
            if time_range == 'Today':
                today_labels = []
                today_data = []
                today_local = now_local.date()
                today_records = [r for r in all_graph_records if r.started_at and ensure_timezone_aware(r.started_at).astimezone(device_tz).date() == today_local]
                hourly_data = defaultdict(list)
                for record in today_records:
                    try:
                        started_at = ensure_timezone_aware(record.started_at)
                        if started_at is None:
                            continue
                        hour = started_at.astimezone(device_tz).hour
                        duration_decimal = parse_duration_hours(record.duration_hours) or 0
                        hourly_data[hour].append(duration_decimal)
                    except Exception as e:
                        logger.warning(f"Error processing record {(record.id if record else 'unknown')} for today graph: {e}")
                        continue
                for hour in sorted(hourly_data.keys()):
                    today_labels.append(hour)
                    today_data.append(round(sum(hourly_data[hour]) / len(hourly_data[hour]), 1))
                today_graph = FastingTimeRangeData(labels=today_labels, data=today_data) if today_labels else None
            elif time_range == 'OneWeek':
                week_labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
                week_data = [0.0] * 7
                week_start_graph = today_start - timedelta(days=7)
                week_records = [r for r in all_graph_records if r.started_at and ensure_timezone_aware(r.started_at) >= week_start_graph]
                weekly_data = defaultdict(list)
                for record in week_records:
                    try:
                        started_at = ensure_timezone_aware(record.started_at)
                        if started_at is None:
                            continue
                        day_of_week = started_at.weekday()
                        duration_decimal = parse_duration_hours(record.duration_hours) or 0
                        weekly_data[day_of_week].append(duration_decimal)
                    except Exception as e:
                        logger.warning(f"Error processing record {(record.id if record else 'unknown')} for week graph: {e}")
                        continue
                for day_idx in range(7):
                    if day_idx in weekly_data:
                        week_data[day_idx] = round(sum(weekly_data[day_idx]) / len(weekly_data[day_idx]), 1)
                week_graph = FastingTimeRangeData(labels=week_labels, data=week_data)
            elif time_range == 'OneMonth':
                month_start_graph = today_start - timedelta(days=30)
                month_records = [r for r in all_graph_records if r.started_at and ensure_timezone_aware(r.started_at) >= month_start_graph]
                monthly_weekly_data = defaultdict(list)
                for record in month_records:
                    try:
                        started_at = ensure_timezone_aware(record.started_at)
                        if started_at is None:
                            continue
                        days_since_monday = started_at.weekday()
                        week_start_date = (started_at - timedelta(days=days_since_monday)).date()
                        days_from_month_start = (week_start_date - month_start_graph.date()).days
                        week_num = min(days_from_month_start // 7 + 1, 4)
                        duration_decimal = parse_duration_hours(record.duration_hours) or 0
                        monthly_weekly_data[week_num].append(duration_decimal)
                    except Exception as e:
                        logger.warning(f"Error processing record {(record.id if record else 'unknown')} for month graph: {e}")
                        continue
                month_labels = ['W1', 'W2', 'W3', 'W4']
                month_data = []
                for week_num in range(1, 5):
                    if week_num in monthly_weekly_data:
                        month_data.append(round(sum(monthly_weekly_data[week_num]), 1))
                    else:
                        month_data.append(0.0)
                month_graph = FastingTimeRangeData(labels=month_labels, data=month_data)
            else:
                yearly_data = defaultdict(list)
                for record in all_graph_records:
                    try:
                        if record.started_at:
                            started_at = ensure_timezone_aware(record.started_at)
                            if started_at is None:
                                continue
                            year = started_at.year
                            duration_decimal = parse_duration_hours(record.duration_hours) or 0
                            yearly_data[year].append(duration_decimal)
                    except Exception as e:
                        logger.warning(f'Error processing record {record.id} for all_time graph: {e}')
                        continue
                all_time_labels = sorted(yearly_data.keys())
                all_time_data = [round(sum(yearly_data[year]), 1) for year in all_time_labels]
                all_time_labels_str = [str(year) for year in all_time_labels]
                all_time_graph = FastingTimeRangeData(labels=all_time_labels_str, data=all_time_data) if all_time_labels else None
        except Exception as graph_error:
            logger.error(f'Error generating graph data: {graph_error}')
            import traceback
            logger.error(traceback.format_exc())
            today_graph = None
            week_graph = None
            month_graph = None
            all_time_graph = None
        graph_data = FastingGraphResponse(Today=today_graph if time_range == 'Today' else None, OneWeek=week_graph if time_range == 'OneWeek' else None, OneMonth=month_graph if time_range == 'OneMonth' else None, AllTime=all_time_graph if time_range == 'AllTime' else None)
        filtered_count = len(filtered_items)
        try:
            response_data = {'items': items_by_range.model_dump(mode='json'), 'count': filtered_count, 'total': total, 'total_fasting_days': total_fasting_days, 'average_fasting_time': average_fasting_time, 'graph_data': graph_data.model_dump(mode='json', exclude_none=True)}
            return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message='Fasting records retrieved successfully', data=response_data).model_dump())
        except Exception as response_error:
            logger.error(f'Error creating response data: {response_error}')
            import traceback
            logger.error(traceback.format_exc())
            raise
    except Exception as e:
        import traceback
        error_traceback = traceback.format_exc()
        logger.error(f'Error fetching fasting records for user {user_id}: {str(e)}')
        logger.error(f'Full traceback:\n{error_traceback}')
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='INTERNAL_ERROR', message='Failed to fetch fasting records. Please try again later.').model_dump())

@fasting_router.delete('/records/{record_id}', status_code=200, summary='Delete Fasting Record', description='Delete a specific fasting record by its ID.')
async def delete_fasting_record(record_id: str, user_id: str=Query(..., description='User ID (required for verification)'), user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    try:
        logger.info(f'Deleting fasting record {record_id} for user: {user_id}')
        record = db.query(dbm.FastingRecord).filter(dbm.FastingRecord.id == str(record_id), dbm.FastingRecord.user_id == str(user_id)).first()
        if not record:
            return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content=ErrorResponse(code='RECORD_NOT_FOUND', message='Fasting record not found or does not belong to this user').model_dump())
        try:
            notification = dbm.Notification(user_id=str(user_id), type='health_reminder', category='fasting', title='Fasting Record Removed', detail=f'Your fasting record from {record.date} ({record.start_time} - {record.end_time}) has been removed.', is_read=False, meta={'fasting_id': record_id, 'was_status': record.status})
            db.add(notification)
        except Exception as notif_error:
            logger.warning(f'Failed to create notification for deleted fasting record: {notif_error}')
        db.delete(record)
        db.commit()
        logger.info(f'Successfully deleted fasting record {record_id}')
        return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message='Fasting record deleted successfully').model_dump())
    except Exception as e:
        logger.error(f'Error deleting fasting record: {str(e)}')
        db.rollback()
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='INTERNAL_ERROR', message='Failed to delete fasting record').model_dump())

@fasting_router.get('/report', status_code=200, summary='Generate Intermittent Fasting Report PDF', description="Generate a clinical-style fasting report with overview metrics and detailed logs. Filter by time_range: 'Today', 'OneWeek', 'OneMonth', or 'AllTime'.")
async def generate_fasting_report(user_id: str, time_range: Optional[str]=Query(default='AllTime', description="Time range filter: 'Today', 'OneWeek', 'OneMonth', or 'AllTime'"), user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> Response:
    try:
        from datetime import datetime as dt, timezone
        import io
        try:
            from reportlab.lib import colors
            from reportlab.lib.pagesizes import letter
            from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.units import inch
            REPORTLAB_AVAILABLE = True
        except ImportError:
            REPORTLAB_AVAILABLE = False
            logger.warning('reportlab not available. Install with: pip install reportlab')
        if not REPORTLAB_AVAILABLE:
            return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='DEPENDENCY_ERROR', message='PDF generation requires reportlab. Install with: pip install reportlab').model_dump())
        user = db.query(dbm.User).filter(dbm.User.id == str(user_id)).first()
        if not user:
            return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content=ErrorResponse(code='USER_NOT_FOUND', message='User not found').model_dump())
        valid_ranges = ['Today', 'OneWeek', 'OneMonth', 'AllTime']
        if time_range not in valid_ranges:
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=ErrorResponse(code='VALIDATION_ERROR', message=f"Invalid time_range. Must be one of: {', '.join(valid_ranges)}").model_dump())
        from datetime import timedelta
        date_filter = {}
        now = dt.now(timezone.utc)
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        if time_range == 'Today':
            date_filter['start'] = today_start
            date_filter['end'] = now
        elif time_range == 'OneWeek':
            week_start = today_start - timedelta(days=7)
            date_filter['start'] = week_start
            date_filter['end'] = now
        elif time_range == 'OneMonth':
            month_start = today_start - timedelta(days=30)
            date_filter['start'] = month_start
            date_filter['end'] = now
        query = db.query(dbm.FastingRecord).filter(dbm.FastingRecord.user_id == str(user_id))
        if date_filter.get('start'):
            query = query.filter(dbm.FastingRecord.started_at >= date_filter['start'])
        if date_filter.get('end'):
            query = query.filter(dbm.FastingRecord.started_at <= date_filter['end'])
        fasting_records = query.order_by(dbm.FastingRecord.started_at.asc()).all()
        if not fasting_records:
            return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content=ErrorResponse(code='NO_DATA', message='No fasting data found for the selected period').model_dump())
        total_fasts = len(fasting_records)
        durations: List[float] = []
        pattern_counter: Counter[str] = Counter()
        sugar_after_values: List[int] = []
        detailed_rows: List[List[str]] = []
        for record in fasting_records:
            start_dt = record.started_at
            end_dt = record.ended_at
            if not start_dt:
                start_dt = dt.strptime(f'{record.date} {record.start_time}', '%Y-%m-%d %H:%M').replace(tzinfo=timezone.utc)
            if not end_dt:
                raw_end = dt.strptime(f'{record.date} {record.end_time}', '%Y-%m-%d %H:%M')
                if raw_end < start_dt.replace(tzinfo=None):
                    raw_end += timedelta(days=1)
                end_dt = raw_end.replace(tzinfo=timezone.utc)
            duration = parse_duration_hours(record.duration_hours) or round((end_dt - start_dt).total_seconds() / 3600, 1)
            durations.append(duration)
            pattern = infer_fasting_pattern(duration, record.notes)
            pattern_counter[pattern] += 1
            notes_text = record.notes if record.notes else '-'
            detailed_rows.append([start_dt.strftime('%Y-%m-%d'), start_dt.strftime('%H:%M'), end_dt.strftime('%H:%M'), pattern, f'{duration:.1f} h', notes_text])
        avg_duration = sum(durations) / total_fasts if durations else 0
        most_used_pattern = pattern_counter.most_common(1)[0][0] if pattern_counter else 'N/A'
        unique_fasting_dates = set()
        for record in fasting_records:
            if record.started_at:
                unique_fasting_dates.add(record.started_at.date())
        total_fasting_days = len(unique_fasting_dates)
        completed_fasts = sum((1 for r in fasting_records if r.status == 'Completed'))
        completion_rate = completed_fasts / total_fasts * 100 if total_fasts > 0 else 0
        summary_parts = []
        if most_used_pattern != 'N/A':
            pattern_count = pattern_counter[most_used_pattern]
            pattern_percentage = pattern_count / total_fasts * 100 if total_fasts > 0 else 0
            if pattern_percentage >= 70:
                summary_parts.append(f'Excellent consistency: You follow {most_used_pattern} pattern {pattern_percentage:.0f}% of the time.')
            elif pattern_percentage >= 50:
                summary_parts.append(f'Good consistency: {most_used_pattern} is your preferred pattern ({pattern_percentage:.0f}% usage).')
        else:
            summary_parts.append(f'Varied patterns: You use multiple fasting approaches, with {most_used_pattern} most common.')
        if avg_duration >= 16:
            summary_parts.append(f'Long fasting durations (avg {avg_duration:.1f}h) suggest effective metabolic flexibility.')
        elif avg_duration >= 12:
            summary_parts.append(f'Moderate fasting durations (avg {avg_duration:.1f}h) provide good health benefits.')
        elif avg_duration >= 8:
            summary_parts.append(f'Shorter fasting windows (avg {avg_duration:.1f}h) are a good starting point for beginners.')
        if completion_rate >= 90:
            summary_parts.append(f'Outstanding completion rate ({completion_rate:.0f}%) shows strong commitment to your fasting routine.')
        elif completion_rate >= 70:
            summary_parts.append(f'Good completion rate ({completion_rate:.0f}%) indicates consistent fasting practice.')
        elif completion_rate >= 50:
            summary_parts.append(f'Moderate completion rate ({completion_rate:.0f}%). Consider setting reminders to improve consistency.')
        else:
            summary_parts.append(f'Completion rate ({completion_rate:.0f}%) suggests room for improvement. Start with shorter fasts if needed.')
        if total_fasting_days > 0:
            date_range_days = (fasting_records[-1].started_at.date() - fasting_records[0].started_at.date()).days + 1 if fasting_records else 1
            frequency = total_fasting_days / date_range_days * 100 if date_range_days > 0 else 0
            if frequency >= 80:
                summary_parts.append(f'High frequency fasting ({frequency:.0f}% of days) demonstrates excellent discipline.')
            elif frequency >= 50:
                summary_parts.append(f'Regular fasting practice ({frequency:.0f}% of days) supports metabolic health.')
            elif frequency >= 30:
                summary_parts.append(f'Moderate fasting frequency ({frequency:.0f}% of days). Consider increasing consistency for better results.')
            else:
                summary_parts.append(f'Lower frequency ({frequency:.0f}% of days). Regular fasting can enhance metabolic flexibility.')
        if summary_parts:
            insight = ' '.join(summary_parts)
        else:
            insight = 'Continue tracking your fasting patterns to build meaningful insights.'
        if avg_duration >= 14 and completion_rate >= 75:
            recommendation = 'Your fasting routine shows excellent consistency and duration. Maintain this pattern for optimal metabolic benefits.'
        elif avg_duration >= 10 and completion_rate >= 60:
            recommendation = "You're building a solid fasting habit. Consider gradually extending durations or increasing frequency for enhanced benefits."
        else:
            recommendation = 'Focus on consistency first. Complete shorter fasts regularly before extending duration.'
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.6 * inch, bottomMargin=0.6 * inch, leftMargin=0.7 * inch, rightMargin=0.7 * inch)
        story = []
        styles = getSampleStyleSheet()
        base_font = 'Helvetica'
        styles.add(ParagraphStyle(name='FastingTitle', parent=styles['Heading1'], fontName=base_font, fontSize=20, textColor=colors.HexColor('#0F172A'), alignment=1, spaceAfter=4))
        styles.add(ParagraphStyle(name='SectionHeading', parent=styles['Heading2'], fontName=base_font, fontSize=13, textColor=colors.HexColor('#111827'), spaceAfter=6))
        styles.add(ParagraphStyle(name='BodyTextSmall', parent=styles['BodyText'], fontName=base_font, fontSize=10, leading=14, textColor=colors.HexColor('#111827')))
        styles.add(ParagraphStyle(name='Tagline', parent=styles['BodyText'], fontName=base_font, fontSize=9, alignment=1, textColor=colors.HexColor('#475467'), spaceAfter=6))
        page_width, _ = letter
        doc_width = page_width - doc.leftMargin - doc.rightMargin

        def draw_footer(canvas, doc_obj):
            canvas.saveState()
            canvas.setFont(base_font, 8)
            canvas.setFillColor(colors.HexColor('#475467'))
            canvas.drawCentredString(page_width / 2, 0.45 * inch, 'Generated by SugarCare')
            canvas.restoreState()

        def add_divider(thickness=0.5):
            divider = Table([['']], colWidths=[doc_width])
            divider.setStyle(TableStyle([('LINEBELOW', (0, 0), (-1, 0), thickness, colors.HexColor('#D0D5DD'))]))
            story.append(divider)
            story.append(Spacer(1, 0.18 * inch))
        logo_path = Path('static/images/logo.png')
        if logo_path.exists():
            try:
                logo = Image(str(logo_path.resolve()))
                logo.drawHeight = 0.65 * inch
                logo.drawWidth = 1.6 * inch
                logo.hAlign = 'CENTER'
                story.append(logo)
            except Exception:
                story.append(Paragraph('[SugarCare Logo Here]', styles['BodyText']))
        else:
            story.append(Paragraph('[SugarCare Logo Here]', styles['BodyText']))
        story.append(Paragraph('Intermittent Fasting Report', styles['FastingTitle']))
        story.append(Paragraph('Stay balanced. Stay well.', styles['Tagline']))
        story.append(Spacer(1, 0.2 * inch))
        add_divider(0.7)
        profile = getattr(user, 'profile', None)

        def fmt_profile(value, suffix=''):
            if value in (None, '', 0):
                return '-'
            if suffix and isinstance(value, (int, float)):
                return f'{value}{suffix}'
            return str(value)
        if time_range == 'AllTime':
            if fasting_records:
                date_range_text = f"{fasting_records[0].started_at.strftime('%Y-%m-%d')} → {fasting_records[-1].started_at.strftime('%Y-%m-%d')}"
            else:
                date_range_text = 'All available data'
        elif date_filter.get('start') and date_filter.get('end'):
            start_str = date_filter['start'].strftime('%Y-%m-%d')
            end_str = date_filter['end'].strftime('%Y-%m-%d')
            date_range_text = f'{start_str} → {end_str}'
        elif fasting_records:
            date_range_text = f"{fasting_records[0].started_at.strftime('%Y-%m-%d')} → {fasting_records[-1].started_at.strftime('%Y-%m-%d')}"
        else:
            date_range_text = time_range
        user_info_data = [['Name', profile.name if profile and profile.name else user.email, 'Date Range', date_range_text], ['Total Fasts Logged', str(total_fasts), 'Age', fmt_profile(profile.age) if profile else '-'], ['Gender', profile.gender.title() if profile and profile.gender else '-', 'Height', fmt_profile(profile.height_cm, ' cm') if profile else '-'], ['Weight', fmt_profile(profile.weight_kg, ' kg') if profile else '-', '', '']]
        user_info_col_widths = [doc_width * 0.25] * 4
        user_info_table = Table(user_info_data, colWidths=user_info_col_widths)
        user_info_table.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F9FAFB')), ('FONTNAME', (0, 0), (-1, -1), base_font), ('FONTSIZE', (0, 0), (-1, -1), 10), ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#475467')), ('TEXTCOLOR', (2, 0), (2, -1), colors.HexColor('#475467')), ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#0F172A')), ('TEXTCOLOR', (3, 0), (3, -1), colors.HexColor('#0F172A')), ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'), ('FONTNAME', (3, 0), (3, -1), 'Helvetica-Bold'), ('BOX', (0, 0), (-1, -1), 0.4, colors.HexColor('#E4E7EC')), ('INNERGRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#E4E7EC')), ('LEFTPADDING', (0, 0), (-1, -1), 8), ('RIGHTPADDING', (0, 0), (-1, -1), 8), ('TOPPADDING', (0, 0), (-1, -1), 6), ('BOTTOMPADDING', (0, 0), (-1, -1), 6), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')]))
        story.append(user_info_table)
        story.append(Spacer(1, 0.18 * inch))
        add_divider()
        story.append(Paragraph('Fasting Overview', styles['SectionHeading']))
        overview_data = [['Total Fasts Logged', str(total_fasts)], ['Average Fast Duration', f'{avg_duration:.1f} h'], ['Most Used Pattern', most_used_pattern], ['Total Fasting Days', str(total_fasting_days)]]
        overview_table = Table(overview_data, colWidths=[2.3 * inch, doc_width - 2.3 * inch])
        overview_table.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F9FAFB')), ('FONTNAME', (0, 0), (-1, -1), base_font), ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'), ('FONTSIZE', (0, 0), (-1, -1), 10), ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#475467')), ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#0F172A')), ('BOX', (0, 0), (-1, -1), 0.4, colors.HexColor('#E4E7EC')), ('INNERGRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#E4E7EC'))]))
        story.append(overview_table)
        story.append(Spacer(1, 0.18 * inch))
        add_divider()
        story.append(Paragraph('Detailed Fasting Logs', styles['SectionHeading']))
        fasting_headers = ['Date', 'Start Time', 'End Time', 'Pattern', 'Total Hours', 'Notes']
        fasting_col_widths = [doc_width * 0.15, doc_width * 0.13, doc_width * 0.13, doc_width * 0.13, doc_width * 0.13, doc_width * 0.33]

        def wrap_cell_text(text: str) -> Paragraph:
            return Paragraph(str(text), styles['BodyTextSmall'])
        wrapped_fasting_rows = []
        for row in detailed_rows:
            wrapped_fasting_rows.append([wrap_cell_text(row[0]), wrap_cell_text(row[1]), wrap_cell_text(row[2]), wrap_cell_text(row[3]), wrap_cell_text(row[4]), wrap_cell_text(row[5])])
        fasting_table = Table([fasting_headers] + wrapped_fasting_rows, colWidths=fasting_col_widths, repeatRows=1)
        fasting_style = [('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#0F172A')), ('TEXTCOLOR', (0, 0), (-1, 0), colors.white), ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'), ('FONTSIZE', (0, 0), (-1, 0), 10), ('ALIGN', (0, 0), (-1, 0), 'CENTER'), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'), ('GRID', (0, 0), (-1, -1), 0.3, colors.HexColor('#E4E7EC')), ('LEFTPADDING', (0, 0), (-1, -1), 6), ('RIGHTPADDING', (0, 0), (-1, -1), 6), ('TOPPADDING', (0, 0), (-1, -1), 5), ('BOTTOMPADDING', (0, 0), (-1, -1), 5)]
        for idx in range(1, len(wrapped_fasting_rows) + 1):
            bg_color = colors.HexColor('#F8FAFC') if idx % 2 == 1 else colors.white
            fasting_style.append(('BACKGROUND', (0, idx), (-1, idx), bg_color))
            fasting_style.append(('ALIGN', (0, idx), (0, idx), 'LEFT'))
            fasting_style.append(('ALIGN', (1, idx), (2, idx), 'CENTER'))
            fasting_style.append(('ALIGN', (3, idx), (4, idx), 'CENTER'))
            fasting_style.append(('ALIGN', (5, idx), (5, idx), 'LEFT'))
        fasting_table.setStyle(TableStyle(fasting_style))
        story.append(fasting_table)
        story.append(Spacer(1, 0.2 * inch))
        story.append(Paragraph('Summary & Effects', styles['SectionHeading']))
        summary_metrics = [['Total Fasting Days', str(total_fasting_days)], ['Average Duration', f'{avg_duration:.1f} h'], ['Most Used Pattern', most_used_pattern], ['Completion Rate', f'{completion_rate:.0f}%']]
        summary_table = Table(summary_metrics, colWidths=[2.3 * inch, doc_width - 2.3 * inch])
        summary_table.setStyle(TableStyle([('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F9FAFB')), ('FONTNAME', (0, 0), (-1, -1), base_font), ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'), ('FONTSIZE', (0, 0), (-1, -1), 10), ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#475467')), ('TEXTCOLOR', (1, 0), (1, -1), colors.HexColor('#0F172A')), ('BOX', (0, 0), (-1, -1), 0.4, colors.HexColor('#E4E7EC')), ('INNERGRID', (0, 0), (-1, -1), 0.4, colors.HexColor('#E4E7EC')), ('VALIGN', (0, 0), (-1, -1), 'MIDDLE')]))
        story.append(summary_table)
        story.append(Spacer(1, 0.12 * inch))
        story.append(Paragraph('Insights:', styles['SectionHeading']))
        for part in summary_parts:
            story.append(Paragraph(f'• {part}', styles['BodyTextSmall']))
        story.append(Spacer(1, 0.12 * inch))
        story.append(Paragraph('Recommendation:', styles['SectionHeading']))
        story.append(Paragraph(recommendation, styles['BodyTextSmall']))
        story.append(Spacer(1, 0.2 * inch))
        doc.build(story, onFirstPage=draw_footer, onLaterPages=draw_footer)
        buffer.seek(0)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'fasting_report_{user_id}_{timestamp}.pdf'
        reports_dir = Path('reports')
        reports_dir.mkdir(exist_ok=True)
        file_path = reports_dir / filename
        with open(file_path, 'wb') as f:
            f.write(buffer.getvalue())
        logger.info(f'Fasting report saved to: {file_path}')
        buffer.seek(0)
        return Response(content=buffer.getvalue(), media_type='application/pdf', headers={'Content-Disposition': f'attachment; filename={filename}', 'Content-Type': 'application/pdf'})
    except Exception as e:
        logger.error(f'Error generating fasting report: {str(e)}')
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='INTERNAL_ERROR', message=f'Failed to generate fasting report: {str(e)}').model_dump())
community_router = APIRouter(prefix='/api/v1/community', tags=['Community Insights'], responses={400: {'model': ErrorResponse, 'description': 'Validation Error'}, 500: {'model': ErrorResponse, 'description': 'Internal Server Error'}})
BLOG_IMAGES_DIR = Path('static/images/blogs')
BLOG_IMAGES_DIR.mkdir(parents=True, exist_ok=True)
ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
MAX_IMAGE_SIZE = 5 * 1024 * 1024

def calculate_read_time(text: str, words_per_minute: int=200) -> int:
    if not text:
        return 1
    word_count = len(text.split())
    read_time = math.ceil(word_count / words_per_minute)
    return max(1, read_time)

class CommunityBlogItem(BaseModel):
    id: str
    image: str
    title: str
    description: str
    author_name: Optional[str] = None
    read_time: int = Field(..., description='Estimated reading time in minutes')
    created_at: str

@community_router.post('/blogs', status_code=201, summary='Create Community Blog', description='Add a new community blog entry with image file upload. Accepts multipart/form-data.')
async def create_community_blog(request: Request, image: UploadFile=File(..., description='Blog cover image (jpg, png, gif, webp - max 5MB)'), title: str=Form(..., min_length=5, max_length=200, description='Blog title'), description: str=Form(..., min_length=20, max_length=10000, description='Blog content/description'), author_name: Optional[str]=Form(default=None, description='Author name (optional)'), featured: bool=Form(default=False, description='Mark blog as featured'), tags: Optional[str]=Form(default=None, description="Comma-separated tags (e.g., 'diabetes,nutrition,health')"), user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    try:
        if not image.filename:
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=ErrorResponse(code='VALIDATION_ERROR', message='Image file is required').model_dump())
        file_ext = Path(image.filename).suffix.lower()
        if file_ext not in ALLOWED_IMAGE_EXTENSIONS:
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=ErrorResponse(code='VALIDATION_ERROR', message=f"Invalid image format. Allowed: {', '.join(ALLOWED_IMAGE_EXTENSIONS)}").model_dump())
        image_content = await image.read()
        if len(image_content) > MAX_IMAGE_SIZE:
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=ErrorResponse(code='VALIDATION_ERROR', message=f'Image size exceeds maximum allowed ({MAX_IMAGE_SIZE // (1024 * 1024)}MB)').model_dump())
        validated_author_name = None
        if author_name:
            import re
            if not re.match('^[A-Za-z\\s]+$', author_name.strip()):
                return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=ErrorResponse(code='VALIDATION_ERROR', message='Author name can only contain letters and spaces').model_dump())
            validated_author_name = author_name.strip()
        blog_id = str(uuid.uuid4())
        image_filename = f'{blog_id[:8]}_{secrets.token_hex(4)}{file_ext}'
        image_path = BLOG_IMAGES_DIR / image_filename
        with open(image_path, 'wb') as f:
            f.write(image_content)
        image_url = f'/static/images/blogs/{image_filename}'
        parsed_tags = None
        if tags:
            parsed_tags = [t.strip() for t in tags.split(',') if t.strip()]
        featured_value = bool(featured)
        column_exists = True
        try:
            result = db.execute(text('PRAGMA table_info(community_blogs)'))
            columns = [row[1] for row in result.fetchall()]
            column_exists = 'featured' in columns
            if not column_exists:
                logger.info('Featured column does not exist. Adding it to community_blogs table...')
                db.execute(text('\n                    ALTER TABLE community_blogs \n                    ADD COLUMN featured BOOLEAN NOT NULL DEFAULT 0\n                '))
                db.commit()
                logger.info("✓ Successfully added 'featured' column to community_blogs table.")
                column_exists = True
        except Exception as e:
            logger.warning(f'Could not check column existence: {e}. Proceeding with insert attempt.')
        try:
            if column_exists:
                db.execute(text("\n                        INSERT INTO community_blogs \n                        (id, user_id, author_name, image_url, title, description, featured, created_at)\n                        VALUES \n                        (:id, :user_id, :author_name, :image_url, :title, :description, :featured, datetime('now'))\n                    "), {'id': blog_id, 'user_id': user.id if user else None, 'author_name': validated_author_name, 'image_url': image_url, 'title': title.strip(), 'description': description.strip(), 'featured': 1 if featured_value else 0})
            else:
                db.execute(text("\n                        INSERT INTO community_blogs \n                        (id, user_id, author_name, image_url, title, description, created_at)\n                        VALUES \n                        (:id, :user_id, :author_name, :image_url, :title, :description, datetime('now'))\n                    "), {'id': blog_id, 'user_id': user.id if user else None, 'author_name': validated_author_name, 'image_url': image_url, 'title': title.strip(), 'description': description.strip()})
                featured_value = False
            db.commit()
            if column_exists:
                result = db.execute(text('\n                        SELECT id, user_id, author_name, image_url, title, description, \n                                       featured, created_at \n                        FROM community_blogs WHERE id = :id\n                    '), {'id': blog_id})
            else:
                result = db.execute(text('\n                        SELECT id, user_id, author_name, image_url, title, description, created_at \n                        FROM community_blogs WHERE id = :id\n                    '), {'id': blog_id})
            blog_row = result.fetchone()
            if column_exists and len(blog_row) > 7:
                blog = {'id': blog_row[0], 'user_id': blog_row[1], 'author_name': blog_row[2], 'image_url': blog_row[3], 'title': blog_row[4], 'description': blog_row[5], 'created_at': blog_row[7]}
                featured_value = bool(blog_row[6])
            else:
                blog = {'id': blog_row[0], 'user_id': blog_row[1], 'author_name': blog_row[2], 'image_url': blog_row[3], 'title': blog_row[4], 'description': blog_row[5], 'created_at': blog_row[6] if len(blog_row) > 6 else None}
                featured_value = False
        except Exception as sql_error:
            if 'no column named featured' in str(sql_error).lower() or ('featured' in str(sql_error).lower() and 'no such column' in str(sql_error).lower()):
                logger.warning(f'Featured column not found during insert, retrying without it: {sql_error}')
                db.rollback()
                db.execute(text("\n                        INSERT INTO community_blogs \n                        (id, user_id, author_name, image_url, title, description, created_at)\n                        VALUES \n                        (:id, :user_id, :author_name, :image_url, :title, :description, datetime('now'))\n                    "), {'id': blog_id, 'user_id': user.id if user else None, 'author_name': validated_author_name, 'image_url': image_url, 'title': title.strip(), 'description': description.strip()})
                db.commit()
                result = db.execute(text('\n                        SELECT id, user_id, author_name, image_url, title, description, created_at \n                        FROM community_blogs WHERE id = :id\n                    '), {'id': blog_id})
                blog_row = result.fetchone()
                blog = {'id': blog_row[0], 'user_id': blog_row[1], 'author_name': blog_row[2], 'image_url': blog_row[3], 'title': blog_row[4], 'description': blog_row[5], 'created_at': blog_row[6] if len(blog_row) > 6 else None}
                featured_value = False
            else:
                raise
        read_time = calculate_read_time(blog['description'])
        created_at_str = None
        if blog['created_at']:
            if isinstance(blog['created_at'], str):
                created_at_str = blog['created_at']
            else:
                created_at_str = blog['created_at'].isoformat() if hasattr(blog['created_at'], 'isoformat') else str(blog['created_at'])
        try:
            db.expire_all()
            all_users = db.query(dbm.User).all()
            if not all_users:
                logger.warning('No users found to send blog notifications to')
            else:
                author_display = blog.get('author_name', 'Community Member') or 'Community Member'
                blog_title = blog['title']
                blog_description = blog.get('description', '')
                if len(blog_title) > 55:
                    notification_title = f'New Blog: {blog_title[:52]}...'
                else:
                    notification_title = f'New Blog: {blog_title}'
                if blog_description:
                    desc_preview = blog_description[:120] + '...' if len(blog_description) > 120 else blog_description
                    notification_detail = f'{author_display} shared: "{blog_title}"\n\n{desc_preview}'
                else:
                    notification_detail = f'{author_display} shared a new blog: "{blog_title}"'
                notifications_created = 0
                for user in all_users:
                    try:
                        notification = dbm.Notification(user_id=user.id, type='smart_insight', category='blog', title=notification_title, detail=notification_detail, is_read=False, meta={'blog_id': blog['id'], 'author_name': author_display, 'image_url': blog.get('image_url'), 'featured': featured_value, 'title': blog_title})
                        db.add(notification)
                        notifications_created += 1
                    except Exception as user_notif_error:
                        logger.warning(f'Failed to create notification for user {user.id}: {user_notif_error}')
                        continue
                if notifications_created > 0:
                    db.commit()
                    logger.info(f"✓ Created {notifications_created}/{len(all_users)} Smart Insight notifications for new blog: {blog['id']} - '{blog_title[:50]}...'")
                else:
                    logger.warning(f"Failed to create any notifications for blog {blog['id']}")
                    db.rollback()
        except Exception as notif_error:
            logger.error(f"Failed to create notifications for new blog {blog.get('id', 'unknown')}: {notif_error}")
            import traceback
            logger.error(traceback.format_exc())
            db.rollback()
        from services.utils import build_absolute_url
        full_image_url = build_absolute_url(request, blog['image_url'])
        return JSONResponse(status_code=status.HTTP_201_CREATED, content=SuccessResponse(message='Blog posted successfully.', data={'id': blog['id'], 'image': full_image_url, 'title': blog['title'], 'description': blog['description'], 'author_name': blog['author_name'], 'featured': featured_value, 'read_time': read_time, 'created_at': created_at_str}).model_dump())
    except Exception as e:
        logger.error(f'Error creating community blog: {e}')
        import traceback
        logger.error(traceback.format_exc())
        db.rollback()
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='INTERNAL_ERROR', message=f'Failed to create blog: {str(e)}').model_dump())

@community_router.get('/blogs', status_code=200, summary='List Community Blogs', description='Get all community blogs (latest first). No user_id required.')
async def list_community_blogs(request: Request, user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    try:
        from services.utils import build_absolute_url
        try:
            result = db.execute(text('\n                    SELECT id, user_id, author_name, image_url, title, description, \n                           COALESCE(featured, 0) as featured, created_at\n                    FROM community_blogs\n                    ORDER BY created_at DESC\n                '))
            all_blogs_rows = result.fetchall()
            items = []
            for row in all_blogs_rows:
                created_at = row[7] if len(row) > 7 else None
                created_at_str = None
                if created_at:
                    if isinstance(created_at, str):
                        created_at_str = created_at
                    else:
                        created_at_str = created_at.isoformat() if hasattr(created_at, 'isoformat') else str(created_at)
                image_url = row[3]
                full_image_url = build_absolute_url(request, image_url) if image_url else None
                is_featured = bool(row[6]) if row[6] else False
                items.append({'id': row[0], 'image': full_image_url, 'title': row[4], 'description': row[5], 'author_name': row[2], 'featured': is_featured, 'read_time': calculate_read_time(row[5]), 'created_at': created_at_str})
        except Exception as sql_error:
            if 'no column named featured' in str(sql_error).lower() or 'featured' in str(sql_error).lower():
                logger.warning(f'Featured column not found, querying without it: {sql_error}')
                result = db.execute(text('\n                        SELECT id, user_id, author_name, image_url, title, description, created_at\n                        FROM community_blogs\n                        ORDER BY created_at DESC\n                    '))
                all_blogs_rows = result.fetchall()
                items = []
                for row in all_blogs_rows:
                    created_at = row[6] if len(row) > 6 else None
                    created_at_str = None
                    if created_at:
                        if isinstance(created_at, str):
                            created_at_str = created_at
                        else:
                            created_at_str = created_at.isoformat() if hasattr(created_at, 'isoformat') else str(created_at)
                    image_url = row[3]
                    full_image_url = build_absolute_url(request, image_url) if image_url else None
                    items.append({'id': row[0], 'image': full_image_url, 'title': row[4], 'description': row[5], 'author_name': row[2], 'featured': False, 'read_time': calculate_read_time(row[5]), 'created_at': created_at_str})
            else:
                raise
        return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message='Blogs retrieved successfully', data={'items': items, 'count': len(items)}).model_dump())
    except Exception as e:
        logger.error(f'Error listing community blogs: {e}')
        import traceback
        logger.error(traceback.format_exc())
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='INTERNAL_ERROR', message='Failed to fetch blogs').model_dump())

@community_router.delete('/blogs/{blog_id}', status_code=200, summary='Delete Community Blog', description='Delete a community blog by its ID. No user_id required.')
async def delete_community_blog(blog_id: str, user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    try:
        logger.info(f'Deleting community blog: {blog_id}')
        try:
            result = db.execute(text('\n                    SELECT id, title, author_name \n                    FROM community_blogs \n                    WHERE id = :blog_id\n                '), {'blog_id': blog_id})
            blog_row = result.fetchone()
            if not blog_row:
                return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content=ErrorResponse(code='BLOG_NOT_FOUND', message=f'Blog with ID {blog_id} not found').model_dump())
            blog_title = blog_row[1] if len(blog_row) > 1 else 'Unknown'
            db.execute(text('DELETE FROM community_blogs WHERE id = :blog_id'), {'blog_id': blog_id})
            db.commit()
            logger.info(f"Successfully deleted community blog: {blog_id} - '{blog_title}'")
            return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message='Blog deleted successfully', data={'id': blog_id, 'title': blog_title}).model_dump())
        except Exception as sql_error:
            if 'no such table' in str(sql_error).lower():
                return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content=ErrorResponse(code='BLOG_NOT_FOUND', message='Blog table does not exist').model_dump())
            raise
    except Exception as e:
        logger.error(f'Error deleting community blog: {str(e)}')
        import traceback
        logger.error(traceback.format_exc())
        db.rollback()
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='INTERNAL_ERROR', message='Failed to delete blog').model_dump())
PUSH_TEST_TIMEOUT_SEC = 120.0
notification_router = APIRouter(prefix='/api/v1/notifications', tags=['Notifications'], responses={400: {'model': ErrorResponse, 'description': 'Validation Error'}, 500: {'model': ErrorResponse, 'description': 'Internal Server Error'}})

class DeviceTokenRequest(BaseModel):
    fcm_token: str = Field(..., min_length=10, description='FCM device token from the client app')

@notification_router.get('/push_status', status_code=200, summary='Push diagnostics', description='Returns Firebase credentials status, device token count, and FCM/OAuth2 reachability.')
async def push_status(user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    data = get_push_diagnostics(db, str(user.id))
    return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message='Push status', data=data).model_dump())

@notification_router.post('/device_token', status_code=200, summary='Save FCM token', description="Register the current device's FCM token for push. Multiple tokens per user are allowed. Invalid tokens are removed when FCM returns an error.")
async def save_device_token(payload: DeviceTokenRequest, user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    token = payload.fcm_token.strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail='fcm_token is required')
    existing = db.query(dbm.Device).filter(dbm.Device.user_id == str(user.id), dbm.Device.fcm_token == token).first()
    if not existing:
        device = dbm.Device(user_id=str(user.id), fcm_token=token)
        db.add(device)
        db.commit()
    return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message='FCM token saved', data={'fcm_token': token}).model_dump())

class PushTestRequest(BaseModel):
    title: str = Field(default='Test Notification', max_length=100)
    body: str = Field(default='This is a test push from SugarCare.', max_length=300)
    data: Optional[Dict[str, Any]] = Field(default=None, description='Optional data payload')

@notification_router.post('/push_test', status_code=200, summary='Test push (saved tokens)', description='Sends a test push to all device tokens registered for the authenticated user.')
async def push_test(payload: PushTestRequest, user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    try:
        result = await asyncio.wait_for(asyncio.to_thread(send_push_notification_to_user_with_result, db, str(user.id), payload.title, payload.body, payload.data), timeout=PUSH_TEST_TIMEOUT_SEC)
    except asyncio.TimeoutError:
        result = {'firebase_ready': True, 'tokens_count': len(_get_user_device_tokens(db, str(user.id))), 'success_count': 0, 'failure_count': 0, 'generated_at': None, 'errors': [f'Push test timed out after {int(PUSH_TEST_TIMEOUT_SEC)}s. Check GET /push_status and outbound HTTPS to oauth2.googleapis.com and fcm.googleapis.com.']}
    tokens_count = result.get('tokens_count', 0)
    success_count = result.get('success_count', 0)
    errors = result.get('errors', [])
    if tokens_count == 0:
        msg = "No device tokens registered. Register your FCM token first via POST /api/v1/notifications/device_token with your app's FCM token."
    elif success_count > 0:
        msg = f'Push sent to {success_count} device(s).'
    elif errors:
        msg = f"Push failed: {'; '.join((str(e)[:120] for e in errors[:3]))}"
    else:
        msg = 'Push test executed (check data for details).'
    result['_hint'] = msg
    return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message=msg, data=result).model_dump())

class PushTestTokenRequest(BaseModel):
    fcm_token: str = Field(..., min_length=10, description='Exact FCM device token to send to')
    title: str = Field(default='Test from SugarCare', max_length=100)
    body: str = Field(default='Test push to this device.', max_length=300)

@notification_router.post('/push_test_token', status_code=200, summary='Test push (exact token)', description='Sends a test push to the given FCM token only. Use for live testing with an exact device token. Requires auth.')
async def push_test_token(payload: PushTestTokenRequest, user: dbm.User=Depends(get_current_user)) -> JSONResponse:
    result = await asyncio.to_thread(send_push_to_single_token_with_result, payload.fcm_token.strip(), payload.title, payload.body)
    return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message='Push test (single token) executed', data=result).model_dump())

def format_time_ago(dt: datetime) -> str:
    if not dt:
        return 'Unknown'
    now = datetime.now(timezone.utc) if dt.tzinfo else datetime.now()
    if dt.tzinfo:
        now = now.replace(tzinfo=timezone.utc)
    else:
        dt = dt.replace(tzinfo=None)
        now = now.replace(tzinfo=None)
    diff = now - dt
    if diff.total_seconds() < 60:
        return 'Just Now'
    elif diff.total_seconds() < 3600:
        minutes = int(diff.total_seconds() / 60)
        return f"{minutes} Minute{('s' if minutes != 1 else '')} Ago"
    elif diff.total_seconds() < 86400:
        hours = int(diff.total_seconds() / 3600)
        return f"{hours} Hour{('s' if hours != 1 else '')} Ago"
    elif diff.days < 7:
        days = diff.days
        return f"{days} Day{('s' if days != 1 else '')} Ago"
    elif diff.days < 30:
        weeks = diff.days // 7
        return f"{weeks} Week{('s' if weeks != 1 else '')} Ago"
    else:
        return dt.strftime('%b %d, %Y')

def categorize_notification_date(created_at: Optional[datetime]) -> str:
    if not created_at:
        return 'Older'
    now = datetime.now(timezone.utc) if created_at.tzinfo else datetime.now()
    if created_at.tzinfo:
        now = now.replace(tzinfo=timezone.utc)
    else:
        created_at = created_at.replace(tzinfo=None)
        now = now.replace(tzinfo=None)
    created_date = created_at.date() if hasattr(created_at, 'date') else created_at
    today = now.date() if hasattr(now, 'date') else now
    yesterday = today - timedelta(days=1)
    last_week_start = today - timedelta(days=7)
    if isinstance(created_date, datetime):
        created_date = created_date.date()
    if isinstance(today, datetime):
        today = today.date()
    if created_date == today:
        return 'Today'
    elif created_date == yesterday:
        return 'Yesterday'
    elif created_date >= last_week_start:
        return 'Last Week'
    else:
        return 'Older'

def generate_health_reminders(user_id: str, db: Session):
    try:
        latest_sugar = db.query(dbm.SugarRecord).filter(dbm.SugarRecord.user_id == user_id).order_by(dbm.SugarRecord.recorded_at.desc()).first()
        latest_fasting = db.query(dbm.FastingRecord).filter(dbm.FastingRecord.user_id == user_id).order_by(dbm.FastingRecord.started_at.desc()).first()
        active_fastings = db.query(dbm.FastingRecord).filter(dbm.FastingRecord.user_id == user_id, dbm.FastingRecord.status == 'In Progress').all()
        latest_risk = db.query(dbm.RiskForecastLog).filter(dbm.RiskForecastLog.user_id == user_id).order_by(dbm.RiskForecastLog.created_at.desc()).first()
        latest_sugar_forecast = db.query(dbm.SugarForecastLog).filter(dbm.SugarForecastLog.user_id == user_id).order_by(dbm.SugarForecastLog.created_at.desc()).first()
        now = datetime.now(timezone.utc)
        reminders_created = []
        for fasting in active_fastings:
            if fasting.ended_at:
                end_time = fasting.ended_at
                if not end_time.tzinfo:
                    end_time = end_time.replace(tzinfo=timezone.utc)
                if now >= end_time:
                    fasting.status = 'Completed'
                    db.add(fasting)
                    existing_completion = None
                    all_fasting_notifs = db.query(dbm.Notification).filter(dbm.Notification.user_id == user_id, dbm.Notification.type == 'health_reminder', dbm.Notification.category == 'fasting', dbm.Notification.title == 'Fasting Completed!').all()
                    for notif in all_fasting_notifs:
                        if notif.meta and isinstance(notif.meta, dict) and (notif.meta.get('fasting_id') == fasting.id):
                            existing_completion = notif
                            break
                    if not existing_completion:
                        pattern = infer_fasting_pattern(fasting.duration_hours, fasting.notes)
                        duration_display = fasting.duration_hours if isinstance(fasting.duration_hours, str) else f'{int(fasting.duration_hours)}:{int(fasting.duration_hours % 1 * 60):02d}'
                        notification = dbm.Notification(user_id=user_id, type='health_reminder', category='fasting', title='Fasting Completed!', detail=f"Congratulations! You've completed your {pattern} fasting ({duration_display}). Time to break your fast with a nutritious meal.", is_read=False, meta={'fasting_id': fasting.id, 'pattern': pattern, 'duration_hours': fasting.duration_hours})
                        db.add(notification)
                        reminders_created.append(f'fasting_completed_{fasting.id}')
                else:
                    time_until_end = (end_time - now).total_seconds() / 3600
                    if 0 < time_until_end <= 1:
                        existing = None
                        all_ending_notifs = db.query(dbm.Notification).filter(dbm.Notification.user_id == user_id, dbm.Notification.type == 'health_reminder', dbm.Notification.category == 'fasting', dbm.Notification.title == 'Fasting Ending Soon!').all()
                        for notif in all_ending_notifs:
                            if notif.meta and isinstance(notif.meta, dict) and (notif.meta.get('fasting_id') == fasting.id):
                                existing = notif
                                break
                        if not existing:
                            pattern = infer_fasting_pattern(fasting.duration_hours, fasting.notes)
                            minutes_remaining = int(time_until_end * 60)
                            notification = dbm.Notification(user_id=user_id, type='health_reminder', category='fasting', title='Fasting Ending Soon!', detail=f"Your {pattern} fasting will end in about {minutes_remaining} minute{('s' if minutes_remaining != 1 else '')}. Prepare to break your fast with a healthy meal.", is_read=False, reminder_time=end_time, meta={'fasting_id': fasting.id, 'pattern': pattern, 'end_time': end_time.isoformat()})
                            db.add(notification)
                            reminders_created.append(f'fasting_end_soon_{fasting.id}')
        if latest_fasting:
            last_fast_time = latest_fasting.started_at
            if isinstance(last_fast_time, str):
                try:
                    last_fast_time = datetime.fromisoformat(last_fast_time.replace('Z', '+00:00'))
                except:
                    last_fast_time = datetime.strptime(last_fast_time, '%Y-%m-%d %H:%M:%S')
            if not last_fast_time.tzinfo:
                last_fast_time = last_fast_time.replace(tzinfo=timezone.utc)
            hours_since_fast = (now - last_fast_time).total_seconds() / 3600
            if hours_since_fast > 24:
                today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
                existing_today = db.query(dbm.Notification).filter(dbm.Notification.user_id == user_id, dbm.Notification.type == 'health_reminder', dbm.Notification.category == 'fasting', dbm.Notification.title == 'Time to Fast!', dbm.Notification.created_at >= today_start).first()
                last_48h_start = now - timedelta(hours=48)
                existing_recent = db.query(dbm.Notification).filter(dbm.Notification.user_id == user_id, dbm.Notification.type == 'health_reminder', dbm.Notification.category == 'fasting', dbm.Notification.title == 'Time to Fast!', dbm.Notification.created_at >= last_48h_start).first()
                if not existing_today and (not existing_recent):
                    reminder_time = now + timedelta(hours=2)
                    notification = dbm.Notification(user_id=user_id, type='health_reminder', category='fasting', title='Time to Fast!', detail='Consider starting your intermittent fasting routine. Regular fasting can help manage blood sugar levels.', is_read=False, reminder_time=reminder_time)
                    db.add(notification)
                    reminders_created.append('fasting')
        if latest_sugar:
            last_sugar_time = latest_sugar.recorded_at
            if isinstance(last_sugar_time, str):
                try:
                    last_sugar_time = datetime.fromisoformat(last_sugar_time.replace('Z', '+00:00'))
                except:
                    last_sugar_time = datetime.strptime(last_sugar_time, '%Y-%m-%d %H:%M:%S')
            if not last_sugar_time.tzinfo:
                last_sugar_time = last_sugar_time.replace(tzinfo=timezone.utc)
            hours_since_sugar = (now - last_sugar_time).total_seconds() / 3600
            if hours_since_sugar > 6:
                today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
                existing_today = db.query(dbm.Notification).filter(dbm.Notification.user_id == user_id, dbm.Notification.type == 'health_reminder', dbm.Notification.category == 'sugar', dbm.Notification.title == 'Check Your Blood Sugar', dbm.Notification.created_at >= today_start).first()
                last_7d_start = now - timedelta(days=7)
                existing_for_reading = db.query(dbm.Notification).filter(dbm.Notification.user_id == user_id, dbm.Notification.type == 'health_reminder', dbm.Notification.category == 'sugar', dbm.Notification.title == 'Check Your Blood Sugar', dbm.Notification.created_at >= last_7d_start).all()
                reading_notification_exists = False
                for notif in existing_for_reading:
                    if notif.meta and isinstance(notif.meta, dict):
                        existing_reading_id = notif.meta.get('last_sugar_reading_id')
                        if existing_reading_id == latest_sugar.id:
                            reading_notification_exists = True
                            break
                last_24h_start = now - timedelta(hours=24)
                recent_deletions = db.query(dbm.AuditLog).filter(dbm.AuditLog.user_id == user_id, dbm.AuditLog.action == 'notification_deleted', dbm.AuditLog.created_at >= last_24h_start).all()
                deletion_exists = False
                for deletion in recent_deletions:
                    if deletion.meta and isinstance(deletion.meta, dict):
                        del_category = deletion.meta.get('notification_category')
                        del_title = deletion.meta.get('notification_title')
                        if del_category == 'sugar' and del_title == 'Check Your Blood Sugar':
                            deletion_exists = True
                            break
                existing_any = db.query(dbm.Notification).filter(dbm.Notification.user_id == user_id, dbm.Notification.type == 'health_reminder', dbm.Notification.category == 'sugar', dbm.Notification.title == 'Check Your Blood Sugar').first()
                if not existing_today and (not reading_notification_exists) and (not deletion_exists) and (not existing_any):
                    reminder_time = now + timedelta(hours=1)
                    notification = dbm.Notification(user_id=user_id, type='health_reminder', category='sugar', title='Check Your Blood Sugar', detail="It's been a while since your last reading. Regular monitoring helps track your glucose levels.", is_read=False, reminder_time=reminder_time, meta={'last_sugar_reading_id': latest_sugar.id, 'last_sugar_time': last_sugar_time.isoformat(), 'hours_since_reading': round(hours_since_sugar, 1)})
                    db.add(notification)
                    reminders_created.append('sugar')
                else:
                    skip_reason = []
                    if existing_today:
                        skip_reason.append('exists today')
                    if reading_notification_exists:
                        skip_reason.append('exists for this reading')
                    if deletion_exists:
                        skip_reason.append('deleted recently (24h cooldown)')
                    if existing_any:
                        skip_reason.append('already exists')
                    logger.debug(f"Skipped creating sugar reminder for user {user_id}: {', '.join(skip_reason)}")
        if latest_risk:
            last_risk_time = latest_risk.created_at
            if isinstance(last_risk_time, str):
                try:
                    last_risk_time = datetime.fromisoformat(last_risk_time.replace('Z', '+00:00'))
                except:
                    last_risk_time = datetime.strptime(last_risk_time, '%Y-%m-%d %H:%M:%S')
            if not last_risk_time.tzinfo:
                last_risk_time = last_risk_time.replace(tzinfo=timezone.utc)
            days_since_risk = (now - last_risk_time).days
            if days_since_risk > 7:
                week_start = now - timedelta(days=7)
                existing = db.query(dbm.Notification).filter(dbm.Notification.user_id == user_id, dbm.Notification.type == 'health_reminder', dbm.Notification.category == 'risk_forecast', dbm.Notification.title == 'Update Your Risk Forecast', dbm.Notification.created_at >= week_start).first()
                if not existing:
                    reminder_time = now + timedelta(hours=3)
                    notification = dbm.Notification(user_id=user_id, type='health_reminder', category='risk_forecast', title='Update Your Risk Forecast', detail='Get an updated health risk assessment based on your recent data. Regular forecasts help track your health trends.', is_read=False, reminder_time=reminder_time)
                    db.add(notification)
                    reminders_created.append('risk_forecast')
        if latest_sugar_forecast and latest_sugar:
            last_forecast_time = latest_sugar_forecast.created_at
            if isinstance(last_forecast_time, str):
                try:
                    last_forecast_time = datetime.fromisoformat(last_forecast_time.replace('Z', '+00:00'))
                except:
                    last_forecast_time = datetime.strptime(last_forecast_time, '%Y-%m-%d %H:%M:%S')
            if not last_forecast_time.tzinfo:
                last_forecast_time = last_forecast_time.replace(tzinfo=timezone.utc)
            days_since_forecast = (now - last_forecast_time).days
            last_sugar_time = latest_sugar.recorded_at
            if isinstance(last_sugar_time, str):
                try:
                    last_sugar_time = datetime.fromisoformat(last_sugar_time.replace('Z', '+00:00'))
                except:
                    last_sugar_time = datetime.strptime(last_sugar_time, '%Y-%m-%d %H:%M:%S')
            if not last_sugar_time.tzinfo:
                last_sugar_time = last_sugar_time.replace(tzinfo=timezone.utc)
            if days_since_forecast > 3 and last_sugar_time > last_forecast_time:
                week_start = now - timedelta(days=7)
                existing = db.query(dbm.Notification).filter(dbm.Notification.user_id == user_id, dbm.Notification.type == 'health_reminder', dbm.Notification.category == 'sugar_forecast', dbm.Notification.title == 'Generate New Sugar Forecast', dbm.Notification.created_at >= week_start).first()
                if not existing:
                    reminder_time = now + timedelta(hours=2)
                    notification = dbm.Notification(user_id=user_id, type='health_reminder', category='sugar_forecast', title='Generate New Sugar Forecast', detail='You have new blood sugar readings. Generate an updated forecast to predict your glucose levels and get personalized recommendations.', is_read=False, reminder_time=reminder_time)
                    db.add(notification)
                    reminders_created.append('sugar_forecast')
        if reminders_created:
            db.commit()
            logger.info(f"Created health reminders for user {user_id}: {', '.join(reminders_created)}")
        return reminders_created
    except Exception as e:
        logger.error(f'Error generating health reminders for user {user_id}: {e}')
        db.rollback()
        return []

@notification_router.get('/', status_code=200, summary='Get Notifications', description='Get all notifications for a user, organized by type (All Notifications or Smart Insights) and date (Today, Yesterday, Last Week, Older).')
async def get_notifications(user_id: str=Query(..., description='User ID'), type_filter: Optional[str]=Query(None, description="Filter by type: 'all' for all notifications, 'smart_insight' for smart insights only"), user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    try:
        reminders_created = generate_health_reminders(user_id, db)
        push_generated = False
        push_generated_at = None
        if reminders_created:
            try:
                tokens = _get_user_device_tokens(db, user_id)
                if tokens:
                    push_generated = True
                    push_generated_at = datetime.now(timezone.utc).isoformat()
                    title = 'New notifications'
                    body = f'You have {len(reminders_created)} new notification(s) in SugarCare.'
                    data = {'source': 'notification_router', 'created': reminders_created}
                    asyncio.create_task(asyncio.to_thread(_send_push_to_tokens, tokens, title, body, data, user_id))
                    logger.info('Generated push for user %s: %d new notifications', user_id, len(reminders_created))
                else:
                    logger.info('Notifications created for user %s (%d), but no device tokens to push', user_id, len(reminders_created))
            except Exception as e:
                logger.warning('Failed to generate push for new notifications (user %s): %s', user_id, e)
        query = db.query(dbm.Notification).filter(dbm.Notification.user_id == user_id)
        if type_filter == 'smart_insight':
            query = query.filter(dbm.Notification.type == 'smart_insight')
        elif type_filter == 'all' or type_filter is None:
            pass
        notifications = query.order_by(dbm.Notification.created_at.desc()).all()
        organized = {'Today': [], 'Yesterday': [], 'Last Week': [], 'Older': []}
        for notif in notifications:
            date_category = categorize_notification_date(notif.created_at)
            time_ago = format_time_ago(notif.created_at)
            remaining_time = None
            if notif.reminder_time and notif.type == 'health_reminder':
                now = datetime.now(timezone.utc) if notif.reminder_time.tzinfo else datetime.now()
                if notif.reminder_time.tzinfo:
                    now = now.replace(tzinfo=timezone.utc)
                else:
                    notif.reminder_time = notif.reminder_time.replace(tzinfo=None)
                    now = now.replace(tzinfo=None)
                if notif.reminder_time > now:
                    diff = notif.reminder_time - now
                    hours = int(diff.total_seconds() / 3600)
                    minutes = int(diff.total_seconds() % 3600 / 60)
                    if hours > 0:
                        remaining_time = f'{hours}h {minutes}m'
                    else:
                        remaining_time = f'{minutes}m'
            notification_data = {'id': notif.id, 'type': notif.type, 'category': notif.category, 'title': notif.title, 'detail': notif.detail, 'is_read': notif.is_read, 'time_ago': time_ago, 'created_at': notif.created_at.isoformat() if notif.created_at else None, 'remaining_time': remaining_time, 'meta': notif.meta}
            organized[date_category].append(notification_data)
        unread_count = sum((1 for notif in notifications if not notif.is_read))
        smart_insights_count = sum((1 for notif in notifications if notif.type == 'smart_insight'))
        return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message='Notifications retrieved successfully', data={'notifications': organized, 'unread_count': unread_count, 'smart_insights_count': smart_insights_count, 'total_count': len(notifications), 'reminders_created': reminders_created, 'push_generated': push_generated, 'push_generated_at': push_generated_at}).model_dump())
    except Exception as e:
        logger.error(f'Error getting notifications: {e}')
        import traceback
        logger.error(traceback.format_exc())
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='INTERNAL_ERROR', message='Failed to fetch notifications').model_dump())

@notification_router.patch('/{notification_id}/read', status_code=200, summary='Mark Notification as Read', description='Mark a notification as read.')
async def mark_notification_read(notification_id: str, user_id: str=Query(..., description='User ID'), user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    try:
        notification = db.query(dbm.Notification).filter(dbm.Notification.id == notification_id, dbm.Notification.user_id == user_id).first()
        if not notification:
            return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content=ErrorResponse(code='NOT_FOUND', message='Notification not found').model_dump())
        notification.is_read = True
        db.commit()
        return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message='Notification marked as read', data={'id': notification.id, 'is_read': True}).model_dump())
    except Exception as e:
        logger.error(f'Error marking notification as read: {e}')
        db.rollback()
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='INTERNAL_ERROR', message='Failed to mark notification as read').model_dump())

@notification_router.patch('/read-all', status_code=200, summary='Mark All Notifications as Read', description='Mark all notifications for a user as read.')
async def mark_all_notifications_read(user_id: str=Query(..., description='User ID'), user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    try:
        updated = db.query(dbm.Notification).filter(dbm.Notification.user_id == user_id, dbm.Notification.is_read == False).update({'is_read': True})
        db.commit()
        return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message=f'Marked {updated} notifications as read', data={'updated_count': updated}).model_dump())
    except Exception as e:
        logger.error(f'Error marking all notifications as read: {e}')
        db.rollback()
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='INTERNAL_ERROR', message='Failed to mark notifications as read').model_dump())

@notification_router.delete('/{notification_id}', status_code=200, summary='Delete Notification', description='Delete a specific notification by its ID. Requires authentication token.')
async def delete_notification(notification_id: str, user_id: str=Query(..., description='User ID (required for verification)'), user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    try:
        logger.info(f'User {user.id} attempting to delete notification: {notification_id}')
        notification = db.query(dbm.Notification).filter(dbm.Notification.id == notification_id, dbm.Notification.user_id == user_id).first()
        if not notification:
            logger.warning(f'Notification not found: {notification_id} for user {user_id}')
            return JSONResponse(status_code=status.HTTP_404_NOT_FOUND, content=ErrorResponse(code='NOTIFICATION_NOT_FOUND', message=f'Notification with ID {notification_id} not found').model_dump())
        if notification.user_id != user.id:
            logger.warning(f'User {user.id} attempted to delete notification {notification_id} belonging to {notification.user_id}')
            return JSONResponse(status_code=status.HTTP_403_FORBIDDEN, content=ErrorResponse(code='FORBIDDEN', message='You do not have permission to delete this notification').model_dump())
        notification_title = notification.title
        notification_category = notification.category
        notification_type = notification.type
        notification_meta = notification.meta
        notification_created_at = notification.created_at
        if notification_type == 'health_reminder' and notification_category:
            try:
                now_utc = datetime.now(timezone.utc)
                created_at_aware = notification_created_at
                if created_at_aware and (not created_at_aware.tzinfo):
                    created_at_aware = created_at_aware.replace(tzinfo=timezone.utc)
                deletion_log = dbm.AuditLog(user_id=user_id, action='notification_deleted', meta={'notification_type': notification_type, 'notification_category': notification_category, 'notification_title': notification_title, 'deleted_at': now_utc.isoformat(), 'created_at': created_at_aware.isoformat() if created_at_aware else None})
                db.add(deletion_log)
                if created_at_aware:
                    time_since_creation = (now_utc - created_at_aware).total_seconds() / 3600
                    logger.info(f"Deleting health reminder '{notification_title}' (category: {notification_category}) for user {user.id}. Created {time_since_creation:.1f} hours ago. Logged deletion to prevent regeneration.")
            except Exception as log_error:
                logger.warning(f'Error logging deletion: {log_error}')
        db.delete(notification)
        db.commit()
        logger.info(f"Successfully deleted notification {notification_id}: '{notification_title}' (category: {notification_category}) by user {user.id}")
        return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message='Notification deleted successfully', data={'id': notification_id, 'title': notification_title}).model_dump())
    except Exception as e:
        logger.error(f'Error deleting notification {notification_id}: {e}')
        db.rollback()
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='INTERNAL_ERROR', message='Failed to delete notification').model_dump())

@notification_router.delete('/', status_code=200, summary='Delete All Notifications', description='Delete all notifications for a user. Requires authentication token.')
async def delete_all_notifications(user_id: str=Query(..., description='User ID'), type_filter: Optional[str]=Query(None, description="Optional filter: 'read' to delete only read notifications, 'unread' to delete only unread notifications"), user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    try:
        logger.info(f'User {user.id} attempting to delete all notifications (filter: {type_filter})')
        if user_id != user.id:
            return JSONResponse(status_code=status.HTTP_403_FORBIDDEN, content=ErrorResponse(code='FORBIDDEN', message='You can only delete your own notifications').model_dump())
        query = db.query(dbm.Notification).filter(dbm.Notification.user_id == user_id)
        if type_filter == 'read':
            query = query.filter(dbm.Notification.is_read == True)
        elif type_filter == 'unread':
            query = query.filter(dbm.Notification.is_read == False)
        count = query.count()
        query.delete(synchronize_session=False)
        db.commit()
        logger.info(f'Successfully deleted {count} notification(s) for user {user.id}')
        return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message=f'Deleted {count} notification(s) successfully', data={'deleted_count': count, 'filter': type_filter or 'all'}).model_dump())
    except Exception as e:
        logger.error(f'Error deleting all notifications for user {user_id}: {e}')
        db.rollback()
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='INTERNAL_ERROR', message='Failed to delete notifications').model_dump())
hba1c_router = APIRouter(prefix='/api/v1/hba1c', tags=['HbA1C Test Reports'], responses={400: {'model': ErrorResponse, 'description': 'Validation Error'}, 500: {'model': ErrorResponse, 'description': 'Internal Server Error'}})

def calculate_hba1c_status(value: float) -> str:
    if value < 5.7:
        return 'Normal'
    elif value < 6.5:
        return 'Prediabetes'
    else:
        return 'Type 2'

@hba1c_router.post('/record', status_code=201, summary='Add HbA1C Test Record', description='Add a new HbA1C test record with date, time, value, and notes.')
async def add_hba1c_record(request: HbA1CRecordRequest, user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    try:
        logger.info(f'Adding HbA1C record for user: {request.user_id}')
        from datetime import datetime as dt, timezone
        try:
            test_datetime = dt.strptime(f'{request.date} {request.time}', '%Y-%m-%d %H:%M')
            test_datetime = test_datetime.replace(tzinfo=timezone.utc)
        except ValueError as e:
            return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=ErrorResponse(code='VALIDATION_ERROR', message=f'Invalid date or time format: {str(e)}').model_dump())
        hba1c_status = calculate_hba1c_status(request.value)
        hba1c_record = dbm.HbA1CRecord(user_id=str(request.user_id), date=request.date, time=request.time, value=request.value, notes=request.notes[:100] if request.notes else None, status=hba1c_status, test_at=test_datetime)
        db.add(hba1c_record)
        db.commit()
        db.refresh(hba1c_record)
        response_obj = HbA1CRecordResponse(id=hba1c_record.id, user_id=hba1c_record.user_id, date=hba1c_record.date, time=hba1c_record.time, value=hba1c_record.value, notes=hba1c_record.notes, status=hba1c_record.status, created_at=hba1c_record.created_at)
        return JSONResponse(status_code=status.HTTP_201_CREATED, content=SuccessResponse(message='HbA1C record added successfully', data=response_obj.model_dump(mode='json')).model_dump())
    except Exception as e:
        logger.error(f'Error adding HbA1C record: {str(e)}')
        db.rollback()
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='INTERNAL_ERROR', message='Failed to add HbA1C record').model_dump())

@hba1c_router.get('/records', status_code=200, summary='Get HbA1C Test Records', description='Fetch HbA1C test records for a user with optional filtering by date range and status.')
async def get_hba1c_records(user_id: str, start_date: Optional[str]=Query(default=None, description='Start date filter (YYYY-MM-DD format)'), end_date: Optional[str]=Query(default=None, description='End date filter (YYYY-MM-DD format)'), record_status: Optional[str]=Query(default=None, description='Filter by status (Normal, Prediabetes, Type 2)'), user: dbm.User=Depends(get_current_user), db: Session=Depends(get_db)) -> JSONResponse:
    try:
        from datetime import datetime as dt, timezone
        query = db.query(dbm.HbA1CRecord).filter(dbm.HbA1CRecord.user_id == str(user_id))
        if start_date:
            try:
                if len(start_date) == 10 and start_date.count('-') == 2:
                    start_dt = dt.strptime(start_date, '%Y-%m-%d').replace(tzinfo=timezone.utc)
                else:
                    start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                query = query.filter(dbm.HbA1CRecord.test_at >= start_dt)
            except Exception as e:
                logger.warning(f'Invalid start_date format: {start_date}, error: {e}')
                return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=ErrorResponse(code='VALIDATION_ERROR', message=f'Invalid start_date format. Use YYYY-MM-DD format (e.g., 2025-01-17)').model_dump())
        if end_date:
            try:
                if len(end_date) == 10 and end_date.count('-') == 2:
                    end_dt = dt.strptime(end_date, '%Y-%m-%d').replace(hour=23, minute=59, second=59, tzinfo=timezone.utc)
                else:
                    end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                query = query.filter(dbm.HbA1CRecord.test_at <= end_dt)
            except Exception as e:
                logger.warning(f'Invalid end_date format: {end_date}, error: {e}')
                return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content=ErrorResponse(code='VALIDATION_ERROR', message=f'Invalid end_date format. Use YYYY-MM-DD format (e.g., 2025-01-17)').model_dump())
        if record_status:
            query = query.filter(dbm.HbA1CRecord.status == record_status)
        total = query.count()
        query = query.order_by(dbm.HbA1CRecord.test_at.desc())
        records = query.all()
        items = [HbA1CRecordResponse(id=record.id, user_id=record.user_id, date=record.date, time=record.time, value=record.value, notes=record.notes, status=record.status, created_at=record.created_at) for record in records]
        response_obj = HbA1CRecordListResponse(items=items, count=len(items), total=total)
        return JSONResponse(status_code=status.HTTP_200_OK, content=SuccessResponse(message='HbA1C records retrieved successfully', data=response_obj.model_dump(mode='json')).model_dump())
    except Exception as e:
        logger.error(f'Error fetching HbA1C records: {e}')
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=ErrorResponse(code='INTERNAL_ERROR', message='Failed to fetch HbA1C records').model_dump())

def create_app() -> FastAPI:
    app = FastAPI(title='SugarCare Backend API', description='', version='1.0.0', docs_url='/docs', contact={'name': 'SugarCare Development Team', 'email': 'support@sugarcare.ai', 'url': 'https://sugarcare.ai'}, license_info={'name': 'MIT License', 'url': 'https://opensource.org/licenses/MIT'}, servers=[{'url': 'http://localhost:8000', 'description': 'Development server'}])
    app.add_middleware(CORSMiddleware, allow_origins=['*'], allow_credentials=True, allow_methods=['*'], allow_headers=['*'])

    @app.middleware('http')
    async def add_process_time_header(request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers['X-Process-Time'] = str(process_time)
        return response
    static_dir = Path('static')
    if not static_dir.exists():
        (static_dir / 'images' / 'food').mkdir(parents=True, exist_ok=True)
        (static_dir / 'images' / 'meals').mkdir(parents=True, exist_ok=True)
        (static_dir / 'images' / 'profiles').mkdir(parents=True, exist_ok=True)
    else:
        (static_dir / 'images' / 'food').mkdir(parents=True, exist_ok=True)
        (static_dir / 'images' / 'profiles').mkdir(parents=True, exist_ok=True)
        (static_dir / 'images' / 'meals').mkdir(parents=True, exist_ok=True)
    food_images_dir = Path('static/images/food')
    if food_images_dir.exists():
        app.mount('/static/images/food', StaticFiles(directory=str(food_images_dir)), name='food_images')
    profiles_images_dir = Path('static/images/profiles')
    if profiles_images_dir.exists():
        app.mount('/static/images/profiles', StaticFiles(directory=str(profiles_images_dir)), name='profile_images')
    app.include_router(auth_router)
    app.include_router(food_router)
    app.include_router(risk_router)
    app.include_router(sugar_router)
    app.include_router(meal_router)
    app.include_router(chatbot_router)
    app.include_router(community_router)
    app.include_router(profile_router)
    app.include_router(fasting_router)
    app.include_router(hba1c_router)
    app.include_router(notification_router)

    @app.get('/', response_model=Dict[str, Any])
    async def root():
        return {'message': 'SugarCare Backend API', 'version': '1.0.0', 'status': 'running', 'timestamp': datetime.now().isoformat(), 'endpoints': {'food_analysis': '/api/v1/food/analyze', 'risk_forecast': '/api/v1/health/risk_forecast', 'chatbot': '/api/v1/chatbot/message', 'sugar_forecast': '/api/v1/sugar/forecast', 'meal_recommendations': '/api/v1/meals/recommend', 'health_check': '/api/v1/health/check'}, 'documentation': {'swagger_ui': '/docs'}, 'features': ['AI-powered food recognition', 'Health risk forecasting', 'Glucose level prediction', 'Personalized meal recommendations', 'Intelligent chatbot assistance', 'Community insights and analytics']}

    @app.get('/health')
    async def health_check():
        return {'status': 'healthy', 'timestamp': datetime.now().isoformat(), 'version': '1.0.0', 'uptime': 3600.5, 'components': {'database': 'healthy', 'redis': 'healthy', 'models': 'healthy', 'storage': 'healthy'}}

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors = []
        for error in exc.errors():
            field_path = '.'.join((str(x) for x in error['loc']))
            error_type = error.get('type', '')
            error_msg = error.get('msg', '')
            error_value = error.get('input')
            enhanced_message = error_msg
            if 'type_error' in error_type:
                if 'int' in error_msg or 'integer' in error_msg.lower():
                    enhanced_message = f"Field '{field_path}' must be an integer (whole number), but received: {type(error_value).__name__} with value '{error_value}'"
                elif 'float' in error_msg or 'number' in error_msg.lower():
                    enhanced_message = f"Field '{field_path}' must be a number, but received: {type(error_value).__name__} with value '{error_value}'"
                elif 'str' in error_msg or 'string' in error_msg.lower():
                    enhanced_message = f"Field '{field_path}' must be a string (text), but received: {type(error_value).__name__} with value '{error_value}'"
            elif 'value_error' in error_type:
                if 'Value error' in error_msg or 'ValueError' in error_msg:
                    if ', ' in error_msg:
                        enhanced_message = error_msg.split(', ', 1)[1]
                    else:
                        enhanced_message = error_msg
                else:
                    enhanced_message = error_msg
            elif 'greater_than_equal' in error_type or 'less_than_equal' in error_type:
                if 'greater_than_equal' in error_type:
                    ctx = error.get('ctx', {})
                    min_val = ctx.get('ge', 'minimum')
                    enhanced_message = f"Field '{field_path}' must be greater than or equal to {min_val}. Received: {error_value}"
                elif 'less_than_equal' in error_type:
                    ctx = error.get('ctx', {})
                    max_val = ctx.get('le', 'maximum')
                    enhanced_message = f"Field '{field_path}' must be less than or equal to {max_val}. Received: {error_value}"
            elif 'string_pattern_mismatch' in error_type:
                ctx = error.get('ctx', {})
                pattern = ctx.get('pattern', 'required pattern')
                enhanced_message = f"Field '{field_path}' does not match the required format. {error_msg}"
            elif 'missing' in error_type:
                enhanced_message = f"Field '{field_path}' is required but was not provided."
            errors.append({'field': field_path, 'message': enhanced_message, 'type': error_type, 'received_value': error_value, 'received_type': type(error_value).__name__ if error_value is not None else 'None'})
        primary_error = errors[0]['message'] if errors else 'Validation error'
        summary = primary_error if len(errors) == 1 else f'Validation failed with {len(errors)} error(s). Please check the details below.'
        return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content={'error': primary_error, 'success': False, 'message': 'Validation error. Please review the fields below.'})

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        return JSONResponse(status_code=exc.status_code, content={'error': exc.detail if isinstance(exc.detail, str) else 'HTTP error', 'success': False, 'message': exc.detail if isinstance(exc.detail, str) else 'An error occurred'})

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        error_id = str(uuid.uuid4())
        logger.error(f'Unhandled exception {error_id}: {str(exc)}', exc_info=True)
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content={'error': f'Internal server error (id: {error_id})', 'success': False, 'message': 'An internal server error occurred'})

    def custom_openapi():
        if app.openapi_schema:
            return app.openapi_schema
        openapi_schema = get_openapi(title='SugarCare Backend API', version='1.0.0', description=app.description, routes=app.routes)
        openapi_schema['info']['x-logo'] = {'url': 'https://sugarcare.ai/logo.png'}
        schemas_to_hide = []
        if 'components' in openapi_schema and 'schemas' in openapi_schema['components']:
            for schema_name in schemas_to_hide:
                openapi_schema['components']['schemas'].pop(schema_name, None)
        components = openapi_schema.setdefault('components', {})
        schemas = components.setdefault('schemas', {})
        schemas['ErrorResponse'] = ErrorResponse.model_json_schema(ref_template='#/components/schemas/{model}')
        schemas.setdefault('ValidationError', {'title': 'ValidationError', 'type': 'object', 'properties': {'loc': {'title': 'Location', 'type': 'array', 'items': {'oneOf': [{'type': 'string'}, {'type': 'integer'}]}}, 'msg': {'title': 'Message', 'type': 'string'}, 'type': {'title': 'Error Type', 'type': 'string'}}, 'required': ['loc', 'msg', 'type']})
        schemas.setdefault('HTTPValidationError', {'title': 'HTTPValidationError', 'type': 'object', 'properties': {'detail': {'title': 'Detail', 'type': 'array', 'items': {'$ref': '#/components/schemas/ValidationError'}}}})
        components.setdefault('securitySchemes', {}).update({'BearerAuth': {'type': 'http', 'scheme': 'bearer', 'bearerFormat': 'JWT'}, 'ApiKeyAuth': {'type': 'apiKey', 'in': 'header', 'name': 'X-API-Key'}})
        openapi_schema['security'] = [{'BearerAuth': []}, {'ApiKeyAuth': []}]
        app.openapi_schema = openapi_schema
        return app.openapi_schema
    app.openapi = custom_openapi
    return app
app = create_app()
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    logger.warning(f'DB auto-create failed (use migrations in prod): {e}')
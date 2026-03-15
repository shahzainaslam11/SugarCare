from __future__ import annotations
from pydantic import BaseModel, Field, HttpUrl, field_validator
from typing import Dict, List, Optional, Union, Any
from datetime import datetime
from enum import Enum
import uuid

class FoodAnalysisRequest(BaseModel):
    user_id: str = Field(..., description='User ID')
    image_url: Optional[str] = Field(None, description='Image URL (optional if file is uploaded)')

    @field_validator('user_id')
    def validate_user_id(cls, v):
        if not v or not str(v).strip():
            raise ValueError('user_id cannot be empty or whitespace')
        return str(v).strip()

    @field_validator('image_url')
    def validate_image_url(cls, v):
        if v:
            v_str = str(v).strip()
            if not (v_str.startswith('http://') or v_str.startswith('https://')):
                raise ValueError('image_url must start with http:// or https://')
        return v
    model_config = {'json_schema_extra': {'examples': [{'user_id': '12345', 'image_url': 'https://example.com/uploads/meal.jpg'}]}}

class PredictedImpact(BaseModel):
    message: str = Field(..., description='Impact message')
    confidence_note: str = Field(..., description='Confidence note')
    model_config = {'json_schema_extra': {'examples': [{'message': 'May raise sugar by ~3 mg/dL in 2 hrs', 'confidence_note': 'Prediction accuracy may vary based on portion size and ingredients.'}]}}

class NutritionFacts(BaseModel):
    proteins_g: float = Field(..., description='Proteins in grams')
    carbohydrates_g: float = Field(..., description='Carbohydrates in grams')
    fats_g: float = Field(..., description='Fats in grams')
    sugar_g: float = Field(..., description='Sugar in grams')
    fiber_g: float = Field(..., description='Fiber in grams')

class GlycemicIndex(BaseModel):
    value: int = Field(..., description='Glycemic index value')
    category: str = Field(..., description='Glycemic index category')

class FoodAnalysisResponse(BaseModel):
    status: str = Field(..., description='Response status')
    food_item: str = Field(..., description='Identified food item')
    estimated_calories: Optional[int] = Field(None, description='Estimated calories')
    predicted_impact: Optional[PredictedImpact] = Field(None, description='Predicted impact on blood sugar')
    nutrition_facts: Optional[NutritionFacts] = Field(None, description='Nutrition facts')
    glycemic_index: Optional[GlycemicIndex] = Field(None, description='Glycemic index information')
    confidence_score: Optional[float] = Field(None, ge=0, le=1, description='Confidence score')
    suggestion: Optional[str] = Field(None, description='Dietary suggestion')
    image_url: Optional[str] = Field(None, description='URL to the uploaded food image')
    nutrition_source: Optional[str] = Field(None, description="'database' = values from nutrition lookup; 'static_estimate' = default/placeholder values (food not in database).")
    model_config = {'json_schema_extra': {'examples': [{'status': 'success', 'food_item': 'apple', 'estimated_calories': 52, 'predicted_impact': {'message': 'May raise sugar by ~3 mg/dL in 2 hrs', 'confidence_note': 'Prediction accuracy may vary based on portion size and ingredients.'}, 'nutrition_facts': {'proteins_g': 0.0, 'carbohydrates_g': 14.0, 'fats_g': 0.0, 'sugar_g': 10.0, 'fiber_g': 2.4}, 'glycemic_index': {'value': 39, 'category': 'Low'}, 'confidence_score': 0.38, 'suggestion': 'Monitor portion size and blood glucose levels.'}]}}

class RiskForecastRequest(BaseModel):
    user_id: str = Field(..., description='User ID')

    @field_validator('user_id')
    def validate_user_id(cls, v):
        if not v or not str(v).strip():
            raise ValueError('user_id cannot be empty or whitespace')
        return str(v).strip()
    model_config = {'json_schema_extra': {'examples': [{'user_id': '12345'}]}}

class RiskLevel(str, Enum):
    LOW = 'low'
    MODERATE = 'moderate'
    HIGH = 'high'
    CRITICAL = 'critical'

class PredictedRisks(BaseModel):
    neuropathy_risk: RiskLevel = Field(..., description='Neuropathy risk level')
    retinopathy_risk: RiskLevel = Field(..., description='Retinopathy risk level')
    nephropathy_risk: RiskLevel = Field(..., description='Nephropathy risk level')
    cardiovascular_risk: RiskLevel = Field(..., description='Cardiovascular risk level')
    foot_problems_risk: RiskLevel = Field(..., description='Foot problems risk level')

class OverallRiskStatus(BaseModel):
    label: str = Field(..., description='Risk label')
    color: str = Field(..., description='Color code for UI')

class RiskArea(BaseModel):
    name: str = Field(..., description='Risk area name')
    status: str = Field(..., description='Risk status')
    risk_change: str = Field(..., description='Risk change percentage')
    trend: List[float] = Field(..., description='Risk trend over time')
    safe_label: str = Field(..., description='Safe label description')
    description: str = Field(..., description='Risk description')
    tip: str = Field(..., description='Prevention tip')

class RiskForecastResponse(BaseModel):
    status: str = Field(..., description='Response status')
    overall_risk_status: OverallRiskStatus = Field(..., description='Overall risk status')
    risk_areas: List[RiskArea] = Field(..., description='List of risk areas with detailed information')
    prevention_tips: List[str] = Field(..., description='General prevention tips')
    model_config = {'json_schema_extra': {'examples': [{'status': 'success', 'overall_risk_status': {'label': 'Moderate', 'color': '#F5A623'}, 'risk_areas': [{'name': 'Nephropathy (Kidney Health)', 'status': 'Moderate', 'risk_change': '-12%', 'trend': [190, 175, 160, 150, 145, 140, 138], 'safe_label': 'Risk Lowered', 'description': 'Mild kidney stress observed, likely due to elevated HbA1c and dehydration.', 'tip': 'Increase daily water intake and limit sodium.'}], 'prevention_tips': ['Increase daily activity by at least 30 minutes (walking or light exercise).']}]}}

class CommunityInsightsResponse(BaseModel):
    status: str = Field(..., description='Response status')
    region: str = Field(..., description='Geographic region')
    top_food_trends: List[str] = Field(..., description='Popular food trends')
    average_glucose_range: str = Field(..., description='Average glucose range')
    community_tip: str = Field(..., description='Community health tip')
    model_config = {'json_schema_extra': {'examples': [{'status': 'success', 'region': 'South Asia', 'top_food_trends': ['Chapati', 'Rice', 'Lentils'], 'average_glucose_range': '120-160 mg/dL', 'community_tip': 'Users who walk 30 mins after dinner show 15% fewer sugar spikes.'}]}}

class ChatbotRequest(BaseModel):
    user_id: str = Field(..., description='User ID')
    message: str = Field(..., min_length=1, max_length=300, description='User message (1-300 chars, no HTML)')

    @field_validator('user_id')
    def validate_user_id(cls, v):
        if not v or not str(v).strip():
            raise ValueError('user_id cannot be empty or whitespace')
        return str(v).strip()

    @field_validator('message')
    def validate_message(cls, v):
        if not v or not str(v).strip():
            raise ValueError('message cannot be empty or whitespace')
        message_str = str(v).strip()
        if len(message_str) < 1:
            raise ValueError('message cannot be empty')
        if len(message_str) > 300:
            raise ValueError(f'message cannot exceed 300 characters. Received: {len(message_str)} characters')
        import re
        if re.search('<[^>]+>', message_str):
            raise ValueError('message cannot contain HTML tags')
        return message_str
    model_config = {'json_schema_extra': {'examples': [{'user_id': '12345', 'message': 'Can I eat a mango now? My blood sugar level was 120 mg/dL 2 hours ago.'}]}}

class ChatbotResponse(BaseModel):
    reply: str = Field(..., description='AI response')
    model_config = {'json_schema_extra': {'examples': [{'reply': 'If your blood sugar level was 120 mg/dL two hours ago, eating a small mango can be fine. Just monitor portion size and balance it with protein or healthy fats.'}]}}

class GlucoseReading(BaseModel):
    value: float = Field(..., ge=50, le=400, description='Glucose value in mg/dL (50-400)')
    timestamp: datetime = Field(..., description='Timestamp for the glucose reading (ISO 8601 format: YYYY-MM-DDTHH:MM:SS.ffffffZ)')

    @field_validator('value')
    def validate_value(cls, v):
        if isinstance(v, str):
            try:
                v = float(v)
            except ValueError:
                raise ValueError(f'Glucose reading must be numeric, received: {type(v).__name__}')
        if v < 50:
            raise ValueError(f'Glucose reading must be at least 50 mg/dL. Received: {v}')
        if v > 400:
            raise ValueError(f'Glucose reading must not exceed 400 mg/dL. Received: {v}')
        return float(v)

    @field_validator('timestamp', mode='before')
    def validate_timestamp(cls, v):
        if isinstance(v, datetime):
            return v
        if isinstance(v, str):
            try:
                from datetime import datetime as dt
                if len(v) == 10 and v.count('-') == 2:
                    return dt.strptime(v, '%Y-%m-%d')
                if 'T' in v or 'Z' in v:
                    return dt.fromisoformat(v.replace('Z', '+00:00'))
                return dt.fromisoformat(v)
            except (ValueError, TypeError):
                raise ValueError(f'timestamp must be a valid date (YYYY-MM-DD) or datetime string. Received: {v}')
        raise ValueError(f'timestamp must be a datetime or date string. Received: {type(v).__name__}')

class SugarForecastRequest(BaseModel):
    user_id: str = Field(..., description='User ID')
    recent_readings: List[GlucoseReading] = Field(..., min_length=1, max_length=12, description='Recent glucose readings with timestamps (oldest first)')
    meal_info: str = Field(..., description='Meal information')
    activity_level: str = Field(..., description='Activity level')

    @field_validator('user_id')
    def validate_user_id(cls, v):
        if not v or not str(v).strip():
            raise ValueError('user_id cannot be empty or whitespace')
        return str(v).strip()

    @field_validator('recent_readings')
    def validate_recent_readings(cls, v):
        if not v:
            raise ValueError('recent_readings cannot be empty. At least one reading is required.')
        sorted_readings = sorted(v, key=lambda r: r.timestamp)
        if sorted_readings != v:
            raise ValueError('recent_readings must be ordered chronologically (oldest to newest).')
        for previous, current in zip(sorted_readings, sorted_readings[1:]):
            if current.timestamp <= previous.timestamp:
                raise ValueError('Each reading timestamp must be strictly greater than the previous one.')
        return v

    @field_validator('meal_info')
    def validate_meal_info(cls, v):
        if not v or not str(v).strip():
            raise ValueError('meal_info cannot be empty or whitespace')
        return str(v).strip()

    @field_validator('activity_level')
    def validate_activity_level(cls, v):
        if not v or not str(v).strip():
            raise ValueError('activity_level cannot be empty or whitespace')
        return str(v).strip()
    model_config = {'json_schema_extra': {'examples': [{'user_id': '12345', 'recent_readings': [{'value': 120, 'timestamp': '2025-01-05'}, {'value': 135, 'timestamp': '2025-01-06'}, {'value': 150, 'timestamp': '2025-01-07'}, {'value': 165, 'timestamp': '2025-01-08'}], 'meal_info': 'rice and curry', 'activity_level': 'moderate'}]}}

class SugarForecastResponse(BaseModel):
    status: str = Field(..., description='Response status')
    prediction: str = Field(..., description='Sugar prediction')
    confidence: float = Field(..., ge=0, le=1, description='Prediction confidence')
    suggestion: str = Field(..., description='Health suggestion')
    model_config = {'json_schema_extra': {'examples': [{'status': 'success', 'prediction': 'Possible sugar spike in next 2 hours', 'confidence': 0.87, 'suggestion': 'Take a 15-minute walk or reduce carb intake.'}]}}

class SugarRecordRequest(BaseModel):
    user_id: str = Field(..., description='User ID')
    value: int = Field(..., ge=20, le=600, description='Blood sugar value (mg/dL)')
    date: str = Field(..., pattern='^\\d{4}-\\d{2}-\\d{2}$', description='Date in YYYY-MM-DD format (Year-Month-Day, e.g., 2025-01-17)')
    time: str = Field(..., pattern='^([0-1][0-9]|2[0-3]):[0-5][0-9]$', description='Time in HH:MM format (24-hour)')
    tag: Optional[str] = Field(default=None, max_length=50, description='Tag: Fasting, Meal, Bedtime, etc.')
    notes: Optional[str] = Field(default=None, max_length=100, description='Optional notes (max 100 characters)')

    @field_validator('user_id')
    def validate_user_id(cls, v):
        if not v or not str(v).strip():
            raise ValueError('user_id cannot be empty or whitespace')
        return str(v).strip()

    @field_validator('value')
    def validate_value(cls, v):
        if v < 20 or v > 600:
            raise ValueError('Blood sugar value must be between 20 and 600 mg/dL')
        return int(v)

    @field_validator('date')
    def validate_date(cls, v):
        try:
            datetime.strptime(v, '%Y-%m-%d')
        except ValueError:
            raise ValueError('Date must be in YYYY-MM-DD format')
        return v

    @field_validator('notes')
    def validate_notes(cls, v):
        if v and len(v) > 100:
            raise ValueError('Notes cannot exceed 100 characters')
        return v
    model_config = {'extra': 'ignore', 'json_schema_extra': {'examples': [{'user_id': '12345', 'value': 120, 'date': '2025-01-17', 'time': '04:40', 'tag': 'Fasting', 'notes': 'Checked before breakfast'}]}}

class SugarRecordResponse(BaseModel):
    id: str = Field(..., description='Record ID')
    user_id: str = Field(..., description='User ID')
    value: int = Field(..., description='Blood sugar value (mg/dL)')
    date: str = Field(..., description='Date in YYYY-MM-DD format (Year-Month-Day, e.g., 2025-01-17)')
    time: str = Field(..., description='Time in HH:MM format (24-hour, e.g., 14:30)')
    tag: Optional[str] = Field(None, description='Tag: Fasting, Meal, Bedtime, etc.')
    notes: Optional[str] = Field(None, description='Optional notes')
    status: str = Field(..., description='Status: High, Low, or Normal')
    created_at: datetime = Field(..., description='When the record was created in the system (ISO 8601 format: YYYY-MM-DDTHH:MM:SS.ffffffZ)')

class SugarRecordItemsByRange(BaseModel):
    Today: Optional[List[SugarRecordResponse]] = Field(default=[], description='Records from today')
    OneWeek: Optional[List[SugarRecordResponse]] = Field(default=[], description='Records from the last week')
    OneMonth: Optional[List[SugarRecordResponse]] = Field(default=[], description='Records from the last month')
    AllTime: Optional[List[SugarRecordResponse]] = Field(default=[], description='All records')

class SugarRecordListResponse(BaseModel):
    items: SugarRecordItemsByRange = Field(..., description='Sugar records organized by time range')
    count: int = Field(..., description='Number of records returned')
    total: Optional[int] = Field(None, description='Total number of records available')
    total_sugar_days: Optional[int] = Field(None, description='Total number of unique days with sugar records')
    average_sugar_level: Optional[float] = Field(None, description='Average blood sugar level across all records')
    graph_data: Optional['SugarGraphResponse'] = Field(None, description='Graph data for visualization')

class FastingRecordRequest(BaseModel):
    user_id: str = Field(..., description='User ID')
    date: str = Field(..., pattern='^\\d{4}-\\d{2}-\\d{2}$', description='Date in YYYY-MM-DD format (Year-Month-Day, e.g., 2025-01-17)')
    start_time: str = Field(..., pattern='^([0-1][0-9]|2[0-3]):[0-5][0-9]$', description='Start time in HH:MM format (24-hour)')
    end_time: str = Field(..., pattern='^([0-1][0-9]|2[0-3]):[0-5][0-9]$', description='End time in HH:MM format (24-hour)')
    duration_hours: str = Field(..., pattern='^\\d+:\\d{2}$', description="Duration in H:MM format (e.g., '16:30' for 16 hours 30 minutes)")
    timezone: Optional[str] = Field(default='UTC', description="Device timezone (e.g., 'America/New_York', 'Asia/Karachi', 'UTC'). Defaults to UTC if not provided.")
    notes: Optional[str] = Field(default=None, max_length=100, description='Optional notes (max 100 characters)')

    @field_validator('user_id')
    def validate_user_id(cls, v):
        if not v or not str(v).strip():
            raise ValueError('user_id cannot be empty or whitespace')
        return str(v).strip()

    @field_validator('date')
    def validate_date(cls, v):
        try:
            datetime.strptime(v, '%Y-%m-%d')
        except ValueError:
            raise ValueError('Date must be in YYYY-MM-DD format')
        return v

    @field_validator('notes')
    def validate_notes(cls, v):
        if v and len(v) > 100:
            raise ValueError('Notes cannot exceed 100 characters')
        return v

    @field_validator('duration_hours')
    def validate_duration_hours(cls, v):
        if v:
            try:
                parts = v.split(':')
                if len(parts) != 2:
                    raise ValueError("Duration must be in H:MM format (e.g., '16:30')")
                hours = int(parts[0])
                minutes = int(parts[1])
                if minutes < 0 or minutes >= 60:
                    raise ValueError('Minutes must be between 0 and 59')
                if hours < 1:
                    raise ValueError('Hours must be at least 1')
                if hours > 168:
                    raise ValueError('Hours cannot exceed 168 (7 days)')
            except ValueError as e:
                if 'invalid literal' in str(e):
                    raise ValueError("Duration must be in H:MM format with numeric values (e.g., '16:30')")
                raise
        return v
    model_config = {'json_schema_extra': {'examples': [{'user_id': '12345', 'date': '2025-01-17', 'start_time': '20:00', 'end_time': '12:30', 'duration_hours': '16:30', 'notes': '16:8 fasting schedule'}]}}

class FastingRecordResponse(BaseModel):
    id: str = Field(..., description='Record ID')
    user_id: str = Field(..., description='User ID')
    date: str = Field(..., description='Date in YYYY-MM-DD format (Year-Month-Day, e.g., 2025-01-17)')
    start_time: str = Field(..., description='Start time in HH:MM format (24-hour, e.g., 18:00)')
    end_time: str = Field(..., description='End time in HH:MM format (24-hour, e.g., 12:30)')
    duration_hours: str = Field(..., description="Fasting duration in H:MM format (e.g., '16:30' for 16 hours 30 minutes)")
    notes: Optional[str] = Field(None, description='Optional notes')
    status: str = Field(..., description='Status: In Progress or Completed')
    time_remaining: Optional[str] = Field(None, description="Time remaining until fasting ends (HH:MM:SS format, only for 'In Progress' records, null for 'Completed' records)")
    created_at: datetime = Field(..., description='When the record was created in the system (ISO 8601 format: YYYY-MM-DDTHH:MM:SS.ffffffZ)')

class FastingRecordItemsByRange(BaseModel):
    Today: Optional[List[FastingRecordResponse]] = Field(default=[], description='Records from today')
    OneWeek: Optional[List[FastingRecordResponse]] = Field(default=[], description='Records from the last week')
    OneMonth: Optional[List[FastingRecordResponse]] = Field(default=[], description='Records from the last month')
    AllTime: Optional[List[FastingRecordResponse]] = Field(default=[], description='All records')

class FastingRecordListResponse(BaseModel):
    items: FastingRecordItemsByRange = Field(..., description='Fasting records organized by time range')
    count: int = Field(..., description='Number of records returned')
    total: Optional[int] = Field(None, description='Total number of records available')
    total_fasting_days: Optional[int] = Field(None, description='Total number of unique days with fasting records')
    average_fasting_time: Optional[float] = Field(None, description='Average fasting duration in hours')
    graph_data: Optional['FastingGraphResponse'] = Field(None, description='Graph data for visualization')

class FastingTimeRangeData(BaseModel):
    labels: List[Union[str, int]] = Field(..., description='Labels for the graph (hours, days, weeks, or years)')
    data: List[Union[float, int]] = Field(..., description='Fasting hours corresponding to each label')

class FastingGraphResponse(BaseModel):
    Today: Optional['FastingTimeRangeData'] = Field(None, alias='Today', description="Today's graph data (hourly)")
    OneWeek: Optional['FastingTimeRangeData'] = Field(None, alias='OneWeek', description='1 week graph data (daily)')
    OneMonth: Optional['FastingTimeRangeData'] = Field(None, alias='OneMonth', description='1 month graph data (weekly)')
    AllTime: Optional['FastingTimeRangeData'] = Field(None, alias='AllTime', description='All time graph data (yearly)')
    model_config = {'populate_by_name': True, 'json_schema_extra': {'examples': [{'Today': {'labels': [9, 12, 15, 18, 21], 'data': [4, 6, 9, 3, 12]}, 'OneWeek': {'labels': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], 'data': [12, 14, 10, 16, 13, 15, 11]}, 'OneMonth': {'labels': ['W1', 'W2', 'W3', 'W4'], 'data': [60, 55, 48, 62]}, 'AllTime': {'labels': ['2021', '2022', '2023', '2024', '2025'], 'data': [700, 820, 950, 1100, 1350]}}]}}

class SugarGraphResponse(BaseModel):
    Today: Optional['FastingTimeRangeData'] = Field(None, alias='Today', description="Today's graph data (hourly)")
    OneWeek: Optional['FastingTimeRangeData'] = Field(None, alias='OneWeek', description='1 week graph data (daily)')
    OneMonth: Optional['FastingTimeRangeData'] = Field(None, alias='OneMonth', description='1 month graph data (weekly)')
    AllTime: Optional['FastingTimeRangeData'] = Field(None, alias='AllTime', description='All time graph data (yearly)')
    model_config = {'populate_by_name': True, 'json_schema_extra': {'examples': [{'Today': {'labels': [9, 12, 15, 18, 21], 'data': [120, 140, 100, 130, 110]}, 'OneWeek': {'labels': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], 'data': [120, 125, 118, 130, 122, 128, 115]}, 'OneMonth': {'labels': ['W1', 'W2', 'W3', 'W4'], 'data': [125, 120, 128, 122]}, 'AllTime': {'labels': ['2021', '2022', '2023', '2024', '2025'], 'data': [135, 130, 125, 120, 118]}}]}}

class HbA1CRecordRequest(BaseModel):
    user_id: str = Field(..., description='User ID')
    date: str = Field(..., pattern='^\\d{4}-\\d{2}-\\d{2}$', description='Test date in YYYY-MM-DD format')
    time: str = Field(..., pattern='^([0-1][0-9]|2[0-3]):[0-5][0-9]$', description='Test time in HH:MM format (24-hour)')
    value: float = Field(..., ge=0.0, le=20.0, description='HbA1C value in percentage (0-20%)')
    notes: Optional[str] = Field(default=None, max_length=100, description='Optional notes (max 100 characters)')

    @field_validator('user_id')
    def validate_user_id(cls, v):
        if not v or not str(v).strip():
            raise ValueError('user_id cannot be empty or whitespace')
        return str(v).strip()

    @field_validator('date')
    def validate_date(cls, v):
        try:
            datetime.strptime(v, '%Y-%m-%d')
        except ValueError:
            raise ValueError('Date must be in YYYY-MM-DD format')
        return v

    @field_validator('notes')
    def validate_notes(cls, v):
        if v and len(v) > 100:
            raise ValueError('Notes cannot exceed 100 characters')
        return v
    model_config = {'json_schema_extra': {'examples': [{'user_id': '12345', 'date': '2025-01-17', 'time': '04:48', 'value': 5.5, 'notes': 'from HCA Healthcare UK Laboratories'}]}}

class HbA1CRecordResponse(BaseModel):
    id: str = Field(..., description='Record ID')
    user_id: str = Field(..., description='User ID')
    date: str = Field(..., description='Test date in YYYY-MM-DD format')
    time: str = Field(..., description='Test time in HH:MM format')
    value: float = Field(..., description='HbA1C value in percentage')
    notes: Optional[str] = Field(None, description='Optional notes')
    status: str = Field(..., description='Status: Normal, Prediabetes, or Type 2')
    created_at: datetime = Field(..., description='When the record was created in the system (ISO 8601 format: YYYY-MM-DDTHH:MM:SS.ffffffZ)')

class HbA1CRecordListResponse(BaseModel):
    items: List[HbA1CRecordResponse] = Field(..., description='List of HbA1C records')
    count: int = Field(..., description='Number of records returned')
    total: Optional[int] = Field(None, description='Total number of records available')

class MealRecommendationRequest(BaseModel):
    user_id: str = Field(..., description='User ID')
    current_glucose: float = Field(..., ge=50, le=400, description='Current glucose level in mg/dL (50-400)')
    diabetes_control_level: str = Field(..., description="Diabetes control level: 'Well controlled', 'Moderately controlled', or 'Poorly controlled'")
    meal_description: Optional[str] = Field(default=None, min_length=5, max_length=500, description='Meal description (5-500 chars)')
    portion_size: Optional[str] = Field(default=None, description="Portion size: 'Light', 'Medium', or 'Large'")
    time: Optional[str] = Field(default=None, pattern='^([0-1][0-9]|2[0-3]):[0-5][0-9]$', description='Time in HH:MM format (24-hour, e.g., 14:30)')

    @field_validator('user_id')
    def validate_user_id(cls, v):
        if not v or not str(v).strip():
            raise ValueError('user_id cannot be empty or whitespace')
        return str(v).strip()

    @field_validator('current_glucose')
    def validate_current_glucose(cls, v):
        if isinstance(v, str):
            try:
                v = float(v)
            except ValueError:
                raise ValueError(f'current_glucose must be a number, received: {type(v).__name__}')
        if v < 50:
            raise ValueError(f'current_glucose must be at least 50 mg/dL. Received: {v}')
        if v > 400:
            raise ValueError(f'current_glucose must not exceed 400 mg/dL. Received: {v}')
        return float(v)

    @field_validator('diabetes_control_level')
    def validate_diabetes_control_level(cls, v):
        valid_levels = ['Well controlled', 'Moderately controlled', 'Poorly controlled']
        if v not in valid_levels:
            raise ValueError(f"diabetes_control_level must be one of: {', '.join(valid_levels)}. Received: {v}")
        return v

    @field_validator('portion_size')
    def validate_portion_size(cls, v):
        if v is None:
            return v
        valid_sizes = ['Light', 'Medium', 'Large']
        if v not in valid_sizes:
            raise ValueError(f"portion_size must be one of: {', '.join(valid_sizes)}. Received: {v}")
        return v
    model_config = {'json_schema_extra': {'examples': [{'user_id': '12345', 'current_glucose': 130, 'diabetes_control_level': 'Moderately controlled', 'meal_description': 'Grilled chicken with brown rice and steamed vegetables', 'portion_size': 'Medium', 'time': '12:30'}]}}

class MealNutritionFacts(BaseModel):
    proteins_g: float = Field(..., description='Proteins in grams')
    carbohydrates_g: float = Field(..., description='Carbohydrates in grams')
    fats_g: float = Field(..., description='Fats in grams')
    sugar_g: float = Field(..., description='Sugar in grams')
    fiber_g: float = Field(..., description='Fiber in grams')

class RecommendedMeal(BaseModel):
    name: str = Field(..., description='Meal name')
    description: str = Field(..., description='Meal description')
    glycemic_index: int = Field(..., ge=0, le=100, description='Glycemic index')
    image_url: str = Field(..., description='Image URL')
    nutrition_facts: MealNutritionFacts = Field(..., description='Nutrition facts')

class MealRecommendations(BaseModel):
    breakfast: List[RecommendedMeal] = Field(..., description='Breakfast recommendations')
    lunch: List[RecommendedMeal] = Field(..., description='Lunch recommendations')
    dinner: List[RecommendedMeal] = Field(..., description='Dinner recommendations')
    snacks: List[RecommendedMeal] = Field(..., description='Snack recommendations')

class MealRecommendationResponse(BaseModel):
    status: str = Field(..., description='Response status')
    recommendations: MealRecommendations = Field(..., description='Meal recommendations by meal type')

class ErrorResponse(BaseModel):
    status: str = Field(default='error', description='Response status')
    message: str = Field(..., description='Error message')
    error_code: str = Field(..., description='Error code')
    details: Optional[Dict[str, Any]] = Field(None, description='Additional error details')
    timestamp: datetime = Field(default_factory=datetime.now, description='Error timestamp (ISO 8601 format: YYYY-MM-DDTHH:MM:SS.ffffffZ)')
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description='Unique request identifier')
    model_config = {'json_schema_extra': {'examples': [{'status': 'error', 'message': 'Validation failed', 'error_code': 'VALIDATION_ERROR', 'details': {'validation_errors': []}, 'timestamp': '2025-01-05T08:30:00Z', 'request_id': 'a1b2c3'}]}}
from datetime import datetime, timedelta
from typing import Optional, Any
from sqlalchemy import Column, String, DateTime, Text, Integer, ForeignKey, JSON, UniqueConstraint, Index, func, Boolean, Float
from sqlalchemy.orm import relationship
from .database import Base, gen_uuid

class User(Base):
    __tablename__ = 'users'
    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, unique=True, nullable=True)
    password_hash = Column(String, nullable=False)
    is_email_verified = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    profile = relationship('UserProfile', back_populates='user', uselist=False)

class UserProfile(Base):
    __tablename__ = 'user_profiles'
    user_id = Column(String, ForeignKey('users.id'), primary_key=True)
    name = Column(String, nullable=True)
    dob = Column(String, nullable=True)
    height_cm = Column(Integer, nullable=True)
    weight_kg = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    age = Column(Integer, nullable=True)
    diabetes_type = Column(String, nullable=True)
    cholesterol_mg_dl = Column(Integer, nullable=True)
    using_insulin = Column(Boolean, default=False, nullable=False)
    hba1c = Column(Float, nullable=True)
    diet_type = Column(String, nullable=True)
    activity_level = Column(String, nullable=True)
    profile_image = Column(String, nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    user = relationship('User', back_populates='profile')

class Session(Base):
    __tablename__ = 'sessions'
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey('users.id'), index=True, nullable=False)
    refresh_token_hash = Column(String, nullable=False)
    user_agent = Column(String, nullable=True)
    ip = Column(String, nullable=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class EmailVerificationToken(Base):
    __tablename__ = 'email_verification_tokens'
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey('users.id'), index=True, nullable=False)
    token_hash = Column(String, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class PasswordResetToken(Base):
    __tablename__ = 'password_reset_tokens'
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey('users.id'), index=True, nullable=False)
    token_hash = Column(String, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    used_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class OTPCode(Base):
    __tablename__ = 'otp_codes'
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey('users.id'), index=True, nullable=False)
    purpose = Column(String, nullable=False)
    code_hash = Column(String, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    attempts = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class TokenBlacklist(Base):
    __tablename__ = 'token_blacklist'
    id = Column(String, primary_key=True, default=gen_uuid)
    token_hash = Column(String, nullable=False, unique=True, index=True)
    token_type = Column(String, nullable=False)
    user_id = Column(String, ForeignKey('users.id'), index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    revoked_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    __table_args__ = (Index('ix_token_blacklist_user_expires', 'user_id', 'expires_at'),)

class AuditLog(Base):
    __tablename__ = 'audit_logs'
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey('users.id'), index=True, nullable=True)
    action = Column(String, nullable=False)
    meta = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

class FoodAnalysisLog(Base):
    __tablename__ = 'food_analyses'
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey('users.id'), index=True, nullable=False)
    request_json = Column(JSON, nullable=False)
    response_json = Column(JSON, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    __table_args__ = (Index('ix_food_user_created', 'user_id', 'created_at'),)

class RiskForecastLog(Base):
    __tablename__ = 'risk_forecasts'
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey('users.id'), index=True, nullable=False)
    request_json = Column(JSON, nullable=False)
    response_json = Column(JSON, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    __table_args__ = (Index('ix_risk_user_created', 'user_id', 'created_at'),)

class SugarForecastLog(Base):
    __tablename__ = 'sugar_forecasts'
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey('users.id'), index=True, nullable=False)
    request_json = Column(JSON, nullable=False)
    response_json = Column(JSON, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    __table_args__ = (Index('ix_sugar_user_created', 'user_id', 'created_at'),)

class SugarRecord(Base):
    __tablename__ = 'sugar_records'
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey('users.id'), index=True, nullable=False)
    value = Column(Integer, nullable=False)
    unit = Column(String, nullable=False, default='mg/dL', server_default='mg/dL')
    tag = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String, nullable=False)
    recorded_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    __table_args__ = (Index('ix_sugar_record_user_created', 'user_id', 'recorded_at'),)

class MealRecommendationLog(Base):
    __tablename__ = 'meal_recommendations'
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey('users.id'), index=True, nullable=False)
    request_json = Column(JSON, nullable=False)
    response_json = Column(JSON, nullable=True)
    latency_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    __table_args__ = (Index('ix_meals_user_created', 'user_id', 'created_at'),)

class ChatbotMessage(Base):
    __tablename__ = 'chatbot_messages'
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey('users.id'), index=True, nullable=False)
    message = Column(Text, nullable=False)
    reply = Column(Text, nullable=True)
    meta = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    __table_args__ = (Index('ix_chatbot_user_created', 'user_id', 'created_at'),)

class CommunityBlog(Base):
    __tablename__ = 'community_blogs'
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey('users.id'), index=True, nullable=True)
    author_name = Column(String, nullable=True)
    image_url = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    featured = Column(Boolean, nullable=False, default=False, server_default='0')
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    __table_args__ = (Index('ix_blog_created', 'created_at'),)

class FastingRecord(Base):
    __tablename__ = 'fasting_records'
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey('users.id'), index=True, nullable=False)
    date = Column(String, nullable=False)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    duration_hours = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(String, nullable=False, default='In Progress')
    started_at = Column(DateTime(timezone=True), nullable=False)
    ended_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    __table_args__ = (Index('ix_fasting_user_created', 'user_id', 'started_at'),)

class HbA1CRecord(Base):
    __tablename__ = 'hba1c_records'
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey('users.id'), index=True, nullable=False)
    date = Column(String, nullable=False)
    time = Column(String, nullable=False)
    value = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    status = Column(String, nullable=False)
    test_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    __table_args__ = (Index('ix_hba1c_user_created', 'user_id', 'test_at'),)

class Notification(Base):
    __tablename__ = 'notifications'
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey('users.id'), index=True, nullable=True)
    type = Column(String, nullable=False)
    category = Column(String, nullable=True)
    title = Column(String, nullable=False)
    detail = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False, server_default='0')
    reminder_time = Column(DateTime(timezone=True), nullable=True)
    meta = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    __table_args__ = (Index('ix_notification_user_created', 'user_id', 'created_at'), Index('ix_notification_type', 'type'))

class Device(Base):
    __tablename__ = 'devices'
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey('users.id'), index=True, nullable=False)
    fcm_token = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    __table_args__ = (Index('ix_device_user', 'user_id'),)
import uuid
from datetime import datetime, timedelta
from sqlalchemy import Column, String, Integer, Float, DateTime, Text, ForeignKey, JSON
from app.core.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    cognito_user_id = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=True)
    email = Column(String, nullable=False)
    preferred_language = Column(String, default="hi")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class TranslationJob(Base):
    __tablename__ = "translation_jobs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    cognito_user_id = Column(String, nullable=True, index=True)
    guest_session_id = Column(String, nullable=True, index=True)

    source_language = Column(String, default="auto")
    target_language = Column(String, nullable=False)
    document_type = Column(String, nullable=True)

    status = Column(String, nullable=False, default="CREATED", index=True)

    upload_key = Column(String, nullable=False)
    result_key = Column(String, nullable=True)
    report_key = Column(String, nullable=True)

    ocr_confidence = Column(Float, nullable=True)
    warning_count = Column(Integer, default=0)
    error_code = Column(String, nullable=True)

    processing_ms = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(days=7), index=True)
    deleted_at = Column(DateTime, nullable=True)

class UserPreference(Base):
    __tablename__ = "user_preferences"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    cognito_user_id = Column(String, unique=True, nullable=False, index=True)
    default_target_language = Column(String, default="hi")
    output_complexity = Column(String, default="standard")
    retention_preference = Column(Integer, default=7)
    reduced_motion = Column(String, default="false")
    high_contrast = Column(String, default="false")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class JobEvent(Base):
    __tablename__ = "job_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String, nullable=False, index=True)
    event_type = Column(String, nullable=False)
    previous_status = Column(String, nullable=True)
    new_status = Column(String, nullable=False)
    safe_error_code = Column(String, nullable=True)
    duration_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    job_id = Column(String, nullable=False, index=True)
    cognito_user_id = Column(String, nullable=True)
    rating = Column(Integer, nullable=False)
    helpful = Column(String, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_id
from app.models.db_models import Profile, UserPreference
from app.schemas.job_schemas import UserPreferenceSchema
from app.core.config import settings

router = APIRouter(prefix="/v1")

@router.get("/me")
def get_user_profile(
    db: Session = Depends(get_db),
    user_id: Optional[str] = Depends(get_current_user_id)
):
    if not user_id:
        return {
            "is_guest": True,
            "guest_session_id": "guest-session-active",
            "creator": settings.CREATOR_NAME
        }

    profile = db.query(Profile).filter(Profile.cognito_user_id == user_id).first()
    if not profile:
        profile = Profile(
            cognito_user_id=user_id,
            email=f"{user_id}@example.com",
            name="Medical App User",
            preferred_language="hi"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return {
        "id": profile.id,
        "cognito_user_id": profile.cognito_user_id,
        "name": profile.name,
        "email": profile.email,
        "preferred_language": profile.preferred_language,
        "created_at": profile.created_at.isoformat()
    }

@router.patch("/me/preferences", response_model=UserPreferenceSchema)
def update_user_preferences(
    payload: UserPreferenceSchema,
    db: Session = Depends(get_db),
    user_id: Optional[str] = Depends(get_current_user_id)
):
    if not user_id:
        return payload

    pref = db.query(UserPreference).filter(UserPreference.cognito_user_id == user_id).first()
    if not pref:
        pref = UserPreference(cognito_user_id=user_id)
        db.add(pref)

    pref.default_target_language = payload.default_target_language
    pref.output_complexity = payload.output_complexity
    pref.retention_preference = payload.retention_preference
    pref.reduced_motion = payload.reduced_motion
    pref.high_contrast = payload.high_contrast

    db.commit()
    return payload

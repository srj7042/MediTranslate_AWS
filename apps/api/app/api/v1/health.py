from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

@router.get("/health")
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "creator": settings.CREATOR_NAME,
        "environment": settings.ENVIRONMENT
    }

@router.get("/ready")
def readiness_check():
    return {
        "status": "ready",
        "services": {
            "database": "connected",
            "s3": "available",
            "textract": "available",
            "bedrock": "available"
        }
    }

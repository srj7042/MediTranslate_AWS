import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mangum import Mangum

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.health import router as health_router
from app.api.v1.jobs import router as jobs_router
from app.api.v1.user import router as user_router

# Setup logging
logging.basicConfig(level=settings.LOG_LEVEL)
logger = logging.getLogger("meditranslate")

# Initialize database tables for local/serverless startup
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
except Exception as e:
    logger.warning(f"Database initialization warning: {str(e)}")

app = FastAPI(
    title=settings.APP_NAME,
    description=f"AWS-Native Medical Document Translation API — Created by {settings.CREATOR_NAME}",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health_router)
app.include_router(jobs_router)
app.include_router(user_router)

# AWS Lambda Handler via Mangum
handler = Mangum(app)

import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "MediTranslate"
    CREATOR_NAME: str = "Suraj Jaiswal"
    ENVIRONMENT: str = "dev"
    LOG_LEVEL: str = "INFO"

    # Supabase PostgreSQL
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./meditranslate_dev.db")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    # AWS Settings
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    S3_UPLOAD_BUCKET: str = os.getenv("S3_UPLOAD_BUCKET", "meditranslate-dev-uploads")
    S3_RESULT_BUCKET: str = os.getenv("S3_RESULT_BUCKET", "meditranslate-dev-results")
    STEP_FUNCTION_ARN: str = os.getenv("STEP_FUNCTION_ARN", "")

    # Cognito Auth
    COGNITO_USER_POOL_ID: str = os.getenv("COGNITO_USER_POOL_ID", "")
    COGNITO_CLIENT_ID: str = os.getenv("COGNITO_CLIENT_ID", "")
    COGNITO_ISSUER: str = os.getenv("COGNITO_ISSUER", "")

    # Amazon Bedrock
    BEDROCK_MODEL_ID: str = os.getenv("BEDROCK_MODEL_ID", "anthropic.claude-3-sonnet-20240229-v1:0")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

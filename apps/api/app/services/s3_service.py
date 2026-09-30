import logging
import boto3
from botocore.exceptions import ClientError
from app.core.config import settings

logger = logging.getLogger("meditranslate.s3")

def get_s3_client():
    return boto3.client("s3", region_name=settings.AWS_REGION)

def generate_presigned_upload_url(object_key: str, content_type: str = "application/pdf", expires_in: int = 900) -> str:
    """
    Generate presigned PUT URL for direct browser upload to private S3 bucket.
    """
    try:
        s3_client = get_s3_client()
        url = s3_client.generate_presigned_url(
            "put_object",
            Params={
                "Bucket": settings.S3_UPLOAD_BUCKET,
                "Key": object_key,
                "ContentType": content_type
            },
            ExpiresIn=expires_in
        )
        return url
    except Exception as e:
        logger.warning(f"Could not generate presigned URL via AWS SDK: {str(e)}. Using fallback presigned URL format for local dev.")
        return f"https://{settings.S3_UPLOAD_BUCKET}.s3.{settings.AWS_REGION}.amazonaws.com/{object_key}?presigned=true"

def generate_presigned_download_url(bucket_name: str, object_key: str, expires_in: int = 900) -> str:
    """
    Generate presigned GET URL for temporary private S3 download.
    """
    try:
        s3_client = get_s3_client()
        url = s3_client.generate_presigned_url(
            "get_object",
            Params={
                "Bucket": bucket_name,
                "Key": object_key
            },
            ExpiresIn=expires_in
        )
        return url
    except Exception as e:
        logger.warning(f"Fallback download presigned URL: {str(e)}")
        return f"https://{bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/{object_key}?download=true"

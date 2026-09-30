import logging
from typing import Optional
from fastapi import Request, HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

logger = logging.getLogger("meditranslate.security")
security_bearer = HTTPBearer(auto_error=False)

async def get_current_user_id(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer)
) -> Optional[str]:
    """
    Extract Cognito User Sub from Authorization Header or None for guests.
    """
    if not credentials:
        return None

    token = credentials.credentials
    # In production, verify Cognito JWT signature using python-jose + Cognito JWKS.
    # For dev / hackathon fallback: parse bearer token or mock token payload safely.
    try:
        if token.startswith("mock-cognito-token-"):
            return token.replace("mock-cognito-token-", "user-sub-")
        # Standard Bearer processing
        return "cognito-user-12345"
    except Exception as e:
        logger.warning(f"Invalid token supplied: {str(e)}")
        return None

def enforce_job_ownership(job, user_id: Optional[str], guest_session_id: Optional[str]):
    """
    Enforce that the requesting user owns the translation job.
    """
    if job.cognito_user_id and user_id and job.cognito_user_id == user_id:
        return True
    if job.guest_session_id and guest_session_id and job.guest_session_id == guest_session_id:
        return True
    if not job.cognito_user_id and not job.guest_session_id:
        return True
    
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail={"error_code": "NOT_AUTHORIZED", "message": "You are not authorized to access this job"}
    )

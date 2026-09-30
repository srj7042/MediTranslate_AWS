import uuid
import json
from datetime import datetime, timedelta
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Response, status, Header
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user_id, enforce_job_ownership
from app.models.db_models import TranslationJob, JobEvent
from app.schemas.job_schemas import CreateJobRequest, UploadUrlResponse, JobResponse, TranslationResultSchema
from app.services.s3_service import generate_presigned_upload_url, generate_presigned_download_url
from app.services.textract_service import extract_text_from_document
from app.services.bedrock_service import translate_and_explain_with_bedrock
from app.services.pdf_service import generate_translation_pdf
from app.core.config import settings

router = APIRouter(prefix="/v1")

# In-memory result cache for dev/hackathon workflow speed
_job_results_cache = {}

@router.post("/jobs", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_translation_job(
    payload: CreateJobRequest,
    db: Session = Depends(get_db),
    user_id: Optional[str] = Depends(get_current_user_id)
):
    job_id = str(uuid.uuid4())
    upload_key = f"uploads/{user_id or payload.guest_session_id or 'guest'}/{job_id}/document.pdf"
    
    job = TranslationJob(
        id=job_id,
        cognito_user_id=user_id,
        guest_session_id=payload.guest_session_id or f"guest-{job_id[:8]}",
        source_language=payload.source_language or "auto",
        target_language=payload.target_language,
        status="CREATED",
        upload_key=upload_key,
        created_at=datetime.utcnow(),
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    
    db.add(job)
    
    event = JobEvent(
        job_id=job_id,
        event_type="JOB_CREATED",
        previous_status=None,
        new_status="CREATED"
    )
    db.add(event)
    db.commit()
    db.refresh(job)

    return JobResponse(
        id=job.id,
        status=job.status,
        source_language=job.source_language,
        target_language=job.target_language,
        warning_count=0,
        created_at=job.created_at.isoformat(),
        expires_at=job.expires_at.isoformat()
    )

@router.post("/jobs/{job_id}/upload-url", response_model=UploadUrlResponse)
def get_upload_url(
    job_id: str,
    content_type: str = "application/pdf",
    db: Session = Depends(get_db),
    user_id: Optional[str] = Depends(get_current_user_id),
    x_guest_session_id: Optional[str] = Header(None)
):
    job = db.query(TranslationJob).filter(TranslationJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail={"error_code": "JOB_NOT_FOUND", "message": "Job not found"})
    
    enforce_job_ownership(job, user_id, x_guest_session_id)
    
    upload_url = generate_presigned_upload_url(job.upload_key, content_type=content_type)
    job.status = "UPLOADING"
    db.commit()

    return UploadUrlResponse(
        job_id=job.id,
        upload_url=upload_url,
        upload_key=job.upload_key,
        expires_in=900
    )

@router.post("/jobs/{job_id}/start")
def start_job_processing(
    job_id: str,
    db: Session = Depends(get_db),
    user_id: Optional[str] = Depends(get_current_user_id),
    x_guest_session_id: Optional[str] = Header(None)
):
    job = db.query(TranslationJob).filter(TranslationJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail={"error_code": "JOB_NOT_FOUND", "message": "Job not found"})

    enforce_job_ownership(job, user_id, x_guest_session_id)

    # Transition states: UPLOADED -> OCR_PROCESSING -> AI_PROCESSING -> VALIDATING -> COMPLETED
    job.status = "OCR_PROCESSING"
    db.commit()

    # Step 1: Textract OCR Extraction
    ocr_res = extract_text_from_document(settings.S3_UPLOAD_BUCKET, job.upload_key)
    job.ocr_confidence = ocr_res["confidence"]
    job.status = "AI_PROCESSING"
    db.commit()

    # Step 2: Bedrock Translation & Explanation + Deterministic Clinical Invariant Validation
    ai_res = translate_and_explain_with_bedrock(
        ocr_text=ocr_res["text"],
        target_language=job.target_language,
        ocr_confidence=ocr_res["confidence"],
        lines_with_details=ocr_res.get("lines_with_details", [])
    )
    ai_res["ocr_confidence"] = ocr_res["confidence"]
    job.document_type = ai_res.get("document_type", "prescription")
    job.warning_count = len(ai_res.get("critical_warnings", []))
    
    # Cache result
    result_key = f"results/{job.id}/result.json"
    job.result_key = result_key
    _job_results_cache[job.id] = ai_res

    # Finalize status
    job.status = "COMPLETED"
    job.updated_at = datetime.utcnow()
    db.commit()

    return {"status": "COMPLETED", "job_id": job.id}

@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_job_status(
    job_id: str,
    db: Session = Depends(get_db),
    user_id: Optional[str] = Depends(get_current_user_id),
    x_guest_session_id: Optional[str] = Header(None)
):
    job = db.query(TranslationJob).filter(TranslationJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail={"error_code": "JOB_NOT_FOUND", "message": "Job not found"})

    enforce_job_ownership(job, user_id, x_guest_session_id)

    report_url = None
    safety_status = "PASS"
    if job.id in _job_results_cache:
        safety_status = _job_results_cache[job.id].get("overall_safety_status", "PASS")

    if job.result_key:
        report_url = f"/v1/jobs/{job.id}/export-pdf"

    return JobResponse(
        id=job.id,
        status=job.status,
        source_language=job.source_language,
        target_language=job.target_language,
        document_type=job.document_type,
        ocr_confidence=job.ocr_confidence,
        warning_count=job.warning_count,
        overall_safety_status=safety_status,
        error_code=job.error_code,
        created_at=job.created_at.isoformat(),
        expires_at=job.expires_at.isoformat(),
        report_url=report_url
    )

@router.get("/jobs/{job_id}/result", response_model=TranslationResultSchema)
def get_job_result(
    job_id: str,
    db: Session = Depends(get_db),
    user_id: Optional[str] = Depends(get_current_user_id),
    x_guest_session_id: Optional[str] = Header(None)
):
    job = db.query(TranslationJob).filter(TranslationJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail={"error_code": "JOB_NOT_FOUND", "message": "Job not found"})

    enforce_job_ownership(job, user_id, x_guest_session_id)

    if job.id in _job_results_cache:
        return _job_results_cache[job.id]

    # Generate fallback structured result if polled directly
    ocr_res = extract_text_from_document(settings.S3_UPLOAD_BUCKET, job.upload_key)
    ai_res = translate_and_explain_with_bedrock(
        ocr_text=ocr_res["text"],
        target_language=job.target_language,
        ocr_confidence=ocr_res["confidence"],
        lines_with_details=ocr_res.get("lines_with_details", [])
    )
    _job_results_cache[job.id] = ai_res
    return ai_res

@router.get("/jobs/{job_id}/export-pdf")
def export_job_pdf(
    job_id: str,
    db: Session = Depends(get_db),
    user_id: Optional[str] = Depends(get_current_user_id),
    x_guest_session_id: Optional[str] = Header(None)
):
    job = db.query(TranslationJob).filter(TranslationJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail={"error_code": "JOB_NOT_FOUND", "message": "Job not found"})

    enforce_job_ownership(job, user_id, x_guest_session_id)

    result_data = _job_results_cache.get(job.id)
    if not result_data:
        ocr_res = extract_text_from_document(settings.S3_UPLOAD_BUCKET, job.upload_key)
        result_data = translate_and_explain_with_bedrock(ocr_res["text"], target_language=job.target_language)

    pdf_bytes = generate_translation_pdf(result_data)
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=MediTranslate_Report_{job_id[:8]}.pdf"}
    )

@router.delete("/jobs/{job_id}")
def delete_job(
    job_id: str,
    db: Session = Depends(get_db),
    user_id: Optional[str] = Depends(get_current_user_id),
    x_guest_session_id: Optional[str] = Header(None)
):
    job = db.query(TranslationJob).filter(TranslationJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail={"error_code": "JOB_NOT_FOUND", "message": "Job not found"})

    enforce_job_ownership(job, user_id, x_guest_session_id)

    job.status = "DELETED"
    job.deleted_at = datetime.utcnow()
    db.commit()

    if job.id in _job_results_cache:
        del _job_results_cache[job.id]

    return {"status": "DELETED", "job_id": job.id}

@router.get("/history", response_model=List[JobResponse])
def get_job_history(
    db: Session = Depends(get_db),
    user_id: Optional[str] = Depends(get_current_user_id),
    x_guest_session_id: Optional[str] = Header(None)
):
    query = db.query(TranslationJob).filter(TranslationJob.status != "DELETED")
    if user_id:
        query = query.filter(TranslationJob.cognito_user_id == user_id)
    elif x_guest_session_id:
        query = query.filter(TranslationJob.guest_session_id == x_guest_session_id)
    else:
        return []

    jobs = query.order_by(TranslationJob.created_at.desc()).all()
    return [
        JobResponse(
            id=j.id,
            status=j.status,
            source_language=j.source_language,
            target_language=j.target_language,
            document_type=j.document_type,
            ocr_confidence=j.ocr_confidence,
            warning_count=j.warning_count,
            created_at=j.created_at.isoformat(),
            expires_at=j.expires_at.isoformat()
        )
        for j in jobs
    ]

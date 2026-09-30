from pydantic import BaseModel, Field
from typing import List, Optional

class CreateJobRequest(BaseModel):
    source_language: Optional[str] = "auto"
    target_language: str
    explanation_complexity: Optional[str] = "standard"
    guest_session_id: Optional[str] = None

class UploadUrlResponse(BaseModel):
    job_id: str
    upload_url: str
    upload_key: str
    expires_in: int

class EvidenceLinkSchema(BaseModel):
    text: str
    line_number: int
    confidence: float

class MedicationSchema(BaseModel):
    name: str
    dosage: str
    frequency: str
    duration: Optional[str] = None
    instructions: Optional[str] = None
    is_blocked: bool = False
    block_reason: Optional[str] = None
    evidence: Optional[EvidenceLinkSchema] = None

class TestResultSchema(BaseModel):
    name: str
    value: str
    unit: Optional[str] = None
    printed_reference_range: Optional[str] = None
    status: Optional[str] = None
    is_blocked: bool = False
    block_reason: Optional[str] = None
    evidence: Optional[EvidenceLinkSchema] = None

class CriticalWarningSchema(BaseModel):
    field: str
    extracted_value: str
    translated_value: str
    issue: str
    severity: str = "BLOCK"  # BLOCK or WARNING
    blocked_item_type: Optional[str] = None
    blocked_item_name: Optional[str] = None

class TranslationResultSchema(BaseModel):
    document_type: str = "prescription"
    source_language: str
    target_language: str
    original_text: str
    translated_text: str
    summary: str
    medications: List[MedicationSchema] = []
    tests_and_results: List[TestResultSchema] = []
    important_instructions: List[str] = []
    follow_up: List[str] = []
    uncertain_items: List[str] = []
    safety_notes: List[str] = []
    critical_warnings: List[CriticalWarningSchema] = []
    ocr_confidence: float = 98.5
    overall_safety_status: str = "PASS"  # PASS, WARNING, BLOCKED
    ocr_confidence_status: str = "HIGH"  # HIGH, LOW_NEEDS_VERIFICATION
    requires_user_verification: bool = False
    evidence_sources: List[EvidenceLinkSchema] = []

class JobResponse(BaseModel):
    id: str
    status: str
    source_language: str
    target_language: str
    document_type: Optional[str] = None
    ocr_confidence: Optional[float] = None
    warning_count: int = 0
    overall_safety_status: Optional[str] = "PASS"
    error_code: Optional[str] = None
    created_at: str
    expires_at: str
    report_url: Optional[str] = None

class UserPreferenceSchema(BaseModel):
    default_target_language: str = "hi"
    output_complexity: str = "standard"
    retention_preference: int = 7
    reduced_motion: str = "false"
    high_contrast: str = "false"


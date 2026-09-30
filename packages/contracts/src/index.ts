export enum JobStatus {
  CREATED = "CREATED",
  UPLOADING = "UPLOADING",
  UPLOADED = "UPLOADED",
  QUEUED = "QUEUED",
  OCR_PROCESSING = "OCR_PROCESSING",
  AI_PROCESSING = "AI_PROCESSING",
  VALIDATING = "VALIDATING",
  REPORT_GENERATION = "REPORT_GENERATION",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  DELETING = "DELETING",
  DELETED = "DELETED"
}

export enum ErrorCode {
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  UNSUPPORTED_FILE_TYPE = "UNSUPPORTED_FILE_TYPE",
  UPLOAD_EXPIRED = "UPLOAD_EXPIRED",
  OCR_FAILED = "OCR_FAILED",
  OCR_LOW_CONFIDENCE = "OCR_LOW_CONFIDENCE",
  AI_TEMPORARILY_UNAVAILABLE = "AI_TEMPORARILY_UNAVAILABLE",
  AI_OUTPUT_INVALID = "AI_OUTPUT_INVALID",
  CRITICAL_VALUE_MISMATCH = "CRITICAL_VALUE_MISMATCH",
  REPORT_FAILED = "REPORT_FAILED",
  JOB_NOT_FOUND = "JOB_NOT_FOUND",
  NOT_AUTHORIZED = "NOT_AUTHORIZED",
  RATE_LIMITED = "RATE_LIMITED"
}

export enum SafetyStatus {
  PASS = "PASS",
  WARNING = "WARNING",
  BLOCKED = "BLOCKED"
}

export interface EvidenceLink {
  text: string;
  lineNumber: number;
  confidence: number;
}

export interface TranslationJob {
  id: string;
  cognitoUserId?: string | null;
  guestSessionId?: string | null;
  sourceLanguage: string;
  targetLanguage: string;
  documentType?: string | null;
  status: JobStatus;
  uploadKey: string;
  resultKey?: string | null;
  reportKey?: string | null;
  ocrConfidence?: number | null;
  warningCount: number;
  overallSafetyStatus?: SafetyStatus;
  errorCode?: ErrorCode | null;
  processingMs?: number | null;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  deletedAt?: string | null;
}

export interface MedicationItem {
  name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
  isBlocked?: boolean;
  blockReason?: string;
  evidence?: EvidenceLink;
}

export interface TestResultItem {
  name: string;
  value: string;
  unit?: string;
  printedReferenceRange?: string;
  status?: string;
  isBlocked?: boolean;
  blockReason?: string;
  evidence?: EvidenceLink;
}

export interface CriticalValueWarning {
  field: string;
  extractedValue: string;
  translatedValue: string;
  issue: string;
  severity?: "BLOCK" | "WARNING";
  blockedItemType?: string;
  blockedItemName?: string;
}

export interface TranslationResult {
  documentType: string;
  sourceLanguage: string;
  targetLanguage: string;
  originalText: string;
  translatedText: string;
  summary: string;
  medications: MedicationItem[];
  testsAndResults: TestResultItem[];
  importantInstructions: string[];
  followUp: string[];
  uncertainItems: string[];
  safetyNotes: string[];
  criticalWarnings: CriticalValueWarning[];
  ocrConfidence: number;
  overallSafetyStatus: SafetyStatus;
  ocrConfidenceStatus: "HIGH" | "LOW_NEEDS_VERIFICATION";
  requiresUserVerification: boolean;
  evidenceSources: EvidenceLink[];
}


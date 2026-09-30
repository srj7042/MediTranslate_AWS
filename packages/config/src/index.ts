export const APP_CONFIG = {
  appName: "MediTranslate",
  tagline: "Understand medical documents in your language",
  creator: "Suraj Jaiswal",
  hackathon: "AWS Zero to Shipped 2026",
  category: "Social Good — Health",
  lane: "Community",
  defaultRetentionDays: 7,
  maxUploadSizeBytes: 10 * 1024 * 1024, // 10MB
  supportedFileTypes: ["application/pdf", "image/png", "image/jpeg", "image/jpg"],
  supportedLanguages: [
    { code: "hi", name: "Hindi (हिंदी)" },
    { code: "es", name: "Spanish (Español)" },
    { code: "fr", name: "French (Français)" },
    { code: "ar", name: "Arabic (العربية)" },
    { code: "zh", name: "Chinese (中文)" },
    { code: "pt", name: "Portuguese (Português)" },
    { code: "ru", name: "Russian (Русский)" },
    { code: "de", name: "German (Deutsch)" },
    { code: "ja", name: "Japanese (日本語)" },
    { code: "bn", name: "Bengali (বাংলা)" },
    { code: "ta", name: "Tamil (தமிழ்)" },
    { code: "te", name: "Telugu (తెలుగు)" }
  ],
  explanationLevels: [
    { code: "simple", label: "Simple (Easy to read, grade 6 level)" },
    { code: "standard", label: "Standard (Clear medical explanation)" }
  ],
  safetyDisclaimer: "MediTranslate is an informational accessibility tool that helps translate and explain medical documents. It does not provide medical diagnoses, treatment recommendations, or replace advice from a qualified healthcare professional. Always verify critical medication dosages with the original document and a licensed clinician."
};

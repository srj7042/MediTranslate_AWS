import re
import logging

class PHISanitizingFormatter(logging.Formatter):
    """
    Logging formatter that sanitizes potential PHI/PII (names, emails, SSNs, phone numbers)
    from log outputs.
    """
    def format(self, record: logging.LogRecord) -> str:
        original = super().format(record)
        # Mask emails
        sanitized = re.sub(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', '[REDACTED_EMAIL]', original)
        # Mask phone numbers
        sanitized = re.sub(r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b', '[REDACTED_PHONE]', sanitized)
        # Mask SSNs / National IDs
        sanitized = re.sub(r'\b\d{3}-\d{2}-\d{4}\b', '[REDACTED_ID]', sanitized)
        return sanitized

def setup_sanitized_logging(log_level: str = "INFO"):
    handler = logging.StreamHandler()
    formatter = PHISanitizingFormatter('%(asctime)s [%(levelname)s] %(name)s: %(message)s')
    handler.setFormatter(formatter)
    
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    root_logger.addHandler(handler)

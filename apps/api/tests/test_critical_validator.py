import pytest
from app.services.critical_validator import validate_critical_medical_values

def test_dosage_number_mismatch_500mg_to_50mg():
    """
    REQUIRED CASE 1: 500mg -> 50mg must fail and set safety status to BLOCKED.
    """
    ocr_text = "Rx: Amoxicillin 500 mg twice daily after meals"
    lines_with_details = [
        {"line_number": 1, "text": "Rx: Amoxicillin 500 mg twice daily after meals", "confidence": 98.0}
    ]
    bad_meds = [
        {
            "name": "Amoxicillin",
            "dosage": "50 mg",
            "frequency": "twice daily",
            "instructions": "Take after meals"
        }
    ]
    
    res = validate_critical_medical_values(
        ocr_text=ocr_text,
        ai_medications=bad_meds,
        lines_with_details=lines_with_details
    )
    
    assert res["overall_safety_status"] == "BLOCKED"
    assert len(res["warnings"]) > 0
    assert bad_meds[0]["is_blocked"] is True
    assert "INSTRUCTION BLOCKED" in bad_meds[0]["instructions"]


def test_unit_alteration_mg_to_mcg():
    """
    REQUIRED CASE 2: mg -> mcg must fail and set safety status to BLOCKED.
    """
    ocr_text = "Rx: Levothyroxine 50 mg daily"
    lines_with_details = [
        {"line_number": 1, "text": "Rx: Levothyroxine 50 mg daily", "confidence": 99.0}
    ]
    bad_meds = [
        {
            "name": "Levothyroxine",
            "dosage": "50 mcg",
            "frequency": "daily"
        }
    ]
    
    res = validate_critical_medical_values(
        ocr_text=ocr_text,
        ai_medications=bad_meds,
        lines_with_details=lines_with_details
    )
    
    assert res["overall_safety_status"] == "BLOCKED"
    assert bad_meds[0]["is_blocked"] is True


def test_unit_substitution_5ml_to_5mg():
    """
    REQUIRED CASE 3: 5mL -> 5mg must fail and set safety status to BLOCKED.
    """
    ocr_text = "Rx: Cough Syrup 5 mL twice daily"
    lines_with_details = [
        {"line_number": 1, "text": "Rx: Cough Syrup 5 mL twice daily", "confidence": 97.0}
    ]
    bad_meds = [
        {
            "name": "Cough Syrup",
            "dosage": "5 mg",
            "frequency": "twice daily"
        }
    ]
    
    res = validate_critical_medical_values(
        ocr_text=ocr_text,
        ai_medications=bad_meds,
        lines_with_details=lines_with_details
    )
    
    assert res["overall_safety_status"] == "BLOCKED"
    assert bad_meds[0]["is_blocked"] is True


def test_frequency_mismatch_bid_to_once_daily():
    """
    REQUIRED CASE 4: BID -> once daily must fail and set safety status to BLOCKED.
    """
    ocr_text = "Rx: Metformin 500 mg BID"
    lines_with_details = [
        {"line_number": 1, "text": "Rx: Metformin 500 mg BID", "confidence": 96.0}
    ]
    bad_meds = [
        {
            "name": "Metformin",
            "dosage": "500 mg",
            "frequency": "once daily"
        }
    ]
    
    res = validate_critical_medical_values(
        ocr_text=ocr_text,
        ai_medications=bad_meds,
        lines_with_details=lines_with_details
    )
    
    assert res["overall_safety_status"] == "BLOCKED"
    assert bad_meds[0]["is_blocked"] is True


def test_lab_unit_change_percent_to_mg_dl():
    """
    REQUIRED CASE 5: 7.8% -> 7.8mg/dL must fail and set safety status to BLOCKED.
    """
    ocr_text = "HbA1c Test: 7.8 % (Ref: 4.0 - 5.6 %)"
    lines_with_details = [
        {"line_number": 1, "text": "HbA1c Test: 7.8 % (Ref: 4.0 - 5.6 %)", "confidence": 98.0}
    ]
    bad_tests = [
        {
            "name": "HbA1c Test",
            "value": "7.8",
            "unit": "mg/dL",
            "printed_reference_range": "4.0 - 5.6 %"
        }
    ]
    
    res = validate_critical_medical_values(
        ocr_text=ocr_text,
        ai_medications=[],
        ai_tests=bad_tests,
        lines_with_details=lines_with_details
    )
    
    assert res["overall_safety_status"] == "BLOCKED"
    assert bad_tests[0]["is_blocked"] is True


def test_correct_matching_dosage_passes():
    """
    Verify that correct matching dosages pass with PASS status.
    """
    ocr_text = "Rx: Amoxicillin 500 mg twice daily"
    lines_with_details = [
        {"line_number": 1, "text": "Rx: Amoxicillin 500 mg twice daily", "confidence": 98.0}
    ]
    good_meds = [
        {
            "name": "Amoxicillin",
            "dosage": "500 mg",
            "frequency": "twice daily"
        }
    ]
    
    res = validate_critical_medical_values(
        ocr_text=ocr_text,
        ai_medications=good_meds,
        lines_with_details=lines_with_details
    )
    
    assert res["overall_safety_status"] == "PASS"
    assert len(res["warnings"]) == 0
    assert good_meds[0]["is_blocked"] is False
    assert good_meds[0]["evidence"]["line_number"] == 1


def test_low_ocr_confidence_triggers_warning():
    """
    Verify that OCR confidence below 80.0% sets safety status to WARNING and requires user verification.
    """
    ocr_text = "Rx: Amoxicillin 500 mg twice daily"
    lines_with_details = [
        {"line_number": 1, "text": "Rx: Amoxicillin 500 mg twice daily", "confidence": 65.0}
    ]
    good_meds = [
        {
            "name": "Amoxicillin",
            "dosage": "500 mg",
            "frequency": "twice daily"
        }
    ]
    
    res = validate_critical_medical_values(
        ocr_text=ocr_text,
        ai_medications=good_meds,
        ocr_confidence=65.0,
        lines_with_details=lines_with_details
    )
    
    assert res["overall_safety_status"] == "WARNING"
    assert res["requires_user_verification"] is True
    assert res["ocr_confidence_status"] == "LOW_NEEDS_VERIFICATION"

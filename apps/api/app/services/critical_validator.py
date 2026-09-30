import re
from typing import List, Dict, Any, Optional

UNIT_ALIASES = {
    "mg": "mg",
    "g": "g",
    "gram": "g",
    "grams": "g",
    "mcg": "mcg",
    "ug": "mcg",
    "microgram": "mcg",
    "micrograms": "mcg",
    "ml": "ml",
    "milliliter": "ml",
    "milliliters": "ml",
    "l": "l",
    "liter": "l",
    "liters": "l",
    "%": "%",
    "percent": "%",
    "mg/dl": "mg/dl",
    "g/dl": "g/dl",
    "mmol/l": "mmol/l",
    "u/l": "u/l",
    "iu/l": "iu/l",
    "capsule": "capsule",
    "capsules": "capsule",
    "tablet": "tablet",
    "tablets": "tablet",
    "pill": "tablet",
    "pills": "tablet"
}

FREQ_TOKENS = {
    "once daily": "once daily",
    "once a day": "once daily",
    "qd": "once daily",
    "twice daily": "twice daily",
    "twice a day": "twice daily",
    "bid": "twice daily",
    "thrice daily": "thrice daily",
    "thrice a day": "thrice daily",
    "three times daily": "thrice daily",
    "tid": "thrice daily",
    "four times daily": "four times daily",
    "qid": "four times daily",
    "every 12 hours": "twice daily",
    "every 8 hours": "thrice daily",
    "as needed": "as needed",
    "prn": "as needed"
}

def normalize_unit(unit_str: str) -> str:
    cleaned = unit_str.strip().lower()
    return UNIT_ALIASES.get(cleaned, cleaned)

def extract_numbers_and_units(text: str) -> List[Dict[str, Any]]:
    """
    Extract all numerical values and associated dosage/measurement units from text.
    Matches patterns like '500 mg', '50mg', '10 mL', '7.8%', '7.8 mg/dL', 'BID', 'twice daily'.
    """
    pattern = r'(\b\d+(?:\.\d+)?\s*(?:mg/dl|g/dl|mmol/l|u/l|iu/l|mcg|mg|g|ml|l|capsules|capsule|tablets|tablet|pills|pill|units|iu|%|days|weeks|hours|times|twice|thrice|daily))'
    matches = re.findall(pattern, text, re.IGNORECASE)
    
    extracted = []
    for match in matches:
        num_match = re.search(r'\d+(?:\.\d+)?', match)
        unit_match = re.search(r'(?:mg/dl|g/dl|mmol/l|u/l|iu/l|mcg|mg|g|ml|l|capsules|capsule|tablets|tablet|pills|pill|units|iu|%|days|weeks|hours|times|twice|thrice|daily)', match, re.IGNORECASE)
        if num_match:
            unit_raw = unit_match.group(0) if unit_match else ""
            extracted.append({
                "raw": match.strip(),
                "number": num_match.group(0),
                "unit": normalize_unit(unit_raw)
            })
    return extracted

def find_evidence_source(target_term: str, lines_with_details: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """
    Trace evidence line number, raw line text, and OCR confidence from original document OCR lines.
    """
    if not lines_with_details:
        return None
    
    target_lower = target_term.lower()
    
    # Direct line match
    for item in lines_with_details:
        line_text = item.get("text", "")
        if target_lower in line_text.lower():
            return {
                "text": line_text,
                "line_number": item.get("line_number", 1),
                "confidence": item.get("confidence", 95.0)
            }
            
    # Substring / Token match
    tokens = [t for t in re.split(r'\W+', target_lower) if len(t) > 2]
    for item in lines_with_details:
        line_text = item.get("text", "")
        if any(t in line_text.lower() for t in tokens):
            return {
                "text": line_text,
                "line_number": item.get("line_number", 1),
                "confidence": item.get("confidence", 95.0)
            }
            
    # Default to line 1 if unmatched
    first = lines_with_details[0]
    return {
        "text": first.get("text", ""),
        "line_number": first.get("line_number", 1),
        "confidence": first.get("confidence", 95.0)
    }

def validate_critical_medical_values(
    ocr_text: str,
    ai_medications: List[Dict[str, Any]],
    ai_tests: List[Dict[str, Any]] = None,
    ai_translated_text: str = "",
    ocr_confidence: float = 95.0,
    lines_with_details: List[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Deterministically verifies clinical invariants between Textract OCR output and Bedrock output.
    Enforces strict PASS / WARNING / BLOCK rules:
    - 500mg -> 50mg (BLOCK)
    - mg -> mcg (BLOCK)
    - 5mL -> 5mg (BLOCK)
    - BID -> once daily (BLOCK)
    - 7.8% -> 7.8mg/dL (BLOCK)
    - Date mismatch (BLOCK)
    - Drug name missing/altered (BLOCK)
    - OCR confidence < 80.0% (WARNING + user verification required)
    """
    if ai_tests is None:
        ai_tests = []
    if lines_with_details is None:
        lines_with_details = []

    warnings: List[Dict[str, Any]] = []

    # 1. OCR Confidence Check
    ocr_status = "HIGH"
    requires_verification = False
    if ocr_confidence < 80.0:
        ocr_status = "LOW_NEEDS_VERIFICATION"
        requires_verification = True
        warnings.append({
            "field": "OCR Document Confidence",
            "extracted_value": f"{ocr_confidence:.1f}%",
            "translated_value": "N/A",
            "issue": f"LOW_OCR_CONFIDENCE: Overall document OCR confidence ({ocr_confidence:.1f}%) is below the safety threshold (80.0%). Manual verification required.",
            "severity": "WARNING",
            "blocked_item_type": None,
            "blocked_item_name": None
        })

    # 2. Medication Name & Dosage & Unit & Frequency Validation
    for med in ai_medications:
        med_name = med.get("name", "")
        med_dosage = med.get("dosage", "")
        med_freq = med.get("frequency", "").lower()
        
        # Evidence mapping
        med["evidence"] = find_evidence_source(med_name or med_dosage, lines_with_details)
        med["is_blocked"] = False
        med["block_reason"] = None

        if not med_name:
            continue

        med_found_in_ocr = False
        ocr_med_context = ""
        ocr_med_line_num = 1

        for line_item in lines_with_details:
            line = line_item.get("text", "")
            if med_name.lower() in line.lower():
                med_found_in_ocr = True
                ocr_med_context = line
                ocr_med_line_num = line_item.get("line_number", 1)
                break
        
        if not med_found_in_ocr and med_name.lower() not in ocr_text.lower():
            # Drug Name Mismatch / Substitution
            warn = {
                "field": f"Medication Name: '{med_name}'",
                "extracted_value": "Not found in OCR document",
                "translated_value": med_name,
                "issue": f"CRITICAL_VALUE_MISMATCH: Drug name '{med_name}' was not detected in original OCR document.",
                "severity": "BLOCK",
                "blocked_item_type": "medication",
                "blocked_item_name": med_name
            }
            warnings.append(warn)
            med["is_blocked"] = True
            med["block_reason"] = warn["issue"]
            med["instructions"] = "INSTRUCTION BLOCKED: Drug name not verified in original document."
            continue

        # Extract numbers in AI dosage vs OCR line dosage
        ai_num_units = extract_numbers_and_units(med_dosage)
        ocr_num_units = extract_numbers_and_units(ocr_med_context if ocr_med_context else ocr_text)

        # Check Dosage Number & Unit Mismatches (e.g. 500mg -> 50mg, mg -> mcg, 5mL -> 5mg)
        for ai_nu in ai_num_units:
            ai_n = ai_nu["number"]
            ai_u = ai_nu["unit"]

            # Match in OCR numbers
            matching_ocr_nums = [o["number"] for o in ocr_num_units]
            matching_ocr_units = [o["unit"] for o in ocr_num_units if o["number"] == ai_n]

            # Dosage Number Mismatch (500mg -> 50mg)
            if matching_ocr_nums and ai_n not in matching_ocr_nums:
                warn = {
                    "field": f"Medication Dosage: {med_name}",
                    "extracted_value": f"OCR Line {ocr_med_line_num}: '{ocr_med_context}'",
                    "translated_value": f"AI Dosage: '{med_dosage}'",
                    "issue": f"CRITICAL_VALUE_MISMATCH: AI dosage number ({ai_n}) differs from extracted OCR numbers ({', '.join(matching_ocr_nums)}).",
                    "severity": "BLOCK",
                    "blocked_item_type": "medication",
                    "blocked_item_name": med_name
                }
                warnings.append(warn)
                med["is_blocked"] = True
                med["block_reason"] = warn["issue"]
                med["instructions"] = "INSTRUCTION BLOCKED: Critical dosage mismatch detected."

            # Unit Alteration / Substitution (mg -> mcg, 5mL -> 5mg)
            elif ai_u and matching_ocr_units and ai_u not in matching_ocr_units:
                warn = {
                    "field": f"Medication Unit: {med_name}",
                    "extracted_value": f"OCR Unit: '{matching_ocr_units[0]}'",
                    "translated_value": f"AI Unit: '{ai_u}'",
                    "issue": f"CRITICAL_UNIT_MISMATCH: AI unit ({ai_u}) differs from extracted OCR unit ({matching_ocr_units[0]}).",
                    "severity": "BLOCK",
                    "blocked_item_type": "medication",
                    "blocked_item_name": med_name
                }
                warnings.append(warn)
                med["is_blocked"] = True
                med["block_reason"] = warn["issue"]
                med["instructions"] = "INSTRUCTION BLOCKED: Critical dosage unit mismatch detected."

        # Frequency Mismatch (BID / twice daily -> once daily)
        if ocr_med_context:
            for freq_key, std_freq in FREQ_TOKENS.items():
                if freq_key in ocr_med_context.lower():
                    # If OCR has e.g. BID / twice daily but AI says once daily
                    if std_freq == "twice daily" and ("once daily" in med_freq or "once a day" in med_freq):
                        warn = {
                            "field": f"Medication Frequency: {med_name}",
                            "extracted_value": f"OCR Frequency: '{freq_key}' (twice daily)",
                            "translated_value": f"AI Frequency: '{med.get('frequency')}'",
                            "issue": f"CRITICAL_FREQUENCY_MISMATCH: Extracted frequency ({freq_key}) conflicts with translated frequency ({med.get('frequency')}).",
                            "severity": "BLOCK",
                            "blocked_item_type": "medication",
                            "blocked_item_name": med_name
                        }
                        warnings.append(warn)
                        med["is_blocked"] = True
                        med["block_reason"] = warn["issue"]
                        med["instructions"] = "INSTRUCTION BLOCKED: Critical frequency mismatch detected."

    # 3. Lab Test Results & Reference Range Validation
    for test in ai_tests:
        test_name = test.get("name", "")
        test_val = test.get("value", "")
        test_unit = normalize_unit(test.get("unit", ""))
        ref_range = test.get("printed_reference_range", "")

        test["evidence"] = find_evidence_source(test_name or test_val, lines_with_details)
        test["is_blocked"] = False
        test["block_reason"] = None

        if not test_name:
            continue

        # Check lab result unit change (e.g. 7.8% -> 7.8mg/dL)
        test_in_ocr_line = ""
        tokens = [t.lower() for t in re.split(r'\W+', test_name) if len(t) > 2]
        for line_item in lines_with_details:
            line_txt = line_item.get("text", "")
            if test_name.lower() in line_txt.lower() or (tokens and any(tk in line_txt.lower() for tk in tokens)):
                test_in_ocr_line = line_txt
                break

        if not test_in_ocr_line and test_name.lower() not in ocr_text.lower():
            # Also check full ocr_text if lines_with_details is empty
            test_in_ocr_line = ocr_text

        if test_in_ocr_line:
            ocr_units_in_line = extract_numbers_and_units(test_in_ocr_line)
            for ou in ocr_units_in_line:
                if ou["number"] == test_val and test_unit and ou["unit"] and ou["unit"] != test_unit:
                    warn = {
                        "field": f"Lab Result Unit: {test_name}",
                        "extracted_value": f"{ou['number']} {ou['unit']}",
                        "translated_value": f"{test_val} {test_unit}",
                        "issue": f"CRITICAL_LAB_UNIT_MISMATCH: Lab result unit '{ou['unit']}' in OCR document was changed to '{test_unit}'.",
                        "severity": "BLOCK",
                        "blocked_item_type": "lab_test",
                        "blocked_item_name": test_name
                    }
                    warnings.append(warn)
                    test["is_blocked"] = True
                    test["block_reason"] = warn["issue"]

    # 4. Date Mismatches (e.g. 2026-09-26 -> 2026-10-26)
    ocr_dates = re.findall(r'\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}/\d{1,2}/\d{2,4}\b', ocr_text)
    ai_dates = re.findall(r'\b\d{4}-\d{2}-\d{2}\b|\b\d{1,2}/\d{1,2}/\d{2,4}\b', ai_translated_text)
    if ocr_dates and ai_dates:
        for ad in ai_dates:
            if ad not in ocr_dates and len(ocr_dates) > 0:
                warnings.append({
                    "field": "Document Date",
                    "extracted_value": ", ".join(ocr_dates),
                    "translated_value": ad,
                    "issue": f"CRITICAL_DATE_MISMATCH: AI translated date ({ad}) does not match OCR document dates ({', '.join(ocr_dates)}).",
                    "severity": "BLOCK",
                    "blocked_item_type": "date",
                    "blocked_item_name": "Date"
                })

    # Determine overall safety status
    has_block = any(w.get("severity") == "BLOCK" for w in warnings)
    has_warn = any(w.get("severity") == "WARNING" for w in warnings)

    if has_block:
        overall_status = "BLOCKED"
    elif has_warn:
        overall_status = "WARNING"
    else:
        overall_status = "PASS"

    return {
        "warnings": warnings,
        "overall_safety_status": overall_status,
        "ocr_confidence_status": ocr_status,
        "requires_user_verification": requires_verification
    }

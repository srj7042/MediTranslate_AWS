import io
import logging
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

logger = logging.getLogger("meditranslate.pdf")

def generate_translation_pdf(result_data: dict) -> bytes:
    """
    Generate professional PDF document containing extracted text, translation, explanation,
    safety validation status, evidence source links, and blocked instruction callouts.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=18,
        textColor=colors.HexColor('#232F3E'),
        spaceAfter=4
    )
    
    h2_style = ParagraphStyle(
        'DocH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        textColor=colors.HexColor('#146EB4'),
        spaceBefore=10,
        spaceAfter=6
    )
    
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=colors.HexColor('#161E2D')
    )

    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=11.5,
        textColor=colors.HexColor('#D13212')
    )

    warning_box_style = ParagraphStyle(
        'WarningBox',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#900C3F')
    )

    story = []

    # Header Title & Architect
    story.append(Paragraph("MediTranslate — Medical Document Translation Report", title_style))
    story.append(Paragraph("Safety-Verified Clinical Document Understanding Platform | Creator: Suraj Jaiswal", body_style))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#FF9900'), spaceAfter=10))

    # Overall Safety Status Banner
    safety_status = result_data.get("overall_safety_status", "PASS")
    status_bg = "#2ECC71" if safety_status == "PASS" else ("#F39C12" if safety_status == "WARNING" else "#E74C3C")
    status_text_color = "#FFFFFF"
    
    status_p = Paragraph(f"<b>CLINICAL SAFETY STATUS: {safety_status}</b> (OCR Confidence: {result_data.get('ocr_confidence', 95.0):.1f}%)", 
                         ParagraphStyle('StatusBanner', parent=body_style, fontName='Helvetica-Bold', fontSize=10, textColor=colors.HexColor('#FFFFFF')))
    
    status_table = Table([[status_p]], colWidths=[540])
    status_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor(status_bg)),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(status_table)
    story.append(Spacer(1, 10))

    # Safety Notice Disclaimer
    story.append(Paragraph("<b>SAFETY NOTICE:</b> This document is an informational translation & plain-language accessibility explanation. MediTranslate does not provide medical diagnosis, dosage modification, or prescription advice. Always verify medications with your doctor.", disclaimer_style))
    story.append(Spacer(1, 10))

    # Critical Warnings Box (If any exist)
    critical_warnings = result_data.get("critical_warnings", [])
    if critical_warnings:
        warn_content = ["<b>CLINICAL INVARIANT SAFETY WARNINGS:</b>"]
        for w in critical_warnings:
            sev = w.get("severity", "BLOCK")
            warn_content.append(f"• [{sev}] {w.get('field')}: {w.get('issue')}")
        
        warn_p = Paragraph("<br/>".join(warn_content), warning_box_style)
        warn_table = Table([[warn_p]], colWidths=[540])
        warn_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#FADBD8')),
            ('BORDER', (0, 0), (-1, -1), 1, colors.HexColor('#E74C3C')),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 10),
            ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ]))
        story.append(warn_table)
        story.append(Spacer(1, 10))

    # Overview
    story.append(Paragraph("Document Overview", h2_style))
    story.append(Paragraph(f"<b>Document Type:</b> {result_data.get('document_type', 'Prescription').title()}", body_style))
    story.append(Paragraph(f"<b>Target Language:</b> {result_data.get('target_language', 'Hindi').upper()}", body_style))
    story.append(Paragraph(f"<b>Summary:</b> {result_data.get('summary', 'Medical document translation')}", body_style))
    story.append(Spacer(1, 10))

    # Medications Table with Evidence & Blocked Callouts
    medications = result_data.get("medications", [])
    if medications:
        story.append(Paragraph("Medications Mentioned", h2_style))
        table_data = [["Medicine", "Dosage", "Frequency", "Instructions / Evidence Source"]]
        for m in medications:
            name = m.get("name", "")
            dosage = m.get("dosage", "")
            freq = m.get("frequency", "")
            inst = m.get("instructions", "")
            evidence = m.get("evidence", {})
            ev_str = f" [Source Line {evidence.get('line_number')}: '{evidence.get('text')}']" if evidence else ""
            
            if m.get("is_blocked"):
                inst = f"<b>[BLOCKED]</b> {m.get('block_reason')}"
            else:
                inst = f"{inst}{ev_str}"

            table_data.append([name, dosage, freq, Paragraph(inst, body_style)])
        
        t = Table(table_data, colWidths=[110, 80, 100, 250])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#232F3E')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 8.5),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#D5DBDB')),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F7F8FA')]),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ('TOPPADDING', (0, 0), (-1, -1), 5),
        ]))
        story.append(t)
        story.append(Spacer(1, 10))

    # Translated Content
    story.append(Paragraph("Translated Content", h2_style))
    trans_text = result_data.get("translated_text", "").replace("\n", "<br/>")
    story.append(Paragraph(trans_text, body_style))
    story.append(Spacer(1, 10))

    # Original Extracted Text
    story.append(Paragraph("Original OCR Extracted Text", h2_style))
    orig_text = result_data.get("original_text", "").replace("\n", "<br/>")
    story.append(Paragraph(orig_text, body_style))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes

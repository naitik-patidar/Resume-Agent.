"""Document generation service for ATS-compliant DOCX and polished PDF resumes."""
import io
import re
from typing import List
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable


def generate_docx(markdown_text: str) -> bytes:
    """Generate clean, ATS-compliant Word document (.docx) from markdown resume text."""
    doc = Document()

    # Set 0.75 inch margins for standard corporate resume layout
    for section in doc.sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    lines = markdown_text.splitlines()
    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        # Top-level Title / Candidate Name (# Name)
        if stripped.startswith("# "):
            p = doc.add_paragraph()
            run = p.add_run(stripped[2:].strip())
            run.font.name = "Calibri"
            run.font.size = Pt(20)
            run.font.bold = True
            run.font.color.rgb = RGBColor(17, 24, 39)
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_after = Pt(4)

        # Section Heading (## Experience)
        elif stripped.startswith("## "):
            p = doc.add_paragraph()
            run = p.add_run(stripped[3:].strip())
            run.font.name = "Calibri"
            run.font.size = Pt(13)
            run.font.bold = True
            run.font.color.rgb = RGBColor(31, 41, 55)
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(2)

        # Subsection Heading (### Job Title at Company)
        elif stripped.startswith("### "):
            p = doc.add_paragraph()
            run = p.add_run(stripped[4:].strip())
            run.font.name = "Calibri"
            run.font.size = Pt(11)
            run.font.bold = True
            run.font.color.rgb = RGBColor(55, 65, 81)
            p.paragraph_format.space_before = Pt(4)
            p.paragraph_format.space_after = Pt(2)

        # Bullet points (- Bullet or * Bullet)
        elif stripped.startswith("- ") or stripped.startswith("* "):
            bullet_text = stripped[2:].strip()
            # Clean markdown bold markers **bold**
            clean_bullet = re.sub(r"\*\*(.*?)\*\*", r"\1", bullet_text)
            p = doc.add_paragraph(clean_bullet, style="List Bullet")
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(1)
            for r in p.runs:
                r.font.name = "Calibri"
                r.font.size = Pt(10.5)

        # Normal text / contact / summary
        else:
            clean_line = re.sub(r"\*\*(.*?)\*\*", r"\1", stripped)
            p = doc.add_paragraph()
            run = p.add_run(clean_line)
            run.font.name = "Calibri"
            run.font.size = Pt(10)
            p.paragraph_format.space_after = Pt(3)

    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


def generate_pdf(markdown_text: str) -> bytes:
    """Generate executive corporate PDF resume using ReportLab Platypus."""
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=36,
        bottomMargin=36,
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ResumeTitle",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=22,
        alignment=1,  # Center
        textColor=colors.HexColor("#111827"),
        spaceAfter=4,
    )

    heading_style = ParagraphStyle(
        "ResumeHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#1F2937"),
        spaceBefore=8,
        spaceAfter=2,
    )

    subheading_style = ParagraphStyle(
        "ResumeSubheading",
        parent=styles["Heading3"],
        fontName="Helvetica-Bold",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#374151"),
        spaceBefore=4,
        spaceAfter=2,
    )

    bullet_style = ParagraphStyle(
        "ResumeBullet",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=2,
        textColor=colors.HexColor("#1F2937"),
    )

    body_style = ParagraphStyle(
        "ResumeBody",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=13,
        spaceAfter=3,
        textColor=colors.HexColor("#374151"),
    )

    story = []
    lines = markdown_text.splitlines()

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        if stripped.startswith("# "):
            story.append(Paragraph(stripped[2:].strip(), title_style))
            story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#D1D5DB"), spaceAfter=6))

        elif stripped.startswith("## "):
            story.append(Paragraph(stripped[3:].strip(), heading_style))
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#E5E7EB"), spaceAfter=4))

        elif stripped.startswith("### "):
            story.append(Paragraph(stripped[4:].strip(), subheading_style))

        elif stripped.startswith("- ") or stripped.startswith("* "):
            clean_bullet = stripped[2:].strip()
            # Replace **text** with ReportLab <b>text</b>
            clean_bullet = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", clean_bullet)
            story.append(Paragraph(f"&bull; {clean_bullet}", bullet_style))

        else:
            clean_line = re.sub(r"\*\*(.*?)\*\*", r"<b>\1</b>", stripped)
            story.append(Paragraph(clean_line, body_style))

    doc.build(story)
    return buf.getvalue()

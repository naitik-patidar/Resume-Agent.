"""Unit tests for document parsing, header validation, and section detection."""
import io
import pytest
import pymupdf
from docx import Document

from app.services.parser import (
    validate_file_header,
    parse_pdf,
    parse_docx,
    detect_sections,
    parse_document,
    DocumentParsingError,
)


def create_sample_pdf() -> bytes:
    """Create an in-memory PDF using PyMuPDF."""
    doc = pymupdf.open()
    page = doc.new_page()
    text = (
        "Alex Rivera\n"
        "alex@example.com | (555) 019-2834 | San Francisco, CA\n\n"
        "Professional Summary\n"
        "Results-oriented backend engineer with 5 years of experience in distributed systems.\n\n"
        "Experience\n"
        "Senior Backend Engineer at CloudScale\n"
        "- Architected high-throughput REST APIs handling 10k requests/sec\n"
        "- Reduced database query latency by 35% using Redis caching\n\n"
        "Education\n"
        "Bachelor of Science in Computer Science, University of California (2019)\n\n"
        "Technical Skills\n"
        "Python, FastAPI, PostgreSQL, Docker, Kubernetes, AWS\n"
    )
    page.insert_text((50, 72), text)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def create_sample_docx() -> bytes:
    """Create an in-memory DOCX using python-docx."""
    doc = Document()
    doc.add_heading("Morgan Lee", level=1)
    doc.add_paragraph("morgan@example.com | New York, NY")
    doc.add_paragraph("Summary")
    doc.add_paragraph("Dedicated full-stack engineer passionate about clean code and user experience.")
    doc.add_paragraph("Experience")
    doc.add_paragraph("Software Developer at FinTech Inc")
    doc.add_paragraph("- Built scalable React applications and Python backends.")
    doc.add_paragraph("Skills")
    doc.add_paragraph("React, TypeScript, Python, Django, SQL")
    doc.add_paragraph("Education")
    doc.add_paragraph("B.S. in Software Engineering, NYIT (2021)")
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


def test_validate_file_header_valid():
    pdf_bytes = create_sample_pdf()
    assert validate_file_header(pdf_bytes, "resume.pdf") == "pdf"

    docx_bytes = create_sample_docx()
    assert validate_file_header(docx_bytes, "resume.docx") == "docx"


def test_validate_file_header_invalid():
    with pytest.raises(DocumentParsingError, match="Unsupported file format"):
        validate_file_header(b"hello", "resume.txt")

    with pytest.raises(DocumentParsingError, match="Invalid PDF header"):
        validate_file_header(b"NOT_A_PDF", "resume.pdf")

    with pytest.raises(DocumentParsingError, match="Invalid DOCX header"):
        validate_file_header(b"NOT_A_ZIP", "resume.docx")


def test_parse_pdf_extracts_content():
    pdf_bytes = create_sample_pdf()
    text = parse_pdf(pdf_bytes)
    assert "Alex Rivera" in text
    assert "Senior Backend Engineer" in text
    assert "CloudScale" in text
    assert "PostgreSQL" in text


def test_parse_docx_extracts_content():
    docx_bytes = create_sample_docx()
    text = parse_docx(docx_bytes)
    assert "Morgan Lee" in text
    assert "FinTech Inc" in text
    assert "TypeScript" in text


def test_detect_sections():
    sample_text = (
        "John Doe\n"
        "john@doe.com\n\n"
        "Professional Summary\n"
        "Talented engineer.\n\n"
        "Work Experience\n"
        "Staff Engineer at StartupX\n\n"
        "Technical Skills\n"
        "Python, Rust, SQL\n\n"
        "Education\n"
        "MIT, B.S. CS\n"
    )
    sections_map, detected = detect_sections(sample_text)
    assert "Summary" in detected
    assert "Experience" in detected
    assert "Skills" in detected
    assert "Education" in detected
    assert "Staff Engineer at StartupX" in sections_map["Experience"]


def test_parse_document_end_to_end():
    pdf_bytes = create_sample_pdf()
    text, sections, detected = parse_document(pdf_bytes, "test.pdf")
    assert len(text) > 50
    assert "Experience" in detected
    assert "Skills" in detected
    assert "Alex Rivera" in text

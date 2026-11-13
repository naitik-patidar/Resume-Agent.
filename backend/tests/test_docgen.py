"""Unit tests for ATS-compliant DOCX and executive PDF document generation."""
import io
from docx import Document
import pymupdf

from app.services.docgen import generate_docx, generate_pdf


SAMPLE_MARKDOWN = """# Alex Morgan
alex.morgan@example.com | (555) 019-2834 | San Francisco, CA | linkedin.com/in/alexmorgan

## Professional Summary
Senior Software Engineer with 6+ years of experience designing high-throughput distributed systems in Python and Go.

## Experience
### Senior Backend Engineer | TechCorp Inc.
- Engineered distributed event streaming pipeline processing 15,000 events/sec with 99.99% uptime.
- Optimized database indexing and query plans, reducing p95 latency from 450ms to 65ms.
- Mentored 4 junior software engineers through architectural reviews and design docs.

## Education
### Bachelor of Science in Computer Science | University of California, Berkeley
- Graduated Magna Cum Laude

## Technical Skills
- Languages: Python, Go, TypeScript, SQL
- Infrastructure: Docker, Kubernetes, AWS, PostgreSQL, Redis
"""


def test_generate_docx_structure_and_validity():
    docx_bytes = generate_docx(SAMPLE_MARKDOWN)
    assert docx_bytes.startswith(b"PK"), "DOCX file must start with zip magic bytes PK"
    assert len(docx_bytes) > 1000

    # Parse back with python-docx to verify content integrity
    doc = Document(io.BytesIO(docx_bytes))
    text_content = "\n".join([p.text for p in doc.paragraphs])
    assert "Alex Morgan" in text_content
    assert "Professional Summary" in text_content
    assert "TechCorp Inc." in text_content
    assert "15,000 events/sec" in text_content


def test_generate_pdf_structure_and_validity():
    pdf_bytes = generate_pdf(SAMPLE_MARKDOWN)
    assert pdf_bytes.startswith(b"%PDF-"), "PDF file must start with %PDF- magic header"
    assert len(pdf_bytes) > 1000

    # Parse back with PyMuPDF to verify render integrity
    doc = pymupdf.open(stream=pdf_bytes, filetype="pdf")
    assert len(doc) >= 1
    page_text = doc[0].get_text()
    assert "Alex Morgan" in page_text
    assert "Professional Summary" in page_text
    assert "TechCorp Inc." in page_text

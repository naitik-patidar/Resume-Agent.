"""Document parser for PDF and DOCX resumes using PyMuPDF and python-docx."""
import io
import re
from pathlib import Path
from typing import Dict, List, Tuple
import pymupdf
from docx import Document


STANDARD_SECTIONS = [
    ("Contact", re.compile(r"^(contact|personal info|contact information)", re.I)),
    ("Summary", re.compile(r"^(summary|professional summary|executive summary|profile|about me|objective)", re.I)),
    ("Experience", re.compile(r"^(experience|work experience|employment history|professional experience|work history)", re.I)),
    ("Education", re.compile(r"^(education|academic background|academics|qualifications)", re.I)),
    ("Skills", re.compile(r"^(skills|technical skills|core competencies|technologies|tools)", re.I)),
    ("Projects", re.compile(r"^(projects|personal projects|key projects|academic projects)", re.I)),
    ("Certifications", re.compile(r"^(certifications|licenses|courses|awards)", re.I)),
]


class DocumentParsingError(Exception):
    """Raised when a document cannot be parsed or is corrupted."""
    pass


def validate_file_header(file_bytes: bytes, filename: str) -> str:
    """Validate magic bytes and file extension."""
    ext = Path(filename).suffix.lower()
    if ext == ".pdf":
        if not file_bytes.startswith(b"%PDF-"):
            raise DocumentParsingError("Invalid PDF header; file does not appear to be a valid PDF.")
        return "pdf"
    elif ext == ".docx":
        # DOCX files are zip archives starting with PK\x03\x04
        if not file_bytes.startswith(b"PK\x03\x04"):
            raise DocumentParsingError("Invalid DOCX header; file does not appear to be a valid DOCX file.")
        return "docx"
    else:
        raise DocumentParsingError(f"Unsupported file format '{ext}'. Only .pdf and .docx are supported.")


def parse_pdf(file_bytes: bytes) -> str:
    """Extract clean text from PDF bytes using PyMuPDF."""
    try:
        doc = pymupdf.open(stream=file_bytes, filetype="pdf")
        text_parts = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            text_parts.append(page.get_text("text"))
        doc.close()
        full_text = "\n".join(text_parts).strip()
        if not full_text:
            raise DocumentParsingError("PDF is empty or contains only non-extractable scanned images.")
        return full_text
    except DocumentParsingError:
        raise
    except Exception as exc:
        raise DocumentParsingError(f"Failed to read PDF document: {str(exc)}") from exc


def parse_docx(file_bytes: bytes) -> str:
    """Extract clean text from DOCX bytes using python-docx."""
    try:
        doc = Document(io.BytesIO(file_bytes))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        
        # Also extract table text if present
        for table in doc.tables:
            for row in table.rows:
                row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                if row_text:
                    paragraphs.append(row_text)

        full_text = "\n".join(paragraphs).strip()
        if not full_text:
            raise DocumentParsingError("DOCX document is empty.")
        return full_text
    except DocumentParsingError:
        raise
    except Exception as exc:
        raise DocumentParsingError(f"Failed to read DOCX document: {str(exc)}") from exc


def detect_sections(text: str) -> Tuple[Dict[str, str], List[str]]:
    """Segment text into standard resume sections based on common headings."""
    lines = [line.strip() for line in text.splitlines() if line.strip()]
    sections: Dict[str, List[str]] = {}
    current_section = "Header"
    sections[current_section] = []

    for line in lines:
        matched_section = None
        # Headings are typically short lines (< 45 chars)
        if len(line) < 45:
            for sec_name, pattern in STANDARD_SECTIONS:
                # Strip leading/trailing symbols often found in resumes
                clean_heading = re.sub(r"^[#\*\-•—\s]+|[#\*\-•—:\s]+$", "", line)
                if pattern.match(clean_heading):
                    matched_section = sec_name
                    break

        if matched_section:
            current_section = matched_section
            if current_section not in sections:
                sections[current_section] = []
        else:
            sections[current_section].append(line)

    # Format sections as clean multiline strings
    formatted_sections = {k: "\n".join(v).strip() for k, v in sections.items() if v}
    detected_names = [k for k in formatted_sections.keys() if k != "Header"]
    return formatted_sections, detected_names


def parse_document(file_bytes: bytes, filename: str) -> Tuple[str, Dict[str, str], List[str]]:
    """Main parsing entry point: validates headers, extracts text, and detects sections."""
    doc_type = validate_file_header(file_bytes, filename)
    if doc_type == "pdf":
        raw_text = parse_pdf(file_bytes)
    else:
        raw_text = parse_docx(file_bytes)

    # Normalize excessive blank lines and spaces
    cleaned_text = re.sub(r"\n{3,}", "\n\n", raw_text)
    sections_map, detected_sections = detect_sections(cleaned_text)
    return cleaned_text, sections_map, detected_sections

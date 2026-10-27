import io
from pathlib import Path
from typing import Dict, Tuple
import pypdf
import docx

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 Megabytes
ALLOWED_EXTENSIONS = {".pdf", ".docx"}


class ResumeParserError(Exception):
    """Custom exception raised for invalid or unparseable resume files."""
    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def validate_file_metadata(filename: str, file_size: int) -> str:
    """
    Validate file extension and size.
    Returns the normalized file extension without leading dot ("pdf" or "docx").
    """
    if not filename:
        raise ResumeParserError("Filename must not be empty.", status_code=400)

    ext = Path(filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ResumeParserError(
            f"Unsupported file type '{ext or 'unknown'}'. Please upload a PDF (.pdf) or Word document (.docx).",
            status_code=400,
        )

    if file_size <= 0:
        raise ResumeParserError("The uploaded file is empty (0 bytes).", status_code=400)

    if file_size > MAX_FILE_SIZE:
        max_mb = MAX_FILE_SIZE // (1024 * 1024)
        raise ResumeParserError(
            f"File size exceeds the allowed {max_mb} MB limit. Your file is {file_size / (1024 * 1024):.2f} MB.",
            status_code=413,
        )

    return ext.lstrip(".")


def extract_text_from_pdf(file_bytes: bytes) -> Tuple[str, bool]:
    """
    Extract text from a PDF file using pypdf.
    Returns (extracted_text, is_unreadable_or_scanned).
    """
    # Verify PDF magic bytes
    if not file_bytes.startswith(b"%PDF"):
        # Check if %PDF occurs in the first 1024 bytes (some PDFs have leading BOM/whitespace)
        if b"%PDF" not in file_bytes[:1024]:
            raise ResumeParserError(
                "Invalid PDF document: The file does not have a valid PDF header.",
                status_code=400,
            )

    try:
        reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        if reader.is_encrypted:
            try:
                reader.decrypt("")
            except Exception:
                raise ResumeParserError(
                    "The uploaded PDF is password protected. Please upload an unlocked PDF.",
                    status_code=400,
                )

        pages_text = []
        for i, page in enumerate(reader.pages):
            try:
                text = page.extract_text() or ""
                if text.strip():
                    pages_text.append(text.strip())
            except Exception:
                continue

        full_text = "\n\n".join(pages_text).strip()
        is_unreadable = len(full_text) == 0

        return full_text, is_unreadable

    except ResumeParserError:
        raise
    except Exception as exc:
        raise ResumeParserError(
            f"Failed to read PDF document: {str(exc)}",
            status_code=400,
        )


def extract_text_from_docx(file_bytes: bytes) -> Tuple[str, bool]:
    """
    Extract text from a DOCX file using python-docx.
    Returns (extracted_text, is_unreadable).
    """
    # Verify ZIP magic bytes (DOCX is an OpenXML ZIP archive)
    if not file_bytes.startswith(b"PK\x03\x04"):
        raise ResumeParserError(
            "Invalid DOCX document: The file is corrupted or not a valid Word document.",
            status_code=400,
        )

    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]

        table_cells = []
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    cell_text = cell.text.strip()
                    if cell_text and cell_text not in table_cells:
                        table_cells.append(cell_text)

        full_text = "\n\n".join(paragraphs + table_cells).strip()
        is_unreadable = len(full_text) == 0

        return full_text, is_unreadable

    except ResumeParserError:
        raise
    except Exception as exc:
        raise ResumeParserError(
            f"Failed to read DOCX document: {str(exc)}",
            status_code=400,
        )


def parse_resume_file(filename: str, file_bytes: bytes) -> Dict[str, any]:
    """
    Parse an uploaded resume file and extract its text content.
    """
    file_size = len(file_bytes)
    file_type = validate_file_metadata(filename, file_size)

    if file_type == "pdf":
        text, is_unreadable = extract_text_from_pdf(file_bytes)
    elif file_type == "docx":
        text, is_unreadable = extract_text_from_docx(file_bytes)
    else:
        raise ResumeParserError(f"Unsupported file type: {file_type}", status_code=400)

    return {
        "text": text,
        "file_type": file_type,
        "file_size_bytes": file_size,
        "is_unreadable": is_unreadable,
    }

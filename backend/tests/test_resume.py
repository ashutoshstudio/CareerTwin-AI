import io
import docx
import pypdf
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.resume import ResumeAnalysis
from app.services.skill_extractor import analyze_resume_text, extract_skills


def create_synthetic_pdf(text: str = "John Doe - BCA Student - Python React SQL Developer") -> bytes:
    """Create a minimal valid synthetic PDF with selectable text for testing."""
    escaped_text = text.replace("(", "\\(").replace(")", "\\)")
    stream_content = f"BT\n/F1 12 Tf\n72 712 Td\n({escaped_text}) Tj\nET\n".encode("utf-8")
    stream_length = len(stream_content)

    header = (
        b"%PDF-1.4\n"
        b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"
        b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n"
        + f"4 0 obj\n<< /Length {stream_length} >>\nstream\n".encode("utf-8")
    )
    footer = (
        b"endstream\nendobj\n"
        b"5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
        b"xref\n0 6\n0000000000 65535 f \n"
        b"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n500\n%%EOF"
    )
    return header + stream_content + footer


def create_blank_pdf() -> bytes:
    """Create a blank PDF with no extractable text (simulating scanned document)."""
    writer = pypdf.PdfWriter()
    writer.add_blank_page(width=612, height=792)
    buf = io.BytesIO()
    writer.write(buf)
    return buf.getvalue()


def create_synthetic_docx(text: str = "Alice Smith\nEmail: alice@example.com\nSkills: Python, Docker, AWS, FastAPI") -> bytes:
    """Create a valid synthetic DOCX document in-memory."""
    doc = docx.Document()
    for line in text.split("\n"):
        doc.add_paragraph(line)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


@pytest.fixture
def auth_headers(client: TestClient) -> dict:
    """Register and authenticate a primary test user."""
    res = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Resume Test User",
            "email": "resumetest@example.com",
            "password": "Password123!",
        },
    )
    assert res.status_code == 201
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def second_auth_headers(client: TestClient) -> dict:
    """Register and authenticate a second test user to test data isolation."""
    res = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Second User",
            "email": "seconduser@example.com",
            "password": "Password123!",
        },
    )
    assert res.status_code == 201
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ── 1. Valid PDF Extraction ──────────────────────────────────────────────────

def test_valid_pdf_extraction(client: TestClient, auth_headers: dict):
    pdf_bytes = create_synthetic_pdf(
        "Alex Rivera - Delhi University - BCA Graduate 2026. Proficient in Python, React, SQL, and Docker."
    )
    files = {"file": ("resume.pdf", pdf_bytes, "application/pdf")}

    response = client.post("/api/v1/resume/analyze", headers=auth_headers, files=files)
    assert response.status_code == 200

    data = response.json()
    assert data["filename"] == "resume.pdf"
    assert data["file_type"] == "pdf"
    assert data["status"] == "completed"

    # Verify extracted skills
    skill_names = [s["name"] for s in data["extracted_skills"]]
    assert "Python" in skill_names
    assert "React" in skill_names
    assert "SQL" in skill_names
    assert "Docker" in skill_names

    # Verify education
    assert data["education"]["degree"] == "Bachelor of Computer Applications (BCA)"
    assert data["education"]["graduation_year"] == 2026


# ── 2. Valid DOCX Extraction ─────────────────────────────────────────────────

def test_valid_docx_extraction(client: TestClient, auth_headers: dict):
    docx_text = (
        "Sarah Connor\n"
        "Email: sarah@example.com\n"
        "Education: Bachelor of Technology (B.Tech) - 2025\n"
        "Technical Skills: Python, Scikit-learn, Machine Learning, Git, Communication"
    )
    docx_bytes = create_synthetic_docx(docx_text)
    files = {"file": ("my_resume.docx", docx_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")}

    response = client.post("/api/v1/resume/analyze", headers=auth_headers, files=files)
    assert response.status_code == 200

    data = response.json()
    assert data["filename"] == "my_resume.docx"
    assert data["file_type"] == "docx"
    assert data["status"] == "completed"

    skill_names = [s["name"] for s in data["extracted_skills"]]
    assert "Python" in skill_names
    assert "Scikit-learn" in skill_names
    assert "Machine Learning" in skill_names
    assert "Git" in skill_names
    assert "Communication" in skill_names

    assert data["contact_info"]["email"] == "sarah@example.com"
    assert data["education"]["degree"] == "Bachelor of Technology (B.Tech / B.E.)"
    assert data["education"]["graduation_year"] == 2025


# ── 3. Unsupported File Types ────────────────────────────────────────────────

def test_unsupported_file_types(client: TestClient, auth_headers: dict):
    # Reject .txt file
    files = {"file": ("notes.txt", b"Python developer resume", "text/plain")}
    res_txt = client.post("/api/v1/resume/analyze", headers=auth_headers, files=files)
    assert res_txt.status_code == 400
    assert "Unsupported file type" in res_txt.json()["detail"]

    # Reject .exe or .png
    files_png = {"file": ("photo.png", b"\x89PNG\r\n\x1a\nfake", "image/png")}
    res_png = client.post("/api/v1/resume/analyze", headers=auth_headers, files=files_png)
    assert res_png.status_code == 400


# ── 4. Oversized Uploads ─────────────────────────────────────────────────────

def test_oversized_upload(client: TestClient, auth_headers: dict):
    # Over 5 MB (5 * 1024 * 1024 + 100 bytes)
    big_content = b"%PDF-1.4 " + (b"0" * (5 * 1024 * 1024 + 100))
    files = {"file": ("giant_resume.pdf", big_content, "application/pdf")}

    response = client.post("/api/v1/resume/analyze", headers=auth_headers, files=files)
    assert response.status_code == 413
    assert "exceeds" in response.json()["detail"].lower()


# ── 5. Empty or Scanned Files (OCR explanation) ──────────────────────────────

def test_empty_zero_byte_file(client: TestClient, auth_headers: dict):
    files = {"file": ("empty.pdf", b"", "application/pdf")}
    response = client.post("/api/v1/resume/analyze", headers=auth_headers, files=files)
    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_scanned_pdf_unreadable_graceful(client: TestClient, auth_headers: dict):
    blank_pdf = create_blank_pdf()
    files = {"file": ("scanned.pdf", blank_pdf, "application/pdf")}

    response = client.post("/api/v1/resume/analyze", headers=auth_headers, files=files)
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "unreadable"
    assert len(data["warnings"]) > 0
    # Must explain OCR is not supported rather than inventing skills
    warning_text = " ".join(data["warnings"])
    assert "OCR" in warning_text or "scanned" in warning_text.lower()
    assert len(data["extracted_skills"]) == 0


# ── 6. Skill Extraction and Alias Handling ───────────────────────────────────

def test_skill_aliases_and_word_boundaries():
    # Test aliases: sklearn -> Scikit-learn, ML -> Machine Learning, JS -> JavaScript
    text = "Experience with sklearn, ML algorithms, and modern JS. Also knows C++ and C#."
    skills = extract_skills(text)
    names = [s["name"] for s in skills]

    assert "Scikit-learn" in names
    assert "Machine Learning" in names
    assert "JavaScript" in names
    assert "C++" in names
    assert "C#" in names

    # Word boundary test: "javascript" should NOT trigger "Java"
    text_js_only = "Building frontend with javascript and html5"
    skills_js = extract_skills(text_js_only)
    names_js = [s["name"] for s in skills_js]
    assert "JavaScript" in names_js
    assert "Java" not in names_js  # Critical: Java must not match inside javascript


# ── 7. Authentication Requirements ───────────────────────────────────────────

def test_missing_or_invalid_auth(client: TestClient):
    pdf_bytes = create_synthetic_pdf("Python Developer")
    files = {"file": ("resume.pdf", pdf_bytes, "application/pdf")}

    # Missing auth
    res_no_auth = client.post("/api/v1/resume/analyze", files=files)
    assert res_no_auth.status_code == 401

    # Invalid token
    res_bad_auth = client.post(
        "/api/v1/resume/analyze",
        headers={"Authorization": "Bearer invalid.token.value"},
        files=files,
    )
    assert res_bad_auth.status_code == 401


# ── 8. User-Specific Analysis Access & Isolation ─────────────────────────────

def test_user_data_isolation(client: TestClient, auth_headers: dict, second_auth_headers: dict):
    pdf_bytes = create_synthetic_pdf("User One Resume - Python Developer")
    files = {"file": ("user_one.pdf", pdf_bytes, "application/pdf")}

    # User 1 uploads
    res1 = client.post("/api/v1/resume/analyze", headers=auth_headers, files=files)
    assert res1.status_code == 200
    analysis_id = res1.json()["id"]

    # User 1 can view their own analysis
    res_own = client.get(f"/api/v1/resume/{analysis_id}", headers=auth_headers)
    assert res_own.status_code == 200
    assert res_own.json()["id"] == analysis_id

    # User 2 CANNOT access User 1's analysis (must return 404)
    res_other = client.get(f"/api/v1/resume/{analysis_id}", headers=second_auth_headers)
    assert res_other.status_code == 404


# ── 9. Database Persistence & History Retrieval ──────────────────────────────

def test_resume_history_and_latest(client: TestClient, auth_headers: dict):
    # Upload first document
    pdf1 = create_synthetic_pdf("Resume 1 - Python and SQL")
    client.post("/api/v1/resume/analyze", headers=auth_headers, files={"file": ("r1.pdf", pdf1, "application/pdf")})

    # Upload second document
    pdf2 = create_synthetic_pdf("Resume 2 - React, Docker, and AWS")
    client.post("/api/v1/resume/analyze", headers=auth_headers, files={"file": ("r2.pdf", pdf2, "application/pdf")})

    # Check history
    res_history = client.get("/api/v1/resume/history", headers=auth_headers)
    assert res_history.status_code == 200
    history = res_history.json()
    assert len(history) == 2
    assert history[0]["filename"] == "r2.pdf"  # newest first
    assert history[1]["filename"] == "r1.pdf"

    # Check latest
    res_latest = client.get("/api/v1/resume/latest", headers=auth_headers)
    assert res_latest.status_code == 200
    latest = res_latest.json()
    assert latest["filename"] == "r2.pdf"
    skill_names = [s["name"] for s in latest["extracted_skills"]]
    assert "React" in skill_names
    assert "Docker" in skill_names
    assert "AWS" in skill_names

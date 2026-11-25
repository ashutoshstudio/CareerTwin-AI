import io
import docx
import pypdf
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.core.security import hash_password
from app.models.profile import StudentProfile
from app.models.user import User


def create_synthetic_pdf(text: str = "John Doe - Data Analyst - Python SQL Excel") -> bytes:
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


def create_synthetic_docx(text: str) -> bytes:
    """Create a valid synthetic DOCX document in-memory."""
    doc = docx.Document()
    for line in text.split("\n"):
        doc.add_paragraph(line)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


def _create_test_user_and_token(
    client: TestClient,
    db_session: Session,
    email: str = "ats_tester@example.com",
    role: str = "Data Analyst",
) -> tuple[dict, int]:
    user = User(
        email=email,
        hashed_password=hash_password("Pass123!"),
        full_name="ATS Tester",
        role="student",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    profile = StudentProfile(
        user_id=user.id,
        target_role=role,
        skills=[{"name": "Python", "level": 4}, {"name": "SQL", "level": 3}],
        education_level="B.Tech Computer Science",
        experience_months=12,
    )
    db_session.add(profile)
    db_session.commit()

    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "Pass123!"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}, user.id


SAMPLE_RESUME_TEXT = """
JOHN DOE
Email: john.doe@example.com | Phone: 555-123-4567 | github.com/johndoe | linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Analytical and detail-oriented Junior Data Analyst with 1+ years of experience extracting data insights, building SQL database queries, and developing interactive business intelligence dashboards.

TECHNICAL SKILLS
• Programming: Python, SQL, R
• Data & Analytics: Pandas, NumPy, Excel, Power BI, Tableau, Statistics
• Tools: Git, GitHub, Docker, Linux

EXPERIENCE & PROJECTS
Junior Data Analyst Intern | Tech Corp (Jan 2024 - Present)
• Engineered and optimized complex SQL queries and relational ETL pipelines, reducing query processing time by 35% across 500,000+ transaction rows.
• Developed 8+ interactive Power BI dashboards visualizing monthly business KPIs for 15+ executive stakeholders.
• Automated weekly data cleaning workflows using Python and Pandas, saving 12 hours per week for the analytics team.

Academic Capstone Project | University Data Analytics Lab
• Built a predictive regression model in Python and Scikit-learn, achieving 89.5% accuracy in forecasting student retention metrics.
• Created clear statistical charts and documented findings in a GitHub repository with 40+ stars.

EDUCATION
Bachelor of Computer Applications (BCA) | State University
Graduated with Honors | CGPA: 3.8/4.0
"""


def test_score_resume_text_endpoint(client: TestClient, db_session: Session):
    headers, user_id = _create_test_user_and_token(client, db_session)

    resp = client.post(
        "/api/v1/ats/score-text",
        headers=headers,
        json={
            "resume_text": SAMPLE_RESUME_TEXT,
            "target_role": "Data Analyst",
            "filename": "john_doe_resume.txt",
        },
    )
    assert resp.status_code == 200
    data = resp.json()

    assert data["user_id"] == user_id
    assert data["target_role"] == "Data Analyst"
    assert data["overall_score"] >= 75.0
    assert data["grade"] in ("Strong ATS Compatibility", "Good Optimization")

    cat_scores = data["category_scores"]
    assert cat_scores["keyword_matching"] > 15.0
    assert cat_scores["section_completeness"] >= 16.0
    assert cat_scores["experience_relevance"] >= 14.0
    assert cat_scores["quantifiable_achievements"] >= 10.0
    assert cat_scores["formatting_readability"] >= 10.0

    assert "Python" in data["matched_skills"]
    assert "SQL" in data["matched_skills"]
    assert len(data["detected_sections"]) >= 4
    assert len(data["strengths"]) > 0
    assert len(data["role_comparisons"]) >= 3
    assert data["word_count"] > 100
    assert data["quantifiable_metrics_count"] >= 3


def test_score_resume_file_pdf(client: TestClient, db_session: Session):
    headers, user_id = _create_test_user_and_token(
        client, db_session, email="pdf_ats@example.com"
    )

    pdf_bytes = create_synthetic_pdf(
        "Jane Smith - Data Analyst\nEmail: jane@example.com Phone: 555-987-6543\n"
        "Skills: Python, SQL, Tableau, Excel, Pandas, Statistics\n"
        "Experience: Built 5+ dashboards and reduced query time by 25% across 10k users.\n"
        "Education: Bachelor of Computer Applications (BCA)"
    )

    resp = client.post(
        "/api/v1/ats/score-file",
        headers=headers,
        data={"target_role": "Data Analyst"},
        files={"file": ("jane_smith_resume.pdf", pdf_bytes, "application/pdf")},
    )
    assert resp.status_code == 200
    data = resp.json()

    assert data["user_id"] == user_id
    assert data["filename"] == "jane_smith_resume.pdf"
    assert data["overall_score"] > 50.0
    assert "Python" in data["matched_skills"]
    assert "SQL" in data["matched_skills"]


def test_score_resume_file_docx(client: TestClient, db_session: Session):
    headers, user_id = _create_test_user_and_token(
        client, db_session, email="docx_ats@example.com"
    )

    docx_bytes = create_synthetic_docx(
        "Bob Developer\nEmail: bob@example.com Phone: 555-444-3322\n"
        "Skills: Python, FastAPI, Git, SQL, Docker, Linux\n"
        "Projects: Architected REST microservices with 99.9% uptime for 20k clients.\n"
        "Education: Bachelor of Technology (B.Tech / B.E.)"
    )

    resp = client.post(
        "/api/v1/ats/score-file",
        headers=headers,
        data={"target_role": "Python Developer"},
        files={"file": ("bob_resume.docx", docx_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")},
    )
    assert resp.status_code == 200
    data = resp.json()

    assert data["user_id"] == user_id
    assert data["target_role"] == "Python Developer"
    assert data["overall_score"] > 50.0
    assert "Python" in data["matched_skills"]
    assert "FastAPI" in data["matched_skills"]


def test_score_latest_resume_fallback(client: TestClient, db_session: Session):
    headers, user_id = _create_test_user_and_token(
        client, db_session, email="latest_ats@example.com"
    )

    resp = client.post(
        "/api/v1/ats/score-latest",
        headers=headers,
        params={"target_role": "Data Analyst"},
    )
    assert resp.status_code == 200
    data = resp.json()

    assert data["user_id"] == user_id
    assert data["target_role"] == "Data Analyst"
    assert data["overall_score"] > 30.0


def test_ats_history_and_latest_endpoints(client: TestClient, db_session: Session):
    headers, user_id = _create_test_user_and_token(
        client, db_session, email="history_ats@example.com"
    )

    # Initially GET /latest should return null
    init_latest = client.get("/api/v1/ats/latest", headers=headers)
    assert init_latest.status_code == 200
    assert init_latest.json() is None

    # Score a resume
    client.post(
        "/api/v1/ats/score-text",
        headers=headers,
        json={"resume_text": SAMPLE_RESUME_TEXT, "target_role": "Data Analyst"},
    )

    # Latest should now return record
    latest_resp = client.get("/api/v1/ats/latest", headers=headers)
    assert latest_resp.status_code == 200
    latest_data = latest_resp.json()
    assert latest_data["target_role"] == "Data Analyst"

    # History should contain 1 item
    hist_resp = client.get("/api/v1/ats/history", headers=headers)
    assert hist_resp.status_code == 200
    history = hist_resp.json()
    assert len(history) == 1
    assert history[0]["id"] == latest_data["id"]


def test_ats_invalid_file_handling(client: TestClient, db_session: Session):
    headers, _ = _create_test_user_and_token(
        client, db_session, email="invalid_ats@example.com"
    )

    # Empty file
    resp_empty = client.post(
        "/api/v1/ats/score-file",
        headers=headers,
        files={"file": ("empty.pdf", b"", "application/pdf")},
    )
    assert resp_empty.status_code == 400

    # Unsupported extension
    resp_unsupported = client.post(
        "/api/v1/ats/score-file",
        headers=headers,
        files={"file": ("malicious.exe", b"executable content", "application/octet-stream")},
    )
    assert resp_unsupported.status_code == 400


def test_ats_unauthorized(client: TestClient):
    resp = client.get("/api/v1/ats/latest")
    assert resp.status_code == 401

    resp_post = client.post("/api/v1/ats/score-latest")
    assert resp_post.status_code == 401


def test_ats_tenant_isolation(client: TestClient, db_session: Session):
    headers_a, user_a_id = _create_test_user_and_token(
        client, db_session, email="tenant_a@example.com"
    )
    headers_b, user_b_id = _create_test_user_and_token(
        client, db_session, email="tenant_b@example.com"
    )

    # User A scores a resume
    client.post(
        "/api/v1/ats/score-text",
        headers=headers_a,
        json={"resume_text": SAMPLE_RESUME_TEXT, "target_role": "Data Analyst"},
    )

    # User B should have no ATS history or latest evaluation
    latest_b = client.get("/api/v1/ats/latest", headers=headers_b)
    assert latest_b.status_code == 200
    assert latest_b.json() is None

    hist_b = client.get("/api/v1/ats/history", headers=headers_b)
    assert hist_b.status_code == 200
    assert len(hist_b.json()) == 0

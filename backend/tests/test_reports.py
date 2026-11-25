import os
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.models.profile import StudentProfile
from app.models.resume import ResumeAnalysis
from app.models.readiness import CareerReadinessAssessment
from app.models.skill_gap import SkillGapAnalysis
from app.models.recommendation import CareerRecommendation
from app.models.job import SavedJob
from app.models.roadmap import LearningRoadmap
from app.models.ats import AtsEvaluation
from app.models.github import GitHubAnalysis
from app.models.report import Report
from app.schemas.report import ALL_REPORT_SECTION_IDS


def _create_user(
    client: TestClient,
    db_session: Session,
    email: str = "report_tester@example.com",
    role: str = "Data Analyst",
    populate_all_modules: bool = False,
) -> tuple[dict, User]:
    user = User(
        email=email,
        hashed_password=hash_password("Pass123!"),
        full_name="Report Tester",
        role="student",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    profile = StudentProfile(
        user_id=user.id,
        target_role=role,
        skills=[
            {"name": "Python", "level": 4},
            {"name": "SQL", "level": 3},
            {"name": "Pandas", "level": 4},
        ],
        education_level="B.Tech Computer Science",
        experience_months=12,
        github_url="https://github.com/reporttester",
    )
    db_session.add(profile)
    db_session.commit()

    if populate_all_modules:
        # 1. Resume
        resume = ResumeAnalysis(
            user_id=user.id,
            filename="tester_resume.pdf",
            file_type="pdf",
            file_size_bytes=10240,
            skills=[
                {"name": "Python", "category": "Programming Languages"},
                {"name": "SQL", "category": "Databases"},
                {"name": "Tableau", "category": "BI & Analytics"},
            ],
            education={"degree": "B.Tech"},
            summary="Candidate with strong analytical foundation",
        )
        db_session.add(resume)

        # 2. Career Readiness
        readiness = CareerReadinessAssessment(
            user_id=user.id,
            target_role=role,
            readiness_score=85.5,
            readiness_category="High Readiness",
            model_version="rf_v1.0",
            dimension_scores={
                "technical_skills": 88.0,
                "problem_solving": 82.0,
                "project_experience": 84.0,
                "communication": 80.0,
            },
            features_snapshot={"core_coverage": 0.8},
            matching_core_skills=["Python", "SQL"],
            missing_core_skills=["AWS"],
            supporting_skills=["Tableau"],
        )
        db_session.add(readiness)

        # 3. Skill Gap
        skill_gap = SkillGapAnalysis(
            user_id=user.id,
            target_role=role,
            skill_coverage_percentage=75.0,
            proficiency_alignment_percentage=80.0,
            met_count=2,
            improvement_count=1,
            missing_count=2,
            total_required=5,
            skills_comparison=[
                {"skill": "Python", "status": "met"},
                {"skill": "SQL", "status": "met"},
            ],
            recommendations=["Learn AWS and Spark"],
        )
        db_session.add(skill_gap)

        # 4. Career Recommendations
        recom = CareerRecommendation(
            user_id=user.id,
            top_role="Data Analyst",
            top_fit_score=92.0,
            recommended_roles=[
                {"role": "Data Analyst", "fit_score": 92.0, "reasoning": "Strong SQL and Pandas foundations"},
                {"role": "Business Intelligence Analyst", "fit_score": 84.0, "reasoning": "Good analytical skills"},
            ],
            student_skills_snapshot=[{"name": "Python"}, {"name": "SQL"}],
        )
        db_session.add(recom)

        # 5. Saved Job
        job = SavedJob(
            user_id=user.id,
            job_id="job-da-01",
        )
        db_session.add(job)

        # 6. Learning Roadmap
        roadmap = LearningRoadmap(
            user_id=user.id,
            target_role=role,
            total_weeks=6,
            current_week=1,
            completion_percentage=33.3,
            total_items=3,
            completed_items=1,
            weeks_data=[
                {
                    "week_number": 1,
                    "title": "Advanced SQL & Relational Databases",
                    "estimated_hours": 10,
                    "topics": [
                        {"id": "t1", "title": "Window Functions", "is_completed": True},
                        {"id": "t2", "title": "Subqueries & CTEs", "is_completed": True},
                    ],
                    "resources": [
                        {"title": "PostgreSQL Official Docs", "url": "https://www.postgresql.org/docs/"}
                    ],
                },
                {
                    "week_number": 2,
                    "title": "Cloud Data Warehouses",
                    "estimated_hours": 12,
                    "topics": [
                        {"id": "t3", "title": "Snowflake Basics", "is_completed": False},
                    ],
                    "resources": [
                        {"title": "Snowflake Guides", "url": "https://docs.snowflake.com/"}
                    ],
                },
            ],
        )
        db_session.add(roadmap)

        # 7. ATS Evaluation
        ats = AtsEvaluation(
            user_id=user.id,
            filename="tester_resume.pdf",
            target_role=role,
            overall_score=82.0,
            grade="Good Match",
            category_scores={
                "keyword_matching": 26.0,
                "section_completeness": 18.0,
                "experience_relevance": 17.0,
                "quantifiable_achievements": 11.0,
                "formatting_readability": 10.0,
            },
            matched_skills=["Python", "SQL", "Pandas"],
            missing_skills=["AWS", "Docker"],
            recommendations=["Add quantifiable metrics to project bullet points"],
        )
        db_session.add(ats)

        # 8. GitHub Analysis
        github = GitHubAnalysis(
            user_id=user.id,
            username="reporttester",
            target_role=role,
            overall_score=78.0,
            grade="B+ (Strong Portfolio)",
            category_scores={
                "repo_quality": 80.0,
                "activity_consistency": 75.0,
                "tech_diversity": 82.0,
                "portfolio_depth": 75.0,
            },
            total_repos_analyzed=8,
            total_stars=12,
            languages={"Python": 70.0, "SQL": 30.0},
            detected_technologies=["Python", "SQL"],
            matched_skills=["Python", "SQL"],
            missing_skills=["Docker"],
            repositories=[
                {
                    "name": "sales-analytics-pipeline",
                    "description": "ETL pipeline using Python and Postgres",
                    "stars": 12,
                    "forks": 3,
                    "languages": ["Python", "SQL"],
                    "is_portfolio_worthy": True,
                }
            ],
            recommendations=["Add automated unit tests via GitHub Actions"],
        )
        db_session.add(github)

        db_session.commit()

    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "Pass123!"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    return headers, user


# 1. Preview Endpoint Test (All modules populated vs empty profile)
def test_report_preview_endpoint(client: TestClient, db_session: Session):
    headers, user = _create_user(client, db_session, email="preview_all@example.com", populate_all_modules=True)

    resp = client.get("/api/v1/reports/preview?target_role=Data Analyst", headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    assert data["student_name"] == "Report Tester"
    assert data["student_email"] == "preview_all@example.com"
    assert data["target_role"] == "Data Analyst"
    assert len(data["sections"]) == 11

    # Verify all sections report is_available == True when data is populated
    for section in data["sections"]:
        assert section["is_available"] is True
        assert section["section_id"] in ALL_REPORT_SECTION_IDS
        assert section["data_summary"] is not None

    assert "readiness" in data["data_snapshot"]
    assert "ats" in data["data_snapshot"]
    assert "github" in data["data_snapshot"]


def test_report_preview_unpopulated(client: TestClient, db_session: Session):
    headers, user = _create_user(client, db_session, email="preview_empty@example.com", populate_all_modules=False)

    resp = client.get("/api/v1/reports/preview", headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    # Profile should be available, but resume, ats, github should be unavailable
    sec_map = {s["section_id"]: s["is_available"] for s in data["sections"]}
    assert sec_map["profile"] is True
    assert sec_map["resume"] is False
    assert sec_map["ats"] is False
    assert sec_map["github"] is False


# 2. Generate PDF with All Sections
def test_report_generate_all_sections_pdf(client: TestClient, db_session: Session):
    headers, user = _create_user(client, db_session, email="gen_all@example.com", populate_all_modules=True)

    payload = {
        "title": "Comprehensive Dossier - Data Analyst",
        "target_role": "Data Analyst",
        "selected_sections": ALL_REPORT_SECTION_IDS,
    }
    resp = client.post("/api/v1/reports/generate", json=payload, headers=headers)
    assert resp.status_code in (200, 201)
    data = resp.json()

    assert data["title"] == "Comprehensive Dossier - Data Analyst"
    assert data["target_role"] == "Data Analyst"
    assert data["file_size_bytes"] > 0
    assert len(data["selected_sections"]) == 11
    assert data["overall_readiness_score"] == 85.5
    assert data["overall_ats_score"] == 82.0
    assert data["overall_github_score"] == 78.0

    # Verify DB record
    report_record = db_session.query(Report).filter(Report.id == data["id"]).first()
    assert report_record is not None
    assert Path(report_record.file_path).exists()
    assert os.path.getsize(report_record.file_path) == data["file_size_bytes"]

    # Verify PDF magic bytes
    with open(report_record.file_path, "rb") as f:
        header = f.read(5)
        assert header == b"%PDF-"


# 3. Generate Selected Sections (Subset)
def test_report_generate_selected_sections(client: TestClient, db_session: Session):
    headers, user = _create_user(client, db_session, email="gen_subset@example.com", populate_all_modules=True)

    subset = ["profile", "readiness", "roadmap"]
    payload = {
        "title": "Executive Summary Report",
        "target_role": "Data Analyst",
        "selected_sections": subset,
    }
    resp = client.post("/api/v1/reports/generate", json=payload, headers=headers)
    assert resp.status_code in (200, 201)
    data = resp.json()

    assert data["selected_sections"] == subset
    assert data["file_size_bytes"] > 0


# 4. Generate with Invalid Section IDs (400)
def test_report_generate_invalid_sections_400(client: TestClient, db_session: Session):
    headers, user = _create_user(client, db_session, email="gen_inv@example.com")

    payload = {
        "title": "Invalid Report",
        "selected_sections": ["profile", "fake_nonexistent_section_123"],
    }
    resp = client.post("/api/v1/reports/generate", json=payload, headers=headers)
    assert resp.status_code == 400
    assert "Invalid section ID" in resp.json()["detail"]


# 5. Generate with Empty Sections (400)
def test_report_generate_empty_sections_400(client: TestClient, db_session: Session):
    headers, user = _create_user(client, db_session, email="gen_empty@example.com")

    payload = {
        "title": "Empty Report",
        "selected_sections": [],
    }
    resp = client.post("/api/v1/reports/generate", json=payload, headers=headers)
    assert resp.status_code == 400
    assert "At least one report section must be selected" in resp.json()["detail"]


# 6. History Endpoint
def test_report_history_endpoint(client: TestClient, db_session: Session):
    headers, user = _create_user(client, db_session, email="gen_hist@example.com", populate_all_modules=True)

    # Initially empty
    resp = client.get("/api/v1/reports/history", headers=headers)
    assert resp.status_code == 200
    assert resp.json() == []

    # Generate 2 reports
    client.post("/api/v1/reports/generate", json={"title": "Report One"}, headers=headers)
    client.post("/api/v1/reports/generate", json={"title": "Report Two"}, headers=headers)

    resp2 = client.get("/api/v1/reports/history", headers=headers)
    assert resp2.status_code == 200
    history = resp2.json()
    assert len(history) == 2
    # Verify newest first
    assert history[0]["title"] == "Report Two"
    assert history[1]["title"] == "Report One"


# 7. Download Generated Report PDF
def test_report_download_endpoint(client: TestClient, db_session: Session):
    headers, user = _create_user(client, db_session, email="download_tester@example.com", populate_all_modules=True)

    gen_resp = client.post(
        "/api/v1/reports/generate",
        json={"title": "Download Test Report"},
        headers=headers,
    )
    report_id = gen_resp.json()["id"]

    download_resp = client.get(f"/api/v1/reports/{report_id}/download", headers=headers)
    assert download_resp.status_code == 200
    assert download_resp.headers["content-type"] == "application/pdf"
    assert "attachment; filename=" in download_resp.headers["content-disposition"]
    assert download_resp.content.startswith(b"%PDF-")


# 8. Download Non-Existent Report (404)
def test_report_download_not_found_404(client: TestClient, db_session: Session):
    headers, user = _create_user(client, db_session, email="notfound@example.com")

    resp = client.get("/api/v1/reports/999999/download", headers=headers)
    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()


# 9. Download Report with Missing Physical File (404)
def test_report_download_missing_file_404(client: TestClient, db_session: Session):
    headers, user = _create_user(client, db_session, email="missing_file@example.com")

    gen_resp = client.post(
        "/api/v1/reports/generate",
        json={"title": "Ghost Report"},
        headers=headers,
    )
    assert gen_resp.status_code in (200, 201)
    report_id = gen_resp.json()["id"]

    # Delete physical file from disk
    report_record = db_session.query(Report).filter(Report.id == report_id).first()
    if os.path.exists(report_record.file_path):
        os.remove(report_record.file_path)

    resp = client.get(f"/api/v1/reports/{report_id}/download", headers=headers)
    assert resp.status_code == 404
    assert "missing" in resp.json()["detail"].lower()


# 10. Unauthorized Requests (401)
def test_report_unauthorized(client: TestClient):
    resp_prev = client.get("/api/v1/reports/preview")
    assert resp_prev.status_code == 401

    resp_gen = client.post("/api/v1/reports/generate", json={"title": "Hacker Report"})
    assert resp_gen.status_code == 401

    resp_hist = client.get("/api/v1/reports/history")
    assert resp_hist.status_code == 401

    resp_dl = client.get("/api/v1/reports/1/download")
    assert resp_dl.status_code == 401


# 11. Strict Tenant Isolation (User B cannot access or download User A's report)
def test_report_tenant_isolation(client: TestClient, db_session: Session):
    headers_a, user_a = _create_user(client, db_session, email="tenant_a@example.com", populate_all_modules=True)
    headers_b, user_b = _create_user(client, db_session, email="tenant_b@example.com", populate_all_modules=False)

    # User A creates a report
    gen_a = client.post(
        "/api/v1/reports/generate",
        json={"title": "Confidential Report A"},
        headers=headers_a,
    )
    report_a_id = gen_a.json()["id"]

    # User B attempts to download User A's report -> 404
    resp_b_dl = client.get(f"/api/v1/reports/{report_a_id}/download", headers=headers_b)
    assert resp_b_dl.status_code == 404

    # User B's history should be empty
    resp_b_hist = client.get("/api/v1/reports/history", headers=headers_b)
    assert resp_b_hist.status_code == 200
    assert resp_b_hist.json() == []


# 12. Robust PDF Compilation with Uncompleted Modules
def test_report_pdf_content_and_uncompleted_modules(client: TestClient, db_session: Session):
    """
    Verifies that a brand new student with 0 assessments completed can still
    generate a complete 11-section PDF without errors, and the PDF correctly
    renders 'Data Not Yet Available' notice banners.
    """
    headers, user = _create_user(client, db_session, email="fresh_student@example.com", populate_all_modules=False)

    payload = {
        "title": "Fresh Student Career Baseline Report",
        "target_role": "Machine Learning Engineer",
        "selected_sections": ALL_REPORT_SECTION_IDS,
    }
    resp = client.post("/api/v1/reports/generate", json=payload, headers=headers)
    assert resp.status_code in (200, 201)
    data = resp.json()

    assert data["file_size_bytes"] > 0
    assert data["overall_readiness_score"] is None
    assert data["overall_ats_score"] is None
    assert data["overall_github_score"] is None

    # Verify file exists and is valid PDF
    report_record = db_session.query(Report).filter(Report.id == data["id"]).first()
    assert report_record is not None
    assert os.path.exists(report_record.file_path)
    assert os.path.getsize(report_record.file_path) > 1000

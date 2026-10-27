import pytest
from fastapi.testclient import TestClient
from app.services.job_matching_service import (
    calculate_job_match,
    get_job_by_id,
    get_job_catalog,
    match_jobs_for_candidate,
)


@pytest.fixture
def auth_headers(client: TestClient) -> dict:
    """Register and authenticate test student."""
    res = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "JobMatch Student",
            "email": "job_student@example.com",
            "password": "Password123!",
        },
    )
    assert res.status_code == 201
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def second_auth_headers(client: TestClient) -> dict:
    """Register second user to test tenant isolation."""
    res = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Second Job Student",
            "email": "job_student2@example.com",
            "password": "Password123!",
        },
    )
    assert res.status_code == 201
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ── 1. Service Logic & Calculation Tests ─────────────────────────────────────

def test_curated_dataset_structure():
    """Verify curated dataset contains required roles and academic sample labelling."""
    jobs = get_job_catalog()
    assert len(jobs) >= 5

    categories = {j["role_category"] for j in jobs}
    assert "Data Analyst" in categories
    assert "Python Developer" in categories
    assert "Machine Learning Engineer" in categories
    assert "Full Stack Developer" in categories
    assert "Cloud Engineer" in categories

    for j in jobs:
        assert j["is_sample"] is True
        assert "[academic sample]" in j["company"].lower()
        assert len(j["required_skills"]) > 0
        assert j["location_type"] in ["Remote", "Hybrid", "On-site"]
        assert j["source_attribution"] != ""


def test_calculate_job_match_full_skills():
    """Candidate with all required skills at or above benchmark level gets high match score."""
    job = get_job_by_id("job-py-01")
    assert job is not None

    # Required skills for job-py-01: Python (4), FastAPI (3), SQL (3), Git (3)
    skills = [
        {"name": "Python", "level": 4},
        {"name": "FastAPI", "level": 4},
        {"name": "SQL", "level": 3},
        {"name": "Git", "level": 3},
        {"name": "Docker", "level": 3},  # Preferred skill
    ]

    res = calculate_job_match(
        job=job,
        candidate_skills=skills,
        target_role="Python Developer",
        experience_months=6,
    )

    assert res["match_score"] >= 80.0
    assert res["match_grade"] == "High Match"
    assert len(res["matching_skills"]) >= 4
    assert len(res["missing_required_skills"]) == 0
    assert res["score_breakdown"]["required_skills_score"] == 70.0


def test_calculate_job_match_empty_profile():
    """Candidate with zero skills receives 0.0 match score and all required skills missing."""
    job = get_job_by_id("job-da-01")
    assert job is not None

    res = calculate_job_match(
        job=job,
        candidate_skills=[],
        target_role="Data Analyst",
        experience_months=0,
    )

    assert res["match_score"] == 0.0
    assert res["match_grade"] == "Emerging Match"
    assert len(res["matching_skills"]) == 0
    assert len(res["missing_required_skills"]) == len(job["required_skills"])


def test_calculate_job_match_partial_skills_and_gaps():
    """Candidate with partial skills has gaps accurately identified."""
    job = get_job_by_id("job-da-01")
    assert job is not None
    # Required: SQL (3), Excel (3), Power BI (3)
    # Candidate only has SQL at level 2 (deficit of 1)
    skills = [
        {"name": "SQL", "level": 2},
    ]

    res = calculate_job_match(
        job=job,
        candidate_skills=skills,
        target_role="Data Analyst",
        experience_months=0,
    )

    assert 0.0 < res["match_score"] < 50.0
    # SQL should be in matching (partially) and missing_required (deficit)
    assert any(m["name"] == "SQL" for m in res["matching_skills"])
    sql_gap = next(g for g in res["missing_required_skills"] if g["name"] == "SQL")
    assert sql_gap["gap"] == 1

    # Excel and Power BI should be completely missing
    missing_names = {g["name"] for g in res["missing_required_skills"]}
    assert "Excel" in missing_names
    assert "Power BI" in missing_names


def test_match_jobs_ranking_and_filters():
    """Candidate with Data Analyst skills ranks Data Analyst jobs higher than ML jobs."""
    skills = [
        {"name": "SQL", "level": 4},
        {"name": "Excel", "level": 4},
        {"name": "Power BI", "level": 3},
        {"name": "Python", "level": 2},
    ]

    results = match_jobs_for_candidate(
        candidate_skills=skills,
        target_role="Data Analyst",
    )

    assert len(results) >= 5
    # First result should be a Data Analyst role
    assert results[0]["role_category"] == "Data Analyst"
    assert results[0]["rank"] == 1

    # Test category filter
    da_only = match_jobs_for_candidate(candidate_skills=skills, role_filter="Data Analyst")
    assert all(j["role_category"] == "Data Analyst" for j in da_only)

    # Test location type filter
    remote_only = match_jobs_for_candidate(candidate_skills=skills, location_type_filter="Remote")
    assert all(j["location_type"] == "Remote" for j in remote_only)


# ── 2. Authenticated API Endpoint Tests ───────────────────────────────────────

def test_vacancies_public_endpoint(client: TestClient):
    """GET /api/v1/jobs/vacancies returns all curated vacancies."""
    res = client.get("/api/v1/jobs/vacancies")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    assert len(data) >= 5
    assert all(j["is_sample"] is True for j in data)


def test_match_endpoint_authenticated(client: TestClient, auth_headers: dict):
    """GET /api/v1/jobs/match returns ranked jobs with transparent match breakdown."""
    # Setup profile skills
    profile_payload = {
        "headline": "Junior Python Dev",
        "target_role": "Python Developer",
        "skills": [
            {"name": "Python", "level": 4},
            {"name": "FastAPI", "level": 3},
            {"name": "SQL", "level": 3},
            {"name": "Git", "level": 3},
        ],
    }
    client.put("/api/v1/profile/me", json=profile_payload, headers=auth_headers)

    res = client.get("/api/v1/jobs/match", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()

    assert data["total_matched"] >= 5
    assert data["candidate_skills_count"] >= 4
    top_match = data["matches"][0]
    assert top_match["role_category"] == "Python Developer"
    assert top_match["match_score"] >= 70.0
    assert "score_breakdown" in top_match
    assert "formula" in top_match["score_breakdown"]
    assert "disclaimer" in top_match


def test_get_single_job_detail(client: TestClient, auth_headers: dict):
    """GET /api/v1/jobs/{job_id} returns individual job with personalized score."""
    res = client.get("/api/v1/jobs/job-py-01", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == "job-py-01"
    assert "match_score" in data
    assert "matching_skills" in data


def test_save_and_unsave_job(client: TestClient, auth_headers: dict):
    """POST /save and DELETE /save manage bookmarks."""
    # Initially 0 saved
    res_list = client.get("/api/v1/jobs/saved", headers=auth_headers)
    assert res_list.status_code == 200
    assert len(res_list.json()) == 0

    # Save job
    save_res = client.post("/api/v1/jobs/save/job-py-01", headers=auth_headers)
    assert save_res.status_code == 200
    assert save_res.json()["is_saved"] is True

    # Check saved list
    res_saved = client.get("/api/v1/jobs/saved", headers=auth_headers)
    assert res_saved.status_code == 200
    saved_items = res_saved.json()
    assert len(saved_items) == 1
    assert saved_items[0]["job_id"] == "job-py-01"

    # Match endpoint should flag job as saved
    match_res = client.get("/api/v1/jobs/match", headers=auth_headers)
    job_py_01 = next(j for j in match_res.json()["matches"] if j["id"] == "job-py-01")
    assert job_py_01["is_saved"] is True

    # Unsave job
    del_res = client.delete("/api/v1/jobs/save/job-py-01", headers=auth_headers)
    assert del_res.status_code == 200
    assert del_res.json()["is_saved"] is False

    # Check saved list empty again
    res_empty = client.get("/api/v1/jobs/saved", headers=auth_headers)
    assert len(res_empty.json()) == 0


def test_jobs_unauthorized(client: TestClient):
    """Protected endpoints require valid auth token."""
    assert client.get("/api/v1/jobs/match").status_code == 401
    assert client.get("/api/v1/jobs/saved").status_code == 401
    assert client.post("/api/v1/jobs/save/job-py-01").status_code == 401
    assert client.delete("/api/v1/jobs/save/job-py-01").status_code == 401


def test_jobs_tenant_isolation(
    client: TestClient, auth_headers: dict, second_auth_headers: dict
):
    """User 1's saved jobs must be isolated from User 2."""
    # User 1 saves job-da-01
    client.post("/api/v1/jobs/save/job-da-01", headers=auth_headers)

    # User 1 has 1 saved job
    u1_saved = client.get("/api/v1/jobs/saved", headers=auth_headers).json()
    assert len(u1_saved) == 1
    assert u1_saved[0]["job_id"] == "job-da-01"

    # User 2 saved list must be 0
    u2_saved = client.get("/api/v1/jobs/saved", headers=second_auth_headers).json()
    assert len(u2_saved) == 0

    # User 2 unsaving job-da-01 should say it was not saved
    u2_del = client.delete("/api/v1/jobs/save/job-da-01", headers=second_auth_headers).json()
    assert u2_del["is_saved"] is False

    # User 1's saved job is still intact
    u1_check = client.get("/api/v1/jobs/saved", headers=auth_headers).json()
    assert len(u1_check) == 1

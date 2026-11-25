"""
Comprehensive unit and integration tests for external job providers:
Adzuna, Remotive, Arbeitnow, Orchestrator Service, 42-Role Mapping, and 5-Factor Scoring.
All external HTTP requests are mocked so tests run 100% offline.
"""
from typing import Any, Dict, List
from unittest.mock import AsyncMock, MagicMock, patch
import httpx
import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from app.services.job_providers.adzuna_provider import AdzunaJobProvider
from app.services.job_providers.arbeitnow_provider import ArbeitnowJobProvider
from app.services.job_providers.base import NormalizedJob, clean_html_text, is_valid_http_url
from app.services.job_providers.job_provider_service import JobProviderService, get_job_provider_service
from app.services.job_providers.matcher_utils import (
    extract_skills_from_job,
    generate_linkedin_search_url,
    map_job_to_catalog_role,
)
from app.services.job_providers.remotive_provider import RemotiveJobProvider
from app.services.job_matching_service import calculate_job_match, match_jobs_for_candidate


@pytest.fixture
def auth_headers(client: TestClient) -> dict:
    """Register and authenticate test student."""
    res = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "JobProvider Student",
            "email": "provider_test_user@example.com",
            "password": "Password123!",
        },
    )
    assert res.status_code == 201
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ── 1. Helper Utilities Tests ───────────────────────────────────────────────

def test_clean_html_text():
    html_sample = "<p>Join our team as a <strong>Senior Developer</strong>.<br>Required: Python &amp; FastAPI.</p>"
    cleaned = clean_html_text(html_sample)
    assert "<p>" not in cleaned
    assert "<strong>" not in cleaned
    assert "&amp;" not in cleaned
    assert "Senior Developer" in cleaned
    assert "Python & FastAPI" in cleaned


def test_is_valid_http_url():
    assert is_valid_http_url("https://remotive.com/job/123") is True
    assert is_valid_http_url("http://example.com") is True
    assert is_valid_http_url("ftp://example.com") is False
    assert is_valid_http_url("javascript:alert(1)") is False
    assert is_valid_http_url("") is False
    assert is_valid_http_url(None) is False


def test_generate_linkedin_search_url():
    url = generate_linkedin_search_url("Python Developer", "Bangalore, India")
    assert "https://www.linkedin.com/jobs/search/?" in url
    assert "keywords=Python+Developer" in url or "keywords=Python%20Developer" in url
    assert "location=Bangalore%2C+India" in url or "location=Bangalore%2C%20India" in url


# ── 2. 42-Role Catalog Mapping & Skill Extraction Tests ─────────────────────

def test_map_job_to_catalog_role_exact_and_fuzzy():
    # Exact title
    role1 = map_job_to_catalog_role("Junior Python Developer", "Building REST APIs with FastAPI")
    assert role1["id"] == "python-developer"

    # Data Analyst role
    role2 = map_job_to_catalog_role("BI Reporting Analyst", "SQL queries and Power BI visual dashboards")
    assert role2["id"] in ["data-analyst", "business-intelligence-analyst"]

    # Cloud Engineer role
    role3 = map_job_to_catalog_role("AWS Infrastructure Specialist", "Terraform, ECS, S3, cloud deployments")
    assert role3["category"] == "Cloud and DevOps"


def test_extract_skills_from_job():
    title = "Associate Backend Engineer"
    desc = "We build microservices using Python and PostgreSQL. Docker containers and Git workflow required."
    tags = ["python", "docker", "fastapi"]

    req_skills, pref_skills = extract_skills_from_job(title, desc, tags)
    req_names = {s["name"].lower() for s in req_skills}

    assert len(req_skills) >= 2
    assert "python" in req_names
    for s in req_skills:
        assert s["min_level"] >= 1


# ── 3. Remotive Provider Tests ──────────────────────────────────────────────

@pytest.mark.anyio
async def test_remotive_provider_status_and_fetch():
    provider = RemotiveJobProvider()
    status = provider.get_status()
    assert status["configured"] is True
    assert status["active"] is True
    assert "Remotive" in status["terms_attribution"]

    mock_remotive_payload = {
        "job-count": 1,
        "jobs": [
            {
                "id": 998877,
                "url": "https://remotive.com/remote-jobs/software-dev/python-dev-998877",
                "title": "Remote Python Developer",
                "company_name": "Acme Cloud Corp",
                "category": "Software Development",
                "tags": ["python", "fastapi", "sql"],
                "job_type": "full_time",
                "publication_date": "2026-02-20T10:00:00",
                "candidate_required_location": "Worldwide",
                "salary": "$90,000",
                "description": "<p>Looking for a Python Developer with FastAPI and Git skills.</p>",
            }
        ],
    }

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = mock_remotive_payload

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_resp
        jobs = await provider.fetch_jobs(query="python", limit=5)

    assert len(jobs) == 1
    job = jobs[0]
    assert job.id == "remotive-998877"
    assert job.source == "remotive"
    assert job.title == "Remote Python Developer"
    assert job.company == "Acme Cloud Corp"
    assert job.is_remote is True
    assert job.attribution_text == "Powered by Remotive"
    assert "<p>" not in job.description


@pytest.mark.anyio
async def test_remotive_provider_timeout_handling():
    provider = RemotiveJobProvider()
    with patch("httpx.AsyncClient.get", side_effect=httpx.TimeoutException("Timeout")):
        jobs = await provider.fetch_jobs(query="python")
    assert jobs == []


# ── 4. Arbeitnow Provider Tests ─────────────────────────────────────────────

@pytest.mark.anyio
async def test_arbeitnow_provider_status_and_fetch():
    provider = ArbeitnowJobProvider()
    status = provider.get_status()
    assert status["configured"] is True
    assert status["active"] is True
    assert "Arbeitnow" in status["terms_attribution"]

    mock_arbeitnow_payload = {
        "data": [
            {
                "slug": "data-analyst-berlin-123",
                "company_name": "Berlin Analytics GmbH",
                "title": "Junior Data Analyst",
                "description": "<p>Analyze data sets with SQL, Tableau, and Excel.</p>",
                "remote": True,
                "url": "https://www.arbeitnow.com/view/data-analyst-berlin-123",
                "tags": ["SQL", "Tableau", "Excel"],
                "job_types": ["Full Time"],
                "location": "Berlin",
                "created_at": 1740000000,
            }
        ]
    }

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = mock_arbeitnow_payload

    with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
        mock_get.return_value = mock_resp
        jobs = await provider.fetch_jobs(query="data analyst", limit=5)

    assert len(jobs) == 1
    job = jobs[0]
    assert job.id == "arbeitnow-data-analyst-berlin-123"
    assert job.source == "arbeitnow"
    assert job.title == "Junior Data Analyst"
    assert job.is_remote is True
    assert job.attribution_text == "Powered by Arbeitnow"


@pytest.mark.anyio
async def test_arbeitnow_provider_error_handling():
    provider = ArbeitnowJobProvider()
    with patch("httpx.AsyncClient.get", side_effect=httpx.HTTPError("Server Error")):
        jobs = await provider.fetch_jobs(query="react")
    assert jobs == []


# ── 5. Adzuna Provider Tests ────────────────────────────────────────────────

def test_adzuna_provider_status_no_creds():
    with patch.object(settings, "ADZUNA_APP_ID", None), patch.object(settings, "ADZUNA_APP_KEY", None):
        provider = AdzunaJobProvider()
        status = provider.get_status()
        assert status["configured"] is False
        assert status["active"] is False
        assert status["requires_credentials"] is True
        assert "not configured" in status["message"].lower()


@pytest.mark.anyio
async def test_adzuna_provider_fetch_mocked():
    with patch.object(settings, "ADZUNA_APP_ID", "mock_app_id"), patch.object(settings, "ADZUNA_APP_KEY", "mock_key"):
        provider = AdzunaJobProvider()
        status = provider.get_status()
        assert status["configured"] is True
        assert status["active"] is True

        mock_adzuna_payload = {
            "results": [
                {
                    "id": "77665544",
                    "title": "Software Engineer (Python/FastAPI)",
                    "company": {"display_name": "Bangalore Tech Labs"},
                    "description": "Design backend REST APIs using Python, SQLAlchemy and PostgreSQL.",
                    "location": {"display_name": "Bangalore, India"},
                    "salary_min": 600000,
                    "salary_max": 900000,
                    "created": "2026-02-21T12:00:00Z",
                    "redirect_url": "https://www.adzuna.com/land/ad/77665544",
                    "category": {"label": "IT Jobs"},
                    "contract_time": "full_time",
                }
            ]
        }

        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = mock_adzuna_payload

        with patch("httpx.AsyncClient.get", new_callable=AsyncMock) as mock_get:
            mock_get.return_value = mock_resp
            jobs = await provider.fetch_jobs(query="software engineer", limit=5)

        assert len(jobs) == 1
        job = jobs[0]
        assert job.id == "adzuna-77665544"
        assert job.source == "adzuna"
        assert job.company == "Bangalore Tech Labs"
        assert job.salary_min == 600000
        assert job.currency == "INR"
        assert job.attribution_text == "Jobs by Adzuna"


@pytest.mark.anyio
async def test_adzuna_provider_rate_limit_and_unconfigured():
    # If creds missing, returns empty immediately
    with patch.object(settings, "ADZUNA_APP_ID", None):
        provider = AdzunaJobProvider()
        jobs = await provider.fetch_jobs()
        assert jobs == []

    # If rate limited (HTTP 429), returns empty list cleanly
    with patch.object(settings, "ADZUNA_APP_ID", "id"), patch.object(settings, "ADZUNA_APP_KEY", "key"):
        provider = AdzunaJobProvider()
        mock_resp = MagicMock()
        mock_resp.status_code = 429
        with patch("httpx.AsyncClient.get", new_callable=AsyncMock, return_value=mock_resp):
            jobs = await provider.fetch_jobs()
            assert jobs == []


# ── 6. JobProviderService (Orchestrator, Caching, Deduplication) ─────────────

@pytest.mark.anyio
async def test_job_provider_service_deduplication_and_caching():
    svc = JobProviderService()
    svc.clear_cache()

    # Create two duplicate jobs from different sources
    job1 = NormalizedJob(
        id="remotive-1",
        source="remotive",
        external_id="1",
        title="Full Stack Developer",
        company="GlobalTech Inc",
        description="Python and React full stack developer.",
        location="Remote",
        location_type="Remote",
        is_remote=True,
        employment_type="Full-time",
        application_url="https://remotive.com/1",
        attribution_text="Remotive",
    )
    job2 = NormalizedJob(
        id="arbeitnow-2",
        source="arbeitnow",
        external_id="2",
        title="Full Stack Developer",
        company="GlobalTech Inc",  # Same title & company -> deduplication target
        description="Python and React full stack developer.",
        location="Remote",
        location_type="Remote",
        is_remote=True,
        employment_type="Full-time",
        application_url="https://arbeitnow.com/2",
        attribution_text="Arbeitnow",
    )

    with patch.object(svc.providers["remotive"], "fetch_jobs", new_callable=AsyncMock, return_value=[job1]), \
         patch.object(svc.providers["arbeitnow"], "fetch_jobs", new_callable=AsyncMock, return_value=[job2]), \
         patch.object(svc.providers["adzuna"], "fetch_jobs", new_callable=AsyncMock, return_value=[]):

        results = await svc.fetch_live_jobs(query="developer", force_refresh=True)

        # Deduplication should keep only 1 instance
        assert len(results) == 1
        assert results[0].id == "remotive-1"

        # Subsequent fetch within TTL should hit cache
        with patch.object(svc.providers["remotive"], "fetch_jobs", new_callable=AsyncMock) as spy_fetch:
            cached_results = await svc.fetch_live_jobs(query="developer", force_refresh=False)
            assert len(cached_results) == 1
            spy_fetch.assert_not_called()

        # Job should be accessible via get_job_by_id
        looked_up = svc.get_job_by_id("remotive-1")
        assert looked_up is not None
        assert looked_up.title == "Full Stack Developer"


# ── 7. 5-Factor Scoring Model Tests ──────────────────────────────────────────

def test_five_factor_scoring_calculation():
    job = {
        "id": "test-job-01",
        "title": "Junior Python Developer",
        "company": "Tech Corp",
        "role_category": "Python Developer",
        "matched_role_name": "Python Developer",
        "matched_role_id": "python-developer",
        "location": "Remote",
        "location_type": "Remote",
        "is_remote": True,
        "is_sample": False,
        "required_skills": [
            {"name": "Python", "min_level": 4},
            {"name": "FastAPI", "min_level": 3},
        ],
        "preferred_skills": [
            {"name": "Docker", "min_level": 2},
        ],
    }

    # Candidate with complete required skills
    candidate_skills = [
        {"name": "Python", "level": 4},
        {"name": "FastAPI", "level": 3},
        {"name": "Docker", "level": 2},
    ]

    res = calculate_job_match(
        job=job,
        candidate_skills=candidate_skills,
        target_role="Python Developer",
        experience_months=12,
        candidate_education="B.Tech Computer Science",
        candidate_degree="B.Tech",
        scoring_model="five_factor",
    )

    score_bd = res["score_breakdown"]
    assert res["match_score"] >= 90.0
    assert res["match_grade"] == "High Match"
    # Required skills max 50 points
    assert score_bd["required_skills_score"] == 50.0
    # Secondary skills max 20 points
    assert score_bd["preferred_skills_score"] == 20.0
    # Experience alignment (12 months = 15 points)
    assert score_bd["experience_score"] == 15.0
    # Education alignment (B.Tech CS = 5.0 points)
    assert score_bd["education_score"] == 5.0
    # Role relevance (Target matches role category = 10.0 points)
    assert score_bd["role_relevance_score"] == 10.0

    # Total should equal 50 + 20 + 15 + 5 + 10 = 100.0
    assert res["match_score"] == 100.0
    assert "Required Skills (50.0 / 50 pts)" in score_bd["formula"]
    assert "linkedin_search_url" in res


# ── 8. API Endpoints Integration Tests ──────────────────────────────────────

def test_get_providers_status_endpoint(client: TestClient):
    res = client.get("/api/v1/jobs/providers")
    assert res.status_code == 200
    data = res.json()
    assert "providers" in data
    assert len(data["providers"]) == 4

    provider_names = {p["name"] for p in data["providers"]}
    assert "remotive" in provider_names
    assert "arbeitnow" in provider_names
    assert "adzuna" in provider_names
    assert "curated" in provider_names


def test_get_live_jobs_endpoint(client: TestClient):
    mock_job = NormalizedJob(
        id="remotive-live-1",
        source="remotive",
        external_id="live-1",
        title="Live Remote Engineer",
        company="LiveCorp",
        description="Great remote opportunities.",
        location="Worldwide",
        location_type="Remote",
        is_remote=True,
        employment_type="Full-time",
        application_url="https://remotive.com/live-1",
        attribution_text="Powered by Remotive",
    )

    with patch.object(
        get_job_provider_service(),
        "fetch_live_jobs",
        new_callable=AsyncMock,
        return_value=[mock_job],
    ):
        res = client.get("/api/v1/jobs/live?search=engineer")
        assert res.status_code == 200
        data = res.json()
        assert len(data) == 1
        assert data[0]["id"] == "remotive-live-1"
        assert data[0]["title"] == "Live Remote Engineer"
        assert data[0]["attribution_text"] == "Powered by Remotive"


def test_matched_jobs_curated_and_live_combined(client: TestClient, auth_headers: dict):
    # Set up candidate profile
    client.put(
        "/api/v1/profile/me",
        json={
            "headline": "Junior Python Dev",
            "target_role": "Python Developer",
            "education_level": "B.Tech Computer Science",
            "skills": [
                {"name": "Python", "level": 4},
                {"name": "FastAPI", "level": 3},
                {"name": "SQL", "level": 3},
                {"name": "Git", "level": 3},
            ],
        },
        headers=auth_headers,
    )

    # 1. Test source_type=curated
    res_curated = client.get("/api/v1/jobs/match?source_type=curated", headers=auth_headers)
    assert res_curated.status_code == 200
    data_curated = res_curated.json()
    assert data_curated["total_matched"] >= 5
    assert all(j["is_sample"] is True for j in data_curated["matches"])

    # 2. Test single job detail with 5-factor scoring
    first_job_id = data_curated["matches"][0]["id"]
    res_detail = client.get(f"/api/v1/jobs/{first_job_id}", headers=auth_headers)
    assert res_detail.status_code == 200
    detail_data = res_detail.json()
    assert detail_data["id"] == first_job_id
    assert "score_breakdown" in detail_data
    assert "experience_score" in detail_data["score_breakdown"]
    assert "education_score" in detail_data["score_breakdown"]
    assert "role_relevance_score" in detail_data["score_breakdown"]

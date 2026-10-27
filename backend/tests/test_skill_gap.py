import pytest
from fastapi.testclient import TestClient
from app.services.skill_gap_service import analyze_skill_gap, ROLE_BENCHMARKS


@pytest.fixture
def auth_headers(client: TestClient) -> dict:
    """Register and authenticate test student."""
    res = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "SkillGap Student",
            "email": "skillgap_test@example.com",
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
            "full_name": "Second Skill Student",
            "email": "skillgap_second@example.com",
            "password": "Password123!",
        },
    )
    assert res.status_code == 201
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ── 1. Skill Gap Service Logic Tests ─────────────────────────────────────────

def test_analyze_skill_gap_categorization():
    # Data Analyst requirements:
    # SQL (req 4), Python (req 4), Excel (req 4), Power BI (req 3), Tableau (req 3), Statistics (req 3)
    candidate_skills = [
        {"name": "SQL", "level": 4},        # Met (4 >= 4)
        {"name": "Python", "level": 2},     # Needs improvement (2 < 4, gap = 2)
        {"name": "Excel", "level": 5},      # Met (5 >= 4)
        {"name": "Pandas", "level": 3},     # Secondary met (3 >= 3)
        # Power BI, Tableau, Statistics are MISSING
    ]

    result = analyze_skill_gap(candidate_skills, "Data Analyst")

    assert result["target_role"] == "Data Analyst"
    assert result["met_count"] >= 3  # SQL, Excel, Pandas
    assert result["improvement_count"] >= 1  # Python
    assert result["missing_count"] >= 3  # Power BI, Tableau, Statistics

    # Find Python item in comparisons
    python_item = next(item for item in result["skills_comparison"] if item["name"] == "Python")
    assert python_item["status"] == "needs_improvement"
    assert python_item["current_level"] == 2
    assert python_item["required_level"] == 4
    assert python_item["gap"] == 2
    assert python_item["priority"] == "high"

    # Find SQL item
    sql_item = next(item for item in result["skills_comparison"] if item["name"] == "SQL")
    assert sql_item["status"] == "met"
    assert sql_item["gap"] == 0

    # Check recommendations order: High priority first
    recs = result["recommendations"]
    assert len(recs) > 0
    assert recs[0]["priority"] == "high"


def test_coverage_and_alignment_calculation():
    # Perfect candidate for Data Analyst
    benchmarks = ROLE_BENCHMARKS["Data Analyst"]
    all_skills = []
    for s in benchmarks["core_skills"] + benchmarks["secondary_skills"]:
        all_skills.append({"name": s["name"], "level": s["required_level"]})

    result = analyze_skill_gap(all_skills, "Data Analyst")
    assert result["skill_coverage_percentage"] == 100.0
    assert result["proficiency_alignment_percentage"] == 100.0
    assert result["missing_count"] == 0
    assert result["improvement_count"] == 0
    assert len(result["recommendations"]) == 0


# ── 2. Authenticated Endpoints ───────────────────────────────────────────────

def test_run_skill_gap_analysis_endpoint(client: TestClient, auth_headers: dict):
    # Setup profile with verified skills
    client.put(
        "/api/v1/profile/me",
        headers=auth_headers,
        json={
            "headline": "Junior Developer",
            "target_role": "Python Developer",
            "skills": [
                {"name": "Python", "level": 4},
                {"name": "Git", "level": 3},     # needs improvement (req 4)
                {"name": "HTML", "level": 3},
            ],
        },
    )

    response = client.post(
        "/api/v1/skill-gap/analyze",
        headers=auth_headers,
        json={"target_role": "Python Developer", "include_resume_skills": False},
    )
    assert response.status_code == 200

    data = response.json()
    assert data["target_role"] == "Python Developer"
    assert 0.0 <= data["skill_coverage_percentage"] <= 100.0
    assert 0.0 <= data["proficiency_alignment_percentage"] <= 100.0
    assert len(data["skills_comparison"]) > 0
    assert len(data["recommendations"]) > 0

    # Verify Git is marked as needing improvement
    git_item = next(item for item in data["skills_comparison"] if item["name"] == "Git")
    assert git_item["status"] == "needs_improvement"
    assert git_item["gap"] == 1


def test_latest_and_history_endpoints(client: TestClient, auth_headers: dict):
    # Post analysis for Data Analyst
    client.post(
        "/api/v1/skill-gap/analyze",
        headers=auth_headers,
        json={"target_role": "Data Analyst"},
    )

    # Post analysis for Machine Learning Engineer
    client.post(
        "/api/v1/skill-gap/analyze",
        headers=auth_headers,
        json={"target_role": "Machine Learning Engineer"},
    )

    # GET /latest
    latest_res = client.get("/api/v1/skill-gap/latest", headers=auth_headers)
    assert latest_res.status_code == 200
    assert latest_res.json()["target_role"] == "Machine Learning Engineer"

    # GET /history
    history_res = client.get("/api/v1/skill-gap/history", headers=auth_headers)
    assert history_res.status_code == 200
    history = history_res.json()
    assert len(history) >= 2
    assert history[0]["target_role"] == "Machine Learning Engineer"


def test_role_definitions_endpoint(client: TestClient):
    response = client.get("/api/v1/skill-gap/roles")
    assert response.status_code == 200

    roles = response.json()
    assert len(roles) == 3
    role_names = [r["role_name"] for r in roles]
    assert "Data Analyst" in role_names
    assert "Python Developer" in role_names
    assert "Machine Learning Engineer" in role_names


# ── 3. Auth Protection and Isolation ─────────────────────────────────────────

def test_skill_gap_auth_protection(client: TestClient):
    # Unauthenticated POST /analyze
    res1 = client.post("/api/v1/skill-gap/analyze", json={"target_role": "Data Analyst"})
    assert res1.status_code == 401

    # Unauthenticated GET /latest
    res2 = client.get("/api/v1/skill-gap/latest")
    assert res2.status_code == 401

    # Unauthenticated GET /history
    res3 = client.get("/api/v1/skill-gap/history")
    assert res3.status_code == 401


def test_skill_gap_tenant_isolation(client: TestClient, auth_headers: dict, second_auth_headers: dict):
    # User 1 runs analysis
    client.post(
        "/api/v1/skill-gap/analyze",
        headers=auth_headers,
        json={"target_role": "Data Analyst"},
    )

    # User 2 checks history (should be empty for User 2)
    history_u2 = client.get("/api/v1/skill-gap/history", headers=second_auth_headers)
    assert history_u2.status_code == 200
    assert len(history_u2.json()) == 0

import pytest
from fastapi.testclient import TestClient
from app.services.recommendation_service import (
    evaluate_career_recommendations,
    get_role_catalog_list,
    ROLE_CATALOG,
)


@pytest.fixture
def auth_headers(client: TestClient) -> dict:
    """Register and authenticate test student."""
    res = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Recommendation Student",
            "email": "rec_student@example.com",
            "password": "Password123!",
        },
    )
    assert res.status_code == 201
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def second_auth_headers(client: TestClient) -> dict:
    """Register second user to verify tenant isolation."""
    res = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Second Rec Student",
            "email": "rec_student2@example.com",
            "password": "Password123!",
        },
    )
    assert res.status_code == 201
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ── 1. Recommendation Engine Service Unit Tests ──────────────────────────────

def test_catalog_contains_required_roles():
    """Verify that Data Analyst, Python Developer, and Machine Learning Engineer are documented in the catalog."""
    catalog = get_role_catalog_list()
    role_names = {item["role_name"] for item in catalog}

    assert "Data Analyst" in role_names
    assert "Python Developer" in role_names
    assert "Machine Learning Engineer" in role_names

    for item in catalog:
        assert len(item["core_skills"]) > 0
        assert len(item["secondary_skills"]) > 0
        assert item["demand_level"] in ["High", "Very High", "Extremely High"]
        assert len(item["description"]) > 20


def test_evaluate_career_recommendations_ranking():
    """Verify that a candidate with heavy Python developer skills ranks Python Developer above ML/Data Analyst."""
    skills = [
        {"name": "Python", "level": 4},
        {"name": "FastAPI", "level": 4},
        {"name": "Git", "level": 4},
        {"name": "SQL", "level": 3},
        {"name": "HTML", "level": 3},
        {"name": "CSS", "level": 3},
        {"name": "JavaScript", "level": 3},
    ]

    recs = evaluate_career_recommendations(
        candidate_skills=skills,
        target_role="Python Developer",
        experience_months=6,
        education_level="BCA",
    )

    assert len(recs) >= 3
    # First ranked role should be Python Developer
    assert recs[0]["role_name"] == "Python Developer"
    assert recs[0]["rank"] == 1
    assert recs[0]["fit_score"] >= 70.0
    assert recs[0]["match_tier"] == "Strong Match"

    # Every recommendation must have required explainability fields
    for r in recs:
        assert "fit_reason" in r
        assert len(r["fit_reason"]) > 10
        assert "matching_skills" in r
        assert "missing_or_weaker_skills" in r
        assert "suggested_next_steps" in r
        assert len(r["suggested_next_steps"]) >= 2
        assert 0.0 <= r["fit_score"] <= 100.0


def test_evaluate_data_analyst_ranking():
    """Verify that a candidate with heavy BI, SQL, and Excel skills ranks Data Analyst highest."""
    skills = [
        {"name": "SQL", "level": 4},
        {"name": "Excel", "level": 4},
        {"name": "Power BI", "level": 4},
        {"name": "Tableau", "level": 3},
        {"name": "Statistics", "level": 3},
        {"name": "Python", "level": 3},
    ]

    recs = evaluate_career_recommendations(
        candidate_skills=skills,
        target_role="Data Analyst",
        experience_months=0,
        education_level="BCA",
    )

    assert recs[0]["role_name"] == "Data Analyst"
    assert recs[0]["fit_score"] > recs[-1]["fit_score"]
    assert any(m["name"] == "SQL" for m in recs[0]["matching_skills"])


# ── 2. Authenticated API Endpoint Tests ───────────────────────────────────────

def test_get_catalog_public(client: TestClient):
    """GET /api/v1/recommendations/catalog returns role catalog."""
    res = client.get("/api/v1/recommendations/catalog")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, list)
    names = [r["role_name"] for r in data]
    assert "Data Analyst" in names
    assert "Python Developer" in names
    assert "Machine Learning Engineer" in names


def test_evaluate_recommendations_endpoint(client: TestClient, auth_headers: dict):
    """POST /api/v1/recommendations/evaluate generates recommendations and persists them."""
    # First set student profile skills
    profile_payload = {
        "headline": "Aspiring ML Engineer",
        "education_level": "BCA Computer Applications",
        "institution": "Tech University",
        "target_role": "Machine Learning Engineer",
        "skills": [
            {"name": "Python", "level": 4},
            {"name": "Scikit-learn", "level": 4},
            {"name": "Pandas", "level": 4},
            {"name": "NumPy", "level": 3},
            {"name": "Machine Learning", "level": 4},
            {"name": "SQL", "level": 3},
        ],
    }
    prof_res = client.put("/api/v1/profile/me", json=profile_payload, headers=auth_headers)
    assert prof_res.status_code == 200

    # Evaluate recommendations
    rec_res = client.post("/api/v1/recommendations/evaluate", json={}, headers=auth_headers)
    assert rec_res.status_code == 200
    rec_data = rec_res.json()

    assert rec_data["top_role"] == "Machine Learning Engineer"
    assert rec_data["top_fit_score"] >= 65.0
    assert rec_data["total_roles_evaluated"] >= 3
    assert len(rec_data["recommendations"]) >= 3
    assert "disclaimer" in rec_data
    assert "hiring" in rec_data["disclaimer"].lower() or "guarantee" in rec_data["disclaimer"].lower()

    # Verify top role explainability
    top_rec = rec_data["recommendations"][0]
    assert top_rec["role_name"] == "Machine Learning Engineer"
    assert len(top_rec["matching_skills"]) >= 3
    assert len(top_rec["suggested_next_steps"]) >= 1


def test_get_latest_recommendations(client: TestClient, auth_headers: dict):
    """GET /api/v1/recommendations/latest retrieves latest evaluation."""
    profile_payload = {
        "headline": "Aspiring ML Engineer",
        "target_role": "Machine Learning Engineer",
        "skills": [
            {"name": "Python", "level": 4},
            {"name": "Scikit-learn", "level": 4},
            {"name": "Pandas", "level": 4},
            {"name": "Machine Learning", "level": 4},
        ],
    }
    client.put("/api/v1/profile/me", json=profile_payload, headers=auth_headers)
    client.post("/api/v1/recommendations/evaluate", json={}, headers=auth_headers)

    res = client.get("/api/v1/recommendations/latest", headers=auth_headers)
    assert res.status_code == 200
    data = res.json()
    assert data["top_role"] == "Machine Learning Engineer"
    assert len(data["recommendations"]) >= 3


def test_get_recommendation_history(client: TestClient, auth_headers: dict):
    """GET /api/v1/recommendations/history returns history entries."""
    # Run evaluation
    client.post("/api/v1/recommendations/evaluate", json={}, headers=auth_headers)

    res = client.get("/api/v1/recommendations/history", headers=auth_headers)
    assert res.status_code == 200
    history = res.json()
    assert isinstance(history, list)
    assert len(history) >= 1
    assert "top_role" in history[0]
    assert "top_fit_score" in history[0]


def test_recommendations_unauthorized(client: TestClient):
    """Endpoints require valid authentication."""
    res = client.post("/api/v1/recommendations/evaluate", json={})
    assert res.status_code == 401

    res = client.get("/api/v1/recommendations/latest")
    assert res.status_code == 401

    res = client.get("/api/v1/recommendations/history")
    assert res.status_code == 401


def test_recommendations_tenant_isolation(
    client: TestClient, auth_headers: dict, second_auth_headers: dict
):
    """Ensure User 2 cannot see User 1's recommendations."""
    # User 1 evaluates
    u1_eval = client.post("/api/v1/recommendations/evaluate", json={}, headers=auth_headers)
    assert u1_eval.status_code == 200

    # User 1 history has entries
    u1_res = client.get("/api/v1/recommendations/history", headers=auth_headers)
    assert u1_res.status_code == 200
    u1_history = u1_res.json()
    assert len(u1_history) >= 1

    # User 2 history should initially be empty
    u2_res = client.get("/api/v1/recommendations/history", headers=second_auth_headers)
    assert u2_res.status_code == 200
    u2_history = u2_res.json()
    assert len(u2_history) == 0

    # User 2 evaluates recommendations for their own profile
    u2_eval = client.post("/api/v1/recommendations/evaluate", json={}, headers=second_auth_headers)
    assert u2_eval.status_code == 200
    u2_data = u2_eval.json()

    # Verify separate user IDs and recommendation records
    assert u2_data["user_id"] != u1_eval.json()["user_id"]
    assert u2_data["id"] != u1_eval.json()["id"]

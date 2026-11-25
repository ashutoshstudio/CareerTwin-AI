import pytest
from fastapi.testclient import TestClient
from app.ml.readiness_model import (
    SUPPORTED_ROLES,
    assess_readiness,
    extract_features_from_profile,
    get_model_bundle,
)


@pytest.fixture
def auth_headers(client: TestClient) -> dict:
    """Register and authenticate student user."""
    res = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Readiness Student",
            "email": "readiness_test@example.com",
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
            "full_name": "Second Student",
            "email": "readiness_second@example.com",
            "password": "Password123!",
        },
    )
    assert res.status_code == 201
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ── 1. Model Training & Evaluation Metrics ───────────────────────────────────

def test_readiness_model_training_and_metrics():
    bundle, metadata = get_model_bundle()
    assert "regressor" in bundle
    assert "classifier" in bundle
    assert "feature_names" in bundle

    metrics = metadata.get("metrics", {})
    assert metrics["r2_score"] >= 0.75, f"R2 score too low: {metrics['r2_score']}"
    assert metrics["accuracy"] >= 0.75, f"Accuracy too low: {metrics['accuracy']}"
    assert metrics["mae"] <= 6.0, f"MAE too high: {metrics['mae']}"
    assert metrics["train_samples"] > 1000
    assert metrics["test_samples"] > 200


# ── 2. Feature Extraction Consistency ────────────────────────────────────────

def test_feature_extraction_consistency():
    skills = [
        {"name": "Python", "level": 5},
        {"name": "SQL", "level": 4},
        {"name": "Pandas", "level": 4},
    ]

    feat_vector, raw_dict, matching_core, missing_core, supporting = extract_features_from_profile(
        profile_skills=skills,
        target_role="Data Analyst",
        experience_months=12,
        education_level="Bachelor of Computer Applications (BCA)",
        github_url="https://github.com/alex",
        linkedin_url=None,
    )

    assert len(feat_vector) == 9
    assert "Python" in matching_core
    assert "SQL" in matching_core
    assert "Excel" in missing_core
    assert "Pandas" in supporting
    assert raw_dict["experience_months"] == 12
    assert raw_dict["has_github"] is True
    assert raw_dict["has_linkedin"] is False


# ── 3. Predictions Across Roles ──────────────────────────────────────────────

def test_predict_readiness_across_supported_roles():
    skills = [
        {"name": "Python", "level": 4},
        {"name": "Machine Learning", "level": 4},
        {"name": "Scikit-learn", "level": 4},
        {"name": "Pandas", "level": 4},
        {"name": "SQL", "level": 3},
    ]

    for role in SUPPORTED_ROLES:
        result = assess_readiness(
            profile_skills=skills,
            target_role=role,
            experience_months=6,
            education_level="Bachelor of Computer Applications (BCA)",
            github_url="https://github.com/candidate",
            linkedin_url="https://linkedin.com/in/candidate",
        )

        assert 0.0 <= result["readiness_score"] <= 100.0
        assert result["readiness_category"] in ["High Readiness", "Moderate Readiness", "Needs Development"]
        assert "dimension_scores" in result
        assert result["dimension_scores"]["technical_skills"] >= 0.0
        assert len(result["limitations"]) > 0


# ── 4. Assess Endpoint (Authenticated) ───────────────────────────────────────

def test_readiness_assess_endpoint_authenticated(client: TestClient, auth_headers: dict):
    # Setup profile with skills
    client.put(
        "/api/v1/profile/me",
        headers=auth_headers,
        json={
            "headline": "Aspiring ML Engineer",
            "education_level": "Bachelor of Computer Applications (BCA)",
            "experience_months": 6,
            "target_role": "Machine Learning Engineer",
            "skills": [
                {"name": "Python", "level": 4},
                {"name": "Machine Learning", "level": 4},
                {"name": "Scikit-learn", "level": 4},
                {"name": "SQL", "level": 3},
            ],
        },
    )

    response = client.post(
        "/api/v1/readiness/assess",
        headers=auth_headers,
        json={"target_role": "Machine Learning Engineer", "include_resume_skills": False},
    )
    assert response.status_code == 200

    data = response.json()
    assert data["target_role"] == "Machine Learning Engineer"
    assert 0.0 <= data["readiness_score"] <= 100.0
    assert data["readiness_category"] in ["High Readiness", "Moderate Readiness", "Needs Development"]
    assert "Python" in data["matching_core_skills"]
    assert "Machine Learning" in data["matching_core_skills"]
    assert "Scikit-learn" in data["matching_core_skills"]
    assert len(data["limitations"]) >= 2


# ── 5. Latest & History Endpoints ────────────────────────────────────────────

def test_readiness_latest_and_history_endpoints(client: TestClient, auth_headers: dict):
    # Assess first role
    client.post(
        "/api/v1/readiness/assess",
        headers=auth_headers,
        json={"target_role": "Data Analyst"},
    )

    # Assess second role
    client.post(
        "/api/v1/readiness/assess",
        headers=auth_headers,
        json={"target_role": "Python Developer"},
    )

    # GET /latest
    latest_res = client.get("/api/v1/readiness/latest", headers=auth_headers)
    assert latest_res.status_code == 200
    assert latest_res.json()["target_role"] == "Python Developer"

    # GET /history
    history_res = client.get("/api/v1/readiness/history", headers=auth_headers)
    assert history_res.status_code == 200
    history = history_res.json()
    assert len(history) >= 2
    assert history[0]["target_role"] == "Python Developer"


# ── 6. Model Info Transparency Endpoint ──────────────────────────────────────

def test_model_info_transparency_endpoint(client: TestClient):
    response = client.get("/api/v1/readiness/model-info")
    assert response.status_code == 200

    data = response.json()
    assert "metrics" in data
    assert data["metrics"]["accuracy"] > 0.70
    assert data["metrics"]["r2_score"] > 0.70
    assert len(data["features"]) == 9
    assert len(data["supported_roles"]) >= 40
    assert "disclaimer" in data
    assert "not represent actual hiring outcomes" in data["disclaimer"]


# ── 7. Authentication Protection ─────────────────────────────────────────────

def test_readiness_auth_protection(client: TestClient):
    # Unauthenticated /assess
    res_assess = client.post("/api/v1/readiness/assess", json={"target_role": "Data Analyst"})
    assert res_assess.status_code == 401

    # Unauthenticated /latest
    res_latest = client.get("/api/v1/readiness/latest")
    assert res_latest.status_code == 401

    # Unauthenticated /history
    res_history = client.get("/api/v1/readiness/history")
    assert res_history.status_code == 401


# ── 8. Tenant Isolation ──────────────────────────────────────────────────────

def test_readiness_tenant_isolation(client: TestClient, auth_headers: dict, second_auth_headers: dict):
    # User 1 creates an assessment
    client.post(
        "/api/v1/readiness/assess",
        headers=auth_headers,
        json={"target_role": "Machine Learning Engineer"},
    )

    # User 2 checks history (should be empty for User 2)
    history_user2 = client.get("/api/v1/readiness/history", headers=second_auth_headers)
    assert history_user2.status_code == 200
    assert len(history_user2.json()) == 0

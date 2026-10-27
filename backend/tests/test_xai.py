import pytest
from fastapi.testclient import TestClient
from app.ml.readiness_model import FEATURE_NAMES, get_model_bundle
from app.ml.xai_service import (
    explain_student_assessment,
    get_global_model_explanation,
    get_lime_explainer,
    get_tree_explainer,
)


@pytest.fixture
def auth_headers(client: TestClient) -> dict:
    """Register and authenticate test student."""
    res = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "XAI Student",
            "email": "xai_student@example.com",
            "password": "Password123!",
        },
    )
    assert res.status_code == 201
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def second_auth_headers(client: TestClient) -> dict:
    """Register second user to verify user data isolation."""
    res = client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Second XAI Student",
            "email": "xai_student2@example.com",
            "password": "Password123!",
        },
    )
    assert res.status_code == 201
    token = res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


# ── 1. Service Logic: SHAP, LIME, Consistency & Fidelity Tests ──────────────

def test_feature_names_and_ordering_consistency():
    """Verify that feature extraction order matches the exact model feature order."""
    bundle, metadata = get_model_bundle()
    model_features = metadata.get("features", [])

    assert model_features == FEATURE_NAMES
    assert len(FEATURE_NAMES) == 9
    assert FEATURE_NAMES[0] == "core_coverage"
    assert FEATURE_NAMES[-1] == "role_code"


def test_shap_explanation_fidelity_and_reconstruction():
    """
    Verify SHAP TreeExplainer produces exact additive attributions where:
    Predicted Score = Base Value + sum(SHAP Values) within numerical precision.
    """
    skills = [
        {"name": "Python", "level": 4},
        {"name": "SQL", "level": 3},
        {"name": "Git", "level": 3},
    ]

    exp = explain_student_assessment(
        profile_skills=skills,
        target_role="Python Developer",
        experience_months=6,
        education_level="BCA",
        github_url="https://github.com/example/student",
    )

    assert "predicted_score" in exp
    assert "base_value" in exp
    assert "shap_attributions" in exp
    assert len(exp["shap_attributions"]) == len(FEATURE_NAMES)

    # Check fidelity
    fidelity = exp["fidelity_check"]
    assert fidelity["is_faithful"] is True
    assert fidelity["discrepancy"] < 0.05
    assert abs((fidelity["base_value"] + fidelity["sum_shap"]) - fidelity["reconstructed_score"]) < 0.001

    # Check positive and negative contributors lists
    for item in exp["positive_contributors"]:
        assert item["shap_value"] > 0
        assert item["impact"] == "positive"

    for item in exp["negative_contributors"]:
        assert item["shap_value"] < 0
        assert item["impact"] == "negative"


def test_lime_explanation_generation():
    """Verify LIME local tabular surrogate generates decision rule conditions and weights."""
    skills = [
        {"name": "SQL", "level": 4},
        {"name": "Python", "level": 4},
        {"name": "Excel", "level": 3},
    ]

    exp = explain_student_assessment(
        profile_skills=skills,
        target_role="Data Analyst",
        experience_months=0,
    )

    assert "lime_attributions" in exp
    assert len(exp["lime_attributions"]) > 0

    for item in exp["lime_attributions"]:
        assert "condition" in item
        assert "weight" in item
        assert "impact" in item
        assert item["impact"] in ["positive", "negative"]


def test_global_model_explanation():
    """Verify global model feature importance and methodology metrics."""
    global_xai = get_global_model_explanation()

    assert "global_importances" in global_xai
    assert len(global_xai["global_importances"]) == len(FEATURE_NAMES)

    # Sum of Gini importances must be close to 1.0
    total_gini = sum(item["importance_score"] for item in global_xai["global_importances"])
    assert 0.99 <= total_gini <= 1.01

    # Ranks must be 1 to 9
    ranks = [item["rank"] for item in global_xai["global_importances"]]
    assert ranks == list(range(1, 10))

    # Limitations and notes present
    assert len(global_xai["limitations"]) >= 2
    assert "tree_explainer" in global_xai["methodology_notes"]


# ── 2. Authenticated API Endpoint & Security Tests ───────────────────────────

def test_explain_endpoint_authenticated(client: TestClient, auth_headers: dict):
    """POST /api/v1/readiness/explain returns full validated explainability output."""
    profile_payload = {
        "headline": "ML Enthusiast",
        "education_level": "Bachelor of Computer Applications (BCA)",
        "target_role": "Machine Learning Engineer",
        "skills": [
            {"name": "Python", "level": 4},
            {"name": "Machine Learning", "level": 4},
            {"name": "Scikit-learn", "level": 3},
            {"name": "Pandas", "level": 4},
            {"name": "SQL", "level": 3},
        ],
        "github_url": "https://github.com/student/ml-repo",
    }
    client.put("/api/v1/profile/me", json=profile_payload, headers=auth_headers)

    res = client.post("/api/v1/readiness/explain", json={"target_role": "Machine Learning Engineer"}, headers=auth_headers)
    assert res.status_code == 200
    data = res.json()

    assert data["target_role"] == "Machine Learning Engineer"
    assert "predicted_score" in data
    assert "base_value" in data
    assert len(data["shap_attributions"]) == 9
    assert len(data["lime_attributions"]) > 0
    assert "causal_disclaimer" in data
    assert "correlation" in data["causal_disclaimer"].lower() or "causal" in data["causal_disclaimer"].lower()
    assert data["fidelity_check"]["is_faithful"] is True


def test_get_explain_endpoint(client: TestClient, auth_headers: dict):
    """GET /api/v1/readiness/explain returns latest explanation."""
    res = client.get("/api/v1/readiness/explain", headers=auth_headers)
    assert res.status_code == 200
    assert "predicted_score" in res.json()


def test_dedicated_xai_route(client: TestClient, auth_headers: dict):
    """Verify /api/v1/xai/explain and /api/v1/xai/global work identically."""
    res_xai = client.get("/api/v1/xai/explain", headers=auth_headers)
    assert res_xai.status_code == 200
    assert "shap_attributions" in res_xai.json()

    res_global = client.get("/api/v1/xai/global")
    assert res_global.status_code == 200
    assert "global_importances" in res_global.json()


def test_xai_unauthorized(client: TestClient):
    """Explain endpoints require authentication."""
    assert client.get("/api/v1/readiness/explain").status_code == 401
    assert client.post("/api/v1/readiness/explain", json={}).status_code == 401
    assert client.get("/api/v1/xai/explain").status_code == 401


def test_xai_tenant_isolation(client: TestClient, auth_headers: dict, second_auth_headers: dict):
    """User 1's profile skills and attributions are strictly isolated from User 2."""
    # User 1 has rich skills
    u1_profile = {
        "target_role": "Python Developer",
        "skills": [
            {"name": "Python", "level": 5},
            {"name": "FastAPI", "level": 4},
            {"name": "Git", "level": 4},
        ],
    }
    client.put("/api/v1/profile/me", json=u1_profile, headers=auth_headers)
    u1_exp = client.get("/api/v1/readiness/explain", headers=auth_headers).json()

    # User 2 has empty profile
    u2_exp = client.get("/api/v1/readiness/explain", headers=second_auth_headers).json()

    # Predictions and core coverage must be different
    assert u1_exp["predicted_score"] != u2_exp["predicted_score"]
    assert u1_exp["features_snapshot"]["total_skills_count"] > u2_exp["features_snapshot"]["total_skills_count"]

from unittest.mock import patch
import pytest
from fastapi import HTTPException
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.core.security import hash_password
from app.models.github import GitHubAnalysis
from app.models.profile import StudentProfile
from app.models.user import User

MOCK_PROFILE = {
    "login": "octotest",
    "name": "Octo Test User",
    "avatar_url": "https://avatars.githubusercontent.com/u/1000",
    "bio": "Building data pipelines and cloud microservices",
    "company": "Tech Corp",
    "location": "Bangalore, India",
    "blog": "https://octotest.dev",
    "public_repos": 4,
    "followers": 22,
    "following": 8,
    "created_at": "2021-04-10T12:00:00Z",
    "html_url": "https://github.com/octotest",
}

MOCK_REPOS = [
    {
        "name": "sales-analytics-pipeline",
        "description": "Automated ETL pipeline using Python, SQL, and Pandas for sales reporting",
        "language": "Python",
        "stargazers_count": 14,
        "forks_count": 4,
        "fork": False,
        "updated_at": "2024-03-01T15:00:00Z",
        "topics": ["python", "sql", "pandas", "data-analytics"],
        "html_url": "https://github.com/octotest/sales-analytics-pipeline",
    },
    {
        "name": "fastapi-model-service",
        "description": "Production REST API for serving machine learning models with FastAPI and Docker",
        "language": "Python",
        "stargazers_count": 18,
        "forks_count": 5,
        "fork": False,
        "updated_at": "2024-02-15T10:00:00Z",
        "topics": ["fastapi", "docker", "python", "machine-learning"],
        "html_url": "https://github.com/octotest/fastapi-model-service",
    },
    {
        "name": "portfolio-dashboard",
        "description": "Interactive data visualization dashboard with React and Tailwind CSS",
        "language": "JavaScript",
        "stargazers_count": 6,
        "forks_count": 1,
        "fork": False,
        "updated_at": "2024-01-20T08:00:00Z",
        "topics": ["react", "tailwind", "javascript"],
        "html_url": "https://github.com/octotest/portfolio-dashboard",
    },
    {
        "name": "upstream-utility-fork",
        "description": "Forked open-source library helper",
        "language": "Go",
        "stargazers_count": 0,
        "forks_count": 0,
        "fork": True,
        "updated_at": "2022-05-01T00:00:00Z",
        "topics": [],
        "html_url": "https://github.com/octotest/upstream-utility-fork",
    },
]


def _create_test_user_and_token(
    client: TestClient,
    db_session: Session,
    email: str = "gh_tester@example.com",
    role: str = "Data Analyst",
    github_url: str = "https://github.com/octotest",
) -> tuple[dict, int]:
    user = User(
        email=email,
        hashed_password=hash_password("Pass123!"),
        full_name="GitHub Tester",
        role="student",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    profile = StudentProfile(
        user_id=user.id,
        target_role=role,
        github_url=github_url,
        skills=[{"name": "Python", "level": 4}],
    )
    db_session.add(profile)
    db_session.commit()

    login_res = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "Pass123!"},
    )
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}, user.id


def test_analyze_github_profile_endpoint(client: TestClient, db_session: Session):
    """Test successful GitHub profile analysis with mocked GitHub API response."""
    headers, user_id = _create_test_user_and_token(client, db_session, email="gh_success@test.com")

    with patch(
        "app.services.github_service.fetch_github_user_data",
        return_value=(MOCK_PROFILE, MOCK_REPOS),
    ):
        res = client.post(
            "/api/v1/github/analyze",
            headers=headers,
            json={"username": "octotest", "target_role": "Data Analyst"},
        )

    assert res.status_code == 200
    data = res.json()
    assert data["username"] == "octotest"
    assert data["target_role"] == "Data Analyst"
    assert 0.0 <= data["overall_score"] <= 100.0
    assert "A" in data["grade"] or "B" in data["grade"]

    # Verify 6 category scores
    cat_scores = data["category_scores"]
    assert "project_quality" in cat_scores
    assert "skill_diversity" in cat_scores
    assert "documentation" in cat_scores
    assert "coding_activity" in cat_scores
    assert "community_engagement" in cat_scores
    assert "role_relevance" in cat_scores

    # Verify role benchmarks
    assert "Python" in data["matched_skills"]
    assert "SQL" in data["matched_skills"]
    assert len(data["repositories"]) == 4

    # Verify DB persistence
    db_record = db_session.query(GitHubAnalysis).filter_by(user_id=user_id).first()
    assert db_record is not None
    assert db_record.username == "octotest"
    assert db_record.total_stars == 38  # 14 + 18 + 6


def test_github_fallback_to_profile_url(client: TestClient, db_session: Session):
    """Test that analyzer uses profile.github_url when payload username is blank."""
    headers, _ = _create_test_user_and_token(
        client,
        db_session,
        email="gh_fallback@test.com",
        github_url="https://github.com/profiledev",
    )

    custom_profile = {**MOCK_PROFILE, "login": "profiledev"}
    with patch(
        "app.services.github_service.fetch_github_user_data",
        return_value=(custom_profile, MOCK_REPOS),
    ):
        res = client.post(
            "/api/v1/github/analyze",
            headers=headers,
            json={"username": "", "target_role": "Python Developer"},
        )

    assert res.status_code == 200
    data = res.json()
    assert data["username"] == "profiledev"


def test_github_missing_username_and_no_profile_url_400(client: TestClient, db_session: Session):
    """Test 400 when username is blank and student profile has no github_url."""
    headers, _ = _create_test_user_and_token(
        client,
        db_session,
        email="gh_nourl@test.com",
        github_url="",
    )
    res = client.post(
        "/api/v1/github/analyze",
        headers=headers,
        json={"username": ""},
    )
    assert res.status_code == 400
    assert "valid github username is required" in res.json()["detail"].lower()


def test_github_user_not_found_404(client: TestClient, db_session: Session):
    """Test 404 error handling for non-existent GitHub username."""
    headers, _ = _create_test_user_and_token(client, db_session, email="gh_404@test.com")

    with patch(
        "app.services.github_service.fetch_github_user_data",
        side_effect=HTTPException(status_code=404, detail="GitHub user 'ghost_user' was not found."),
    ):
        res = client.post(
            "/api/v1/github/analyze",
            headers=headers,
            json={"username": "ghost_user", "target_role": "Data Analyst"},
        )

    assert res.status_code == 404
    assert "not found" in res.json()["detail"].lower()


def test_github_rate_limit_429(client: TestClient, db_session: Session):
    """Test 429 error handling for GitHub API rate limits."""
    headers, _ = _create_test_user_and_token(client, db_session, email="gh_429@test.com")

    with patch(
        "app.services.github_service.fetch_github_user_data",
        side_effect=HTTPException(status_code=429, detail="GitHub API rate limit exceeded."),
    ):
        res = client.post(
            "/api/v1/github/analyze",
            headers=headers,
            json={"username": "popular_user", "target_role": "Data Analyst"},
        )

    assert res.status_code == 429
    assert "rate limit" in res.json()["detail"].lower()


def test_github_empty_repositories_handling(client: TestClient, db_session: Session):
    """Test that candidate with zero public repositories evaluates cleanly without division by zero."""
    headers, _ = _create_test_user_and_token(client, db_session, email="gh_empty@test.com")
    empty_profile = {**MOCK_PROFILE, "login": "newdev", "public_repos": 0}

    with patch(
        "app.services.github_service.fetch_github_user_data",
        return_value=(empty_profile, []),
    ):
        res = client.post(
            "/api/v1/github/analyze",
            headers=headers,
            json={"username": "newdev", "target_role": "Data Analyst"},
        )

    assert res.status_code == 200
    data = res.json()
    assert data["total_repos_analyzed"] == 0
    assert data["overall_score"] >= 0.0
    assert len(data["weaknesses"]) > 0


def test_get_latest_github_analysis(client: TestClient, db_session: Session):
    """Test retrieving latest GitHub analysis endpoint."""
    headers, user_id = _create_test_user_and_token(client, db_session, email="gh_latest@test.com")

    # Initial check should be None
    res = client.get("/api/v1/github/latest", headers=headers)
    assert res.status_code == 200
    assert res.json() is None

    # Analyze
    with patch(
        "app.services.github_service.fetch_github_user_data",
        return_value=(MOCK_PROFILE, MOCK_REPOS),
    ):
        client.post(
            "/api/v1/github/analyze",
            headers=headers,
            json={"username": "octotest", "target_role": "Data Analyst"},
        )

    # Check latest returns analysis
    res_latest = client.get("/api/v1/github/latest", headers=headers)
    assert res_latest.status_code == 200
    assert res_latest.json() is not None
    assert res_latest.json()["username"] == "octotest"


def test_get_github_analysis_history(client: TestClient, db_session: Session):
    """Test retrieving history list of past analyses."""
    headers, _ = _create_test_user_and_token(client, db_session, email="gh_hist@test.com")

    with patch(
        "app.services.github_service.fetch_github_user_data",
        return_value=(MOCK_PROFILE, MOCK_REPOS),
    ):
        client.post(
            "/api/v1/github/analyze",
            headers=headers,
            json={"username": "octotest", "target_role": "Data Analyst"},
        )

    res = client.get("/api/v1/github/history", headers=headers)
    assert res.status_code == 200
    history = res.json()
    assert len(history) >= 1
    assert history[0]["username"] == "octotest"


def test_sync_github_skills_to_profile(client: TestClient, db_session: Session):
    """Test syncing detected GitHub technical skills into student profile."""
    headers, user_id = _create_test_user_and_token(client, db_session, email="gh_sync@test.com")

    # Run analysis
    with patch(
        "app.services.github_service.fetch_github_user_data",
        return_value=(MOCK_PROFILE, MOCK_REPOS),
    ):
        client.post(
            "/api/v1/github/analyze",
            headers=headers,
            json={"username": "octotest", "target_role": "Data Analyst"},
        )

    # Sync skills
    sync_res = client.post(
        "/api/v1/github/sync-skills",
        headers=headers,
        json={},
    )
    assert sync_res.status_code == 200
    sync_data = sync_res.json()
    assert sync_data["total_profile_skills"] >= 2
    assert "SQL" in sync_data["synced_skills"]

    # Verify profile skills in DB
    profile = db_session.query(StudentProfile).filter_by(user_id=user_id).first()
    skill_names = [s["name"] for s in profile.skills]
    assert "Python" in skill_names
    assert "SQL" in skill_names


def test_github_unauthorized(client: TestClient):
    """Test that unauthenticated requests to GitHub endpoints are rejected with 401."""
    res_analyze = client.post("/api/v1/github/analyze", json={"username": "octotest"})
    assert res_analyze.status_code == 401

    res_latest = client.get("/api/v1/github/latest")
    assert res_latest.status_code == 401

    res_history = client.get("/api/v1/github/history")
    assert res_history.status_code == 401


def test_github_tenant_isolation(client: TestClient, db_session: Session):
    """Test strict tenant isolation: User B cannot access User A's GitHub evaluation."""
    headers_a, user_a_id = _create_test_user_and_token(client, db_session, email="gh_user_a@test.com")
    headers_b, user_b_id = _create_test_user_and_token(client, db_session, email="gh_user_b@test.com")

    # User A analyzes octotest
    with patch(
        "app.services.github_service.fetch_github_user_data",
        return_value=(MOCK_PROFILE, MOCK_REPOS),
    ):
        res_a = client.post(
            "/api/v1/github/analyze",
            headers=headers_a,
            json={"username": "octotest", "target_role": "Data Analyst"},
        )
    assert res_a.status_code == 200

    # User B should have None for latest analysis
    res_b_latest = client.get("/api/v1/github/latest", headers=headers_b)
    assert res_b_latest.status_code == 200
    assert res_b_latest.json() is None

    # User B history should be empty
    res_b_history = client.get("/api/v1/github/history", headers=headers_b)
    assert res_b_history.status_code == 200
    assert len(res_b_history.json()) == 0

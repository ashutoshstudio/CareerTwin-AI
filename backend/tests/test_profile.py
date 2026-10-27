import tempfile
from pathlib import Path
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base, get_db
from app.main import app


def test_protected_profile_endpoint_rejects_missing_token(client: TestClient) -> None:
    """Accessing /api/v1/profile/me without an Authorization header returns HTTP 401."""
    res_get = client.get("/api/v1/profile/me")
    assert res_get.status_code == 401
    assert "missing" in res_get.json()["detail"].lower()

    res_put = client.put("/api/v1/profile/me", json={"headline": "Test"})
    assert res_put.status_code == 401


def test_protected_profile_endpoint_rejects_invalid_token(client: TestClient) -> None:
    """Accessing /api/v1/profile/me with a bogus token returns HTTP 401."""
    headers = {"Authorization": "Bearer invalid.fake.token"}
    res = client.get("/api/v1/profile/me", headers=headers)
    assert res.status_code == 401
    assert "invalid or expired" in res.json()["detail"].lower()


def test_get_and_update_profile(client: TestClient) -> None:
    """A registered user can fetch and update their profile with full details and skills."""
    # Register user
    reg = client.post(
        "/api/v1/auth/register",
        json={"email": "profileuser@example.com", "full_name": "Initial Name", "password": "Password123!"},
    )
    assert reg.status_code == 201
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch initial profile
    res_initial = client.get("/api/v1/profile/me", headers=headers)
    assert res_initial.status_code == 200
    p_data = res_initial.json()
    assert p_data["email"] == "profileuser@example.com"
    assert p_data["full_name"] == "Initial Name"
    assert p_data["skills"] == []

    # Update profile
    update_payload = {
        "full_name": "Updated Student Name",
        "headline": "Aspiring Data Scientist & BCA Final Year",
        "education_level": "Bachelor of Computer Applications (BCA)",
        "institution": "University School of Information Technology",
        "graduation_year": 2026,
        "experience_months": 6,
        "github_url": "https://github.com/teststudent",
        "linkedin_url": "https://linkedin.com/in/teststudent",
        "target_role": "Data Scientist",
        "skills": [
            {"name": "Python", "level": 4},
            {"name": "SQL", "level": 3},
            {"name": "Machine Learning", "level": 3},
        ],
    }
    res_update = client.put("/api/v1/profile/me", json=update_payload, headers=headers)
    assert res_update.status_code == 200
    updated = res_update.json()
    assert updated["full_name"] == "Updated Student Name"
    assert updated["headline"] == "Aspiring Data Scientist & BCA Final Year"
    assert updated["education_level"] == "Bachelor of Computer Applications (BCA)"
    assert updated["graduation_year"] == 2026
    assert updated["experience_months"] == 6
    assert updated["target_role"] == "Data Scientist"
    assert len(updated["skills"]) == 3
    assert updated["skills"][0]["name"] == "Python"
    assert updated["skills"][0]["level"] == 4

    # Fetch again with GET to verify persistence in current session
    res_verify = client.get("/api/v1/profile/me", headers=headers)
    assert res_verify.status_code == 200
    verified = res_verify.json()
    assert verified["full_name"] == "Updated Student Name"
    assert len(verified["skills"]) == 3


def test_user_profile_isolation(client: TestClient) -> None:
    """User A and User B cannot view or modify each other's profiles."""
    reg_a = client.post(
        "/api/v1/auth/register",
        json={"email": "usera@example.com", "full_name": "User A", "password": "PasswordA123"},
    )
    token_a = reg_a.json()["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    reg_b = client.post(
        "/api/v1/auth/register",
        json={"email": "userb@example.com", "full_name": "User B", "password": "PasswordB123"},
    )
    token_b = reg_b.json()["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # User A updates profile
    client.put(
        "/api/v1/profile/me",
        json={"target_role": "Data Scientist", "headline": "User A Headline"},
        headers=headers_a,
    )

    # User B fetches profile -> must see User B's own profile, not User A's
    res_b = client.get("/api/v1/profile/me", headers=headers_b)
    data_b = res_b.json()
    assert data_b["email"] == "userb@example.com"
    assert data_b["headline"] is None
    assert data_b["target_role"] is None


def test_data_persistence_across_app_restarts() -> None:
    """Data persists across application restarts in a real SQLite database file."""
    with tempfile.TemporaryDirectory() as tmpdir:
        db_file = Path(tmpdir) / "test_persistence.db"
        sqlite_url = f"sqlite:///{db_file}"

        persist_engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
        PersistSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=persist_engine)

        Base.metadata.create_all(bind=persist_engine)

        def get_persist_db():
            session = PersistSessionLocal()
            try:
                yield session
            finally:
                session.close()

        app.dependency_overrides[get_db] = get_persist_db

        # 1. First run / instance: Register and save profile data
        with TestClient(app) as test_client_1:
            reg = test_client_1.post(
                "/api/v1/auth/register",
                json={"email": "persistent@example.com", "full_name": "Persistent User", "password": "PassWord123!"},
            )
            assert reg.status_code == 201
            token = reg.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}

            update_res = test_client_1.put(
                "/api/v1/profile/me",
                json={
                    "headline": "Persisted Headline",
                    "target_role": "Machine Learning Engineer",
                    "skills": [{"name": "PyTorch", "level": 4}],
                },
                headers=headers,
            )
            assert update_res.status_code == 200

        # Simulate full shutdown by disposing engine and clearing overrides
        persist_engine.dispose()
        app.dependency_overrides.clear()

        # 2. Second run / restart: New engine pointing to the exact same file
        restarted_engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
        RestartedSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=restarted_engine)

        def get_restarted_db():
            session = RestartedSessionLocal()
            try:
                yield session
            finally:
                session.close()

        app.dependency_overrides[get_db] = get_restarted_db

        with TestClient(app) as test_client_2:
            # Login again using the same credentials from before restart
            login_res = test_client_2.post(
                "/api/v1/auth/login",
                json={"email": "persistent@example.com", "password": "PassWord123!"},
            )
            assert login_res.status_code == 200
            new_token = login_res.json()["access_token"]
            new_headers = {"Authorization": f"Bearer {new_token}"}

            # Verify profile data survived the restart intact
            profile_res = test_client_2.get("/api/v1/profile/me", headers=new_headers)
            assert profile_res.status_code == 200
            profile = profile_res.json()
            assert profile["email"] == "persistent@example.com"
            assert profile["headline"] == "Persisted Headline"
            assert profile["target_role"] == "Machine Learning Engineer"
            assert len(profile["skills"]) == 1
            assert profile["skills"][0]["name"] == "PyTorch"
            assert profile["skills"][0]["level"] == 4

        restarted_engine.dispose()
        app.dependency_overrides.clear()

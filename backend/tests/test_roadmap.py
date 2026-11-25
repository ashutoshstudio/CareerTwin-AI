from typing import Any, Dict
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.profile import StudentProfile
from app.models.user import User
from app.core.security import hash_password


def _create_test_user_and_token(
    client: TestClient,
    db_session: Session,
    email: str = "roadmap_student@example.com",
    role: str = "Data Analyst",
    skills: list = None,
) -> tuple[Dict[str, str], int]:
    """Helper to create a user and return auth headers and user ID."""
    if skills is None:
        skills = [
            {"name": "Python", "level": 2},
            {"name": "SQL", "level": 1},
        ]

    user = User(
        email=email,
        hashed_password=hash_password("StrongPass123!"),
        full_name="Roadmap Student",
        role="student",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    profile = StudentProfile(
        user_id=user.id,
        target_role=role,
        skills=skills,
        education_level="B.Tech Computer Science",
        experience_months=6,
    )
    db_session.add(profile)
    db_session.commit()

    # Login to obtain JWT
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "StrongPass123!"},
    )
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}, user.id


def test_get_or_create_roadmap_authenticated(client: TestClient, db_session: Session):
    headers, user_id = _create_test_user_and_token(client, db_session)

    # Calling GET /api/v1/roadmap should auto-generate a roadmap
    resp = client.get("/api/v1/roadmap", headers=headers)
    assert resp.status_code == 200
    data = resp.json()

    assert data["user_id"] == user_id
    assert data["target_role"] == "Data Analyst"
    assert data["total_weeks"] >= 4
    assert data["current_week"] == 1
    assert data["completion_percentage"] == 0.0
    assert data["total_items"] > 0
    assert data["completed_items"] == 0
    assert len(data["weeks"]) == data["total_weeks"]

    # Verify structure of first week
    first_week = data["weeks"][0]
    assert first_week["week_number"] == 1
    assert "title" in first_week
    assert "focus_area" in first_week
    assert first_week["estimated_hours"] > 0
    assert "milestone" in first_week
    assert len(first_week["items"]) > 0

    first_item = first_week["items"][0]
    assert "id" in first_item
    assert "title" in first_item
    assert "description" in first_item
    assert first_item["is_completed"] is False
    assert len(first_item["resources"]) > 0
    assert first_item["resources"][0]["url"].startswith("http")


def test_roadmap_toggle_item_updates_progress(client: TestClient, db_session: Session):
    headers, _ = _create_test_user_and_token(
        client, db_session, email="toggle_student@example.com"
    )

    # 1. Fetch initial roadmap
    get_resp = client.get("/api/v1/roadmap", headers=headers)
    assert get_resp.status_code == 200
    initial_data = get_resp.json()
    first_item_id = initial_data["weeks"][0]["items"][0]["id"]
    total_items = initial_data["total_items"]

    # 2. Toggle first item as completed
    toggle_resp = client.post(
        "/api/v1/roadmap/toggle-item",
        headers=headers,
        json={"item_id": first_item_id, "is_completed": True},
    )
    assert toggle_resp.status_code == 200
    updated_data = toggle_resp.json()

    assert updated_data["completed_items"] == 1
    expected_pct = round((1 / total_items) * 100.0, 1)
    assert updated_data["completion_percentage"] == expected_pct
    assert updated_data["weeks"][0]["items"][0]["is_completed"] is True

    # 3. Untoggle the item
    untoggle_resp = client.post(
        "/api/v1/roadmap/toggle-item",
        headers=headers,
        json={"item_id": first_item_id, "is_completed": False},
    )
    assert untoggle_resp.status_code == 200
    untoggled_data = untoggle_resp.json()

    assert untoggled_data["completed_items"] == 0
    assert untoggled_data["completion_percentage"] == 0.0
    assert untoggled_data["weeks"][0]["items"][0]["is_completed"] is False


def test_generate_roadmap_custom_role(client: TestClient, db_session: Session):
    headers, _ = _create_test_user_and_token(
        client, db_session, email="custom_role_student@example.com"
    )

    resp = client.post(
        "/api/v1/roadmap/generate",
        headers=headers,
        json={"target_role": "Machine Learning Engineer", "target_weeks": 6},
    )
    assert resp.status_code == 200
    data = resp.json()

    assert data["target_role"] == "Machine Learning Engineer"
    assert data["total_weeks"] >= 4
    assert any("Machine Learning" in w["title"] or "Machine Learning" in w.get("skills", []) for w in data["weeks"])


def test_roadmap_summary_endpoint(client: TestClient, db_session: Session):
    headers, _ = _create_test_user_and_token(
        client, db_session, email="summary_student@example.com"
    )

    # Before generating, GET /summary should return has_roadmap False
    sum_before = client.get("/api/v1/roadmap/summary", headers=headers)
    assert sum_before.status_code == 200
    assert sum_before.json()["has_roadmap"] is False

    # Now generate/fetch roadmap
    client.get("/api/v1/roadmap", headers=headers)

    # Summary should now return true with progress info
    sum_after = client.get("/api/v1/roadmap/summary", headers=headers)
    assert sum_after.status_code == 200
    summary_data = sum_after.json()
    assert summary_data["has_roadmap"] is True
    assert summary_data["target_role"] == "Data Analyst"
    assert summary_data["completion_percentage"] == 0.0
    assert summary_data["current_week"] == 1
    assert summary_data["next_recommended_task"] is not None


def test_roadmap_unauthorized(client: TestClient):
    resp = client.get("/api/v1/roadmap")
    assert resp.status_code == 401

    toggle_resp = client.post(
        "/api/v1/roadmap/toggle-item",
        json={"item_id": "test-item", "is_completed": True},
    )
    assert toggle_resp.status_code == 401

    sum_resp = client.get("/api/v1/roadmap/summary")
    assert sum_resp.status_code == 401


def test_roadmap_tenant_isolation(client: TestClient, db_session: Session):
    headers_a, user_a_id = _create_test_user_and_token(
        client, db_session, email="user_a@example.com"
    )
    headers_b, user_b_id = _create_test_user_and_token(
        client, db_session, email="user_b@example.com"
    )

    # User A gets roadmap and marks an item completed
    resp_a = client.get("/api/v1/roadmap", headers=headers_a)
    assert resp_a.status_code == 200
    item_id_a = resp_a.json()["weeks"][0]["items"][0]["id"]

    client.post(
        "/api/v1/roadmap/toggle-item",
        headers=headers_a,
        json={"item_id": item_id_a, "is_completed": True},
    )

    # User B gets roadmap
    resp_b = client.get("/api/v1/roadmap", headers=headers_b)
    assert resp_b.status_code == 200
    data_b = resp_b.json()

    # User B should have 0 completed items and 0% progress
    assert data_b["user_id"] == user_b_id
    assert data_b["completed_items"] == 0
    assert data_b["completion_percentage"] == 0.0
    assert data_b["weeks"][0]["items"][0]["is_completed"] is False

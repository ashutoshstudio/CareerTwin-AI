from fastapi.testclient import TestClient


def test_registration_succeeds(client: TestClient) -> None:
    """Registration creates user, hashes password, returns JWT token and user info."""
    payload = {
        "email": "student@example.com",
        "full_name": "Test Student",
        "password": "SecurePassword123!",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert "user" in data
    user = data["user"]
    assert user["email"] == "student@example.com"
    assert user["full_name"] == "Test Student"
    assert user["role"] == "student"
    # Ensure plaintext or hashed password is never returned
    assert "password" not in user
    assert "hashed_password" not in user


def test_duplicate_registration_rejected(client: TestClient) -> None:
    """Duplicate email registration must return HTTP 409 Conflict."""
    payload = {
        "email": "duplicate@example.com",
        "full_name": "First User",
        "password": "Password123!",
    }
    res1 = client.post("/api/v1/auth/register", json=payload)
    assert res1.status_code == 201

    # Attempt to register again with same email (case-insensitive)
    payload_dup = {
        "email": "DUPLICATE@example.com",
        "full_name": "Second User",
        "password": "AnotherPassword456!",
    }
    res2 = client.post("/api/v1/auth/register", json=payload_dup)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"].lower()


def test_registration_validation_errors(client: TestClient) -> None:
    """Registration with invalid email or short password returns HTTP 422."""
    res_bad_email = client.post(
        "/api/v1/auth/register",
        json={"email": "invalid-email", "full_name": "Name", "password": "Pass123Password"},
    )
    assert res_bad_email.status_code == 422

    res_short_pass = client.post(
        "/api/v1/auth/register",
        json={"email": "valid@example.com", "full_name": "Name", "password": "123"},
    )
    assert res_short_pass.status_code == 422


def test_login_succeeds_with_valid_credentials(client: TestClient) -> None:
    """Login with correct credentials returns HTTP 200 and a valid JWT token."""
    register_payload = {
        "email": "loginuser@example.com",
        "full_name": "Login User",
        "password": "ValidPassword999",
    }
    client.post("/api/v1/auth/register", json=register_payload)

    login_payload = {
        "email": "loginuser@example.com",
        "password": "ValidPassword999",
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "loginuser@example.com"


def test_login_rejects_invalid_password(client: TestClient) -> None:
    """Login with wrong password must return HTTP 401."""
    register_payload = {
        "email": "wrongpass@example.com",
        "full_name": "Wrong Pass User",
        "password": "CorrectPassword123",
    }
    client.post("/api/v1/auth/register", json=register_payload)

    login_payload = {
        "email": "wrongpass@example.com",
        "password": "IncorrectPasswordXYZ",
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 401
    assert "incorrect" in response.json()["detail"].lower()


def test_login_rejects_nonexistent_user(client: TestClient) -> None:
    """Login with non-existent email must return HTTP 401."""
    login_payload = {
        "email": "nonexistent@example.com",
        "password": "SomePassword123",
    }
    response = client.post("/api/v1/auth/login", json=login_payload)
    assert response.status_code == 401

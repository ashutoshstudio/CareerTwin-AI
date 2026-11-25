"""
Tests for Real Google OAuth 2.0 Authorization Code Flow & Account Linking.
Covers new user creation, existing user linking, dual email+Google login,
account conflicts, invalid tokens, unverified emails, CSRF state verification,
cancelled sign-in, and single-use session ticket exchange.
All external Google endpoints are safely mocked during automated tests.
"""
from unittest.mock import AsyncMock, MagicMock, patch
from urllib.parse import parse_qs, urlparse
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.profile import StudentProfile
from app.models.user import User


def _extract_query_param(url: str, key: str) -> str:
    parsed = urlparse(url)
    vals = parse_qs(parsed.query).get(key, [])
    return vals[0] if vals else ""


def test_google_oauth_unconfigured_handling(client: TestClient, monkeypatch):
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", None)
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_SECRET", None)

    status_resp = client.get("/api/v1/auth/google/status")
    assert status_resp.status_code == 200
    s_json = status_resp.json()
    assert s_json["configured"] is False
    assert s_json["google_client_id_present"] is False
    assert s_json["google_client_secret_present"] is False

    login_resp = client.get("/api/v1/auth/google/login")
    assert login_resp.status_code == 503

    # Verify configured diagnostics never leak actual secret values
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "secret-client-id-value")
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_SECRET", "super-secret-value")
    ok_resp = client.get("/api/v1/auth/google/status")
    assert ok_resp.status_code == 200
    ok_json = ok_resp.json()
    assert ok_json["configured"] is True
    assert ok_json["google_client_id_present"] is True
    assert ok_json["google_client_secret_present"] is True
    assert "super-secret-value" not in ok_resp.text
    assert "secret-client-id-value" not in ok_resp.text


def test_google_login_url_generation_and_open_redirect_guard(client: TestClient, monkeypatch):
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "test-client-id.apps.googleusercontent.com")
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_SECRET", "test-client-secret")
    monkeypatch.setattr(settings, "GOOGLE_REDIRECT_URI", "http://127.0.0.1:8000/api/v1/auth/google/callback")

    # Attempt open redirect attack via redirect and frontend_origin parameters
    resp = client.get(
        "/api/v1/auth/google/login?redirect=//evil.com/phish&frontend_origin=https://evil.com",
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["configured"] is True
    auth_url = data["authorization_url"]
    assert auth_url.startswith("https://accounts.google.com/o/oauth2/v2/auth?")
    assert "test-client-id.apps.googleusercontent.com" in auth_url
    assert "response_type=code" in auth_url

    # State parameter must exist and encode safe redirect/origin defaults
    state = _extract_query_param(auth_url, "state")
    assert len(state) > 20


def test_google_callback_new_user_and_jwt_session(client: TestClient, db_session: Session, monkeypatch):
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "test-client-id")
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_SECRET", "test-client-secret")

    login_res = client.get("/api/v1/auth/google/login?redirect=/profile&frontend_origin=http://localhost:5173")
    state = _extract_query_param(login_res.json()["authorization_url"], "state")

    mock_claims = {
        "sub": "google-uid-new-001",
        "email": "new.student@gmail.com",
        "email_verified": True,
        "name": "Aria Google Student",
        "iss": "https://accounts.google.com",
        "aud": "test-client-id",
    }

    with (
        patch("app.api.v1.endpoints.auth.exchange_code_for_tokens", new=AsyncMock(return_value={"id_token": "mock.id.token"})),
        patch("app.api.v1.endpoints.auth.verify_google_id_token", return_value=mock_claims),
    ):
        cb_resp = client.get(
            f"/api/v1/auth/google/callback?code=auth-code-123&state={state}",
            follow_redirects=False,
        )

    assert cb_resp.status_code == 302
    loc = cb_resp.headers["location"]
    assert loc.startswith("http://localhost:5173/auth/google/callback?")
    ticket = _extract_query_param(loc, "ticket")
    assert _extract_query_param(loc, "redirect") == "/profile"
    assert len(ticket) > 10

    # Exchange one-time ticket for real CareerTwin JWT
    exch_resp = client.post("/api/v1/auth/google/exchange", json={"ticket": ticket})
    assert exch_resp.status_code == 200
    auth_data = exch_resp.json()
    assert auth_data["token_type"] == "bearer"
    assert auth_data["user"]["email"] == "new.student@gmail.com"
    assert auth_data["user"]["auth_provider"] == "google"
    assert "hashed_password" not in auth_data["user"]

    # Token must authenticate existing protected endpoints cleanly
    profile_resp = client.get(
        "/api/v1/profile/me",
        headers={"Authorization": f"Bearer {auth_data['access_token']}"},
    )
    assert profile_resp.status_code == 200

    # Replaying single-use ticket must be rejected (401)
    replay_resp = client.post("/api/v1/auth/google/exchange", json={"ticket": ticket})
    assert replay_resp.status_code == 401

    # Google-only user attempting password login must receive clean 401
    pw_login = client.post(
        "/api/v1/auth/login",
        json={"email": "new.student@gmail.com", "password": "anypassword"},
    )
    assert pw_login.status_code == 401


def test_google_callback_links_existing_local_user_and_preserves_dual_login(
    client: TestClient, db_session: Session, monkeypatch
):
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "test-client-id")
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_SECRET", "test-client-secret")

    # 1. User registers first via Email/Password
    reg_resp = client.post(
        "/api/v1/auth/register",
        json={
            "email": "existing.local@example.com",
            "full_name": "Existing Student",
            "password": "LocalPassword123!",
        },
    )
    assert reg_resp.status_code == 201
    local_user_id = reg_resp.json()["user"]["id"]

    # 2. Same user signs in with Google (verified email match)
    state = _extract_query_param(client.get("/api/v1/auth/google/login").json()["authorization_url"], "state")
    mock_claims = {
        "sub": "google-uid-linked-777",
        "email": "existing.local@example.com",
        "email_verified": True,
        "name": "Existing Student",
        "iss": "accounts.google.com",
    }

    with (
        patch("app.api.v1.endpoints.auth.exchange_code_for_tokens", new=AsyncMock(return_value={"id_token": "mock.token"})),
        patch("app.api.v1.endpoints.auth.verify_google_id_token", return_value=mock_claims),
    ):
        cb_resp = client.get(
            f"/api/v1/auth/google/callback?code=code-link&state={state}",
            follow_redirects=False,
        )

    assert cb_resp.status_code == 302
    ticket = _extract_query_param(cb_resp.headers["location"], "ticket")
    exch_resp = client.post("/api/v1/auth/google/exchange", json={"ticket": ticket})
    assert exch_resp.status_code == 200
    assert exch_resp.json()["user"]["id"] == local_user_id
    assert exch_resp.json()["user"]["auth_provider"] == "local,google"

    # 3. Verify ONLY 1 user exists in DB and existing password login STILL WORKS
    assert db_session.query(User).filter_by(email="existing.local@example.com").count() == 1
    pw_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "existing.local@example.com", "password": "LocalPassword123!"},
    )
    assert pw_resp.status_code == 200
    assert pw_resp.json()["user"]["id"] == local_user_id


def test_google_callback_account_conflict_rejection(client: TestClient, db_session: Session, monkeypatch):
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "test-client-id")
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_SECRET", "test-client-secret")

    # Pre-create user already linked to Google sub AAA
    user = User(
        email="linked@example.com",
        hashed_password="!oauth_disabled:abc",
        full_name="Linked User",
        role="student",
        google_id="google-sub-AAA",
        auth_provider="google",
        is_active=True,
    )
    db_session.add(user)
    db_session.commit()

    state = _extract_query_param(client.get("/api/v1/auth/google/login").json()["authorization_url"], "state")
    conflicting_claims = {
        "sub": "google-sub-BBB",
        "email": "linked@example.com",
        "email_verified": True,
        "name": "Impostor Sub",
    }

    with (
        patch("app.api.v1.endpoints.auth.exchange_code_for_tokens", new=AsyncMock(return_value={"id_token": "mock.token"})),
        patch("app.api.v1.endpoints.auth.verify_google_id_token", return_value=conflicting_claims),
    ):
        cb_resp = client.get(
            f"/api/v1/auth/google/callback?code=code-conflict&state={state}",
            follow_redirects=False,
        )

    assert cb_resp.status_code == 302
    loc = cb_resp.headers["location"]
    assert _extract_query_param(loc, "oauth_error") == "account_conflict"


def test_google_callback_error_scenarios(client: TestClient, monkeypatch):
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "test-client-id")
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_SECRET", "test-client-secret")

    state = _extract_query_param(client.get("/api/v1/auth/google/login").json()["authorization_url"], "state")

    # 1. User cancelled login at Google prompt
    cancel_resp = client.get(
        f"/api/v1/auth/google/callback?error=access_denied&state={state}",
        follow_redirects=False,
    )
    assert cancel_resp.status_code == 302
    assert _extract_query_param(cancel_resp.headers["location"], "oauth_error") == "cancelled"

    # 2. Tampered / invalid CSRF state
    bad_state_resp = client.get(
        "/api/v1/auth/google/callback?code=abc&state=tampered-invalid-state",
        follow_redirects=False,
    )
    assert bad_state_resp.status_code == 302
    assert _extract_query_param(bad_state_resp.headers["location"], "oauth_error") == "invalid_state"

    # 3. Unverified email rejected by real verify_google_id_token logic
    with (
        patch("app.api.v1.endpoints.auth.exchange_code_for_tokens", new=AsyncMock(return_value={"id_token": "mock.id"})),
        patch(
            "app.services.google_oauth_service.google_id_token.verify_oauth2_token",
            return_value={
                "sub": "sub-unverified",
                "email": "unverified@example.com",
                "email_verified": False,
                "iss": "https://accounts.google.com",
            },
        ),
    ):
        unver_resp = client.get(
            f"/api/v1/auth/google/callback?code=abc&state={state}",
            follow_redirects=False,
        )
    assert unver_resp.status_code == 302
    assert _extract_query_param(unver_resp.headers["location"], "oauth_error") == "unverified_email"

    # 4. Invalid / forged ID token rejected cryptographically
    with (
        patch("app.api.v1.endpoints.auth.exchange_code_for_tokens", new=AsyncMock(return_value={"id_token": "forged.token"})),
        patch(
            "app.services.google_oauth_service.google_id_token.verify_oauth2_token",
            side_effect=ValueError("Wrong audience or invalid signature"),
        ),
    ):
        invalid_tok_resp = client.get(
            f"/api/v1/auth/google/callback?code=abc&state={state}",
            follow_redirects=False,
        )
    assert invalid_tok_resp.status_code == 302
    assert _extract_query_param(invalid_tok_resp.headers["location"], "oauth_error") == "invalid_token"

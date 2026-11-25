from collections import deque
from datetime import timedelta
import logging
import re
import secrets
from typing import Any, Dict, Optional, Tuple
from urllib.parse import urlencode
import httpx
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import create_access_token, decode_access_token
from app.models.profile import StudentProfile
from app.models.user import User

logger = logging.getLogger(__name__)

GOOGLE_AUTH_BASE_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"
LOCAL_ORIGIN_REGEX = re.compile(r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$")

# Track consumed single-use OAuth exchange ticket nonces to prevent replay attacks
_CONSUMED_TICKET_NONCES: deque[str] = deque(maxlen=2000)


class GoogleOAuthError(Exception):
    """Domain error with standardized frontend-safe error code and description."""

    def __init__(self, code: str, message: str):
        super().__init__(message)
        self.code = code
        self.message = message


def is_google_oauth_configured() -> bool:
    """Returns True only when Client ID, Client Secret, and Redirect URI are all set."""
    return bool(
        (settings.GOOGLE_CLIENT_ID or "").strip()
        and (settings.GOOGLE_CLIENT_SECRET or "").strip()
        and (settings.GOOGLE_REDIRECT_URI or "").strip()
    )


def sanitize_redirect_path(redirect_path: Optional[str]) -> str:
    """Prevents open redirects by enforcing internal relative paths only."""
    if not redirect_path:
        return "/dashboard"
    clean = redirect_path.strip()
    if not clean.startswith("/") or clean.startswith("//"):
        return "/dashboard"
    return clean


def resolve_safe_frontend_origin(origin: Optional[str]) -> str:
    """Validates frontend redirect target against configured CORS origins and localhost."""
    fallback = (settings.FRONTEND_URL or "http://localhost:5173").rstrip("/")
    if not origin:
        return fallback
    clean = origin.strip().rstrip("/")
    allowed = {o.rstrip("/") for o in (settings.ALLOWED_ORIGINS or [])}
    if clean in allowed or LOCAL_ORIGIN_REGEX.match(clean):
        return clean
    return fallback


def build_google_authorization_url(
    redirect_path: Optional[str] = "/dashboard",
    frontend_origin: Optional[str] = None,
) -> str:
    """
    Constructs Google OAuth 2.0 Authorization Code URL with a signed CSRF state JWT.
    """
    if not is_google_oauth_configured():
        raise GoogleOAuthError(
            "oauth_not_configured",
            "Google OAuth credentials are not configured on the server.",
        )

    safe_redirect = sanitize_redirect_path(redirect_path)
    safe_origin = resolve_safe_frontend_origin(frontend_origin)

    state_token = create_access_token(
        subject="google_oauth_state",
        expires_delta=timedelta(minutes=10),
        extra_claims={
            "purpose": "google_oauth_state",
            "nonce": secrets.token_urlsafe(16),
            "redirect": safe_redirect,
            "origin": safe_origin,
        },
    )

    params = {
        "client_id": settings.GOOGLE_CLIENT_ID.strip(),
        "redirect_uri": settings.GOOGLE_REDIRECT_URI.strip(),
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "online",
        "prompt": "select_account",
        "state": state_token,
    }
    return f"{GOOGLE_AUTH_BASE_URL}?{urlencode(params)}"


def validate_oauth_state(state_token: Optional[str]) -> Dict[str, Any]:
    """Verifies signed OAuth CSRF state JWT and extracts origin/redirect target."""
    if not state_token:
        raise GoogleOAuthError("invalid_state", "Missing OAuth CSRF state parameter.")

    payload = decode_access_token(state_token)
    if (
        not payload
        or payload.get("sub") != "google_oauth_state"
        or payload.get("purpose") != "google_oauth_state"
    ):
        raise GoogleOAuthError("invalid_state", "Invalid or expired OAuth state parameter.")

    return {
        "redirect": sanitize_redirect_path(payload.get("redirect")),
        "origin": resolve_safe_frontend_origin(payload.get("origin")),
    }


async def exchange_code_for_tokens(code: str) -> Dict[str, Any]:
    """Exchanges Google authorization code for OAuth tokens including id_token."""
    if not is_google_oauth_configured():
        raise GoogleOAuthError("oauth_not_configured", "Google OAuth is not configured.")

    data = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID.strip(),
        "client_secret": settings.GOOGLE_CLIENT_SECRET.strip(),
        "redirect_uri": settings.GOOGLE_REDIRECT_URI.strip(),
        "grant_type": "authorization_code",
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(
                GOOGLE_TOKEN_ENDPOINT,
                data=data,
                headers={"Content-Type": "application/x-www-form-urlencoded"},
            )
    except httpx.RequestError as exc:
        logger.warning("Google OAuth token exchange network error: %s", type(exc).__name__)
        raise GoogleOAuthError("token_exchange_failed", "Unable to reach Google authentication servers.")

    if resp.status_code != 200:
        err_code = "token_exchange_failed"
        try:
            err_body = resp.json()
            google_err = err_body.get("error", "")
            logger.warning("Google OAuth token endpoint rejected code (error=%s, status=%d)", google_err, resp.status_code)
            if google_err == "invalid_grant":
                err_code = "invalid_code"
        except Exception:
            logger.warning("Google OAuth token exchange returned HTTP %d", resp.status_code)
        raise GoogleOAuthError(err_code, "Failed to verify authorization code with Google.")

    token_payload = resp.json()
    if not token_payload.get("id_token"):
        raise GoogleOAuthError("invalid_token", "Google token response did not include an ID token.")

    return token_payload


def verify_google_id_token(id_token_str: str) -> Dict[str, Any]:
    """
    Cryptographically verifies Google ID token signature, audience, issuer,
    expiration, and verified email status.
    """
    if not id_token_str or not settings.GOOGLE_CLIENT_ID:
        raise GoogleOAuthError("invalid_token", "Missing Google ID token or client ID.")

    try:
        claims = google_id_token.verify_oauth2_token(
            id_token_str,
            google_requests.Request(),
            audience=settings.GOOGLE_CLIENT_ID.strip(),
        )
    except Exception as exc:
        logger.warning("Google ID token verification failed: %s", type(exc).__name__)
        raise GoogleOAuthError("invalid_token", "Invalid or expired Google ID token.")

    iss = claims.get("iss")
    if iss not in ("accounts.google.com", "https://accounts.google.com"):
        raise GoogleOAuthError("invalid_token", "Untrusted token issuer.")

    if not claims.get("email_verified"):
        raise GoogleOAuthError("unverified_email", "Your Google account email address is not verified.")

    sub = (claims.get("sub") or "").strip()
    email = (claims.get("email") or "").strip().lower()
    if not sub or not email:
        raise GoogleOAuthError("invalid_token", "Google ID token is missing required user claims.")

    return {
        "sub": sub,
        "email": email,
        "name": (claims.get("name") or email.split("@")[0]).strip()[:255],
    }


def authenticate_or_link_google_user(claims: Dict[str, Any], db: Session) -> User:
    """
    Matches verified Google user to existing CareerTwin account (by google_id or verified email),
    links accounts securely, creates new users cleanly, and blocks conflicting account links.
    """
    google_sub = claims["sub"]
    normalized_email = claims["email"].strip().lower()
    display_name = claims.get("name") or normalized_email.split("@")[0]

    user_by_sub = db.query(User).filter(User.google_id == google_sub).first()
    user_by_email = db.query(User).filter(User.email == normalized_email).first()

    # Case 1: Google ID already registered
    if user_by_sub:
        if user_by_email and user_by_email.id != user_by_sub.id:
            raise GoogleOAuthError(
                "account_conflict",
                "Another account already exists with this email address.",
            )
        if not user_by_sub.is_active:
            raise GoogleOAuthError(
                "inactive_account",
                "Your CareerTwin account is inactive. Please contact support.",
            )
        # Update email cleanly if Google user changed their primary verified Gmail without collision
        if user_by_sub.email != normalized_email and not user_by_email:
            user_by_sub.email = normalized_email
            db.commit()
            db.refresh(user_by_sub)
        return user_by_sub

    # Case 2: Existing account matches verified Google email -> link or detect conflict
    if user_by_email:
        if user_by_email.google_id and user_by_email.google_id != google_sub:
            raise GoogleOAuthError(
                "account_conflict",
                "This email account is already linked to a different Google account.",
            )
        if not user_by_email.is_active:
            raise GoogleOAuthError(
                "inactive_account",
                "Your CareerTwin account is inactive. Please contact support.",
            )
        user_by_email.google_id = google_sub
        existing_provider = user_by_email.auth_provider or "local"
        if "google" not in existing_provider:
            user_by_email.auth_provider = f"{existing_provider},google"
        db.commit()
        db.refresh(user_by_email)
        return user_by_email

    # Case 3: Brand new user via Google Sign-In
    # Use non-bcrypt disabled sentinel so password authentication remains disabled unless explicitly set
    disabled_password_sentinel = f"!oauth_disabled:{secrets.token_urlsafe(32)}"
    new_user = User(
        email=normalized_email,
        hashed_password=disabled_password_sentinel,
        full_name=display_name,
        role="student",
        google_id=google_sub,
        auth_provider="google",
        is_active=True,
    )
    db.add(new_user)
    db.flush()

    new_profile = StudentProfile(
        user_id=new_user.id,
        skills=[],
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_user)
    return new_user


def issue_one_time_exchange_ticket(user: User, redirect_path: str) -> str:
    """
    Issues a short-lived (90s) single-use signed exchange ticket so the long-lived
    access JWT never travels in browser redirect URL query strings.
    """
    return create_access_token(
        subject=str(user.id),
        expires_delta=timedelta(seconds=90),
        extra_claims={
            "purpose": "google_oauth_ticket",
            "jti": secrets.token_urlsafe(16),
            "redirect": sanitize_redirect_path(redirect_path),
        },
    )


def redeem_exchange_ticket(ticket: str, db: Session) -> Tuple[User, str]:
    """Validates and consumes a single-use Google OAuth exchange ticket."""
    payload = decode_access_token(ticket)
    if (
        not payload
        or payload.get("purpose") != "google_oauth_ticket"
        or not payload.get("jti")
        or not payload.get("sub")
    ):
        raise GoogleOAuthError("invalid_token", "Invalid or expired Google sign-in session ticket.")

    jti = str(payload["jti"])
    if jti in _CONSUMED_TICKET_NONCES:
        raise GoogleOAuthError("invalid_token", "Sign-in ticket has already been used.")

    try:
        user_id = int(payload["sub"])
    except (TypeError, ValueError):
        raise GoogleOAuthError("invalid_token", "Malformed sign-in ticket.")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise GoogleOAuthError("invalid_token", "User account no longer exists.")
    if not user.is_active:
        raise GoogleOAuthError("inactive_account", "User account is inactive.")

    _CONSUMED_TICKET_NONCES.append(jti)
    return user, sanitize_redirect_path(payload.get("redirect"))

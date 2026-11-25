from typing import Optional
from urllib.parse import urlencode
from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.core.config import refresh_env_settings_if_changed, settings
from app.core.security import create_access_token, hash_password, verify_password
from app.models.profile import StudentProfile
from app.models.user import User
from app.schemas.user import (
    AuthResponse,
    GoogleAuthStatusOut,
    GoogleAuthUrlOut,
    GoogleTicketExchangeRequest,
    UserLogin,
    UserRegister,
)
from app.services.google_oauth_service import (
    GoogleOAuthError,
    authenticate_or_link_google_user,
    build_google_authorization_url,
    exchange_code_for_tokens,
    is_google_oauth_configured,
    issue_one_time_exchange_ticket,
    redeem_exchange_ticket,
    resolve_safe_frontend_origin,
    validate_oauth_state,
    verify_google_id_token,
)

router = APIRouter()


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register new student account",
)
def register(
    user_in: UserRegister,
    db: Session = Depends(get_db),
) -> AuthResponse:
    """
    Register a new user account with secure password hashing.
    Rejects duplicate email addresses with HTTP 409 Conflict.
    Automatically initializes a corresponding student profile.
    """
    normalized_email = user_in.email.strip().lower()

    existing_user = db.query(User).filter(User.email == normalized_email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )

    # Hash password with bcrypt
    hashed = hash_password(user_in.password)

    new_user = User(
        email=normalized_email,
        hashed_password=hashed,
        full_name=user_in.full_name.strip(),
        role="student",
        is_active=True,
    )
    db.add(new_user)
    db.flush()  # assign new_user.id

    # Automatically create the corresponding blank student profile
    new_profile = StudentProfile(
        user_id=new_user.id,
        skills=[],
    )
    db.add(new_profile)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(
        subject=new_user.id,
        extra_claims={"email": new_user.email, "role": new_user.role},
    )

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=new_user,
    )


@router.post(
    "/login",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate existing user and issue token",
)
def login(
    credentials: UserLogin,
    db: Session = Depends(get_db),
) -> AuthResponse:
    """
    Verify user credentials and issue a signed JWT access token.
    Rejects non-existent users or invalid passwords with HTTP 401 Unauthorized.
    """
    normalized_email = credentials.email.strip().lower()

    user = db.query(User).filter(User.email == normalized_email).first()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive. Please contact support.",
        )

    token = create_access_token(
        subject=user.id,
        extra_claims={"email": user.email, "role": user.role},
    )

    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=user,
    )


@router.get(
    "/google/status",
    response_model=GoogleAuthStatusOut,
    status_code=status.HTTP_200_OK,
    summary="Check whether Google OAuth 2.0 is configured",
)
def google_oauth_status() -> GoogleAuthStatusOut:
    """Reports configuration readiness and credential presence without exposing secrets."""
    refresh_env_settings_if_changed()
    diag = settings.get_google_oauth_diagnostics()
    return GoogleAuthStatusOut(
        configured=is_google_oauth_configured(),
        redirect_uri=settings.GOOGLE_REDIRECT_URI,
        **diag,
    )


@router.get(
    "/google/login",
    response_model=GoogleAuthUrlOut,
    status_code=status.HTTP_200_OK,
    summary="Initiate real Google OAuth 2.0 Authorization Code flow",
)
def google_oauth_login(
    redirect: Optional[str] = Query(default="/dashboard", max_length=255),
    frontend_origin: Optional[str] = Query(default=None, max_length=255),
) -> GoogleAuthUrlOut:
    """
    Generates the official Google OAuth consent URL with CSRF state protection.
    Returns HTTP 503 if server credentials (GOOGLE_CLIENT_ID/SECRET) are unset.
    """
    refresh_env_settings_if_changed()
    try:
        auth_url = build_google_authorization_url(
            redirect_path=redirect,
            frontend_origin=frontend_origin,
        )
        return GoogleAuthUrlOut(authorization_url=auth_url, configured=True)
    except GoogleOAuthError as oauth_err:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=oauth_err.message,
        )


@router.get(
    "/google/callback",
    summary="Handle Google OAuth 2.0 authorization callback and verify ID token",
)
async def google_oauth_callback(
    code: Optional[str] = Query(default=None),
    state: Optional[str] = Query(default=None),
    error: Optional[str] = Query(default=None),
    db: Session = Depends(get_db),
):
    """
    Exchanges Google authorization code for tokens, cryptographically verifies the
    Google ID token, resolves/links/creates the user, and redirects back to the
    frontend with a short-lived single-use session ticket.
    """
    fallback_origin = resolve_safe_frontend_origin(None)

    try:
        state_data = validate_oauth_state(state)
    except GoogleOAuthError as state_err:
        err_qs = urlencode({"oauth_error": state_err.code})
        return RedirectResponse(
            url=f"{fallback_origin}/login?{err_qs}",
            status_code=status.HTTP_302_FOUND,
        )

    origin = state_data["origin"]
    redirect_path = state_data["redirect"]

    if error:
        mapped = "cancelled" if error == "access_denied" else "oauth_denied"
        err_qs = urlencode({"oauth_error": mapped})
        return RedirectResponse(
            url=f"{origin}/login?{err_qs}",
            status_code=status.HTTP_302_FOUND,
        )

    if not code:
        err_qs = urlencode({"oauth_error": "missing_code"})
        return RedirectResponse(
            url=f"{origin}/login?{err_qs}",
            status_code=status.HTTP_302_FOUND,
        )

    try:
        token_data = await exchange_code_for_tokens(code)
        claims = verify_google_id_token(token_data["id_token"])
        user = authenticate_or_link_google_user(claims, db)
        ticket = issue_one_time_exchange_ticket(user=user, redirect_path=redirect_path)
    except GoogleOAuthError as oauth_err:
        err_qs = urlencode({"oauth_error": oauth_err.code})
        return RedirectResponse(
            url=f"{origin}/login?{err_qs}",
            status_code=status.HTTP_302_FOUND,
        )

    success_qs = urlencode({"ticket": ticket, "redirect": redirect_path})
    return RedirectResponse(
        url=f"{origin}/auth/google/callback?{success_qs}",
        status_code=status.HTTP_302_FOUND,
    )


@router.post(
    "/google/exchange",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Exchange one-time Google OAuth callback ticket for CareerTwin JWT",
)
def exchange_google_oauth_ticket(
    payload: GoogleTicketExchangeRequest,
    db: Session = Depends(get_db),
) -> AuthResponse:
    """
    Consumes single-use callback ticket and returns the standard CareerTwin JWT
    matching the email/password AuthResponse format.
    """
    try:
        user, _ = redeem_exchange_ticket(payload.ticket, db)
    except GoogleOAuthError as oauth_err:
        status_code = (
            status.HTTP_403_FORBIDDEN
            if oauth_err.code == "inactive_account"
            else status.HTTP_401_UNAUTHORIZED
        )
        raise HTTPException(status_code=status_code, detail=oauth_err.message)

    token = create_access_token(
        subject=user.id,
        extra_claims={"email": user.email, "role": user.role},
    )
    return AuthResponse(
        access_token=token,
        token_type="bearer",
        user=user,
    )

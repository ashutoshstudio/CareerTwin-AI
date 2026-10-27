from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.core.security import create_access_token, hash_password, verify_password
from app.models.profile import StudentProfile
from app.models.user import User
from app.schemas.user import AuthResponse, UserLogin, UserRegister

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

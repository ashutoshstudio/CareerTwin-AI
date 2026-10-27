from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.models.profile import StudentProfile
from app.models.user import User
from app.schemas.profile import ProfileOut, ProfileUpdate, SkillItem

router = APIRouter()


def _format_profile_out(user: User, profile: StudentProfile) -> ProfileOut:
    """Helper to assemble a clean ProfileOut response from User and StudentProfile models."""
    raw_skills = profile.skills or []
    skill_items = []
    for item in raw_skills:
        if isinstance(item, dict):
            skill_items.append(
                SkillItem(name=item.get("name", ""), level=int(item.get("level", 1)))
            )
        elif isinstance(item, str):
            skill_items.append(SkillItem(name=item, level=3))

    return ProfileOut(
        id=profile.id,
        user_id=user.id,
        full_name=user.full_name,
        email=user.email,
        headline=profile.headline,
        education_level=profile.education_level,
        institution=profile.institution,
        graduation_year=profile.graduation_year,
        experience_months=profile.experience_months,
        github_url=profile.github_url,
        linkedin_url=profile.linkedin_url,
        target_role=profile.target_role,
        skills=skill_items,
        created_at=profile.created_at,
        updated_at=profile.updated_at,
    )


@router.get(
    "/me",
    response_model=ProfileOut,
    status_code=status.HTTP_200_OK,
    summary="Get current user profile",
)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProfileOut:
    """
    Retrieve the authenticated user's student profile.
    Strictly isolated: identity is derived directly from the verified JWT.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        # Create empty profile if not yet created
        profile = StudentProfile(user_id=current_user.id, skills=[])
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return _format_profile_out(current_user, profile)


@router.put(
    "/me",
    response_model=ProfileOut,
    status_code=status.HTTP_200_OK,
    summary="Update current user profile",
)
def update_my_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProfileOut:
    """
    Update profile details for the authenticated user.
    Supports updating full name, education, experience, links, target role, and skills list.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id, skills=[])
        db.add(profile)
        db.flush()

    # Update user full name if supplied
    if profile_in.full_name is not None:
        current_user.full_name = profile_in.full_name.strip()
        db.add(current_user)

    # Update profile fields if supplied
    if profile_in.headline is not None:
        profile.headline = profile_in.headline.strip() if profile_in.headline else None
    if profile_in.education_level is not None:
        profile.education_level = profile_in.education_level.strip() if profile_in.education_level else None
    if profile_in.institution is not None:
        profile.institution = profile_in.institution.strip() if profile_in.institution else None
    if profile_in.graduation_year is not None:
        profile.graduation_year = profile_in.graduation_year
    if profile_in.experience_months is not None:
        profile.experience_months = profile_in.experience_months
    if profile_in.github_url is not None:
        profile.github_url = profile_in.github_url.strip() if profile_in.github_url else None
    if profile_in.linkedin_url is not None:
        profile.linkedin_url = profile_in.linkedin_url.strip() if profile_in.linkedin_url else None
    if profile_in.target_role is not None:
        profile.target_role = profile_in.target_role.strip() if profile_in.target_role else None
    if profile_in.skills is not None:
        # Store serialized list of objects
        profile.skills = [{"name": s.name.strip(), "level": s.level} for s in profile_in.skills]

    db.add(profile)
    db.commit()
    db.refresh(profile)
    db.refresh(current_user)

    return _format_profile_out(current_user, profile)

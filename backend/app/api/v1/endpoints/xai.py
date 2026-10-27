from typing import Optional
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.profile import StudentProfile
from app.models.resume import ResumeAnalysis
from app.models.user import User
from app.schemas.xai import (
    GlobalModelXaiOut,
    ModelExplanationOut,
    ReadinessExplanationRequest,
)
from app.ml.xai_service import (
    explain_student_assessment,
    get_global_model_explanation,
)

router = APIRouter()


@router.post(
    "/explain",
    response_model=ModelExplanationOut,
    status_code=status.HTTP_200_OK,
    summary="Explain student career readiness prediction using SHAP and LIME",
)
def post_xai_explanation(
    request: ReadinessExplanationRequest = ReadinessExplanationRequest(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ModelExplanationOut:
    """Computes SHAP additive feature attributions and LIME local linear surrogate for authenticated student."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    candidate_skills = list(profile.skills or []) if profile else []
    target_role = (
        (request.target_role or "").strip()
        or (profile.target_role if profile and profile.target_role else "")
        or "Data Analyst"
    )
    exp_months = profile.experience_months if profile else 0
    edu_level = profile.education_level if profile else None
    github_url = profile.github_url if profile else None
    linkedin_url = profile.linkedin_url if profile else None

    if request.include_resume_skills:
        latest_resume = (
            db.query(ResumeAnalysis)
            .filter(ResumeAnalysis.user_id == current_user.id)
            .order_by(ResumeAnalysis.created_at.desc())
            .first()
        )
        if latest_resume and latest_resume.skills:
            existing_names = {s.get("name", "").strip().lower() for s in candidate_skills}
            for r_skill in latest_resume.skills:
                r_name = (r_skill.get("name") or "").strip()
                if r_name and r_name.lower() not in existing_names:
                    candidate_skills.append({"name": r_name, "level": 3})
                    existing_names.add(r_name.lower())

    explanation_dict = explain_student_assessment(
        profile_skills=candidate_skills,
        target_role=target_role,
        experience_months=exp_months,
        education_level=edu_level,
        github_url=github_url,
        linkedin_url=linkedin_url,
    )

    return ModelExplanationOut(**explanation_dict)


@router.get(
    "/explain",
    response_model=ModelExplanationOut,
    status_code=status.HTTP_200_OK,
    summary="Get SHAP and LIME explanations for authenticated student",
)
def get_xai_explanation(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ModelExplanationOut:
    """Retrieve explainability analysis for authenticated user's current profile."""
    return post_xai_explanation(
        request=ReadinessExplanationRequest(),
        current_user=current_user,
        db=db,
    )


@router.get(
    "/global",
    response_model=GlobalModelXaiOut,
    status_code=status.HTTP_200_OK,
    summary="Get global feature importance and methodology notes",
)
def get_xai_global() -> GlobalModelXaiOut:
    """Returns global Gini importance and mean absolute SHAP values across benchmark distribution."""
    data = get_global_model_explanation()
    return GlobalModelXaiOut(**data)

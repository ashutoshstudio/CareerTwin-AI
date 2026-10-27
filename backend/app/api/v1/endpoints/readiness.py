from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.models.profile import StudentProfile
from app.models.readiness import CareerReadinessAssessment
from app.models.resume import ResumeAnalysis
from app.models.user import User
from app.schemas.readiness import (
    CareerReadinessOut,
    DimensionScores,
    ModelEvaluationMetrics,
    ModelInfoOut,
    ReadinessAssessmentRequest,
    ReadinessHistoryItem,
)
from app.schemas.xai import (
    GlobalModelXaiOut,
    ModelExplanationOut,
    ReadinessExplanationRequest,
)
from app.ml.readiness_model import (
    SUPPORTED_ROLES,
    assess_readiness,
    get_model_bundle,
)
from app.ml.xai_service import (
    explain_student_assessment,
    get_global_model_explanation,
)

router = APIRouter()


def _format_assessment_out(record: CareerReadinessAssessment, user_id: int, model_metadata: dict) -> CareerReadinessOut:
    """Format SQLAlchemy assessment record to Pydantic CareerReadinessOut."""
    dims = record.dimension_scores or {}
    dimension_scores = DimensionScores(
        technical_skills=dims.get("technical_skills", 0.0),
        experience=dims.get("experience", 0.0),
        education=dims.get("education", 0.0),
        portfolio=dims.get("portfolio", 0.0),
    )

    return CareerReadinessOut(
        id=record.id,
        user_id=user_id,
        target_role=record.target_role,
        readiness_score=record.readiness_score,
        readiness_category=record.readiness_category,
        model_version=record.model_version,
        dimension_scores=dimension_scores,
        matching_core_skills=record.matching_core_skills or [],
        missing_core_skills=record.missing_core_skills or [],
        supporting_skills=record.supporting_skills or [],
        features_snapshot=record.features_snapshot or {},
        limitations=record.limitations or [],
        model_metadata=model_metadata,
        created_at=record.created_at,
    )


@router.post(
    "/assess",
    response_model=CareerReadinessOut,
    status_code=status.HTTP_200_OK,
    summary="Assess student career readiness for a target role using Scikit-learn",
)
def assess_student_readiness(
    request: ReadinessAssessmentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CareerReadinessOut:
    """
    Executes ML career readiness prediction for the authenticated student.
    Combines student profile data with verified skills and Scikit-learn model evaluation.
    """
    # 1. Fetch current profile
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    profile_skills = list(profile.skills or []) if profile else []
    experience_months = profile.experience_months if profile else 0
    education_level = profile.education_level if profile else None
    github_url = profile.github_url if profile else None
    linkedin_url = profile.linkedin_url if profile else None

    # Target role resolution: request override -> profile target_role -> fallback default
    target_role = (
        (request.target_role or "").strip()
        or (profile.target_role if profile and profile.target_role else "")
        or "Data Analyst"
    )

    # 2. Optionally incorporate newly extracted skills from user's latest resume analysis
    if request.include_resume_skills:
        latest_resume = (
            db.query(ResumeAnalysis)
            .filter(ResumeAnalysis.user_id == current_user.id)
            .order_by(ResumeAnalysis.created_at.desc())
            .first()
        )
        if latest_resume and latest_resume.skills:
            existing_skill_names = {s.get("name", "").lower().strip() for s in profile_skills}
            for r_skill in latest_resume.skills:
                r_name = r_skill.get("name", "").strip()
                if r_name and r_name.lower() not in existing_skill_names:
                    profile_skills.append({"name": r_name, "level": 3})
                    existing_skill_names.add(r_name.lower())

    # 3. Execute Scikit-learn ML assessment
    ml_output = assess_readiness(
        profile_skills=profile_skills,
        target_role=target_role,
        experience_months=experience_months,
        education_level=education_level,
        github_url=github_url,
        linkedin_url=linkedin_url,
    )

    # 4. Save assessment result to database
    assessment = CareerReadinessAssessment(
        user_id=current_user.id,
        target_role=ml_output["target_role"],
        readiness_score=ml_output["readiness_score"],
        readiness_category=ml_output["readiness_category"],
        model_version=ml_output["model_version"],
        dimension_scores=ml_output["dimension_scores"],
        features_snapshot=ml_output["features_snapshot"],
        matching_core_skills=ml_output["matching_core_skills"],
        missing_core_skills=ml_output["missing_core_skills"],
        supporting_skills=ml_output["supporting_skills"],
        limitations=ml_output["limitations"],
    )

    db.add(assessment)
    db.commit()
    db.refresh(assessment)

    return _format_assessment_out(assessment, current_user.id, ml_output["model_metadata"])


@router.get(
    "/latest",
    response_model=CareerReadinessOut,
    status_code=status.HTTP_200_OK,
    summary="Get user's latest career readiness assessment",
)
def get_latest_readiness(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CareerReadinessOut:
    """
    Retrieve user's latest readiness assessment.
    If none exists yet, automatically computes an initial baseline assessment.
    """
    record = (
        db.query(CareerReadinessAssessment)
        .filter(CareerReadinessAssessment.user_id == current_user.id)
        .order_by(CareerReadinessAssessment.created_at.desc())
        .first()
    )

    _, metadata = get_model_bundle()

    if not record:
        # Run an initial assessment for the student
        return assess_student_readiness(
            request=ReadinessAssessmentRequest(),
            current_user=current_user,
            db=db,
        )

    return _format_assessment_out(record, current_user.id, metadata)


@router.get(
    "/history",
    response_model=List[ReadinessHistoryItem],
    status_code=status.HTTP_200_OK,
    summary="Get user's previous readiness assessment history",
)
def get_readiness_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[ReadinessHistoryItem]:
    """
    Retrieve past readiness assessments for the authenticated user (tenant isolated).
    """
    records = (
        db.query(CareerReadinessAssessment)
        .filter(CareerReadinessAssessment.user_id == current_user.id)
        .order_by(CareerReadinessAssessment.created_at.desc())
        .limit(20)
        .all()
    )

    return [
        ReadinessHistoryItem(
            id=r.id,
            target_role=r.target_role,
            readiness_score=r.readiness_score,
            readiness_category=r.readiness_category,
            created_at=r.created_at,
        )
        for r in records
    ]


@router.get(
    "/model-info",
    response_model=ModelInfoOut,
    status_code=status.HTTP_200_OK,
    summary="Get transparent model architecture, evaluation metrics, and dataset description",
)
def get_readiness_model_info() -> ModelInfoOut:
    """
    Returns transparency details on model training, metrics on held-out test set,
    and scientific limitations.
    """
    _, metadata = get_model_bundle()
    raw_metrics = metadata.get("metrics", {})

    metrics = ModelEvaluationMetrics(
        accuracy=raw_metrics.get("accuracy", 0.0),
        macro_f1=raw_metrics.get("macro_f1", 0.0),
        r2_score=raw_metrics.get("r2_score", 0.0),
        mae=raw_metrics.get("mae", 0.0),
        train_samples=raw_metrics.get("train_samples", 0),
        test_samples=raw_metrics.get("test_samples", 0),
    )

    return ModelInfoOut(
        model_name=metadata.get("model_name", "CareerReadinessRandomForest"),
        model_version=metadata.get("model_version", "rf_v1.0"),
        algorithm=metadata.get("algorithm", "RandomForest Ensemble"),
        supported_roles=SUPPORTED_ROLES,
        features=metadata.get("features", []),
        metrics=metrics,
        dataset_description=metadata.get("dataset_description", ""),
        disclaimer=metadata.get("disclaimer", ""),
    )


@router.post(
    "/explain",
    response_model=ModelExplanationOut,
    status_code=status.HTTP_200_OK,
    summary="Explain student career readiness prediction using SHAP and LIME",
)
def explain_readiness_prediction(
    request: ReadinessExplanationRequest = ReadinessExplanationRequest(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ModelExplanationOut:
    """
    Computes exact SHAP additive feature attributions and LIME local linear
    explanations for the authenticated student's profile on the trained model.
    """
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
    summary="Get SHAP and LIME explanations for latest student profile assessment",
)
def get_latest_readiness_explanation(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ModelExplanationOut:
    """Retrieve explainability analysis for authenticated user's current profile."""
    return explain_readiness_prediction(
        request=ReadinessExplanationRequest(),
        current_user=current_user,
        db=db,
    )


@router.get(
    "/global-xai",
    response_model=GlobalModelXaiOut,
    status_code=status.HTTP_200_OK,
    summary="Get global feature importance and methodology notes",
)
def get_global_xai() -> GlobalModelXaiOut:
    """Returns global Gini importance and mean absolute SHAP values across benchmark distribution."""
    data = get_global_model_explanation()
    return GlobalModelXaiOut(**data)

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.profile import StudentProfile
from app.models.readiness import CareerReadinessAssessment
from app.models.recommendation import CareerRecommendation
from app.models.resume import ResumeAnalysis
from app.models.skill_gap import SkillGapAnalysis
from app.models.user import User
from app.schemas.recommendation import (
    CareerRecommendationsOut,
    CareerRecommendationsRequest,
    RecommendationHistoryItem,
    RoleCatalogItem,
    RoleRecommendationItem,
    SkillDeficitDetail,
    SkillMatchDetail,
)
from app.services.recommendation_service import (
    evaluate_career_recommendations,
    get_role_catalog_list,
)

router = APIRouter()


def _format_recommendations_out(
    record: CareerRecommendation,
) -> CareerRecommendationsOut:
    """Format SQLAlchemy CareerRecommendation model to Pydantic CareerRecommendationsOut schema."""
    raw_roles = record.recommended_roles or []
    items: List[RoleRecommendationItem] = []

    for r in raw_roles:
        if not isinstance(r, dict):
            continue

        raw_matching = r.get("matching_skills") or []
        matching = [
            SkillMatchDetail(
                name=m.get("name", ""),
                current_level=int(m.get("current_level", 1)),
                required_level=int(m.get("required_level", 1)),
                is_core=bool(m.get("is_core", True)),
            )
            for m in raw_matching
            if isinstance(m, dict)
        ]

        raw_missing = r.get("missing_or_weaker_skills") or []
        missing = [
            SkillDeficitDetail(
                name=g.get("name", ""),
                current_level=int(g.get("current_level", 0)),
                required_level=int(g.get("required_level", 1)),
                gap=int(g.get("gap", 1)),
                priority=str(g.get("priority", "medium")),
                is_core=bool(g.get("is_core", True)),
            )
            for g in raw_missing
            if isinstance(g, dict)
        ]

        items.append(
            RoleRecommendationItem(
                role_name=r.get("role_name", ""),
                fit_score=float(r.get("fit_score", 0.0)),
                match_tier=r.get("match_tier", "Potential Match"),
                rank=int(r.get("rank", 1)),
                demand_level=r.get("demand_level", "High"),
                core_alignment_score=float(r.get("core_alignment_score", 0.0)),
                secondary_alignment_score=float(r.get("secondary_alignment_score", 0.0)),
                fit_reason=r.get("fit_reason", ""),
                matching_skills=matching,
                missing_or_weaker_skills=missing,
                suggested_next_steps=r.get("suggested_next_steps", []),
            )
        )

    skills_snapshot = record.student_skills_snapshot or []
    evaluated_skill_names = [
        s.get("name") for s in skills_snapshot if isinstance(s, dict) and s.get("name")
    ]

    return CareerRecommendationsOut(
        id=record.id,
        user_id=record.user_id,
        top_role=record.top_role,
        top_fit_score=record.top_fit_score,
        total_roles_evaluated=len(items),
        student_skills_evaluated=evaluated_skill_names,
        recommendations=items,
        created_at=record.created_at,
    )


@router.post(
    "/evaluate",
    response_model=CareerRecommendationsOut,
    status_code=status.HTTP_200_OK,
    summary="Evaluate transparent career recommendations for authenticated student",
)
def run_career_recommendations(
    request: CareerRecommendationsRequest = CareerRecommendationsRequest(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CareerRecommendationsOut:
    """
    Ranks suitable roles from the documented catalog based on the student's
    actual profile skills, proficiency levels, target role preference,
    education, and prior readiness assessments.
    """
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    candidate_skills = list(profile.skills or []) if profile else []
    target_role = profile.target_role if profile else None
    exp_months = profile.experience_months if profile else 0
    edu_level = profile.education_level if profile else None

    # Optionally merge unmerged resume extracted skills
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

    # Fetch prior readiness assessments
    readiness_records = (
        db.query(CareerReadinessAssessment)
        .filter(CareerReadinessAssessment.user_id == current_user.id)
        .all()
    )
    prior_readiness_map: Dict[str, float] = {
        r.target_role: r.readiness_score for r in readiness_records
    }

    # Fetch prior skill gap analyses
    gap_records = (
        db.query(SkillGapAnalysis)
        .filter(SkillGapAnalysis.user_id == current_user.id)
        .all()
    )
    prior_gap_map: Dict[str, float] = {
        g.target_role: g.skill_coverage_percentage for g in gap_records
    }

    # Evaluate recommendations
    ranked_roles = evaluate_career_recommendations(
        candidate_skills=candidate_skills,
        target_role=target_role,
        experience_months=exp_months,
        education_level=edu_level,
        prior_readiness_map=prior_readiness_map,
        prior_gap_map=prior_gap_map,
    )

    top_role = ranked_roles[0]["role_name"] if ranked_roles else "Data Analyst"
    top_score = ranked_roles[0]["fit_score"] if ranked_roles else 0.0

    # Persist in database
    rec_record = CareerRecommendation(
        user_id=current_user.id,
        top_role=top_role,
        top_fit_score=top_score,
        recommended_roles=ranked_roles,
        student_skills_snapshot=candidate_skills,
    )
    db.add(rec_record)
    db.commit()
    db.refresh(rec_record)

    return _format_recommendations_out(rec_record)


@router.get(
    "/latest",
    response_model=CareerRecommendationsOut,
    status_code=status.HTTP_200_OK,
    summary="Get user's latest career recommendations",
)
def get_latest_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> CareerRecommendationsOut:
    """
    Retrieve most recent career recommendations for the authenticated user.
    If none exists, executes an initial evaluation based on current profile.
    """
    record = (
        db.query(CareerRecommendation)
        .filter(CareerRecommendation.user_id == current_user.id)
        .order_by(CareerRecommendation.created_at.desc())
        .first()
    )

    if not record:
        return run_career_recommendations(
            request=CareerRecommendationsRequest(),
            current_user=current_user,
            db=db,
        )

    return _format_recommendations_out(record)


@router.get(
    "/history",
    response_model=List[RecommendationHistoryItem],
    status_code=status.HTTP_200_OK,
    summary="Get history of past career recommendation evaluations",
)
def get_recommendation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[RecommendationHistoryItem]:
    """Retrieve historical recommendation evaluations for the current authenticated user."""
    records = (
        db.query(CareerRecommendation)
        .filter(CareerRecommendation.user_id == current_user.id)
        .order_by(CareerRecommendation.created_at.desc())
        .limit(20)
        .all()
    )

    return [
        RecommendationHistoryItem(
            id=r.id,
            top_role=r.top_role,
            top_fit_score=r.top_fit_score,
            created_at=r.created_at,
        )
        for r in records
    ]


@router.get(
    "/catalog",
    response_model=List[RoleCatalogItem],
    status_code=status.HTTP_200_OK,
    summary="Get documented catalog of supported technology roles",
)
def get_catalog() -> List[RoleCatalogItem]:
    """Returns the documented role catalog with benchmark skills, demand outlook, and suitable backgrounds."""
    raw_catalog = get_role_catalog_list()
    return [
        RoleCatalogItem(
            role_name=c["role_name"],
            tagline=c["tagline"],
            demand_level=c["demand_level"],
            description=c["description"],
            core_skills=c["core_skills"],
            secondary_skills=c["secondary_skills"],
            suitable_backgrounds=c["suitable_backgrounds"],
        )
        for c in raw_catalog
    ]

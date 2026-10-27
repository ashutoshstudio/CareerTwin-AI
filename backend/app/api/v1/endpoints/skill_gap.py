from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.models.profile import StudentProfile
from app.models.resume import ResumeAnalysis
from app.models.skill_gap import SkillGapAnalysis
from app.models.user import User
from app.schemas.skill_gap import (
    LearningRecommendation,
    RoleSkillsDefinitionOut,
    SkillComparisonItem,
    SkillGapHistoryItem,
    SkillGapOut,
    SkillGapRequest,
)
from app.services.skill_gap_service import (
    ROLE_BENCHMARKS,
    analyze_skill_gap,
)

router = APIRouter()


def _format_skill_gap_out(record: SkillGapAnalysis) -> SkillGapOut:
    """Format SQLAlchemy SkillGapAnalysis model to Pydantic SkillGapOut schema."""
    raw_comparisons = record.skills_comparison or []
    comparisons = [
        SkillComparisonItem(
            name=c.get("name", ""),
            category=c.get("category", "Core Requirement"),
            current_level=int(c.get("current_level", 0)),
            required_level=int(c.get("required_level", 1)),
            gap=int(c.get("gap", 0)),
            status=c.get("status", "missing"),
            priority=c.get("priority", "medium"),
        )
        for c in raw_comparisons
        if isinstance(c, dict)
    ]

    raw_recs = record.recommendations or []
    recommendations = [
        LearningRecommendation(
            skill_name=r.get("skill_name", ""),
            priority=r.get("priority", "medium"),
            action_type=r.get("action_type", "acquire_missing"),
            current_level=int(r.get("current_level", 0)),
            target_level=int(r.get("target_level", 1)),
            recommendation=r.get("recommendation", ""),
        )
        for r in raw_recs
        if isinstance(r, dict)
    ]

    return SkillGapOut(
        id=record.id,
        user_id=record.user_id,
        target_role=record.target_role,
        skill_coverage_percentage=record.skill_coverage_percentage,
        proficiency_alignment_percentage=record.proficiency_alignment_percentage,
        met_count=record.met_count,
        improvement_count=record.improvement_count,
        missing_count=record.missing_count,
        total_required=record.total_required,
        skills_comparison=comparisons,
        recommendations=recommendations,
        created_at=record.created_at,
    )


@router.post(
    "/analyze",
    response_model=SkillGapOut,
    status_code=status.HTTP_200_OK,
    summary="Analyze student skill gap against target role requirements",
)
def run_skill_gap_analysis(
    request: SkillGapRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SkillGapOut:
    """
    Evaluates current student profile skills and proficiency levels against
    the target entry-level role benchmark. Saves analysis to database.
    """
    # 1. Fetch current profile
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    candidate_skills = list(profile.skills or []) if profile else []

    # 2. Determine target role
    target_role = (
        (request.target_role or "").strip()
        or (profile.target_role if profile and profile.target_role else "")
        or "Data Analyst"
    )

    # 3. Optionally incorporate unmerged resume skills
    if request.include_resume_skills:
        latest_resume = (
            db.query(ResumeAnalysis)
            .filter(ResumeAnalysis.user_id == current_user.id)
            .order_by(ResumeAnalysis.created_at.desc())
            .first()
        )
        if latest_resume and latest_resume.skills:
            existing_names = {s.get("name", "").lower().strip() for s in candidate_skills}
            for r_skill in latest_resume.skills:
                r_name = r_skill.get("name", "").strip()
                if r_name and r_name.lower() not in existing_names:
                    candidate_skills.append({"name": r_name, "level": 3})
                    existing_names.add(r_name.lower())

    # 4. Perform skill gap computation
    gap_result = analyze_skill_gap(candidate_skills, target_role)

    # 5. Persist analysis
    record = SkillGapAnalysis(
        user_id=current_user.id,
        target_role=gap_result["target_role"],
        skill_coverage_percentage=gap_result["skill_coverage_percentage"],
        proficiency_alignment_percentage=gap_result["proficiency_alignment_percentage"],
        met_count=gap_result["met_count"],
        improvement_count=gap_result["improvement_count"],
        missing_count=gap_result["missing_count"],
        total_required=gap_result["total_required"],
        skills_comparison=gap_result["skills_comparison"],
        recommendations=gap_result["recommendations"],
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return _format_skill_gap_out(record)


@router.get(
    "/latest",
    response_model=SkillGapOut,
    status_code=status.HTTP_200_OK,
    summary="Get user's latest skill gap analysis",
)
def get_latest_skill_gap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SkillGapOut:
    """
    Retrieve most recent skill gap analysis for the authenticated user.
    If none exists, executes an initial analysis based on their profile.
    """
    record = (
        db.query(SkillGapAnalysis)
        .filter(SkillGapAnalysis.user_id == current_user.id)
        .order_by(SkillGapAnalysis.created_at.desc())
        .first()
    )

    if not record:
        return run_skill_gap_analysis(
            request=SkillGapRequest(),
            current_user=current_user,
            db=db,
        )

    return _format_skill_gap_out(record)


@router.get(
    "/history",
    response_model=List[SkillGapHistoryItem],
    status_code=status.HTTP_200_OK,
    summary="Get user's past skill gap analysis history",
)
def get_skill_gap_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[SkillGapHistoryItem]:
    """
    Retrieve history of previous skill gap analyses for the current user.
    """
    records = (
        db.query(SkillGapAnalysis)
        .filter(SkillGapAnalysis.user_id == current_user.id)
        .order_by(SkillGapAnalysis.created_at.desc())
        .limit(20)
        .all()
    )

    return [
        SkillGapHistoryItem(
            id=r.id,
            target_role=r.target_role,
            skill_coverage_percentage=r.skill_coverage_percentage,
            proficiency_alignment_percentage=r.proficiency_alignment_percentage,
            missing_count=r.missing_count,
            created_at=r.created_at,
        )
        for r in records
    ]


@router.get(
    "/roles",
    response_model=List[RoleSkillsDefinitionOut],
    status_code=status.HTTP_200_OK,
    summary="Get supported roles and their benchmark skill requirements",
)
def get_role_definitions() -> List[RoleSkillsDefinitionOut]:
    """
    Returns benchmark role competencies, core skills, and required levels.
    """
    results = []
    for role_name, data in ROLE_BENCHMARKS.items():
        results.append(
            RoleSkillsDefinitionOut(
                role_name=role_name,
                core_skills=data["core_skills"],
                secondary_skills=data["secondary_skills"],
            )
        )
    return results

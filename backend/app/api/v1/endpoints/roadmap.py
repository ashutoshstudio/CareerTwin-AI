from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from app.api.deps import get_current_user, get_db
from app.models.profile import StudentProfile
from app.models.resume import ResumeAnalysis
from app.models.roadmap import LearningRoadmap
from app.models.user import User
from app.schemas.roadmap import (
    RoadmapGenerateRequest,
    RoadmapItem,
    RoadmapItemToggleRequest,
    RoadmapOut,
    RoadmapResource,
    RoadmapSummaryOut,
    RoadmapWeek,
)
from app.services.roadmap_service import (
    generate_personalized_roadmap,
    recalculate_roadmap_progress,
)

router = APIRouter()


def _format_roadmap_out(record: LearningRoadmap) -> RoadmapOut:
    """Format SQLAlchemy LearningRoadmap model into Pydantic RoadmapOut schema."""
    raw_weeks = record.weeks_data or []
    completed_ids = set(record.completed_item_ids or [])
    weeks: List[RoadmapWeek] = []

    for w in raw_weeks:
        raw_items = w.get("items", [])
        items: List[RoadmapItem] = []
        for it in raw_items:
            item_id = it.get("id", "")
            is_item_done = item_id in completed_ids or bool(it.get("is_completed", False))
            raw_resources = it.get("resources", [])
            resources = [
                RoadmapResource(
                    title=r.get("title", ""),
                    url=r.get("url", "#"),
                    type=r.get("type", "Tutorial"),
                    is_free=r.get("is_free", True),
                )
                for r in raw_resources
            ]
            items.append(
                RoadmapItem(
                    id=item_id,
                    title=it.get("title", ""),
                    description=it.get("description", ""),
                    skills=it.get("skills", []),
                    resources=resources,
                    is_completed=is_item_done,
                )
            )

        is_week_done = bool(items) and all(item.is_completed for item in items)
        weeks.append(
            RoadmapWeek(
                week_number=int(w.get("week_number", 1)),
                title=w.get("title", ""),
                focus_area=w.get("focus_area", ""),
                estimated_hours=int(w.get("estimated_hours", 10)),
                milestone=w.get("milestone", ""),
                skills=w.get("skills", []),
                items=items,
                is_completed=is_week_done,
            )
        )

    return RoadmapOut(
        id=record.id,
        user_id=record.user_id,
        target_role=record.target_role,
        total_weeks=record.total_weeks,
        current_week=record.current_week,
        completion_percentage=record.completion_percentage,
        total_items=record.total_items,
        completed_items=record.completed_items,
        weeks=weeks,
        created_at=record.created_at,
        updated_at=record.updated_at,
    )


def _get_candidate_skills_and_role(
    current_user: User,
    db: Session,
    target_role_override: Optional[str] = None,
    include_resume: bool = True,
) -> tuple[List[Dict[str, Any]], str]:
    """Retrieve verified profile skills, optionally unmerged resume skills, and target role."""
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    candidate_skills = list(profile.skills or []) if profile else []

    target_role = (
        (target_role_override or "").strip()
        or (profile.target_role if profile and profile.target_role else "")
        or "Data Analyst"
    )

    if include_resume:
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

    return candidate_skills, target_role


@router.get(
    "",
    response_model=RoadmapOut,
    status_code=status.HTTP_200_OK,
    summary="Get current user's personalized learning roadmap",
)
def get_current_roadmap(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RoadmapOut:
    """
    Retrieve current active learning roadmap for authenticated student.
    If no roadmap has been generated yet, automatically synthesizes and persists one.
    """
    record = (
        db.query(LearningRoadmap)
        .filter(LearningRoadmap.user_id == current_user.id)
        .order_by(LearningRoadmap.created_at.desc())
        .first()
    )

    if not record:
        # Generate initial roadmap based on profile skills
        candidate_skills, target_role = _get_candidate_skills_and_role(current_user, db)
        gen = generate_personalized_roadmap(candidate_skills, target_role)

        record = LearningRoadmap(
            user_id=current_user.id,
            target_role=gen["target_role"],
            total_weeks=gen["total_weeks"],
            current_week=gen["current_week"],
            completion_percentage=gen["completion_percentage"],
            total_items=gen["total_items"],
            completed_items=gen["completed_items"],
            weeks_data=gen["weeks"],
            completed_item_ids=[],
        )
        db.add(record)
        db.commit()
        db.refresh(record)

    return _format_roadmap_out(record)


@router.post(
    "/generate",
    response_model=RoadmapOut,
    status_code=status.HTTP_200_OK,
    summary="Generate or regenerate personalized learning roadmap",
)
def generate_roadmap(
    request: RoadmapGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RoadmapOut:
    """
    Generates a personalized weekly roadmap for the specified target role and skill gaps.
    Saves to database and returns the generated plan.
    """
    candidate_skills, target_role = _get_candidate_skills_and_role(
        current_user,
        db,
        target_role_override=request.target_role,
        include_resume=request.include_resume_skills,
    )

    gen = generate_personalized_roadmap(
        candidate_skills=candidate_skills,
        target_role=target_role,
        target_weeks=request.target_weeks,
    )

    record = LearningRoadmap(
        user_id=current_user.id,
        target_role=gen["target_role"],
        total_weeks=gen["total_weeks"],
        current_week=gen["current_week"],
        completion_percentage=gen["completion_percentage"],
        total_items=gen["total_items"],
        completed_items=gen["completed_items"],
        weeks_data=gen["weeks"],
        completed_item_ids=[],
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return _format_roadmap_out(record)


@router.post(
    "/toggle-item",
    response_model=RoadmapOut,
    status_code=status.HTTP_200_OK,
    summary="Toggle milestone checklist topic completion",
)
def toggle_roadmap_item(
    request: RoadmapItemToggleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RoadmapOut:
    """
    Updates completion status of a roadmap topic, persists progress in SQLite,
    and recalculates completion percentage and current active week.
    """
    record = (
        db.query(LearningRoadmap)
        .filter(LearningRoadmap.user_id == current_user.id)
        .order_by(LearningRoadmap.created_at.desc())
        .first()
    )

    if not record:
        # If no roadmap exists yet, auto-generate first
        candidate_skills, target_role = _get_candidate_skills_and_role(current_user, db)
        gen = generate_personalized_roadmap(candidate_skills, target_role)
        record = LearningRoadmap(
            user_id=current_user.id,
            target_role=gen["target_role"],
            total_weeks=gen["total_weeks"],
            current_week=gen["current_week"],
            completion_percentage=gen["completion_percentage"],
            total_items=gen["total_items"],
            completed_items=gen["completed_items"],
            weeks_data=gen["weeks"],
            completed_item_ids=[],
        )
        db.add(record)
        db.commit()
        db.refresh(record)

    completed_ids = set(record.completed_item_ids or [])
    if request.is_completed:
        completed_ids.add(request.item_id)
    else:
        completed_ids.discard(request.item_id)

    weeks_data = list(record.weeks_data or [])
    (
        updated_weeks,
        total_items,
        completed_items,
        completion_pct,
        current_week,
        _,
        _,
    ) = recalculate_roadmap_progress(weeks_data, completed_ids)

    record.completed_item_ids = list(completed_ids)
    record.weeks_data = updated_weeks
    record.total_items = total_items
    record.completed_items = completed_items
    record.completion_percentage = completion_pct
    record.current_week = current_week

    flag_modified(record, "completed_item_ids")
    flag_modified(record, "weeks_data")

    db.add(record)
    db.commit()
    db.refresh(record)

    return _format_roadmap_out(record)


@router.get(
    "/summary",
    response_model=RoadmapSummaryOut,
    status_code=status.HTTP_200_OK,
    summary="Get compact roadmap progress summary for dashboard",
)
def get_roadmap_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> RoadmapSummaryOut:
    """
    Retrieve high-level summary metrics (completion %, current week, next task)
    for dashboard widget display.
    """
    record = (
        db.query(LearningRoadmap)
        .filter(LearningRoadmap.user_id == current_user.id)
        .order_by(LearningRoadmap.created_at.desc())
        .first()
    )

    if not record:
        return RoadmapSummaryOut(has_roadmap=False)

    weeks_data = list(record.weeks_data or [])
    completed_ids = set(record.completed_item_ids or [])
    (
        _,
        total_items,
        completed_items,
        completion_pct,
        current_week,
        next_task,
        milestone,
    ) = recalculate_roadmap_progress(weeks_data, completed_ids)

    return RoadmapSummaryOut(
        has_roadmap=True,
        target_role=record.target_role,
        completion_percentage=completion_pct,
        total_weeks=record.total_weeks,
        current_week=current_week,
        total_items=total_items,
        completed_items=completed_items,
        next_recommended_task=next_task,
        milestone=milestone,
    )

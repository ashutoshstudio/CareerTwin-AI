from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.job import SavedJob
from app.models.profile import StudentProfile
from app.models.resume import ResumeAnalysis
from app.models.user import User
from app.schemas.job import (
    JobListingBase,
    JobMatchResult,
    JobMatchesResponse,
    SavedJobOut,
    ToggleSaveResponse,
)
from app.services.job_matching_service import (
    calculate_job_match,
    get_job_by_id,
    get_job_catalog,
    match_jobs_for_candidate,
)

router = APIRouter()


@router.get(
    "/match",
    response_model=JobMatchesResponse,
    status_code=status.HTTP_200_OK,
    summary="Match entry-level vacancies against current student's verified skills",
)
def get_matched_jobs(
    role_category: Optional[str] = Query(None, description="Filter by role category (e.g. 'Data Analyst')"),
    location_type: Optional[str] = Query(None, description="Filter by location type ('Remote', 'Hybrid', 'On-site')"),
    min_match_score: Optional[float] = Query(None, ge=0.0, le=100.0, description="Minimum match percentage threshold"),
    include_resume_skills: bool = Query(True, description="Incorporate unmerged skills from latest resume"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JobMatchesResponse:
    """
    Ranks curated entry-level tech vacancies for the authenticated student
    using transparent skill matching and multi-factor competency calculation.
    """
    # 1. Fetch student profile
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    candidate_skills = list(profile.skills or []) if profile else []
    target_role = profile.target_role if profile else None
    exp_months = profile.experience_months if profile else 0

    # 2. Optionally incorporate resume skills
    if include_resume_skills:
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

    # 3. Fetch user's saved job IDs
    saved_records = db.query(SavedJob).filter(SavedJob.user_id == current_user.id).all()
    saved_ids = {r.job_id for r in saved_records}

    # 4. Perform job matching
    matched_results = match_jobs_for_candidate(
        candidate_skills=candidate_skills,
        target_role=target_role,
        experience_months=exp_months,
        role_filter=role_category,
        location_type_filter=location_type,
        min_match_score=min_match_score,
        saved_job_ids=saved_ids,
    )

    return JobMatchesResponse(
        total_matched=len(matched_results),
        candidate_skills_count=len(candidate_skills),
        matches=[JobMatchResult(**item) for item in matched_results],
    )


@router.get(
    "/vacancies",
    response_model=List[JobListingBase],
    status_code=status.HTTP_200_OK,
    summary="Get all curated academic technology vacancies",
)
def list_vacancies() -> List[JobListingBase]:
    """Returns all listings in the curated benchmark dataset."""
    catalog = get_job_catalog()
    return [JobListingBase(**item) for item in catalog]


@router.get(
    "/saved",
    response_model=List[SavedJobOut],
    status_code=status.HTTP_200_OK,
    summary="Get saved / bookmarked vacancies for authenticated student",
)
def get_saved_jobs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[SavedJobOut]:
    """Retrieves all jobs bookmarked by the current user."""
    records = (
        db.query(SavedJob)
        .filter(SavedJob.user_id == current_user.id)
        .order_by(SavedJob.created_at.desc())
        .all()
    )

    results = []
    for r in records:
        raw_job = get_job_by_id(r.job_id)
        job_details = JobListingBase(**raw_job) if raw_job else None
        results.append(
            SavedJobOut(
                id=r.id,
                job_id=r.job_id,
                user_id=r.user_id,
                saved_at=r.created_at,
                job_details=job_details,
            )
        )
    return results


@router.post(
    "/save/{job_id}",
    response_model=ToggleSaveResponse,
    status_code=status.HTTP_200_OK,
    summary="Save / bookmark a vacancy for the authenticated student",
)
def save_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ToggleSaveResponse:
    """Bookmarks a job vacancy for the current student."""
    job = get_job_by_id(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job vacancy with ID '{job_id}' not found in catalog.",
        )

    existing = (
        db.query(SavedJob)
        .filter(SavedJob.user_id == current_user.id, SavedJob.job_id == job_id)
        .first()
    )
    if existing:
        return ToggleSaveResponse(
            job_id=job_id,
            is_saved=True,
            message="Job is already saved in your bookmarks.",
        )

    saved_rec = SavedJob(user_id=current_user.id, job_id=job_id)
    db.add(saved_rec)
    db.commit()

    return ToggleSaveResponse(
        job_id=job_id,
        is_saved=True,
        message="Job successfully bookmarked to your saved list.",
    )


@router.delete(
    "/save/{job_id}",
    response_model=ToggleSaveResponse,
    status_code=status.HTTP_200_OK,
    summary="Remove a saved vacancy from student bookmarks",
)
def unsave_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ToggleSaveResponse:
    """Removes a bookmarked job vacancy for the current student."""
    existing = (
        db.query(SavedJob)
        .filter(SavedJob.user_id == current_user.id, SavedJob.job_id == job_id)
        .first()
    )
    if not existing:
        return ToggleSaveResponse(
            job_id=job_id,
            is_saved=False,
            message="Job was not in your saved bookmarks.",
        )

    db.delete(existing)
    db.commit()

    return ToggleSaveResponse(
        job_id=job_id,
        is_saved=False,
        message="Job removed from your saved bookmarks.",
    )


@router.get(
    "/{job_id}",
    response_model=JobMatchResult,
    status_code=status.HTTP_200_OK,
    summary="Get single vacancy with personalized match score for current student",
)
def get_job_detail(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JobMatchResult:
    """Fetches a specific vacancy with personalized match metrics."""
    job = get_job_by_id(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID '{job_id}' not found.",
        )

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    candidate_skills = list(profile.skills or []) if profile else []
    target_role = profile.target_role if profile else None
    exp_months = profile.experience_months if profile else 0

    match_res = calculate_job_match(
        job=job,
        candidate_skills=candidate_skills,
        target_role=target_role,
        experience_months=exp_months,
    )

    is_saved = (
        db.query(SavedJob)
        .filter(SavedJob.user_id == current_user.id, SavedJob.job_id == job_id)
        .first()
        is not None
    )

    match_res["is_saved"] = is_saved
    match_res["rank"] = 1

    return JobMatchResult(**match_res)

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
    ProviderStatusItem,
    ProviderStatusResponse,
    SavedJobOut,
    ToggleSaveResponse,
)
from app.services.job_matching_service import (
    calculate_job_match,
    get_job_by_id,
    get_job_catalog,
    match_jobs_for_candidate,
)
from app.services.job_providers.job_provider_service import get_job_provider_service

router = APIRouter()


@router.get(
    "/providers",
    response_model=ProviderStatusResponse,
    status_code=status.HTTP_200_OK,
    summary="Get operational status and attribution requirements for all external job providers",
)
def get_providers_status() -> ProviderStatusResponse:
    """Returns the operational status, attribution info, and credential state for each job provider."""
    provider_svc = get_job_provider_service()
    statuses = provider_svc.get_provider_statuses()
    items = [ProviderStatusItem(**s) for s in statuses]
    return ProviderStatusResponse(
        providers=items,
        total_configured=sum(1 for i in items if i.configured),
        total_active=sum(1 for i in items if i.active),
    )


@router.get(
    "/live",
    response_model=List[JobListingBase],
    status_code=status.HTTP_200_OK,
    summary="Fetch live job listings directly from active external job providers",
)
async def get_live_jobs(
    search: Optional[str] = Query(None, description="Search query keyword or job title"),
    location: Optional[str] = Query(None, description="Location filter"),
    role_category: Optional[str] = Query(None, description="Filter by technology domain or catalog role"),
    remote_only: bool = Query(False, description="Filter remote positions only"),
    provider: Optional[str] = Query(None, description="Filter by provider ('remotive', 'arbeitnow', 'adzuna')"),
    limit: int = Query(30, ge=1, le=100, description="Max jobs to retrieve"),
) -> List[JobListingBase]:
    """Fetches live vacancies from connected external APIs with in-memory caching and deduplication."""
    provider_svc = get_job_provider_service()
    norm_jobs = await provider_svc.fetch_live_jobs(
        query=search,
        location=location,
        role_category=role_category,
        remote_only=remote_only,
        provider_name=provider,
        limit=limit,
    )
    return [JobListingBase(**j.to_dict()) for j in norm_jobs]


@router.get(
    "/match",
    response_model=JobMatchesResponse,
    status_code=status.HTTP_200_OK,
    summary="Match live and curated vacancies against student competencies using 5-factor scoring",
)
async def get_matched_jobs(
    source_type: str = Query("all", description="Source pool to match against: 'all', 'live', or 'curated'"),
    role_category: Optional[str] = Query(None, description="Filter by role category (e.g. 'Data Analyst')"),
    location_type: Optional[str] = Query(None, description="Filter by location type ('Remote', 'Hybrid', 'On-site')"),
    remote_only: bool = Query(False, description="Filter remote positions only"),
    job_source: Optional[str] = Query(None, description="Filter by provider ('remotive', 'arbeitnow', 'adzuna', 'curated')"),
    min_match_score: Optional[float] = Query(None, ge=0.0, le=100.0, description="Minimum match percentage threshold"),
    sort_by: str = Query("match_score", description="Sort order: 'match_score' or 'newest'"),
    scoring_model: str = Query("five_factor", description="Scoring formula: 'five_factor' (50/20/15/5/10) or 'standard' (70/20/10)"),
    include_resume_skills: bool = Query(True, description="Incorporate unmerged skills from latest resume"),
    limit: int = Query(40, ge=1, le=100, description="Maximum vacancies to return"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> JobMatchesResponse:
    """
    Ranks vacancies against authenticated student's profile & resume competencies.
    Supports live jobs from external APIs, curated academic benchmarks, or both.
    """
    # 1. Fetch student profile
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    candidate_skills = list(profile.skills or []) if profile else []
    target_role = profile.target_role if profile else None
    exp_months = profile.experience_months if profile else 0
    candidate_edu = profile.education_level if profile else None
    candidate_deg = profile.headline if profile else None

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

    # 4. Fetch live jobs if requested (in testing, only fetch if mocked or explicitly active)
    live_dicts: Optional[List[Dict[str, Any]]] = None
    if source_type in {"all", "live"}:
        from app.core.config import settings as app_settings
        if app_settings.APP_ENV != "testing":
            provider_svc = get_job_provider_service()
            query_kw = target_role or (profile.headline if profile else None)
            live_norm = await provider_svc.fetch_live_jobs(
                query=query_kw,
                role_category=role_category,
                remote_only=remote_only,
                provider_name=job_source if job_source in {"remotive", "arbeitnow", "adzuna"} else None,
                limit=limit,
            )
            live_dicts = [j.to_dict() for j in live_norm]

    # 5. Perform job matching
    matched_results = match_jobs_for_candidate(
        candidate_skills=candidate_skills,
        target_role=target_role,
        experience_months=exp_months,
        candidate_education=candidate_edu,
        candidate_degree=candidate_deg,
        role_filter=role_category,
        location_type_filter=location_type,
        remote_only=remote_only,
        source_filter=job_source or (source_type if source_type in {"curated", "live"} else None),
        min_match_score=min_match_score,
        saved_job_ids=saved_ids,
        live_jobs=live_dicts,
        scoring_model=scoring_model,
        sort_by=sort_by,
    )

    sliced = matched_results[:limit]

    return JobMatchesResponse(
        total_matched=len(sliced),
        candidate_skills_count=len(candidate_skills),
        source_type=source_type,
        matches=[JobMatchResult(**item) for item in sliced],
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
            detail=f"Job vacancy with ID '{job_id}' not found in catalog or active cache.",
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
    candidate_edu = profile.education_level if profile else None
    candidate_deg = profile.headline if profile else None

    match_res = calculate_job_match(
        job=job,
        candidate_skills=candidate_skills,
        target_role=target_role,
        experience_months=exp_months,
        candidate_education=candidate_edu,
        candidate_degree=candidate_deg,
        scoring_model="five_factor",
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

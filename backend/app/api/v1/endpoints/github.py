from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.models.github import GitHubAnalysis
from app.models.profile import StudentProfile
from app.models.user import User
from app.schemas.github import (
    GitHubAnalysisOut,
    GitHubAnalyzeRequest,
    GitHubCategoryScores,
    GitHubDetectedTechnology,
    GitHubHistoryItem,
    GitHubProfileInfo,
    GitHubProjectIdea,
    GitHubRecommendationItem,
    GitHubRepoItem,
    SyncGitHubSkillsRequest,
    SyncGitHubSkillsOut,
)
from app.services.github_service import get_or_create_github_analysis

router = APIRouter()


def _format_github_out(record: GitHubAnalysis) -> GitHubAnalysisOut:
    """Format SQLAlchemy GitHubAnalysis record into validated Pydantic GitHubAnalysisOut schema."""
    cats = record.category_scores or {}
    category_scores = GitHubCategoryScores(
        project_quality=float(cats.get("project_quality", 0.0)),
        skill_diversity=float(cats.get("skill_diversity", 0.0)),
        documentation=float(cats.get("documentation", 0.0)),
        coding_activity=float(cats.get("coding_activity", 0.0)),
        community_engagement=float(cats.get("community_engagement", 0.0)),
        role_relevance=float(cats.get("role_relevance", 0.0)),
    )

    prof = record.profile_info or {}
    profile_info = GitHubProfileInfo(
        username=prof.get("username", record.username),
        name=prof.get("name"),
        avatar_url=prof.get("avatar_url"),
        bio=prof.get("bio"),
        company=prof.get("company"),
        location=prof.get("location"),
        blog=prof.get("blog"),
        public_repos_count=int(prof.get("public_repos_count", 0)),
        followers=int(prof.get("followers", 0)),
        following=int(prof.get("following", 0)),
        created_at=prof.get("created_at"),
        html_url=prof.get("html_url", f"https://github.com/{record.username}"),
    )

    raw_tech = record.detected_technologies or []
    detected_technologies = [
        GitHubDetectedTechnology(
            name=t.get("name", ""),
            category=t.get("category", "Tools, Cloud & DevOps"),
        )
        for t in raw_tech
        if isinstance(t, dict)
    ]

    raw_repos = record.repositories or []
    repositories = [
        GitHubRepoItem(
            name=r.get("name", ""),
            description=r.get("description"),
            html_url=r.get("html_url", ""),
            language=r.get("language"),
            stars=int(r.get("stars", 0)),
            forks=int(r.get("forks", 0)),
            updated_at=r.get("updated_at", ""),
            topics=r.get("topics", []),
            is_fork=bool(r.get("is_fork", False)),
            quality_score=float(r.get("quality_score", 0.0)),
        )
        for r in raw_repos
        if isinstance(r, dict)
    ]

    raw_recs = record.recommendations or []
    recommendations = [
        GitHubRecommendationItem(
            category=rc.get("category", "General"),
            issue=rc.get("issue", ""),
            importance=rc.get("importance", ""),
            suggestion=rc.get("suggestion", ""),
        )
        for rc in raw_recs
        if isinstance(rc, dict)
    ]

    raw_ideas = record.recommended_projects or []
    recommended_projects = [
        GitHubProjectIdea(
            title=pi.get("title", ""),
            description=pi.get("description", ""),
            suggested_tech=pi.get("suggested_tech", []),
            relevance_to_role=pi.get("relevance_to_role", ""),
        )
        for pi in raw_ideas
        if isinstance(pi, dict)
    ]

    return GitHubAnalysisOut(
        id=record.id,
        user_id=record.user_id,
        username=record.username,
        target_role=record.target_role,
        overall_score=record.overall_score,
        grade=record.grade,
        category_scores=category_scores,
        profile_info=profile_info,
        languages=record.languages or {},
        detected_technologies=detected_technologies,
        matched_skills=record.matched_skills or [],
        missing_skills=record.missing_skills or [],
        repositories=repositories,
        strengths=record.strengths or [],
        weaknesses=record.weaknesses or [],
        recommendations=recommendations,
        recommended_projects=recommended_projects,
        total_repos_analyzed=record.total_repos_analyzed,
        total_stars=record.total_stars,
        total_forks=record.total_forks,
        created_at=record.created_at,
    )


@router.post("/analyze", response_model=GitHubAnalysisOut, status_code=status.HTTP_200_OK)
async def analyze_github_profile(
    payload: GitHubAnalyzeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> GitHubAnalysisOut:
    """
    Analyzes public GitHub repositories and coding portfolio for a given username against target role.
    Saves evaluation to SQLite database and returns structured transparent analysis.
    """
    clean_username = (payload.username or "").strip().replace("@", "")
    target_role = (payload.target_role or "Data Analyst").strip()

    if not clean_username:
        # Fallback to student profile github_url if available
        profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
        if profile and profile.github_url:
            clean_username = profile.github_url.rstrip("/").split("/")[-1].replace("@", "").strip()

    if not clean_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A valid GitHub username is required for analysis.",
        )

    # Execute service analysis
    analysis_data = await get_or_create_github_analysis(
        username=clean_username,
        target_role=target_role,
        force_refresh=False,
    )

    # Persist record in database
    db_record = GitHubAnalysis(
        user_id=current_user.id,
        username=clean_username,
        target_role=target_role,
        overall_score=analysis_data["overall_score"],
        grade=analysis_data["grade"],
        category_scores=analysis_data["category_scores"],
        profile_info=analysis_data["profile_info"],
        languages=analysis_data["languages"],
        detected_technologies=analysis_data["detected_technologies"],
        matched_skills=analysis_data["matched_skills"],
        missing_skills=analysis_data["missing_skills"],
        repositories=analysis_data["repositories"],
        strengths=analysis_data["strengths"],
        weaknesses=analysis_data["weaknesses"],
        recommendations=analysis_data["recommendations"],
        recommended_projects=analysis_data["recommended_projects"],
        total_repos_analyzed=analysis_data["total_repos_analyzed"],
        total_stars=analysis_data["total_stars"],
        total_forks=analysis_data["total_forks"],
    )
    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    return _format_github_out(db_record)


@router.get("/latest", response_model=Optional[GitHubAnalysisOut], status_code=status.HTTP_200_OK)
def get_latest_github_analysis(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Optional[GitHubAnalysisOut]:
    """Retrieve the most recent GitHub portfolio evaluation for the authenticated user."""
    record = (
        db.query(GitHubAnalysis)
        .filter(GitHubAnalysis.user_id == current_user.id)
        .order_by(GitHubAnalysis.created_at.desc())
        .first()
    )
    if not record:
        return None
    return _format_github_out(record)


@router.get("/history", response_model=List[GitHubHistoryItem], status_code=status.HTTP_200_OK)
def get_github_analysis_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[GitHubHistoryItem]:
    """Retrieve evaluation history for previous GitHub analyses performed by the student."""
    records = (
        db.query(GitHubAnalysis)
        .filter(GitHubAnalysis.user_id == current_user.id)
        .order_by(GitHubAnalysis.created_at.desc())
        .all()
    )
    return [
        GitHubHistoryItem(
            id=r.id,
            username=r.username,
            target_role=r.target_role,
            overall_score=r.overall_score,
            grade=r.grade,
            total_repos_analyzed=r.total_repos_analyzed,
            total_stars=r.total_stars,
            created_at=r.created_at,
        )
        for r in records
    ]


@router.post("/sync-skills", response_model=SyncGitHubSkillsOut, status_code=status.HTTP_200_OK)
def sync_github_skills_to_profile(
    payload: SyncGitHubSkillsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SyncGitHubSkillsOut:
    """
    Syncs verified technical skills detected from GitHub into the student's profile.
    Enhances career readiness, skill gap calculations, and recommendation models without altering model weights.
    """
    # Find profile
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    if not profile:
        profile = StudentProfile(user_id=current_user.id, skills=[])
        db.add(profile)
        db.commit()
        db.refresh(profile)

    # Find analysis record
    if payload.analysis_id:
        analysis = (
            db.query(GitHubAnalysis)
            .filter(
                GitHubAnalysis.id == payload.analysis_id,
                GitHubAnalysis.user_id == current_user.id,
            )
            .first()
        )
    else:
        analysis = (
            db.query(GitHubAnalysis)
            .filter(GitHubAnalysis.user_id == current_user.id)
            .order_by(GitHubAnalysis.created_at.desc())
            .first()
        )

    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No GitHub analysis found to sync skills from. Please run a GitHub portfolio analysis first.",
        )

    # Determine skills to sync
    candidate_skills: List[str] = []
    if payload.skill_names:
        candidate_skills = payload.skill_names
    else:
        # Default to all matched skills or top detected technologies
        candidate_skills = list(analysis.matched_skills or [])
        if not candidate_skills:
            detected = analysis.detected_technologies or []
            candidate_skills = [t.get("name") for t in detected if isinstance(t, dict) and t.get("name")]

    current_skills_list = list(profile.skills or [])
    existing_skill_names_lower = {
        s.get("name", "").lower() for s in current_skills_list if isinstance(s, dict)
    }

    synced_skills = []
    for skill_name in candidate_skills:
        clean_name = skill_name.strip()
        if clean_name and clean_name.lower() not in existing_skill_names_lower:
            current_skills_list.append({"name": clean_name, "level": 3})
            existing_skill_names_lower.add(clean_name.lower())
            synced_skills.append(clean_name)

    profile.skills = current_skills_list
    db.commit()
    db.refresh(profile)

    return SyncGitHubSkillsOut(
        synced_skills=synced_skills,
        total_profile_skills=len(current_skills_list),
        message=(
            f"Successfully synced {len(synced_skills)} new skill(s) from GitHub to your profile."
            if synced_skills
            else "All detected GitHub skills are already recorded in your profile."
        ),
    )

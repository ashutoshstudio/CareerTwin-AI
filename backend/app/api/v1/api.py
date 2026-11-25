from fastapi import APIRouter
from app.api.v1.endpoints import (
    ats,
    auth,
    career_assistant,
    github,
    job,
    mock_interview,
    profile,
    readiness,
    recommendation,
    reports,
    resume,
    roadmap,
    skill_gap,
    xai,
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(profile.router, prefix="/profile", tags=["Profile"])
api_router.include_router(resume.router, prefix="/resume", tags=["Resume Analysis"])
api_router.include_router(readiness.router, prefix="/readiness", tags=["Career Readiness"])
api_router.include_router(skill_gap.router, prefix="/skill-gap", tags=["Skill Gap Analysis"])
api_router.include_router(recommendation.router, prefix="/recommendations", tags=["Career Recommendations"])
api_router.include_router(job.router, prefix="/jobs", tags=["Job Matching"])
api_router.include_router(xai.router, prefix="/xai", tags=["Explainable AI"])
api_router.include_router(roadmap.router, prefix="/roadmap", tags=["Learning Roadmap"])
api_router.include_router(ats.router, prefix="/ats", tags=["ATS Resume Scorer"])
api_router.include_router(github.router, prefix="/github", tags=["GitHub Analyzer"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reports"])
api_router.include_router(career_assistant.router, prefix="/career-assistant", tags=["Career Assistant"])
api_router.include_router(mock_interview.router, prefix="/mock-interviews", tags=["Mock Interviews"])

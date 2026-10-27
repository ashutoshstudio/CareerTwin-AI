from fastapi import APIRouter
from app.api.v1.endpoints import auth, job, profile, readiness, recommendation, resume, skill_gap, xai

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(profile.router, prefix="/profile", tags=["Profile"])
api_router.include_router(resume.router, prefix="/resume", tags=["Resume Analysis"])
api_router.include_router(readiness.router, prefix="/readiness", tags=["Career Readiness"])
api_router.include_router(skill_gap.router, prefix="/skill-gap", tags=["Skill Gap Analysis"])
api_router.include_router(recommendation.router, prefix="/recommendations", tags=["Career Recommendations"])
api_router.include_router(job.router, prefix="/jobs", tags=["Job Matching"])
api_router.include_router(xai.router, prefix="/xai", tags=["Explainable AI"])

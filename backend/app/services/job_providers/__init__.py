"""
Job Provider Architecture for CareerTwin AI.
Integrates live external job listing providers (Adzuna, Remotive, Arbeitnow)
and harmonizes them into a unified, normalized schema.
"""
from app.services.job_providers.base import BaseJobProvider, NormalizedJob
from app.services.job_providers.job_provider_service import JobProviderService, get_job_provider_service

__all__ = [
    "BaseJobProvider",
    "NormalizedJob",
    "JobProviderService",
    "get_job_provider_service",
]

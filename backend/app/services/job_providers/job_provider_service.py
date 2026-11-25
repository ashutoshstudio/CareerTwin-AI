"""
Orchestration service for live external job providers and curated benchmarks.
Handles concurrent fetching, in-memory TTL caching, cross-provider deduplication,
and seamless unified job lookups.
"""
import asyncio
from datetime import datetime, timezone
import logging
import re
from typing import Any, Dict, List, Optional, Tuple

from app.core.config import settings
from app.services.job_providers.adzuna_provider import AdzunaJobProvider
from app.services.job_providers.arbeitnow_provider import ArbeitnowJobProvider
from app.services.job_providers.base import BaseJobProvider, NormalizedJob
from app.services.job_providers.remotive_provider import RemotiveJobProvider

logger = logging.getLogger(__name__)


def _make_dedup_key(title: str, company: str) -> str:
    """Normalize title and company to detect duplicate cross-posted vacancies."""
    clean_t = re.sub(r"[^a-z0-9]", "", (title or "").lower())
    clean_c = re.sub(r"[^a-z0-9]", "", (company or "").lower())
    return f"{clean_t}::{clean_c}"


class JobProviderService:
    """Singleton service orchestrating external job providers and local caching."""

    def __init__(self):
        self.providers: Dict[str, BaseJobProvider] = {
            "remotive": RemotiveJobProvider(),
            "arbeitnow": ArbeitnowJobProvider(),
            "adzuna": AdzunaJobProvider(),
        }
        # In-memory query cache: {cache_key: (timestamp, List[NormalizedJob])}
        self._query_cache: Dict[str, Tuple[float, List[NormalizedJob]]] = {}
        # Persistent memory index for lookups by job ID: {job_id: NormalizedJob}
        self._jobs_by_id: Dict[str, NormalizedJob] = {}

    def get_provider_statuses(self) -> List[Dict[str, Any]]:
        """Returns the operational status, credential state, and attribution for each provider."""
        statuses: List[Dict[str, Any]] = []
        for p in self.providers.values():
            statuses.append(p.get_status())

        # Also add status for the Curated Academic Benchmark dataset
        statuses.append({
            "name": "curated",
            "display_name": "Curated Academic Benchmarks",
            "configured": True,
            "active": True,
            "requires_credentials": False,
            "has_credentials": True,
            "terms_attribution": "Curated Academic Benchmark Dataset — CareerTwin AI Research v1.0",
            "attribution_url": None,
            "coverage": "42 Verified Technical Role Profiles & Curated Baseline Vacancies",
        })
        return statuses

    def clear_cache(self) -> None:
        """Flushes the query cache (useful in tests or admin refresh)."""
        self._query_cache.clear()

    async def fetch_live_jobs(
        self,
        query: Optional[str] = None,
        location: Optional[str] = None,
        role_category: Optional[str] = None,
        remote_only: bool = False,
        provider_name: Optional[str] = None,
        limit: int = 40,
        force_refresh: bool = False,
    ) -> List[NormalizedJob]:
        """
        Fetches live jobs from active providers with caching and deduplication.
        """
        cache_key = f"{provider_name or 'all'}:{query or ''}:{location or ''}:{role_category or ''}:{remote_only}:{limit}"
        now = datetime.now(timezone.utc).timestamp()
        ttl_seconds = settings.JOB_CACHE_TTL_MINUTES * 60.0

        if not force_refresh and cache_key in self._query_cache:
            cached_time, cached_jobs = self._query_cache[cache_key]
            if (now - cached_time) < ttl_seconds:
                return cached_jobs

        # Determine which providers to query
        targets: List[BaseJobProvider] = []
        if provider_name and provider_name.lower() in self.providers:
            targets = [self.providers[provider_name.lower()]]
        else:
            targets = list(self.providers.values())

        # Run provider fetchers concurrently
        tasks = [
            p.fetch_jobs(query=query, location=location, limit=limit)
            for p in targets
        ]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        all_jobs: List[NormalizedJob] = []
        seen_keys = set()

        for provider, res in zip(targets, results):
            if isinstance(res, Exception):
                logger.error("Job provider %s failed with exception: %s", provider.name, res)
                continue
            if not isinstance(res, list):
                continue

            for job in res:
                # Deduplicate across providers
                dedup_key = _make_dedup_key(job.title, job.company)
                if dedup_key in seen_keys:
                    continue
                seen_keys.add(dedup_key)

                # Filter by remote if requested
                if remote_only and not job.is_remote:
                    continue

                # Filter by category if requested
                if role_category and role_category.strip().lower() not in {"all", ""}:
                    cat_lower = role_category.strip().lower()
                    if (
                        job.role_category.lower() != cat_lower
                        and (job.matched_role_name or "").lower() != cat_lower
                    ):
                        continue

                # Store in ID lookup index
                self._jobs_by_id[job.id] = job
                all_jobs.append(job)

        # Sort by published_at or title
        all_jobs.sort(key=lambda j: j.published_at or "", reverse=True)
        final_list = all_jobs[:limit]

        # Update cache
        self._query_cache[cache_key] = (now, final_list)
        return final_list

    def get_job_by_id(self, job_id: str) -> Optional[NormalizedJob]:
        """Lookup a normalized job in the in-memory provider index."""
        if not job_id:
            return None
        return self._jobs_by_id.get(job_id)

    def register_job(self, job: NormalizedJob) -> None:
        """Manually index a normalized job into memory."""
        self._jobs_by_id[job.id] = job


# Global singleton instance
_provider_service: Optional[JobProviderService] = None


def get_job_provider_service() -> JobProviderService:
    global _provider_service
    if _provider_service is None:
        _provider_service = JobProviderService()
    return _provider_service

"""
Remotive Public API provider adapter.
Fetches verified remote jobs from https://remotive.com/api/remote-jobs.
Attribution requirement: Remotive attribution and direct backlink.
"""
from datetime import datetime
import logging
from typing import Any, Dict, List, Optional
import httpx

from app.services.job_providers.base import BaseJobProvider, NormalizedJob, clean_html_text, is_valid_http_url
from app.services.job_providers.matcher_utils import extract_skills_from_job, map_job_to_catalog_role

logger = logging.getLogger(__name__)

REMOTIVE_API_URL = "https://remotive.com/api/remote-jobs"
TIMEOUT_SECONDS = 8.0


class RemotiveJobProvider(BaseJobProvider):
    """Provider adapter for Remotive remote jobs API."""

    def __init__(self):
        super().__init__(name="remotive", display_name="Remotive Remote Jobs")

    def get_status(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "display_name": self.display_name,
            "configured": True,
            "active": True,
            "requires_credentials": False,
            "has_credentials": True,
            "terms_attribution": "Powered by Remotive API (https://remotive.com)",
            "attribution_url": "https://remotive.com",
            "coverage": "Global Remote Technology Opportunities",
        }

    async def fetch_jobs(
        self,
        query: Optional[str] = None,
        location: Optional[str] = None,
        limit: int = 25,
    ) -> List[NormalizedJob]:
        params: Dict[str, Any] = {"limit": min(50, max(5, limit))}
        if query and query.strip():
            params["search"] = query.strip()

        jobs: List[NormalizedJob] = []

        try:
            async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS, follow_redirects=True) as client:
                resp = await client.get(REMOTIVE_API_URL, params=params)
                if resp.status_code != 200:
                    logger.warning("Remotive API returned HTTP %s", resp.status_code)
                    return []
                data = resp.json()
        except httpx.TimeoutException:
            logger.warning("Remotive API request timed out after %s seconds", TIMEOUT_SECONDS)
            return []
        except Exception as exc:
            logger.warning("Failed to fetch jobs from Remotive API: %s", exc)
            return []

        raw_list = data.get("jobs", []) if isinstance(data, dict) else []

        for item in raw_list:
            try:
                raw_id = str(item.get("id") or "").strip()
                if not raw_id:
                    continue

                title = (item.get("title") or "Technology Professional").strip()
                company = (item.get("company_name") or "Remote Employer").strip()
                raw_desc = item.get("description") or ""
                clean_desc = clean_html_text(raw_desc, max_length=1200)

                url = item.get("url") or f"https://remotive.com/remote-jobs/{raw_id}"
                if not is_valid_http_url(url):
                    url = f"https://remotive.com/remote-jobs/{raw_id}"

                tags = item.get("tags") or []
                if isinstance(tags, str):
                    tags = [t.strip() for t in tags.split(",") if t.strip()]

                category_from_api = item.get("category") or "Software Development"
                if category_from_api and category_from_api not in tags:
                    tags.append(category_from_api)

                loc = item.get("candidate_required_location") or "Worldwide (Remote)"

                # Map to closest CareerTwin 42-role profile
                matched_role = map_job_to_catalog_role(title, clean_desc, tags)
                req_skills, pref_skills = extract_skills_from_job(title, clean_desc, tags, matched_role)

                # Parse publication date
                pub_date = item.get("publication_date")

                norm_job = NormalizedJob(
                    id=f"remotive-{raw_id}",
                    source="remotive",
                    external_id=raw_id,
                    title=title,
                    company=company,
                    description=clean_desc,
                    location=loc,
                    location_type="Remote",
                    is_remote=True,
                    employment_type="Full-time",
                    application_url=url,
                    attribution_text="Powered by Remotive",
                    attribution_url="https://remotive.com",
                    published_at=pub_date,
                    tags=tags[:8],
                    required_skills=req_skills,
                    preferred_skills=pref_skills,
                    role_category=matched_role.get("category", "Software Development"),
                    matched_role_id=matched_role.get("id"),
                    matched_role_name=matched_role.get("name"),
                    experience_required="0-2 years (Entry-Level / Early Career)",
                    experience_level="Entry-Level",
                    is_sample=False,
                )
                jobs.append(norm_job)
            except Exception as item_err:
                logger.debug("Error parsing Remotive job item: %s", item_err)
                continue

        return jobs

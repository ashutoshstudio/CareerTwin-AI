"""
Arbeitnow Public API provider adapter.
Fetches tech and remote job listings from https://www.arbeitnow.com/api/job-board-api.
Attribution requirement: Arbeitnow backlink on job items.
"""
from datetime import datetime, timezone
import logging
from typing import Any, Dict, List, Optional
import httpx

from app.services.job_providers.base import BaseJobProvider, NormalizedJob, clean_html_text, is_valid_http_url
from app.services.job_providers.matcher_utils import extract_skills_from_job, map_job_to_catalog_role

logger = logging.getLogger(__name__)

ARBEITNOW_API_URL = "https://www.arbeitnow.com/api/job-board-api"
TIMEOUT_SECONDS = 8.0


class ArbeitnowJobProvider(BaseJobProvider):
    """Provider adapter for Arbeitnow job board API."""

    def __init__(self):
        super().__init__(name="arbeitnow", display_name="Arbeitnow Jobs")

    def get_status(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "display_name": self.display_name,
            "configured": True,
            "active": True,
            "requires_credentials": False,
            "has_credentials": True,
            "terms_attribution": "Powered by Arbeitnow Job Board API (https://www.arbeitnow.com)",
            "attribution_url": "https://www.arbeitnow.com",
            "coverage": "Europe & Global Remote Technology Roles",
        }

    async def fetch_jobs(
        self,
        query: Optional[str] = None,
        location: Optional[str] = None,
        limit: int = 25,
    ) -> List[NormalizedJob]:
        params: Dict[str, Any] = {"page": 1}
        if query and query.strip():
            params["search"] = query.strip()

        jobs: List[NormalizedJob] = []

        try:
            async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS, follow_redirects=True) as client:
                resp = await client.get(ARBEITNOW_API_URL, params=params)
                if resp.status_code != 200:
                    logger.warning("Arbeitnow API returned HTTP %s", resp.status_code)
                    return []
                data = resp.json()
        except httpx.TimeoutException:
            logger.warning("Arbeitnow API request timed out after %s seconds", TIMEOUT_SECONDS)
            return []
        except Exception as exc:
            logger.warning("Failed to fetch jobs from Arbeitnow API: %s", exc)
            return []

        raw_list = data.get("data", []) if isinstance(data, dict) else []

        for item in raw_list:
            try:
                slug = (item.get("slug") or "").strip()
                if not slug:
                    continue

                title = (item.get("title") or "Software Engineer").strip()
                company = (item.get("company_name") or "Hiring Organisation").strip()
                raw_desc = item.get("description") or ""
                clean_desc = clean_html_text(raw_desc, max_length=1200)

                url = item.get("url") or f"https://www.arbeitnow.com/view/{slug}"
                if not is_valid_http_url(url):
                    url = f"https://www.arbeitnow.com/view/{slug}"

                tags = item.get("tags") or []
                if isinstance(tags, str):
                    tags = [t.strip() for t in tags.split(",") if t.strip()]

                is_remote = bool(item.get("remote", False))
                loc_raw = (item.get("location") or "").strip()
                if not loc_raw:
                    location_str = "Remote" if is_remote else "Global"
                else:
                    location_str = f"{loc_raw} (Remote)" if is_remote and "remote" not in loc_raw.lower() else loc_raw

                if is_remote:
                    location_type = "Remote"
                elif "hybrid" in location_str.lower():
                    location_type = "Hybrid"
                else:
                    location_type = "On-site"

                job_types = item.get("job_types") or []
                emp_type = ", ".join(job_types) if job_types else "Full-time"

                # Parse created_at unix timestamp if present
                pub_date: Optional[str] = None
                created_ts = item.get("created_at")
                if isinstance(created_ts, (int, float)):
                    try:
                        pub_date = datetime.fromtimestamp(created_ts, tz=timezone.utc).isoformat()
                    except Exception:
                        pub_date = None

                # Map to closest CareerTwin 42-role profile
                matched_role = map_job_to_catalog_role(title, clean_desc, tags)
                req_skills, pref_skills = extract_skills_from_job(title, clean_desc, tags, matched_role)

                norm_job = NormalizedJob(
                    id=f"arbeitnow-{slug}",
                    source="arbeitnow",
                    external_id=slug,
                    title=title,
                    company=company,
                    description=clean_desc,
                    location=location_str,
                    location_type=location_type,
                    is_remote=is_remote,
                    employment_type=emp_type,
                    application_url=url,
                    attribution_text="Powered by Arbeitnow",
                    attribution_url="https://www.arbeitnow.com",
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
                if len(jobs) >= limit:
                    break
            except Exception as item_err:
                logger.debug("Error parsing Arbeitnow job item: %s", item_err)
                continue

        return jobs

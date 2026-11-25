"""
Adzuna API provider adapter.
Fetches live jobs using Adzuna Developer API:
https://developer.adzuna.com/
Endpoint: /v1/api/jobs/{country}/search/{page}
Handles API authentication, country routing, rate limits, and fallback.
"""
import logging
from typing import Any, Dict, List, Optional, Tuple
import httpx

from app.core.config import settings
from app.services.job_providers.base import BaseJobProvider, NormalizedJob, clean_html_text, is_valid_http_url
from app.services.job_providers.matcher_utils import extract_skills_from_job, map_job_to_catalog_role

logger = logging.getLogger(__name__)

TIMEOUT_SECONDS = 8.0


class AdzunaJobProvider(BaseJobProvider):
    """Provider adapter for Adzuna Jobs API."""

    def __init__(self):
        super().__init__(name="adzuna", display_name="Adzuna Jobs")

    def _get_credentials(self) -> Tuple[str, str, str]:
        app_id = (settings.ADZUNA_APP_ID or "").strip()
        app_key = (settings.ADZUNA_APP_KEY or "").strip()
        country = (settings.ADZUNA_COUNTRY or "in").strip().lower()
        return app_id, app_key, country

    def get_status(self) -> Dict[str, Any]:
        app_id, app_key, country = self._get_credentials()
        has_creds = bool(app_id and app_key)
        return {
            "name": self.name,
            "display_name": self.display_name,
            "configured": has_creds,
            "active": has_creds,
            "requires_credentials": True,
            "has_credentials": has_creds,
            "country": country,
            "terms_attribution": "Jobs by Adzuna (https://www.adzuna.com)",
            "attribution_url": "https://www.adzuna.com",
            "coverage": f"Adzuna Search (Country code: {country})",
            "message": (
                "Adzuna API is ready."
                if has_creds
                else "Adzuna credentials not configured. Add ADZUNA_APP_ID and ADZUNA_APP_KEY to backend/.env to activate."
            ),
        }

    async def fetch_jobs(
        self,
        query: Optional[str] = None,
        location: Optional[str] = None,
        limit: int = 20,
    ) -> List[NormalizedJob]:
        app_id, app_key, country = self._get_credentials()
        if not app_id or not app_key:
            logger.info("Adzuna API credentials not configured; skipping Adzuna fetch.")
            return []

        search_query = query.strip() if query and query.strip() else "software engineer"
        page = 1
        results_per_page = min(30, max(5, limit))

        url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/{page}"
        params: Dict[str, Any] = {
            "app_id": app_id,
            "app_key": app_key,
            "results_per_page": results_per_page,
            "what": search_query,
            "content-type": "application/json",
        }
        if location and location.strip():
            params["where"] = location.strip()

        jobs: List[NormalizedJob] = []

        try:
            async with httpx.AsyncClient(timeout=TIMEOUT_SECONDS, follow_redirects=True) as client:
                resp = await client.get(url, params=params)

                # If country code fails (e.g. India unsupported on some free plans), try fallback
                if resp.status_code in (400, 404) and country != "gb":
                    logger.info("Adzuna request for country '%s' returned %s; retrying with 'gb' fallback.", country, resp.status_code)
                    fallback_url = f"https://api.adzuna.com/v1/api/jobs/gb/search/{page}"
                    resp = await client.get(fallback_url, params=params)

                if resp.status_code == 429:
                    logger.warning("Adzuna API rate limit reached (HTTP 429).")
                    return []

                if resp.status_code != 200:
                    logger.warning("Adzuna API returned HTTP %s: %s", resp.status_code, resp.text[:200])
                    return []

                data = resp.json()
        except httpx.TimeoutException:
            logger.warning("Adzuna API request timed out after %s seconds", TIMEOUT_SECONDS)
            return []
        except Exception as exc:
            logger.warning("Failed to fetch jobs from Adzuna API: %s", exc)
            return []

        raw_list = data.get("results", []) if isinstance(data, dict) else []

        for item in raw_list:
            try:
                raw_id = str(item.get("id") or "").strip()
                if not raw_id:
                    continue

                title = clean_html_text(item.get("title") or "Technology Role", max_length=120)
                company_obj = item.get("company") or {}
                company = company_obj.get("display_name") or "Employer"
                raw_desc = item.get("description") or ""
                clean_desc = clean_html_text(raw_desc, max_length=1200)

                url = item.get("redirect_url") or "https://www.adzuna.com"
                if not is_valid_http_url(url):
                    url = "https://www.adzuna.com"

                loc_obj = item.get("location") or {}
                location_str = loc_obj.get("display_name") or "India"

                is_remote = "remote" in title.lower() or "remote" in location_str.lower()
                location_type = "Remote" if is_remote else ("Hybrid" if "hybrid" in location_str.lower() else "On-site")

                contract_time = item.get("contract_time") or "full_time"
                emp_type = "Full-time" if contract_time == "full_time" else contract_time.replace("_", " ").title()

                sal_min = item.get("salary_min")
                sal_max = item.get("salary_max")
                currency = "INR" if country == "in" else ("GBP" if country == "gb" else "USD")

                category_obj = item.get("category") or {}
                tag_label = category_obj.get("label") or "IT Jobs"
                tags = [tag_label]

                matched_role = map_job_to_catalog_role(title, clean_desc, tags)
                req_skills, pref_skills = extract_skills_from_job(title, clean_desc, tags, matched_role)

                pub_date = item.get("created")

                norm_job = NormalizedJob(
                    id=f"adzuna-{raw_id}",
                    source="adzuna",
                    external_id=raw_id,
                    title=title,
                    company=company,
                    description=clean_desc,
                    location=location_str,
                    location_type=location_type,
                    is_remote=is_remote,
                    employment_type=emp_type,
                    application_url=url,
                    attribution_text="Jobs by Adzuna",
                    attribution_url="https://www.adzuna.com",
                    salary_min=float(sal_min) if sal_min is not None else None,
                    salary_max=float(sal_max) if sal_max is not None else None,
                    currency=currency,
                    published_at=pub_date,
                    tags=tags,
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
                logger.debug("Error parsing Adzuna job item: %s", item_err)
                continue

        return jobs

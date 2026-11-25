"""
Base schema and interface for external job listing providers.
"""
from abc import ABC, abstractmethod
from dataclasses import asdict, dataclass, field
from datetime import datetime
from typing import Any, Dict, List, Optional
import html
import re


def clean_html_text(raw_html: Optional[str], max_length: int = 1500) -> str:
    """Safely strip HTML tags, unescape HTML entities, and collapse whitespace."""
    if not raw_html:
        return ""
    # Unescape HTML entities first
    unescaped = html.unescape(raw_html)
    # Replace block tags with newline/spaces
    cleaned = re.sub(r"<(?:p|br|div|li|h[1-6])[\s/>]", "\n", unescaped, flags=re.IGNORECASE)
    # Strip remaining HTML tags
    cleaned = re.sub(r"<[^>]+>", " ", cleaned)
    # Normalize multiple whitespace characters
    cleaned = re.sub(r"[ \t]+", " ", cleaned)
    cleaned = re.sub(r"\n\s*\n+", "\n\n", cleaned)
    cleaned = cleaned.strip()
    if len(cleaned) > max_length:
        cleaned = cleaned[:max_length].rstrip() + "..."
    return cleaned


def is_valid_http_url(url: Optional[str]) -> bool:
    """Validate that URL has a valid http or https scheme."""
    if not url or not isinstance(url, str):
        return False
    u = url.strip()
    return u.startswith("http://") or u.startswith("https://")


@dataclass
class NormalizedJob:
    """Unified job listing representation across all external providers and curated benchmarks."""
    id: str
    source: str  # "remotive", "arbeitnow", "adzuna", "curated"
    external_id: str
    title: str
    company: str
    description: str
    location: str
    location_type: str  # "Remote", "Hybrid", "On-site"
    is_remote: bool
    employment_type: str  # "Full-time", "Part-time", "Contract", "Internship"
    application_url: str
    attribution_text: str
    attribution_url: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    currency: Optional[str] = None
    published_at: Optional[str] = None  # ISO timestamp string
    tags: List[str] = field(default_factory=list)
    required_skills: List[Dict[str, Any]] = field(default_factory=list)
    preferred_skills: List[Dict[str, Any]] = field(default_factory=list)
    role_category: str = "Software Development"  # Primary 42-role category or role title
    matched_role_id: Optional[str] = None  # Slug id from 42 roles catalog (e.g. "python-developer")
    matched_role_name: Optional[str] = None  # Formal role name from catalog (e.g. "Python Developer")
    experience_required: str = "0-2 years (Entry-Level / Early Career)"
    experience_level: str = "Entry-Level"
    is_sample: bool = False
    sample_notice: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        """Convert dataclass to clean dictionary matching JobListingBase schema."""
        d = asdict(self)
        # Ensure default sample notice if is_sample
        if d["is_sample"] and not d["sample_notice"]:
            d["sample_notice"] = "Academic Demonstration Record — not an active commercial vacancy"
        return d


class BaseJobProvider(ABC):
    """Abstract base class that all external job provider adapters must implement."""

    def __init__(self, name: str, display_name: str):
        self.name = name
        self.display_name = display_name

    @abstractmethod
    def get_status(self) -> Dict[str, Any]:
        """Return provider configuration status, health, and attribution requirements."""
        pass

    @abstractmethod
    async def fetch_jobs(
        self,
        query: Optional[str] = None,
        location: Optional[str] = None,
        limit: int = 20,
    ) -> List[NormalizedJob]:
        """Fetch and normalize job listings from provider API."""
        pass

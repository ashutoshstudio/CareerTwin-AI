from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class SkillRequirementItem(BaseModel):
    name: str
    min_level: int = Field(default=3, ge=1, le=5)
    description: Optional[str] = None


class JobSkillMatchItem(BaseModel):
    name: str
    student_level: int = Field(..., ge=1, le=5)
    required_level: int = Field(..., ge=1, le=5)
    is_required: bool = True


class JobMissingSkillItem(BaseModel):
    name: str
    required_level: int = Field(..., ge=1, le=5)
    is_required: bool = True
    gap: int = Field(..., ge=1, le=5)
    learning_resources: Optional[List[Dict[str, Any]]] = None


class ScoreCalculationBreakdown(BaseModel):
    required_skills_score: float = Field(..., ge=0.0, le=70.0, description="Points earned from required skills")
    preferred_skills_score: float = Field(..., ge=0.0, le=20.0, description="Points earned from preferred / secondary skills")
    affinity_score: float = Field(..., ge=0.0, le=30.0, description="Points earned from role affinity & experience")
    experience_score: Optional[float] = Field(None, ge=0.0, le=20.0, description="Points from candidate experience alignment")
    education_score: Optional[float] = Field(None, ge=0.0, le=10.0, description="Points from degree & education suitability")
    role_relevance_score: Optional[float] = Field(None, ge=0.0, le=15.0, description="Points from career goal & role relevance")
    formula: str = Field(
        default="Match Score = (Required Skills [50%] + Secondary Skills [20%] + Experience [15%] + Education [5%] + Role Relevance [10%])",
        description="Transparent scoring formula applied",
    )


class JobListingBase(BaseModel):
    id: str
    title: str
    company: str
    role_category: str
    experience_required: str
    location: str
    location_type: str  # "Remote", "Hybrid", "On-site"
    employment_type: str  # "Full-time", "Internship", "Part-time"
    is_sample: bool = True
    sample_notice: Optional[str] = "Academic Demonstration Record — not an active commercial vacancy"
    source_attribution: Optional[str] = "Curated Academic Benchmark Dataset — CareerTwin AI Research v1.0"
    application_url: Optional[str] = None
    description: str
    required_skills: List[SkillRequirementItem]
    preferred_skills: List[SkillRequirementItem]

    # Enhanced fields for external provider listings
    source: Optional[str] = "curated"  # "remotive", "arbeitnow", "adzuna", "curated"
    provider_source: Optional[str] = None
    is_remote: Optional[bool] = False
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    currency: Optional[str] = None
    published_at: Optional[str] = None
    attribution_text: Optional[str] = None
    attribution_url: Optional[str] = None
    matched_role_id: Optional[str] = None
    matched_role_name: Optional[str] = None
    experience_level: Optional[str] = "Entry-Level"
    linkedin_search_url: Optional[str] = None
    recommended_resources: Optional[List[Dict[str, Any]]] = None

    model_config = ConfigDict(extra="ignore")


class JobMatchResult(JobListingBase):
    match_score: float = Field(..., ge=0.0, le=100.0)
    match_grade: str = Field(..., description="'High Match', 'Good Match', or 'Emerging Match'")
    rank: int = Field(..., ge=1)
    is_saved: bool = False
    matching_skills: List[JobSkillMatchItem] = Field(default_factory=list)
    missing_required_skills: List[JobMissingSkillItem] = Field(default_factory=list)
    missing_preferred_skills: List[JobMissingSkillItem] = Field(default_factory=list)
    score_breakdown: ScoreCalculationBreakdown
    disclaimer: str = Field(
        default=(
            "Skill match scores evaluate technical qualification overlap against documented entry-level "
            "vacancy requirements. A high match score indicates syllabus and skill alignment, not a guaranteed "
            "interview or commercial employment offer."
        )
    )


class JobMatchesResponse(BaseModel):
    total_matched: int
    candidate_skills_count: int
    matches: List[JobMatchResult]
    source_type: Optional[str] = "all"
    disclaimer: str = Field(
        default=(
            "Skill match scores evaluate technical qualification overlap against documented entry-level "
            "vacancy requirements. A high match score indicates syllabus and skill alignment, not a guaranteed "
            "interview or commercial employment offer."
        )
    )


class SavedJobOut(BaseModel):
    id: int
    job_id: str
    user_id: int
    saved_at: datetime
    job_details: Optional[JobListingBase] = None

    model_config = ConfigDict(from_attributes=True)


class ToggleSaveResponse(BaseModel):
    job_id: str
    is_saved: bool
    message: str


class ProviderStatusItem(BaseModel):
    name: str
    display_name: str
    configured: bool
    active: bool
    requires_credentials: bool
    has_credentials: bool
    terms_attribution: str
    attribution_url: Optional[str] = None
    coverage: Optional[str] = None
    country: Optional[str] = None
    message: Optional[str] = None


class ProviderStatusResponse(BaseModel):
    providers: List[ProviderStatusItem]
    total_configured: int
    total_active: int

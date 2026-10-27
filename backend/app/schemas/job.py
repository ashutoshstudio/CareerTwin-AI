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


class ScoreCalculationBreakdown(BaseModel):
    required_skills_score: float = Field(..., ge=0.0, le=70.0, description="Points earned from required skills (max 70)")
    preferred_skills_score: float = Field(..., ge=0.0, le=20.0, description="Points earned from preferred skills (max 20)")
    affinity_score: float = Field(..., ge=0.0, le=10.0, description="Points earned from role affinity & experience (max 10)")
    formula: str = Field(
        default="Match Score = (Required Skills [70%] + Preferred Skills [20%] + Role & Experience Affinity [10%])",
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
    employment_type: str  # "Full-time", "Internship"
    is_sample: bool = True
    sample_notice: str = "Academic Demonstration Record — not an active commercial vacancy"
    source_attribution: str = "Curated Academic Benchmark Dataset — CareerTwin AI Research v1.0"
    application_url: Optional[str] = None
    description: str
    required_skills: List[SkillRequirementItem]
    preferred_skills: List[SkillRequirementItem]


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

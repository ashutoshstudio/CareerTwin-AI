from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class SkillMatchDetail(BaseModel):
    name: str
    current_level: int = Field(..., ge=1, le=5, description="Student's verified proficiency level")
    required_level: int = Field(..., ge=1, le=5, description="Target benchmark proficiency level")
    is_core: bool = Field(default=True, description="Whether this is a core or secondary competency")


class SkillDeficitDetail(BaseModel):
    name: str
    current_level: int = Field(..., ge=0, le=5, description="Student's current level (0 if entirely missing)")
    required_level: int = Field(..., ge=1, le=5, description="Benchmark level required for this role")
    gap: int = Field(..., ge=1, le=5, description="Proficiency level deficit")
    priority: str = Field(..., description="'high' or 'medium'")
    is_core: bool = Field(default=True, description="Whether this is a core requirement")


class RoleRecommendationItem(BaseModel):
    role_name: str
    fit_score: float = Field(..., ge=0.0, le=100.0, description="Overall transparent fit score percentage")
    match_tier: str = Field(..., description="'Strong Match', 'Moderate Match', or 'Potential Match'")
    rank: int = Field(..., ge=1, description="Rank position among all evaluated catalog roles")
    demand_level: str = Field(default="High", description="Industry demand outlook for entry-level applicants")
    core_alignment_score: float = Field(..., ge=0.0, le=50.0, description="Score contribution from core skills (max 50)")
    secondary_alignment_score: float = Field(..., ge=0.0, le=20.0, description="Score contribution from secondary skills (max 20)")
    fit_reason: str = Field(..., description="Explainable narrative detailing why this role fits the candidate")
    matching_skills: List[SkillMatchDetail] = Field(default_factory=list)
    missing_or_weaker_skills: List[SkillDeficitDetail] = Field(default_factory=list)
    suggested_next_steps: List[str] = Field(default_factory=list)


class CareerRecommendationsRequest(BaseModel):
    include_resume_skills: bool = Field(
        default=True,
        description="Whether to incorporate unmerged skills from the student's latest uploaded resume.",
    )


class CareerRecommendationsOut(BaseModel):
    id: Optional[int] = None
    user_id: int
    top_role: str
    top_fit_score: float
    total_roles_evaluated: int
    student_skills_evaluated: List[str] = Field(default_factory=list)
    recommendations: List[RoleRecommendationItem] = Field(default_factory=list)
    disclaimer: str = Field(
        default=(
            "Role match scores evaluate technical and academic competency alignment against documented "
            "entry-level curriculum and job benchmarks. They indicate developmental readiness and learning "
            "priorities, not a commercial ATS hiring decision or employment guarantee."
        )
    )
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RecommendationHistoryItem(BaseModel):
    id: int
    top_role: str
    top_fit_score: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RoleCatalogItem(BaseModel):
    role_name: str
    tagline: str
    demand_level: str
    description: str
    core_skills: List[Dict[str, Any]]
    secondary_skills: List[Dict[str, Any]]
    suitable_backgrounds: List[str]

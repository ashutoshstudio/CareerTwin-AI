from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class SkillComparisonItem(BaseModel):
    name: str
    category: str  # "Core Requirement" or "Secondary Competency"
    current_level: int = Field(..., ge=0, le=5, description="Student's current proficiency (0 if missing, 1-5 if possessed)")
    required_level: int = Field(..., ge=1, le=5, description="Benchmark level required for the target role")
    gap: int = Field(..., ge=0, le=5, description="Proficiency level deficit")
    status: str = Field(..., description="'met' (current >= required), 'needs_improvement' (0 < current < required), or 'missing' (current == 0)")
    priority: str = Field(..., description="'high', 'medium', 'low', or 'none'")


class LearningRecommendation(BaseModel):
    skill_name: str
    priority: str  # "high", "medium", "low"
    action_type: str  # "acquire_missing", "improve_proficiency"
    current_level: int
    target_level: int
    recommendation: str


class SkillGapRequest(BaseModel):
    target_role: Optional[str] = Field(
        default=None,
        description="Target role to analyze. If omitted, student profile target role is used.",
    )
    include_resume_skills: bool = Field(
        default=True,
        description="Whether to incorporate unmerged skills from the student's latest uploaded resume.",
    )


class SkillGapOut(BaseModel):
    id: Optional[int] = None
    user_id: int
    target_role: str
    skill_coverage_percentage: float = Field(..., ge=0.0, le=100.0, description="Percentage of required skills the student possesses (>= 1)")
    proficiency_alignment_percentage: float = Field(..., ge=0.0, le=100.0, description="Weighted benchmark proficiency fulfillment percentage")
    met_count: int
    improvement_count: int
    missing_count: int
    total_required: int
    skills_comparison: List[SkillComparisonItem] = Field(default_factory=list)
    recommendations: List[LearningRecommendation] = Field(default_factory=list)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SkillGapHistoryItem(BaseModel):
    id: int
    target_role: str
    skill_coverage_percentage: float
    proficiency_alignment_percentage: float
    missing_count: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RoleSkillsDefinitionOut(BaseModel):
    role_name: str
    core_skills: List[Dict[str, Any]]
    secondary_skills: List[Dict[str, Any]]

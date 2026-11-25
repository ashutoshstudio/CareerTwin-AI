from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class AtsCategoryScores(BaseModel):
    keyword_matching: float = Field(..., ge=0.0, le=30.0, description="Score for keyword and skill matching (max 30)")
    section_completeness: float = Field(..., ge=0.0, le=20.0, description="Score for resume section completeness (max 20)")
    experience_relevance: float = Field(..., ge=0.0, le=20.0, description="Score for work experience and project relevance (max 20)")
    quantifiable_achievements: float = Field(..., ge=0.0, le=15.0, description="Score for measurable achievements and metrics (max 15)")
    formatting_readability: float = Field(..., ge=0.0, le=15.0, description="Score for formatting, structure and readability (max 15)")


class AtsRecommendationItem(BaseModel):
    category: str = Field(..., description="Area of improvement: Keywords, Metrics, Sections, Verbs, Formatting")
    issue: str = Field(..., description="Identified weakness or deficit in resume")
    importance: str = Field(..., description="Why this factor matters for ATS parsing and technical recruiters")
    suggestion: str = Field(..., description="Actionable recommendation to improve the resume")
    example_before: Optional[str] = Field(default=None, description="Illustrative weak bullet point")
    example_after: Optional[str] = Field(default=None, description="Illustrative improved, metric-driven bullet point")


class RoleComparisonItem(BaseModel):
    role_name: str
    overall_score: float
    keyword_score: float
    matched_skills_count: int
    missing_skills_count: int


class AtsEvaluationOut(BaseModel):
    id: int
    user_id: int
    filename: str
    target_role: str
    overall_score: float = Field(..., ge=0.0, le=100.0)
    grade: str = Field(..., description="Verbal rating: Strong ATS Compatibility, Good Optimization, Needs Improvement")
    category_scores: AtsCategoryScores
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    detected_sections: List[str] = Field(default_factory=list)
    missing_sections: List[str] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    recommendations: List[AtsRecommendationItem] = Field(default_factory=list)
    role_comparisons: List[RoleComparisonItem] = Field(default_factory=list)
    word_count: int = 0
    quantifiable_metrics_count: int = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AtsScoreRequest(BaseModel):
    target_role: Optional[str] = Field(
        default=None,
        description="Target job role to score resume against (e.g. 'Data Analyst', 'Python Developer', 'Machine Learning Engineer')",
    )
    resume_text: Optional[str] = Field(
        default=None,
        description="Raw resume text to evaluate directly if not uploading file.",
    )
    filename: Optional[str] = Field(
        default="resume_text_submission.txt",
        description="Optional name identifier for text submission.",
    )


class AtsHistoryItem(BaseModel):
    id: int
    filename: str
    target_role: str
    overall_score: float
    grade: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

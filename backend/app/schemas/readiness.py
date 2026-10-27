from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ReadinessAssessmentRequest(BaseModel):
    target_role: Optional[str] = Field(
        default=None,
        description="Target role to assess against. If not provided, student profile target role is used.",
    )
    include_resume_skills: bool = Field(
        default=True,
        description="Whether to incorporate unmerged skills from the student's latest uploaded resume.",
    )


class DimensionScores(BaseModel):
    technical_skills: float = Field(..., ge=0.0, le=100.0, description="Core & secondary skill readiness (0-100)")
    experience: float = Field(..., ge=0.0, le=100.0, description="Work & internship experience score (0-100)")
    education: float = Field(..., ge=0.0, le=100.0, description="Academic degree qualification score (0-100)")
    portfolio: float = Field(..., ge=0.0, le=100.0, description="GitHub & LinkedIn profile presence score (0-100)")


class ModelEvaluationMetrics(BaseModel):
    accuracy: float = Field(..., description="Classification accuracy on held-out test set")
    macro_f1: float = Field(..., description="Macro-averaged F1 score on held-out test set")
    r2_score: float = Field(..., description="Coefficient of determination (R2) on held-out test set")
    mae: float = Field(..., description="Mean Absolute Error on held-out test set (percentage points)")
    train_samples: int = Field(..., description="Number of training samples")
    test_samples: int = Field(..., description="Number of test samples")


class CareerReadinessOut(BaseModel):
    id: Optional[int] = None
    user_id: int
    target_role: str
    readiness_score: float = Field(..., ge=0.0, le=100.0)
    readiness_category: str  # "High Readiness", "Moderate Readiness", "Needs Development"
    model_version: str
    dimension_scores: DimensionScores
    matching_core_skills: List[str] = Field(default_factory=list)
    missing_core_skills: List[str] = Field(default_factory=list)
    supporting_skills: List[str] = Field(default_factory=list)
    features_snapshot: Dict[str, float] = Field(default_factory=dict)
    limitations: List[str] = Field(default_factory=list)
    model_metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReadinessHistoryItem(BaseModel):
    id: int
    target_role: str
    readiness_score: float
    readiness_category: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ModelInfoOut(BaseModel):
    model_name: str
    model_version: str
    algorithm: str
    supported_roles: List[str]
    features: List[str]
    metrics: ModelEvaluationMetrics
    dataset_description: str
    disclaimer: str

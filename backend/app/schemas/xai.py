from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class FeatureAttributionItem(BaseModel):
    feature_name: str
    feature_label: str
    feature_value: float = Field(..., description="Normalized feature value passed to the model")
    shap_value: float = Field(..., description="Additive points contributed by this feature toward readiness score")
    impact: str = Field(..., description="'positive', 'negative', or 'neutral'")
    category: str = Field(default="Technical Competency")
    description: str


class LimeFeatureItem(BaseModel):
    feature_name: str
    feature_label: str
    weight: float = Field(..., description="Local linear model weight in LIME explanation")
    condition: str = Field(..., description="Local decision rule interval (e.g. 'core_coverage <= 0.40')")
    impact: str = Field(..., description="'positive' or 'negative'")


class GlobalFeatureImportance(BaseModel):
    feature_name: str
    feature_label: str
    importance_score: float = Field(..., ge=0.0, le=1.0, description="RandomForest Gini importance weight")
    mean_abs_shap: float = Field(..., ge=0.0, description="Mean absolute SHAP value across benchmark background")
    rank: int = Field(..., ge=1)
    category: str


class FidelityCheck(BaseModel):
    base_value: float = Field(..., description="Global baseline expected value (phi_0) in score points")
    sum_shap: float = Field(..., description="Sum of all feature SHAP attributions (sum phi_i)")
    reconstructed_score: float = Field(..., description="base_value + sum_shap")
    actual_prediction: float = Field(..., description="Actual model output pred(x)")
    discrepancy: float = Field(..., description="Absolute mathematical difference |pred(x) - reconstructed|")
    is_faithful: bool = Field(default=True, description="Whether reconstructed score matches actual prediction within numerical tolerance")


class ReadinessExplanationRequest(BaseModel):
    target_role: Optional[str] = Field(
        default=None,
        description="Target role to explain. If omitted, student's profile target role is used.",
    )
    include_resume_skills: bool = Field(
        default=True,
        description="Whether to incorporate unmerged skills from the latest uploaded resume.",
    )


class ModelExplanationOut(BaseModel):
    target_role: str
    predicted_score: float
    predicted_category: str
    model_version: str
    base_value: float
    features_snapshot: Dict[str, Any]
    shap_attributions: List[FeatureAttributionItem]
    positive_contributors: List[FeatureAttributionItem]
    negative_contributors: List[FeatureAttributionItem]
    lime_attributions: List[LimeFeatureItem]
    global_importances: List[GlobalFeatureImportance]
    fidelity_check: FidelityCheck
    causal_disclaimer: str = Field(
        default=(
            "Attribution values (SHAP and LIME) explain how the mathematical model weighted individual "
            "features to produce its internal score. They represent mathematical model sensitivity, NOT real-world "
            "causal mechanisms. Adding a keyword to a profile does not guarantee an interview or cause employment."
        )
    )
    limitations: List[str] = Field(default_factory=list)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GlobalModelXaiOut(BaseModel):
    model_name: str
    model_version: str
    algorithm: str
    base_value: float
    global_importances: List[GlobalFeatureImportance]
    methodology_notes: Dict[str, str]
    limitations: List[str]

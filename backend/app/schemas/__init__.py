from app.schemas.user import UserBase, UserRegister, UserLogin, UserOut, AuthResponse
from app.schemas.token import Token, TokenData
from app.schemas.profile import SkillItem, ProfileBase, ProfileUpdate, ProfileOut

from app.schemas.recommendation import (
    CareerRecommendationsOut,
    CareerRecommendationsRequest,
    RecommendationHistoryItem,
    RoleCatalogItem,
    RoleRecommendationItem,
)

from app.schemas.job import (
    JobListingBase,
    JobMatchResult,
    JobMatchesResponse,
    SavedJobOut,
    ToggleSaveResponse,
)

from app.schemas.xai import (
    FeatureAttributionItem,
    FidelityCheck,
    GlobalFeatureImportance,
    GlobalModelXaiOut,
    LimeFeatureItem,
    ModelExplanationOut,
    ReadinessExplanationRequest,
)

__all__ = [
    "UserBase",
    "UserRegister",
    "UserLogin",
    "UserOut",
    "AuthResponse",
    "Token",
    "TokenData",
    "SkillItem",
    "ProfileBase",
    "ProfileUpdate",
    "ProfileOut",
    "CareerRecommendationsOut",
    "CareerRecommendationsRequest",
    "RecommendationHistoryItem",
    "RoleCatalogItem",
    "RoleRecommendationItem",
    "JobListingBase",
    "JobMatchResult",
    "JobMatchesResponse",
    "SavedJobOut",
    "ToggleSaveResponse",
    "FeatureAttributionItem",
    "FidelityCheck",
    "GlobalFeatureImportance",
    "GlobalModelXaiOut",
    "LimeFeatureItem",
    "ModelExplanationOut",
    "ReadinessExplanationRequest",
]

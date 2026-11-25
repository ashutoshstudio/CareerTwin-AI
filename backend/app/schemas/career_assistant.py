from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ChatMessageRequest(BaseModel):
    conversation_id: Optional[int] = Field(
        default=None,
        description="ID of existing conversation. If omitted, a new conversation is started.",
    )
    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="User query or message content.",
    )
    target_role_override: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Optional target role override for context benchmark.",
    )


class ChatMessageOut(BaseModel):
    id: int
    conversation_id: int
    role: str
    content: str
    provider_used: Optional[str] = None
    is_fallback: bool = False
    generation_mode: str = "fallback_mode"
    provider_error: Optional[str] = None
    relevant_context: Optional[Dict[str, Any]] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChatResponseOut(BaseModel):
    conversation_id: int
    conversation_title: str
    assistant_response: str
    relevant_context: Dict[str, Any]
    provider_used: str
    is_fallback: bool = False
    generation_mode: str = "fallback_mode"
    provider_error: Optional[str] = None
    timestamp: datetime
    message_id: int


class ConversationSummaryOut(BaseModel):
    id: int
    title: str
    target_role: Optional[str] = None
    message_count: int
    last_message_preview: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ConversationDetailOut(BaseModel):
    id: int
    title: str
    target_role: Optional[str] = None
    messages: List[ChatMessageOut]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StudentContextSnapshotOut(BaseModel):
    student_name: str
    target_role: str
    education_level: Optional[str] = None
    experience_months: int = 0
    skills_count: int = 0
    readiness_score: Optional[float] = None
    readiness_level: Optional[str] = None
    ats_score: Optional[float] = None
    ats_grade: Optional[str] = None
    github_score: Optional[float] = None
    github_grade: Optional[str] = None
    skill_gap_coverage: Optional[float] = None
    roadmap_progress: Optional[float] = None
    roadmap_active_week: Optional[int] = None
    top_recommended_role: Optional[str] = None
    available_modules_count: int = 0
    total_modules_count: int = 11
    provider_status: Dict[str, Any] = Field(default_factory=dict)
    verified_skills: List[str] = Field(default_factory=list)
    critical_growth_areas: List[str] = Field(default_factory=list)

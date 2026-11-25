from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


VALID_INTERVIEW_TYPES = {"Technical", "HR", "Behavioral", "Mixed"}
VALID_DIFFICULTIES = {"Beginner", "Intermediate", "Advanced"}
VALID_QUESTION_COUNTS = {5, 10, 15}


class StartInterviewRequest(BaseModel):
    target_role: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Desired job role. Defaults to student's saved target role.",
    )
    interview_type: str = Field(
        default="Mixed",
        description="Technical, HR, Behavioral, or Mixed.",
    )
    difficulty: str = Field(
        default="Intermediate",
        description="Beginner, Intermediate, or Advanced.",
    )
    total_questions: int = Field(
        default=5,
        description="Number of interview questions (5, 10, or 15).",
    )

    @field_validator("interview_type")
    @classmethod
    def validate_interview_type(cls, v: str) -> str:
        clean = v.strip()
        # Accept case-insensitive match normalized cleanly
        lookup = {t.lower(): t for t in VALID_INTERVIEW_TYPES}
        if clean.lower() not in lookup:
            raise ValueError(
                f"Invalid interview_type '{v}'. Allowed values: {', '.join(sorted(VALID_INTERVIEW_TYPES))}."
            )
        return lookup[clean.lower()]

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, v: str) -> str:
        clean = v.strip()
        lookup = {d.lower(): d for d in VALID_DIFFICULTIES}
        if clean.lower() not in lookup:
            raise ValueError(
                f"Invalid difficulty '{v}'. Allowed values: {', '.join(sorted(VALID_DIFFICULTIES))}."
            )
        return lookup[clean.lower()]

    @field_validator("total_questions")
    @classmethod
    def validate_total_questions(cls, v: int) -> int:
        if v not in VALID_QUESTION_COUNTS:
            raise ValueError("total_questions must be 5, 10, or 15.")
        return v


class SubmitAnswerRequest(BaseModel):
    question_id: Optional[int] = Field(
        default=None,
        description="Optional explicit question ID to guard against duplicate submissions.",
    )
    answer: str = Field(
        ...,
        min_length=1,
        max_length=4000,
        description="Student's submitted answer for the active question.",
    )
    elapsed_seconds: Optional[int] = Field(
        default=None,
        ge=0,
        le=86400,
        description="Optional elapsed interview seconds tracked by client timer.",
    )

    @field_validator("answer")
    @classmethod
    def validate_non_empty_answer(cls, v: str) -> str:
        clean = v.strip()
        if not clean:
            raise ValueError("Answer cannot be empty or whitespace only.")
        return clean


class CompleteInterviewRequest(BaseModel):
    elapsed_seconds: Optional[int] = Field(
        default=None,
        ge=0,
        le=86400,
        description="Optional elapsed duration in seconds.",
    )
    ended_early: bool = Field(
        default=False,
        description="True if student terminated an incomplete session intentionally.",
    )


class QuestionPublicOut(BaseModel):
    """Public view of a question during an active interview (hides rubric and expected answers)."""
    id: int
    question_order: int
    question_text: str
    category: str
    topic: Optional[str] = None
    difficulty: str
    student_answer: Optional[str] = None
    answered_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class QuestionReportOut(BaseModel):
    """Detailed question breakdown shown strictly in the final interview report."""
    id: int
    question_order: int
    question_text: str
    category: str
    topic: Optional[str] = None
    difficulty: str
    expected_concepts: List[str] = Field(default_factory=list)
    student_answer: Optional[str] = None
    score: Optional[float] = None
    evaluation_json: Optional[Dict[str, Any]] = None
    provider_used: Optional[str] = None
    answered_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StartInterviewResponseOut(BaseModel):
    interview_id: int
    target_role: str
    interview_type: str
    difficulty: str
    total_questions: int
    estimated_duration_minutes: int
    status: str
    interviewer_intro: str
    current_question: QuestionPublicOut
    first_question: Optional[QuestionPublicOut] = None
    provider_used: str
    fallback_used: bool
    started_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SubmitAnswerResponseOut(BaseModel):
    interview_id: int
    answered_questions: int
    total_questions: int
    status: str
    brief_acknowledgement: str
    next_question: Optional[QuestionPublicOut] = None
    is_last_question_completed: bool
    adaptive_difficulty: str
    provider_used: str
    fallback_used: bool


class MockInterviewSummaryOut(BaseModel):
    id: int
    target_role: str
    interview_type: str
    difficulty: str
    total_questions: int
    answered_questions: int
    status: str
    overall_score: Optional[float] = None
    performance_grade: Optional[str] = None
    duration_seconds: int
    ai_provider_used: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MockInterviewDetailOut(BaseModel):
    id: int
    target_role: str
    interview_type: str
    difficulty: str
    current_difficulty: str
    total_questions: int
    answered_questions: int
    status: str
    overall_score: Optional[float] = None
    performance_grade: Optional[str] = None
    duration_seconds: int
    ai_provider_used: Optional[str] = None
    interviewer_intro: Optional[str] = None
    started_at: datetime
    completed_at: Optional[datetime] = None
    questions: List[QuestionPublicOut] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


class MockInterviewReportOut(BaseModel):
    interview_id: int
    target_role: str
    interview_type: str
    difficulty: str
    total_questions: int
    answered_questions: int
    status: str
    overall_score: float
    performance_grade: str
    duration_seconds: int
    ai_provider_used: str
    fallback_used: bool
    started_at: datetime
    completed_at: Optional[datetime] = None
    category_scores: Dict[str, Any] = Field(default_factory=dict)
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    suggested_improvements: List[str] = Field(default_factory=list)
    recommended_skills_to_practise: List[str] = Field(default_factory=list)
    executive_summary: str
    disclaimer: str
    questions: List[QuestionReportOut] = Field(default_factory=list)


class InterviewSetupContextOut(BaseModel):
    student_name: str
    default_target_role: str
    supported_roles: List[str]
    interview_types: List[str]
    difficulties: List[str]
    question_counts: List[int]
    estimated_durations_minutes: Dict[int, int]
    context_summary: Dict[str, Any]
    provider_status: Dict[str, Any]

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field

ALL_REPORT_SECTION_IDS = [
    "profile",
    "readiness",
    "resume",
    "ats",
    "skill_gap",
    "recommendations",
    "github",
    "job_matches",
    "xai",
    "roadmap",
    "action_plan",
]

SECTION_METADATA = {
    "profile": {"title": "Student Profile & Academic Record", "order": 1},
    "readiness": {"title": "Career Readiness Assessment", "order": 2},
    "resume": {"title": "Resume Skill Extraction & Analysis", "order": 3},
    "ats": {"title": "ATS Resume Score & Keyword Optimization", "order": 4},
    "skill_gap": {"title": "Role Benchmark & Skill Gap Analysis", "order": 5},
    "recommendations": {"title": "Multi-Factor Career Recommendations", "order": 6},
    "github": {"title": "GitHub Portfolio & Code Activity", "order": 7},
    "job_matches": {"title": "Curated Vacancy Matches & Alignment", "order": 8},
    "xai": {"title": "Explainable AI (SHAP & LIME Insights)", "order": 9},
    "roadmap": {"title": "Personalized Learning Roadmap", "order": 10},
    "action_plan": {"title": "Final Career Action Plan & Next Steps", "order": 11},
}


class ReportGenerateRequest(BaseModel):
    title: Optional[str] = Field(
        default="CareerTwin AI Career Readiness Report",
        max_length=255,
        description="Custom title for the generated PDF dossier",
    )
    selected_sections: Optional[List[str]] = Field(
        default=None,
        description="List of section IDs to include. If omitted or empty, all available sections are included.",
    )
    target_role: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Target job role context for benchmark assessments (defaults to student's profile target role)",
    )


class ReportSectionStatus(BaseModel):
    section_id: str
    title: str
    order: int
    is_available: bool
    data_summary: Optional[str] = None


class ReportPreviewOut(BaseModel):
    student_name: str
    student_email: str
    target_role: str
    sections: List[ReportSectionStatus]
    data_snapshot: Dict[str, Any] = Field(default_factory=dict)


class ReportOut(BaseModel):
    id: int
    user_id: int
    title: str
    target_role: str
    selected_sections: List[str]
    sections_available: Dict[str, bool]
    file_size_bytes: int
    overall_readiness_score: Optional[float] = None
    overall_ats_score: Optional[float] = None
    overall_github_score: Optional[float] = None
    summary: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ReportHistoryItem(BaseModel):
    id: int
    title: str
    target_role: str
    selected_sections: List[str]
    file_size_bytes: int
    overall_readiness_score: Optional[float] = None
    overall_ats_score: Optional[float] = None
    overall_github_score: Optional[float] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

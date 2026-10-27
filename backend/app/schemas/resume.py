from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class SkillExtracted(BaseModel):
    name: str
    category: str
    confidence: str = "high"


class EducationInfo(BaseModel):
    degree: Optional[str] = None
    institution: Optional[str] = None
    graduation_year: Optional[int] = None


class ContactInfo(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None


class ResumeAnalysisOut(BaseModel):
    id: int
    user_id: int
    filename: str
    file_type: str
    file_size_bytes: int
    status: str
    text_preview: Optional[str] = None
    extracted_skills: List[SkillExtracted] = Field(default_factory=list)
    education: EducationInfo = Field(default_factory=EducationInfo)
    contact_info: ContactInfo = Field(default_factory=ContactInfo)
    summary: Optional[str] = None
    warnings: List[str] = Field(default_factory=list)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ResumeAnalysisSummaryOut(BaseModel):
    id: int
    filename: str
    file_type: str
    file_size_bytes: int
    status: str
    skills_count: int
    degree_detected: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

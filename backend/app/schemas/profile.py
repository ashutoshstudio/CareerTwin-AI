from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class SkillItem(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    level: int = Field(1, ge=1, le=5, description="Proficiency level from 1 (Beginner) to 5 (Expert)")


class ProfileBase(BaseModel):
    headline: Optional[str] = Field(None, max_length=255)
    education_level: Optional[str] = Field(None, max_length=100)
    institution: Optional[str] = Field(None, max_length=255)
    graduation_year: Optional[int] = Field(None, ge=1970, le=2100)
    experience_months: int = Field(0, ge=0, le=600)
    github_url: Optional[str] = Field(None, max_length=255)
    linkedin_url: Optional[str] = Field(None, max_length=255)
    target_role: Optional[str] = Field(None, max_length=100)
    skills: List[SkillItem] = Field(default_factory=list)


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    headline: Optional[str] = Field(None, max_length=255)
    education_level: Optional[str] = Field(None, max_length=100)
    institution: Optional[str] = Field(None, max_length=255)
    graduation_year: Optional[int] = Field(None, ge=1970, le=2100)
    experience_months: Optional[int] = Field(None, ge=0, le=600)
    github_url: Optional[str] = Field(None, max_length=255)
    linkedin_url: Optional[str] = Field(None, max_length=255)
    target_role: Optional[str] = Field(None, max_length=100)
    skills: Optional[List[SkillItem]] = None


class ProfileOut(ProfileBase):
    id: int
    user_id: int
    full_name: str
    email: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

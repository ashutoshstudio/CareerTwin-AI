from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field


class RoadmapResource(BaseModel):
    title: str = Field(..., description="Resource title or course name")
    url: str = Field(..., description="Legitimate, direct resource URL")
    type: str = Field(default="Tutorial", description="Resource type: Documentation, Tutorial, Course, Interactive")
    is_free: bool = Field(default=True, description="Whether the resource is freely accessible without payment")


class RoadmapItem(BaseModel):
    id: str = Field(..., description="Unique stable identifier for the milestone topic")
    title: str = Field(..., description="Actionable learning topic or task")
    description: str = Field(..., description="Concrete task instructions and learning objectives")
    skills: List[str] = Field(default_factory=list, description="Associated skills targeted by this topic")
    resources: List[RoadmapResource] = Field(default_factory=list, description="Curated external learning resources")
    is_completed: bool = Field(default=False, description="Whether student has checked off this topic")


class RoadmapWeek(BaseModel):
    week_number: int = Field(..., ge=1, le=12, description="Sequence week index (1-based)")
    title: str = Field(..., description="Weekly theme or learning module title")
    focus_area: str = Field(..., description="High-level competency area addressed this week")
    estimated_hours: int = Field(..., ge=1, le=40, description="Estimated study commitment in hours")
    milestone: str = Field(..., description="Tangible milestone outcome achieved by end of the week")
    skills: List[str] = Field(default_factory=list, description="Primary skills developed during this week")
    items: List[RoadmapItem] = Field(default_factory=list, description="Actionable checklist topics")
    is_completed: bool = Field(default=False, description="Whether all topics in this week are completed")


class RoadmapGenerateRequest(BaseModel):
    target_role: Optional[str] = Field(
        default=None,
        description="Target role for which to construct the roadmap. Defaults to student profile target role.",
    )
    target_weeks: Optional[int] = Field(
        default=None,
        ge=2,
        le=12,
        description="Optional preferred duration in weeks. Auto-calculated based on gap volume if omitted.",
    )
    include_resume_skills: bool = Field(
        default=True,
        description="Whether to incorporate unmerged skills from the latest uploaded resume.",
    )


class RoadmapItemToggleRequest(BaseModel):
    item_id: str = Field(..., description="ID of the roadmap checklist item to toggle")
    is_completed: bool = Field(..., description="New completion status for the item")


class RoadmapOut(BaseModel):
    id: int
    user_id: int
    target_role: str
    total_weeks: int
    current_week: int
    completion_percentage: float = Field(..., ge=0.0, le=100.0)
    total_items: int
    completed_items: int
    weeks: List[RoadmapWeek] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RoadmapSummaryOut(BaseModel):
    has_roadmap: bool = Field(..., description="Whether a saved roadmap exists for the student")
    target_role: Optional[str] = None
    completion_percentage: float = Field(default=0.0, ge=0.0, le=100.0)
    total_weeks: int = 0
    current_week: int = 1
    total_items: int = 0
    completed_items: int = 0
    next_recommended_task: Optional[str] = None
    milestone: Optional[str] = None

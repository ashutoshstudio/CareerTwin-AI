from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class GitHubCategoryScores(BaseModel):
    project_quality: float = Field(..., ge=0.0, le=25.0, description="Score for project quality, originality, and non-fork repositories (max 25)")
    skill_diversity: float = Field(..., ge=0.0, le=20.0, description="Score for technical skill and programming language breadth (max 20)")
    documentation: float = Field(..., ge=0.0, le=15.0, description="Score for repository descriptions, topics, and documentation (max 15)")
    coding_activity: float = Field(..., ge=0.0, le=20.0, description="Score for recent update activity and repository maintenance (max 20)")
    community_engagement: float = Field(..., ge=0.0, le=10.0, description="Score for stars, forks, and followers (max 10)")
    role_relevance: float = Field(..., ge=0.0, le=10.0, description="Score for alignment with target career requirements (max 10)")


class GitHubProfileInfo(BaseModel):
    username: str
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    company: Optional[str] = None
    location: Optional[str] = None
    blog: Optional[str] = None
    public_repos_count: int = 0
    followers: int = 0
    following: int = 0
    created_at: Optional[str] = None
    html_url: str


class GitHubRepoItem(BaseModel):
    name: str
    description: Optional[str] = None
    html_url: str
    language: Optional[str] = None
    stars: int = 0
    forks: int = 0
    updated_at: str
    topics: List[str] = Field(default_factory=list)
    is_fork: bool = False
    quality_score: float = 0.0


class GitHubDetectedTechnology(BaseModel):
    name: str
    category: str


class GitHubRecommendationItem(BaseModel):
    category: str
    issue: str
    importance: str
    suggestion: str


class GitHubProjectIdea(BaseModel):
    title: str
    description: str
    suggested_tech: List[str] = Field(default_factory=list)
    relevance_to_role: str


class GitHubAnalyzeRequest(BaseModel):
    username: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Public GitHub username to analyze (optional if linked in profile)",
    )
    target_role: Optional[str] = Field(
        default="Data Analyst",
        description="Target job role to benchmark repository portfolio against",
    )


class GitHubAnalysisOut(BaseModel):
    id: int
    user_id: int
    username: str
    target_role: str
    overall_score: float = Field(..., ge=0.0, le=100.0)
    grade: str
    category_scores: GitHubCategoryScores
    profile_info: GitHubProfileInfo
    languages: Dict[str, Any] = Field(default_factory=dict)
    detected_technologies: List[GitHubDetectedTechnology] = Field(default_factory=list)
    matched_skills: List[str] = Field(default_factory=list)
    missing_skills: List[str] = Field(default_factory=list)
    repositories: List[GitHubRepoItem] = Field(default_factory=list)
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    recommendations: List[GitHubRecommendationItem] = Field(default_factory=list)
    recommended_projects: List[GitHubProjectIdea] = Field(default_factory=list)
    total_repos_analyzed: int = 0
    total_stars: int = 0
    total_forks: int = 0
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GitHubHistoryItem(BaseModel):
    id: int
    username: str
    target_role: str
    overall_score: float
    grade: str
    total_repos_analyzed: int
    total_stars: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SyncGitHubSkillsRequest(BaseModel):
    analysis_id: Optional[int] = Field(default=None, description="Optional ID of specific analysis to sync from; if omitted, latest analysis is used")
    skill_names: Optional[List[str]] = Field(default=None, description="Specific skills to import; if omitted, all detected skills matching role are synced")


class SyncGitHubSkillsOut(BaseModel):
    synced_skills: List[str]
    total_profile_skills: int
    message: str

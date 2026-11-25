from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, DateTime, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="student", nullable=False)
    google_id = Column(String(255), unique=True, index=True, nullable=True)
    auth_provider = Column(String(50), default="local", nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    profile = relationship(
        "StudentProfile",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )
    resumes = relationship(
        "ResumeAnalysis",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    readiness_assessments = relationship(
        "CareerReadinessAssessment",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    skill_gaps = relationship(
        "SkillGapAnalysis",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    recommendations = relationship(
        "CareerRecommendation",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    saved_jobs = relationship(
        "SavedJob",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    roadmaps = relationship(
        "LearningRoadmap",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    ats_evaluations = relationship(
        "AtsEvaluation",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    github_analyses = relationship(
        "GitHubAnalysis",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    reports = relationship(
        "Report",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    career_assistant_conversations = relationship(
        "CareerAssistantConversation",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    mock_interviews = relationship(
        "MockInterview",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"

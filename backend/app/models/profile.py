from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship
from app.core.database import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        index=True,
        nullable=False,
    )

    headline = Column(String(255), nullable=True)
    education_level = Column(String(100), nullable=True)
    institution = Column(String(255), nullable=True)
    graduation_year = Column(Integer, nullable=True)
    experience_months = Column(Integer, default=0, nullable=False)
    github_url = Column(String(255), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    target_role = Column(String(100), nullable=True)

    # Stores list of skills: [{"name": "Python", "level": 4}, ...]
    # Kept flexible as JSON so schema changes don't break when later
    # normalizing into relational skills tables.
    skills = Column(JSON, default=list, nullable=False)

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

    user = relationship("User", back_populates="profile")

    def __repr__(self) -> str:
        return f"<StudentProfile id={self.id} user_id={self.user_id} target_role={self.target_role}>"

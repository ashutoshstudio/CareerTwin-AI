from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship
from app.core.database import Base


class GitHubAnalysis(Base):
    __tablename__ = "github_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    username = Column(String(100), index=True, nullable=False)
    target_role = Column(String(100), nullable=False)
    overall_score = Column(Float, nullable=False)  # 0.0 to 100.0
    grade = Column(String(50), nullable=False)     # "A (Outstanding)", "B (Strong)", etc.

    # 6 Category scores (out of 25, 20, 15, 20, 10, 10)
    category_scores = Column(JSON, default=dict, nullable=False)

    # Public GitHub Profile metadata
    profile_info = Column(JSON, default=dict, nullable=False)

    # Programming language distribution & detected technologies
    languages = Column(JSON, default=dict, nullable=False)
    detected_technologies = Column(JSON, default=list, nullable=False)

    # Role benchmark alignment
    matched_skills = Column(JSON, default=list, nullable=False)
    missing_skills = Column(JSON, default=list, nullable=False)

    # Analyzed public repositories list
    repositories = Column(JSON, default=list, nullable=False)

    # Evaluative feedback & tailored suggestions
    strengths = Column(JSON, default=list, nullable=False)
    weaknesses = Column(JSON, default=list, nullable=False)
    recommendations = Column(JSON, default=list, nullable=False)
    recommended_projects = Column(JSON, default=list, nullable=False)

    # Quick metric counters
    total_repos_analyzed = Column(Integer, default=0, nullable=False)
    total_stars = Column(Integer, default=0, nullable=False)
    total_forks = Column(Integer, default=0, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", back_populates="github_analyses")

    def __repr__(self) -> str:
        return (
            f"<GitHubAnalysis id={self.id} user_id={self.user_id} "
            f"username='{self.username}' score={self.overall_score}>"
        )

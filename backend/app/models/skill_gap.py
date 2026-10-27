from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship
from app.core.database import Base


class SkillGapAnalysis(Base):
    __tablename__ = "skill_gap_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    target_role = Column(String(100), nullable=False)
    skill_coverage_percentage = Column(Float, nullable=False)  # 0.0 to 100.0
    proficiency_alignment_percentage = Column(Float, nullable=False)  # 0.0 to 100.0

    met_count = Column(Integer, default=0, nullable=False)
    improvement_count = Column(Integer, default=0, nullable=False)
    missing_count = Column(Integer, default=0, nullable=False)
    total_required = Column(Integer, default=0, nullable=False)

    # Detailed lists stored as JSON
    skills_comparison = Column(JSON, default=list, nullable=False)
    recommendations = Column(JSON, default=list, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", back_populates="skill_gaps")

    def __repr__(self) -> str:
        return f"<SkillGapAnalysis id={self.id} user_id={self.user_id} role='{self.target_role}' coverage={self.skill_coverage_percentage}%>"

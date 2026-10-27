from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship
from app.core.database import Base


class CareerReadinessAssessment(Base):
    __tablename__ = "career_readiness_assessments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    target_role = Column(String(100), nullable=False)
    readiness_score = Column(Float, nullable=False)  # 0.0 to 100.0
    readiness_category = Column(String(50), nullable=False)  # "High Readiness", "Moderate Readiness", "Needs Development"
    model_version = Column(String(50), nullable=False)

    # Dimensional scores (Technical, Experience, Education, Portfolio)
    dimension_scores = Column(JSON, default=dict, nullable=False)

    # Feature values used during prediction
    features_snapshot = Column(JSON, default=dict, nullable=False)

    # Skills analysis breakdown
    matching_core_skills = Column(JSON, default=list, nullable=False)
    missing_core_skills = Column(JSON, default=list, nullable=False)
    supporting_skills = Column(JSON, default=list, nullable=False)

    # Scientific limitations and disclaimers
    limitations = Column(JSON, default=list, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", back_populates="readiness_assessments")

    def __repr__(self) -> str:
        return f"<CareerReadinessAssessment id={self.id} user_id={self.user_id} role='{self.target_role}' score={self.readiness_score}>"

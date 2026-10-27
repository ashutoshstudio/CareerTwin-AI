from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship
from app.core.database import Base


class CareerRecommendation(Base):
    __tablename__ = "career_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    top_role = Column(String(100), nullable=False)
    top_fit_score = Column(Float, nullable=False)  # 0.0 to 100.0

    # JSON array of all evaluated & ranked roles with explanations
    recommended_roles = Column(JSON, default=list, nullable=False)

    # Snapshot of student skills used for this evaluation
    student_skills_snapshot = Column(JSON, default=list, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", back_populates="recommendations")

    def __repr__(self) -> str:
        return f"<CareerRecommendation id={self.id} user_id={self.user_id} top_role='{self.top_role}' fit_score={self.top_fit_score}%>"

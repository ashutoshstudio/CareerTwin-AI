from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship
from app.core.database import Base


class AtsEvaluation(Base):
    __tablename__ = "ats_evaluations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    filename = Column(String(255), nullable=False)
    target_role = Column(String(100), nullable=False)
    overall_score = Column(Float, nullable=False)  # 0.0 to 100.0
    grade = Column(String(50), nullable=False)     # "Excellent", "Good", "Needs Improvement", etc.

    # 5 Dimension scores: dict of float/int
    category_scores = Column(JSON, default=dict, nullable=False)

    # Detailed extraction and feedback lists stored as JSON
    matched_skills = Column(JSON, default=list, nullable=False)
    missing_skills = Column(JSON, default=list, nullable=False)
    missing_sections = Column(JSON, default=list, nullable=False)
    detected_sections = Column(JSON, default=list, nullable=False)
    strengths = Column(JSON, default=list, nullable=False)
    weaknesses = Column(JSON, default=list, nullable=False)
    recommendations = Column(JSON, default=list, nullable=False)
    role_comparisons = Column(JSON, default=list, nullable=False)

    word_count = Column(Integer, default=0, nullable=False)
    quantifiable_metrics_count = Column(Integer, default=0, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", back_populates="ats_evaluations")

    def __repr__(self) -> str:
        return (
            f"<AtsEvaluation id={self.id} user_id={self.user_id} "
            f"role='{self.target_role}' score={self.overall_score}>"
        )

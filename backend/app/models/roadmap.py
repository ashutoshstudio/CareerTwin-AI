from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship
from app.core.database import Base


class LearningRoadmap(Base):
    __tablename__ = "learning_roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    target_role = Column(String(100), nullable=False)
    total_weeks = Column(Integer, default=4, nullable=False)
    current_week = Column(Integer, default=1, nullable=False)
    completion_percentage = Column(Float, default=0.0, nullable=False)  # 0.0 to 100.0
    total_items = Column(Integer, default=0, nullable=False)
    completed_items = Column(Integer, default=0, nullable=False)

    # Detailed weekly plan and item checklist stored as JSON
    weeks_data = Column(JSON, default=list, nullable=False)
    completed_item_ids = Column(JSON, default=list, nullable=False)

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

    user = relationship("User", back_populates="roadmaps")

    def __repr__(self) -> str:
        return (
            f"<LearningRoadmap id={self.id} user_id={self.user_id} "
            f"role='{self.target_role}' progress={self.completion_percentage:.1f}%>"
        )

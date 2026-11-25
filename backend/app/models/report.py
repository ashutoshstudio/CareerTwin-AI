from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import relationship
from app.core.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    title = Column(String(255), nullable=False)
    target_role = Column(String(100), nullable=False)

    # Sections selected by candidate & section data availability mapping
    selected_sections = Column(JSON, default=list, nullable=False)
    sections_available = Column(JSON, default=dict, nullable=False)

    # File storage path and metadata
    file_path = Column(String(500), nullable=False)
    file_size_bytes = Column(Integer, default=0, nullable=False)

    # Summary score snapshots
    overall_readiness_score = Column(Float, nullable=True)
    overall_ats_score = Column(Float, nullable=True)
    overall_github_score = Column(Float, nullable=True)
    summary = Column(String(1000), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", back_populates="reports")

    def __repr__(self) -> str:
        return (
            f"<Report id={self.id} user_id={self.user_id} "
            f"title='{self.title}' role='{self.target_role}'>"
        )

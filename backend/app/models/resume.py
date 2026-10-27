from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class ResumeAnalysis(Base):
    __tablename__ = "resume_analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # "pdf" or "docx"
    file_size_bytes = Column(Integer, nullable=False)
    status = Column(String(50), default="completed", nullable=False)  # "completed", "unreadable", "failed"

    # Sanitized preview of text content (up to 1000 characters)
    text_preview = Column(Text, nullable=True)

    # Structured extraction results stored as JSON
    skills = Column(JSON, default=list, nullable=False)
    education = Column(JSON, default=dict, nullable=False)
    contact_info = Column(JSON, default=dict, nullable=False)
    warnings = Column(JSON, default=list, nullable=False)
    summary = Column(String(500), nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", back_populates="resumes")

    def __repr__(self) -> str:
        return f"<ResumeAnalysis id={self.id} user_id={self.user_id} filename='{self.filename}' status='{self.status}'>"

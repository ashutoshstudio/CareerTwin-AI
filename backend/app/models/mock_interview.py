from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class MockInterview(Base):
    __tablename__ = "mock_interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    target_role = Column(String(100), nullable=False, index=True)
    interview_type = Column(String(50), nullable=False)  # Technical, HR, Behavioral, Mixed
    difficulty = Column(String(50), nullable=False)      # Beginner, Intermediate, Advanced
    current_difficulty = Column(String(50), nullable=False)  # Tracks adaptive adjustments

    total_questions = Column(Integer, nullable=False)
    answered_questions = Column(Integer, default=0, nullable=False)
    status = Column(String(50), default="in_progress", nullable=False, index=True)  # in_progress, completed, ended_early

    overall_score = Column(Float, nullable=True)
    performance_grade = Column(String(60), nullable=True)
    ai_provider_used = Column(String(120), nullable=True)
    interviewer_intro = Column(Text, nullable=True)

    weak_concepts_identified = Column(JSON, default=list, nullable=False)
    context_snapshot = Column(JSON, default=dict, nullable=False)
    final_feedback = Column(JSON, nullable=True)

    started_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    completed_at = Column(DateTime(timezone=True), nullable=True)
    duration_seconds = Column(Integer, default=0, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user = relationship("User", back_populates="mock_interviews")
    questions = relationship(
        "MockInterviewQuestion",
        back_populates="interview",
        cascade="all, delete-orphan",
        order_by="MockInterviewQuestion.question_order.asc()",
    )

    def __repr__(self) -> str:
        return (
            f"<MockInterview id={self.id} user_id={self.user_id} role='{self.target_role}' "
            f"type='{self.interview_type}' status='{self.status}'>"
        )


class MockInterviewQuestion(Base):
    __tablename__ = "mock_interview_questions"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(
        Integer,
        ForeignKey("mock_interviews.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )

    question_text = Column(Text, nullable=False)
    category = Column(String(50), nullable=False)       # Technical, HR, Behavioral
    topic = Column(String(120), nullable=True)
    difficulty = Column(String(50), nullable=False)     # Beginner, Intermediate, Advanced
    expected_concepts = Column(JSON, default=list, nullable=False)
    question_order = Column(Integer, nullable=False)

    student_answer = Column(Text, nullable=True)
    score = Column(Float, nullable=True)
    evaluation_json = Column(JSON, nullable=True)
    provider_used = Column(String(120), nullable=True)

    answered_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    interview = relationship("MockInterview", back_populates="questions")

    def __repr__(self) -> str:
        return (
            f"<MockInterviewQuestion id={self.id} interview_id={self.interview_id} "
            f"order={self.question_order} category='{self.category}'>"
        )

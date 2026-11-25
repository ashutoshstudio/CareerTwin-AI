from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class CareerAssistantConversation(Base):
    __tablename__ = "career_assistant_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    title = Column(String(255), default="Career Discussion", nullable=False)
    target_role = Column(String(100), nullable=True)

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

    user = relationship("User", back_populates="career_assistant_conversations")
    messages = relationship(
        "CareerAssistantMessage",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="CareerAssistantMessage.created_at.asc()",
    )

    def __repr__(self) -> str:
        return f"<CareerAssistantConversation id={self.id} user_id={self.user_id} title='{self.title}'>"


class CareerAssistantMessage(Base):
    __tablename__ = "career_assistant_messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(
        Integer,
        ForeignKey("career_assistant_conversations.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    role = Column(String(50), nullable=False)  # "user", "assistant", "system"
    content = Column(Text, nullable=False)
    provider_used = Column(String(100), default="deterministic", nullable=True)
    relevant_context = Column(JSON, default=dict, nullable=True)

    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    conversation = relationship("CareerAssistantConversation", back_populates="messages")

    @property
    def is_fallback(self) -> bool:
        if isinstance(self.relevant_context, dict):
            if "is_fallback" in self.relevant_context:
                return bool(self.relevant_context["is_fallback"])
        return self.provider_used == "careertwin_deterministic"

    @property
    def generation_mode(self) -> str:
        if isinstance(self.relevant_context, dict):
            mode = self.relevant_context.get("generation_mode")
            if mode:
                return str(mode)
        if self.is_fallback:
            return "fallback_mode"
        return "ai_mode"

    @property
    def provider_error(self) -> str:
        if isinstance(self.relevant_context, dict):
            return self.relevant_context.get("provider_error")
        return None

    def __repr__(self) -> str:
        return f"<CareerAssistantMessage id={self.id} conversation_id={self.conversation_id} role='{self.role}'>"

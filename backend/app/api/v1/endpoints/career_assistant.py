import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.core.config import settings
from app.models.user import User
from app.models.career_assistant import CareerAssistantConversation
from app.schemas.career_assistant import (
    ChatMessageRequest,
    ChatResponseOut,
    ConversationDetailOut,
    ConversationSummaryOut,
    StudentContextSnapshotOut,
)
from app.services.career_assistant_service import (
    build_student_context,
    delete_conversation,
    get_conversation_messages,
    list_user_conversations,
    process_student_chat,
    retry_last_assistant_message,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/chat",
    response_model=ChatResponseOut,
    status_code=status.HTTP_200_OK,
    summary="Send a message to the AI Career Assistant",
)
async def chat_with_assistant(
    request: ChatMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ChatResponseOut:
    """
    Submits a user query to the CareerTwin AI personal assistant.
    Grounds response in authenticated student's profile, readiness, skill gaps,
    ATS score, and GitHub portfolio. Dispatches to configured AI model or
    deterministic guidance engine with persistent conversation memory.
    """
    # Validation
    clean_msg = request.message.strip()
    if not clean_msg:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Message content cannot be blank or whitespace.",
        )
    if len(clean_msg) > 2000:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Message content exceeds maximum permitted length (2000 characters).",
        )

    # Check conversation existence and tenant isolation if conversation_id provided
    if request.conversation_id:
        existing_conv = (
            db.query(CareerAssistantConversation)
            .filter_by(id=request.conversation_id, user_id=current_user.id)
            .first()
        )
        if not existing_conv:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Conversation #{request.conversation_id} not found or access is unauthorized.",
            )

    try:
        result = await process_student_chat(
            user_id=current_user.id,
            message=clean_msg,
            conversation_id=request.conversation_id,
            target_role_override=request.target_role_override,
            db=db,
        )
        return ChatResponseOut(
            conversation_id=result["conversation_id"],
            conversation_title=result["conversation_title"],
            assistant_response=result["assistant_response"],
            relevant_context=result["relevant_context"],
            provider_used=result["provider_used"],
            is_fallback=result.get("is_fallback", False),
            generation_mode=result.get("generation_mode", "fallback_mode"),
            provider_error=result.get("provider_error"),
            timestamp=result["timestamp"],
            message_id=result["message_id"],
        )
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(val_err),
        )
    except Exception as exc:
        logger.error("Error processing career assistant chat for user %d: %s", current_user.id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while generating the career assistant response.",
        )


@router.get(
    "/conversations",
    response_model=List[ConversationSummaryOut],
    status_code=status.HTTP_200_OK,
    summary="List all conversations for the authenticated student",
)
def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[ConversationSummaryOut]:
    """Retrieves list of past conversations belonging to the authenticated student."""
    conversations = list_user_conversations(user_id=current_user.id, db=db)
    return [ConversationSummaryOut(**c) for c in conversations]


@router.get(
    "/conversations/{conversation_id}",
    response_model=ConversationDetailOut,
    status_code=status.HTTP_200_OK,
    summary="Get full message history for a specific conversation",
)
def get_conversation_detail(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ConversationDetailOut:
    """Retrieves conversation messages enforcing strict user-level tenant isolation."""
    conv = get_conversation_messages(
        user_id=current_user.id,
        conversation_id=conversation_id,
        db=db,
    )
    if not conv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation #{conversation_id} not found or access is unauthorized.",
        )

    return ConversationDetailOut.model_validate(conv)


@router.delete(
    "/conversations/{conversation_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a conversation and all its messages",
)
def delete_conversation_endpoint(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Deletes conversation and cascades messages with tenant isolation."""
    deleted = delete_conversation(
        user_id=current_user.id,
        conversation_id=conversation_id,
        db=db,
    )
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation #{conversation_id} not found or access is unauthorized.",
        )

    return {
        "status": "success",
        "message": f"Conversation #{conversation_id} deleted successfully.",
    }


@router.post(
    "/conversations/{conversation_id}/retry",
    response_model=ChatResponseOut,
    status_code=status.HTTP_200_OK,
    summary="Retry generating the latest assistant response with real AI provider",
)
async def retry_conversation_message(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ChatResponseOut:
    """Retries the last assistant response with the active AI provider."""
    try:
        result = await retry_last_assistant_message(
            user_id=current_user.id,
            conversation_id=conversation_id,
            db=db,
        )
        return ChatResponseOut(
            conversation_id=result["conversation_id"],
            conversation_title=result["conversation_title"],
            assistant_response=result["assistant_response"],
            relevant_context=result["relevant_context"],
            provider_used=result["provider_used"],
            is_fallback=result.get("is_fallback", False),
            generation_mode=result.get("generation_mode", "fallback_mode"),
            provider_error=result.get("provider_error"),
            timestamp=result["timestamp"],
            message_id=result["message_id"],
        )
    except ValueError as val_err:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(val_err),
        )
    except RuntimeError as r_err:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(r_err),
        )
    except Exception as exc:
        logger.error("Error retrying career assistant message: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retry AI response generation.",
        )


@router.get(
    "/context",
    response_model=StudentContextSnapshotOut,
    status_code=status.HTTP_200_OK,
    summary="Get current student CareerTwin context snapshot",
)
def get_student_context_snapshot(
    target_role: Optional[str] = Query(None, description="Optional target role benchmark override"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StudentContextSnapshotOut:
    """
    Returns an aggregated snapshot of the authenticated student's CareerTwin AI metrics
    used for grounding the Career Assistant conversations.
    """
    context = build_student_context(
        user_id=current_user.id,
        db=db,
        target_role_override=target_role,
    )

    profile = context.get("profile", {})
    readiness = context.get("readiness")
    ats = context.get("ats")
    github = context.get("github")
    skill_gap = context.get("skill_gap")
    roadmap = context.get("roadmap")
    recommendations = context.get("recommendations")

    has_key = bool(settings.AI_API_KEY or getattr(settings, "GEMINI_API_KEY", None))
    provider_info = {
        "provider": settings.AI_PROVIDER or "none",
        "model": settings.AI_MODEL or "gemini-3.5-flash-lite",
        "has_api_key": has_key,
        "mode": "external_llm" if (settings.AI_PROVIDER != "none" and has_key) else "deterministic_fallback",
    }

    verified_skills = [
        s.get("name") if isinstance(s, dict) else str(s)
        for s in profile.get("skills", [])
    ]
    growth_areas = []
    if skill_gap and skill_gap.get("skills_comparison"):
        raw_growth = [
            (c.get("name") or c.get("skill"))
            for c in skill_gap["skills_comparison"]
            if isinstance(c, dict) and c.get("status") in ["missing", "needs_improvement"]
        ]
        growth_areas = [str(g) for g in raw_growth if g]
    elif readiness and readiness.get("missing_core_skills"):
        growth_areas = [str(g) for g in readiness.get("missing_core_skills", []) if g]

    return StudentContextSnapshotOut(
        student_name=context.get("student_name", "Student"),
        target_role=context.get("target_role", "Data Analyst"),
        education_level=profile.get("education_level"),
        experience_months=profile.get("experience_months", 0),
        skills_count=len(profile.get("skills", [])),
        readiness_score=readiness.get("readiness_score") if readiness else None,
        readiness_level=readiness.get("readiness_category") if readiness else None,
        ats_score=ats.get("overall_score") if ats else None,
        ats_grade=ats.get("grade") if ats else None,
        github_score=github.get("overall_score") if github else None,
        github_grade=github.get("grade") if github else None,
        skill_gap_coverage=skill_gap.get("skill_coverage_percentage") if skill_gap else None,
        roadmap_progress=roadmap.get("completion_percentage") if roadmap else None,
        roadmap_active_week=roadmap.get("active_week") if roadmap else None,
        top_recommended_role=recommendations.get("top_role") if recommendations else None,
        available_modules_count=context.get("available_modules_count", 0),
        total_modules_count=context.get("total_modules_count", 11),
        provider_status=provider_info,
        verified_skills=verified_skills,
        critical_growth_areas=growth_areas,
    )

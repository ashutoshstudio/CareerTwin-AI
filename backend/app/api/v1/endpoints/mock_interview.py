import logging
from typing import List, Optional
from fastapi import APIRouter, Body, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.mock_interview import (
    CompleteInterviewRequest,
    InterviewSetupContextOut,
    MockInterviewDetailOut,
    MockInterviewReportOut,
    MockInterviewSummaryOut,
    StartInterviewRequest,
    StartInterviewResponseOut,
    SubmitAnswerRequest,
    SubmitAnswerResponseOut,
)
from app.services.mock_interview_service import (
    complete_mock_interview,
    delete_user_interview,
    get_interview_report,
    get_setup_context_summary,
    get_user_interview,
    list_user_interviews,
    start_mock_interview,
    submit_interview_answer,
)

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get(
    "/context",
    response_model=InterviewSetupContextOut,
    status_code=status.HTTP_200_OK,
    summary="Get student context and configuration options for mock interviews",
)
def get_interview_setup_context(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> InterviewSetupContextOut:
    """Returns student's default role, verified profile snapshot, and setup parameters."""
    data = get_setup_context_summary(user_id=current_user.id, db=db)
    return InterviewSetupContextOut(**data)


@router.post(
    "/start",
    response_model=StartInterviewResponseOut,
    status_code=status.HTTP_200_OK,
    summary="Start a personalized mock interview session",
)
async def start_interview_endpoint(
    request: StartInterviewRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> StartInterviewResponseOut:
    """Initializes a new mock interview tailored to student context and asks Question #1."""
    try:
        result = await start_mock_interview(
            user_id=current_user.id,
            target_role=request.target_role,
            interview_type=request.interview_type,
            difficulty=request.difficulty,
            total_questions=request.total_questions,
            db=db,
        )
        return StartInterviewResponseOut(**result)
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as exc:
        logger.error("Error starting mock interview for user %d: %s", current_user.id, exc, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start mock interview session.",
        )


@router.get(
    "/history",
    response_model=List[MockInterviewSummaryOut],
    status_code=status.HTTP_200_OK,
    summary="List mock interview history for authenticated student",
)
def get_interview_history_endpoint(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[MockInterviewSummaryOut]:
    """Returns past and active mock interviews owned by the authenticated student."""
    interviews = list_user_interviews(user_id=current_user.id, db=db)
    return [MockInterviewSummaryOut.model_validate(item) for item in interviews]


@router.post(
    "/{interview_id}/answer",
    response_model=SubmitAnswerResponseOut,
    status_code=status.HTTP_200_OK,
    summary="Submit answer for current question and receive next adaptive question",
)
async def submit_answer_endpoint(
    interview_id: int,
    request: SubmitAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> SubmitAnswerResponseOut:
    """
    Evaluates the submitted answer internally using 100-pt rubric, adjusts adaptive
    difficulty, returns brief interviewer acknowledgement, and generates the next question.
    """
    try:
        result = await submit_interview_answer(
            user_id=current_user.id,
            interview_id=interview_id,
            answer=request.answer,
            question_id=request.question_id,
            elapsed_seconds=request.elapsed_seconds,
            db=db,
        )
        return SubmitAnswerResponseOut(**result)
    except LookupError as not_found:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(not_found))
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))
    except Exception as exc:
        logger.error(
            "Error processing answer for interview %d user %d: %s",
            interview_id,
            current_user.id,
            exc,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to evaluate interview answer.",
        )


@router.post(
    "/{interview_id}/complete",
    response_model=MockInterviewReportOut,
    status_code=status.HTTP_200_OK,
    summary="Complete an interview session and generate final evaluation report",
)
async def complete_interview_endpoint(
    interview_id: int,
    request: Optional[CompleteInterviewRequest] = Body(default=None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MockInterviewReportOut:
    """Finalizes completed or interrupted interviews and builds the comprehensive evaluation report."""
    payload = request or CompleteInterviewRequest()
    try:
        report = await complete_mock_interview(
            user_id=current_user.id,
            interview_id=interview_id,
            elapsed_seconds=payload.elapsed_seconds,
            ended_early=payload.ended_early,
            db=db,
        )
        return MockInterviewReportOut(**report)
    except LookupError as not_found:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(not_found))
    except Exception as exc:
        logger.error("Error completing mock interview %d: %s", interview_id, exc)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete mock interview and generate report.",
        )


@router.get(
    "/{interview_id}",
    response_model=MockInterviewDetailOut,
    status_code=status.HTTP_200_OK,
    summary="Get mock interview details and questions",
)
def get_interview_detail_endpoint(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MockInterviewDetailOut:
    """Retrieves interview metadata and public question stream (without hiding/spoiling rubric)."""
    interview = get_user_interview(user_id=current_user.id, interview_id=interview_id, db=db)
    if not interview:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mock interview #{interview_id} not found or access unauthorized.",
        )
    return MockInterviewDetailOut.model_validate(interview)


@router.get(
    "/{interview_id}/report",
    response_model=MockInterviewReportOut,
    status_code=status.HTTP_200_OK,
    summary="Get full evaluation report for a completed mock interview",
)
def get_interview_report_endpoint(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> MockInterviewReportOut:
    """Returns full rubric breakdowns, question-by-question feedback, and improvement plan."""
    try:
        report = get_interview_report(user_id=current_user.id, interview_id=interview_id, db=db)
        return MockInterviewReportOut(**report)
    except LookupError as not_found:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(not_found))
    except ValueError as val_err:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))


@router.delete(
    "/{interview_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete a mock interview session and its questions",
)
def delete_interview_endpoint(
    interview_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Deletes an owned mock interview and cascades all child questions."""
    deleted = delete_user_interview(user_id=current_user.id, interview_id=interview_id, db=db)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mock interview #{interview_id} not found or access unauthorized.",
        )
    return {
        "status": "success",
        "message": f"Mock interview #{interview_id} deleted successfully.",
    }

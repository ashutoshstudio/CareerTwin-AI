from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.models.ats import AtsEvaluation
from app.models.profile import StudentProfile
from app.models.resume import ResumeAnalysis
from app.models.user import User
from app.schemas.ats import (
    AtsCategoryScores,
    AtsEvaluationOut,
    AtsHistoryItem,
    AtsRecommendationItem,
    AtsScoreRequest,
    RoleComparisonItem,
)
from app.services.ats_service import calculate_ats_score
from app.services.resume_parser import ResumeParserError, parse_resume_file
from app.services.skill_extractor import analyze_resume_text

router = APIRouter()


def _format_ats_out(record: AtsEvaluation) -> AtsEvaluationOut:
    """Format SQLAlchemy AtsEvaluation model into Pydantic AtsEvaluationOut schema."""
    cat_dict = record.category_scores or {}
    category_scores = AtsCategoryScores(
        keyword_matching=float(cat_dict.get("keyword_matching", 0.0)),
        section_completeness=float(cat_dict.get("section_completeness", 0.0)),
        experience_relevance=float(cat_dict.get("experience_relevance", 0.0)),
        quantifiable_achievements=float(cat_dict.get("quantifiable_achievements", 0.0)),
        formatting_readability=float(cat_dict.get("formatting_readability", 0.0)),
    )

    raw_recs = record.recommendations or []
    recommendations = [
        AtsRecommendationItem(
            category=r.get("category", "General"),
            issue=r.get("issue", ""),
            importance=r.get("importance", ""),
            suggestion=r.get("suggestion", ""),
            example_before=r.get("example_before"),
            example_after=r.get("example_after"),
        )
        for r in raw_recs
        if isinstance(r, dict)
    ]

    raw_comps = record.role_comparisons or []
    role_comparisons = [
        RoleComparisonItem(
            role_name=c.get("role_name", ""),
            overall_score=float(c.get("overall_score", 0.0)),
            keyword_score=float(c.get("keyword_score", 0.0)),
            matched_skills_count=int(c.get("matched_skills_count", 0)),
            missing_skills_count=int(c.get("missing_skills_count", 0)),
        )
        for c in raw_comps
        if isinstance(c, dict)
    ]

    return AtsEvaluationOut(
        id=record.id,
        user_id=record.user_id,
        filename=record.filename,
        target_role=record.target_role,
        overall_score=record.overall_score,
        grade=record.grade,
        category_scores=category_scores,
        matched_skills=record.matched_skills or [],
        missing_skills=record.missing_skills or [],
        detected_sections=record.detected_sections or [],
        missing_sections=record.missing_sections or [],
        strengths=record.strengths or [],
        weaknesses=record.weaknesses or [],
        recommendations=recommendations,
        role_comparisons=role_comparisons,
        word_count=record.word_count,
        quantifiable_metrics_count=record.quantifiable_metrics_count,
        created_at=record.created_at,
    )


@router.post(
    "/score-file",
    response_model=AtsEvaluationOut,
    status_code=status.HTTP_200_OK,
    summary="Upload PDF/DOCX and evaluate ATS compatibility score",
)
async def score_resume_file(
    file: UploadFile = File(...),
    target_role: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AtsEvaluationOut:
    """
    Accepts PDF or DOCX file upload, extracts text, calculates 5-dimension
    ATS score against target role benchmark, and saves evaluation to database.
    """
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided for uploaded resume.",
        )

    try:
        file_bytes = await file.read()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to read uploaded file: {str(exc)}",
        )

    # 1. Validate and parse file text using existing parser service
    try:
        parsed = parse_resume_file(file.filename, file_bytes)
    except ResumeParserError as rpe:
        raise HTTPException(status_code=rpe.status_code, detail=rpe.message)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while parsing resume: {str(exc)}",
        )

    if parsed["is_unreadable"] or not parsed["text"].strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="The uploaded resume appears to be an unreadable image or scanned PDF without extractable text.",
        )

    # 2. Determine target role
    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    selected_role = (
        (target_role or "").strip()
        or (profile.target_role if profile and profile.target_role else "")
        or "Data Analyst"
    )

    # 3. Calculate ATS score
    eval_res = calculate_ats_score(
        resume_text=parsed["text"],
        target_role=selected_role,
        filename=file.filename,
    )

    # 4. Save evaluation to database
    record = AtsEvaluation(
        user_id=current_user.id,
        filename=file.filename,
        target_role=eval_res["target_role"],
        overall_score=eval_res["overall_score"],
        grade=eval_res["grade"],
        category_scores=eval_res["category_scores"],
        matched_skills=eval_res["matched_skills"],
        missing_skills=eval_res["missing_skills"],
        detected_sections=eval_res["detected_sections"],
        missing_sections=eval_res["missing_sections"],
        strengths=eval_res["strengths"],
        weaknesses=eval_res["weaknesses"],
        recommendations=eval_res["recommendations"],
        role_comparisons=eval_res["role_comparisons"],
        word_count=eval_res["word_count"],
        quantifiable_metrics_count=eval_res["quantifiable_metrics_count"],
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return _format_ats_out(record)


@router.post(
    "/score-text",
    response_model=AtsEvaluationOut,
    status_code=status.HTTP_200_OK,
    summary="Evaluate ATS score from raw resume text",
)
def score_resume_text(
    request: AtsScoreRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AtsEvaluationOut:
    """
    Evaluate ATS score directly from submitted resume text against target role benchmark.
    """
    text = (request.resume_text or "").strip()
    if not text:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resume text must not be empty.",
        )

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    selected_role = (
        (request.target_role or "").strip()
        or (profile.target_role if profile and profile.target_role else "")
        or "Data Analyst"
    )

    eval_res = calculate_ats_score(
        resume_text=text,
        target_role=selected_role,
        filename=request.filename or "resume_text_submission.txt",
    )

    record = AtsEvaluation(
        user_id=current_user.id,
        filename=request.filename or "resume_text_submission.txt",
        target_role=eval_res["target_role"],
        overall_score=eval_res["overall_score"],
        grade=eval_res["grade"],
        category_scores=eval_res["category_scores"],
        matched_skills=eval_res["matched_skills"],
        missing_skills=eval_res["missing_skills"],
        detected_sections=eval_res["detected_sections"],
        missing_sections=eval_res["missing_sections"],
        strengths=eval_res["strengths"],
        weaknesses=eval_res["weaknesses"],
        recommendations=eval_res["recommendations"],
        role_comparisons=eval_res["role_comparisons"],
        word_count=eval_res["word_count"],
        quantifiable_metrics_count=eval_res["quantifiable_metrics_count"],
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return _format_ats_out(record)


@router.post(
    "/score-latest",
    response_model=AtsEvaluationOut,
    status_code=status.HTTP_200_OK,
    summary="Evaluate ATS score using user's latest uploaded resume",
)
def score_latest_resume(
    target_role: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> AtsEvaluationOut:
    """
    Score the user's most recently uploaded resume without requiring a re-upload.
    """
    latest_resume = (
        db.query(ResumeAnalysis)
        .filter(ResumeAnalysis.user_id == current_user.id)
        .order_by(ResumeAnalysis.created_at.desc())
        .first()
    )

    profile = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    selected_role = (
        (target_role or "").strip()
        or (profile.target_role if profile and profile.target_role else "")
        or "Data Analyst"
    )

    # If user has an existing resume analysis
    if latest_resume and latest_resume.text_preview:
        resume_text = latest_resume.text_preview
        filename = latest_resume.filename
    else:
        # Fallback to synthesizing text from verified skills & degree in profile
        skills_str = ", ".join([s.get("name", "") for s in (profile.skills if profile else [])])
        degree_str = profile.education_level if profile else "B.Tech Computer Science"
        headline_str = profile.headline if profile else "Aspiring Software Engineer"
        resume_text = (
            f"PROFESSIONAL PROFILE\n{headline_str}\n\n"
            f"EDUCATION\n{degree_str} - Graduated with honors\n\n"
            f"TECHNICAL SKILLS\n{skills_str}\n\n"
            f"PROJECTS & EXPERIENCE\n"
            f"• Built data engineering and analytics applications using {skills_str}.\n"
            f"• Wrote automated test scripts and deployed solutions to production."
        )
        filename = "profile_skills_export.pdf"

    eval_res = calculate_ats_score(
        resume_text=resume_text,
        target_role=selected_role,
        filename=filename,
    )

    record = AtsEvaluation(
        user_id=current_user.id,
        filename=filename,
        target_role=eval_res["target_role"],
        overall_score=eval_res["overall_score"],
        grade=eval_res["grade"],
        category_scores=eval_res["category_scores"],
        matched_skills=eval_res["matched_skills"],
        missing_skills=eval_res["missing_skills"],
        detected_sections=eval_res["detected_sections"],
        missing_sections=eval_res["missing_sections"],
        strengths=eval_res["strengths"],
        weaknesses=eval_res["weaknesses"],
        recommendations=eval_res["recommendations"],
        role_comparisons=eval_res["role_comparisons"],
        word_count=eval_res["word_count"],
        quantifiable_metrics_count=eval_res["quantifiable_metrics_count"],
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return _format_ats_out(record)


@router.get(
    "/latest",
    response_model=Optional[AtsEvaluationOut],
    status_code=status.HTTP_200_OK,
    summary="Get user's latest ATS evaluation",
)
def get_latest_ats_evaluation(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Optional[AtsEvaluationOut]:
    """
    Retrieve the most recent ATS evaluation for the authenticated user.
    """
    record = (
        db.query(AtsEvaluation)
        .filter(AtsEvaluation.user_id == current_user.id)
        .order_by(AtsEvaluation.created_at.desc())
        .first()
    )

    if not record:
        return None

    return _format_ats_out(record)


@router.get(
    "/history",
    response_model=List[AtsHistoryItem],
    status_code=status.HTTP_200_OK,
    summary="Get user's ATS evaluation history",
)
def get_ats_evaluation_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[AtsHistoryItem]:
    """
    Retrieve historical ATS evaluations for the authenticated user.
    """
    records = (
        db.query(AtsEvaluation)
        .filter(AtsEvaluation.user_id == current_user.id)
        .order_by(AtsEvaluation.created_at.desc())
        .limit(20)
        .all()
    )

    return [
        AtsHistoryItem(
            id=r.id,
            filename=r.filename,
            target_role=r.target_role,
            overall_score=r.overall_score,
            grade=r.grade,
            created_at=r.created_at,
        )
        for r in records
    ]

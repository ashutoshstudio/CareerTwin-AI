from typing import List
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from app.api.deps import get_current_user, get_db
from app.models.resume import ResumeAnalysis
from app.models.user import User
from app.schemas.resume import (
    ContactInfo,
    EducationInfo,
    ResumeAnalysisOut,
    ResumeAnalysisSummaryOut,
    SkillExtracted,
)
from app.services.resume_parser import ResumeParserError, parse_resume_file
from app.services.skill_extractor import analyze_resume_text

router = APIRouter()


def _format_analysis_out(record: ResumeAnalysis) -> ResumeAnalysisOut:
    """Format SQLAlchemy ResumeAnalysis model into Pydantic ResumeAnalysisOut schema."""
    raw_skills = record.skills or []
    skills = [
        SkillExtracted(
            name=s.get("name", ""),
            category=s.get("category", "General"),
            confidence=s.get("confidence", "high"),
        )
        for s in raw_skills
        if isinstance(s, dict)
    ]

    education_dict = record.education or {}
    education = EducationInfo(
        degree=education_dict.get("degree"),
        institution=education_dict.get("institution"),
        graduation_year=education_dict.get("graduation_year"),
    )

    contact_dict = record.contact_info or {}
    contact_info = ContactInfo(
        email=contact_dict.get("email"),
        phone=contact_dict.get("phone"),
        github_url=contact_dict.get("github_url"),
        linkedin_url=contact_dict.get("linkedin_url"),
    )

    return ResumeAnalysisOut(
        id=record.id,
        user_id=record.user_id,
        filename=record.filename,
        file_type=record.file_type,
        file_size_bytes=record.file_size_bytes,
        status=record.status,
        text_preview=record.text_preview,
        extracted_skills=skills,
        education=education,
        contact_info=contact_info,
        summary=record.summary,
        warnings=record.warnings or [],
        created_at=record.created_at,
    )


@router.post(
    "/analyze",
    response_model=ResumeAnalysisOut,
    status_code=status.HTTP_200_OK,
    summary="Upload and analyze a resume file (PDF or DOCX)",
)
async def analyze_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ResumeAnalysisOut:
    """
    Accepts PDF or DOCX file, extracts text, performs skill and education extraction,
    records results for authenticated user, and returns comprehensive analysis.
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

    # Validate and extract text
    try:
        parsed = parse_resume_file(file.filename, file_bytes)
    except ResumeParserError as rpe:
        raise HTTPException(status_code=rpe.status_code, detail=rpe.message)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred while parsing resume: {str(exc)}",
        )

    # Perform skill, education, and contact info extraction
    analysis_result = analyze_resume_text(parsed["text"])

    # If document has no text (e.g. scanned PDF), mark as unreadable with explanation
    analysis_status = "unreadable" if parsed["is_unreadable"] else analysis_result["status"]

    # Persist in database
    db_record = ResumeAnalysis(
        user_id=current_user.id,
        filename=file.filename,
        file_type=parsed["file_type"],
        file_size_bytes=parsed["file_size_bytes"],
        status=analysis_status,
        text_preview=analysis_result["text_preview"],
        skills=analysis_result["skills"],
        education=analysis_result["education"],
        contact_info=analysis_result["contact_info"],
        warnings=analysis_result["warnings"],
        summary=analysis_result["summary"],
    )

    db.add(db_record)
    db.commit()
    db.refresh(db_record)

    return _format_analysis_out(db_record)


@router.get(
    "/history",
    response_model=List[ResumeAnalysisSummaryOut],
    status_code=status.HTTP_200_OK,
    summary="Get user's previous resume analyses",
)
def get_resume_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[ResumeAnalysisSummaryOut]:
    """
    Retrieve previous resume analyses for the authenticated user, ordered by creation date descending.
    """
    records = (
        db.query(ResumeAnalysis)
        .filter(ResumeAnalysis.user_id == current_user.id)
        .order_by(ResumeAnalysis.created_at.desc())
        .all()
    )

    summaries = []
    for r in records:
        skills = r.skills or []
        edu = r.education or {}
        summaries.append(
            ResumeAnalysisSummaryOut(
                id=r.id,
                filename=r.filename,
                file_type=r.file_type,
                file_size_bytes=r.file_size_bytes,
                status=r.status,
                skills_count=len(skills),
                degree_detected=edu.get("degree"),
                created_at=r.created_at,
            )
        )
    return summaries


@router.get(
    "/latest",
    response_model=ResumeAnalysisOut,
    status_code=status.HTTP_200_OK,
    summary="Get user's latest resume analysis",
)
def get_latest_resume(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ResumeAnalysisOut:
    """
    Retrieve the most recent resume analysis for the authenticated user.
    """
    record = (
        db.query(ResumeAnalysis)
        .filter(ResumeAnalysis.user_id == current_user.id)
        .order_by(ResumeAnalysis.created_at.desc())
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No previous resume analysis found for this account.",
        )

    return _format_analysis_out(record)


@router.get(
    "/{analysis_id}",
    response_model=ResumeAnalysisOut,
    status_code=status.HTTP_200_OK,
    summary="Get a specific resume analysis by ID",
)
def get_resume_by_id(
    analysis_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ResumeAnalysisOut:
    """
    Retrieve a specific analysis. Strictly isolates access so users can only access their own results.
    """
    record = (
        db.query(ResumeAnalysis)
        .filter(
            ResumeAnalysis.id == analysis_id,
            ResumeAnalysis.user_id == current_user.id,
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume analysis #{analysis_id} not found or you do not have permission to view it.",
        )

    return _format_analysis_out(record)

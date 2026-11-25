import os
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.report import Report
from app.models.user import User
from app.schemas.report import (
    ALL_REPORT_SECTION_IDS,
    ReportGenerateRequest,
    ReportHistoryItem,
    ReportOut,
    ReportPreviewOut,
    ReportSectionStatus,
)
from app.services.report_service import (
    REPORTS_DIR,
    aggregate_student_report_data,
    generate_career_readiness_pdf,
)

router = APIRouter()


@router.get("/preview", response_model=ReportPreviewOut, status_code=status.HTTP_200_OK)
def get_report_preview(
    target_role: Optional[str] = Query(default=None, description="Optional target role override for preview"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReportPreviewOut:
    """
    Aggregates the latest available data from all 10 CareerTwin AI modules
    and reports section availability status before PDF compilation.
    """
    data = aggregate_student_report_data(
        user_id=current_user.id,
        db=db,
        target_role_override=target_role,
    )

    section_statuses = [
        ReportSectionStatus(
            section_id=s["section_id"],
            title=s["title"],
            order=s["order"],
            is_available=s["is_available"],
            data_summary=s.get("data_summary"),
        )
        for s in data["sections"]
    ]

    return ReportPreviewOut(
        student_name=data["student_name"],
        student_email=data["student_email"],
        target_role=data["target_role"],
        sections=section_statuses,
        data_snapshot=data["data_snapshot"],
    )


@router.post("/generate", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def generate_report(
    payload: ReportGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReportOut:
    """
    Compiles selected assessment sections into an executive A4 PDF dossier
    and stores generation history in the database.
    """
    # Validate selected sections if provided
    selected = payload.selected_sections
    if selected is not None:
        invalid_sections = [s for s in selected if s not in ALL_REPORT_SECTION_IDS]
        if invalid_sections:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid section ID(s) provided: {', '.join(invalid_sections)}. Valid sections: {', '.join(ALL_REPORT_SECTION_IDS)}",
            )
        if len(selected) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="At least one report section must be selected for generation.",
            )
    else:
        selected = list(ALL_REPORT_SECTION_IDS)

    # 1. Aggregate Data
    aggregated_data = aggregate_student_report_data(
        user_id=current_user.id,
        db=db,
        target_role_override=payload.target_role,
    )

    # 2. Generate PDF
    title = payload.title or f"Career Readiness Report - {aggregated_data['target_role']}"
    pdf_path = generate_career_readiness_pdf(
        report_title=title,
        aggregated_data=aggregated_data,
        selected_sections=selected,
    )

    # 3. File Metadata
    file_size = os.path.getsize(pdf_path) if os.path.exists(pdf_path) else 0

    # Availability map
    avail_map = {
        s["section_id"]: s["is_available"] for s in aggregated_data.get("sections", [])
    }

    # Extract score snapshots
    snapshot = aggregated_data.get("data_snapshot", {})
    r_score = snapshot.get("readiness", {}).get("readiness_score") if snapshot.get("readiness") else None
    a_score = snapshot.get("ats", {}).get("overall_score") if snapshot.get("ats") else None
    g_score = snapshot.get("github", {}).get("overall_score") if snapshot.get("github") else None

    # 4. Save to Database
    db_report = Report(
        user_id=current_user.id,
        title=title,
        target_role=aggregated_data["target_role"],
        selected_sections=selected,
        sections_available=avail_map,
        file_path=pdf_path,
        file_size_bytes=file_size,
        overall_readiness_score=r_score,
        overall_ats_score=a_score,
        overall_github_score=g_score,
        summary=f"Report containing {len(selected)} sections for {aggregated_data['target_role']}.",
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)

    return ReportOut(
        id=db_report.id,
        user_id=db_report.user_id,
        title=db_report.title,
        target_role=db_report.target_role,
        selected_sections=db_report.selected_sections,
        sections_available=db_report.sections_available,
        file_size_bytes=db_report.file_size_bytes,
        overall_readiness_score=db_report.overall_readiness_score,
        overall_ats_score=db_report.overall_ats_score,
        overall_github_score=db_report.overall_github_score,
        summary=db_report.summary,
        created_at=db_report.created_at,
    )


@router.get("/history", response_model=List[ReportHistoryItem], status_code=status.HTTP_200_OK)
def get_report_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[ReportHistoryItem]:
    """Retrieve historical reports generated by the authenticated student."""
    records = (
        db.query(Report)
        .filter(Report.user_id == current_user.id)
        .order_by(Report.created_at.desc())
        .all()
    )
    return [
        ReportHistoryItem(
            id=r.id,
            title=r.title,
            target_role=r.target_role,
            selected_sections=r.selected_sections,
            file_size_bytes=r.file_size_bytes,
            overall_readiness_score=r.overall_readiness_score,
            overall_ats_score=r.overall_ats_score,
            overall_github_score=r.overall_github_score,
            created_at=r.created_at,
        )
        for r in records
    ]


@router.get("/{report_id}/download")
def download_report_pdf(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Downloads a previously generated career readiness PDF.
    Enforces user isolation, file existence verification, and path traversal protection.
    """
    # 1. Fetch record ensuring user isolation
    report = (
        db.query(Report)
        .filter(Report.id == report_id, Report.user_id == current_user.id)
        .first()
    )
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Report #{report_id} was not found or access is unauthorized.",
        )

    # 2. Path Traversal & Existence Protection
    file_path_obj = Path(report.file_path).resolve()
    reports_dir_obj = REPORTS_DIR.resolve()

    # Ensure path is strictly within the permitted reports directory
    try:
        file_path_obj.relative_to(reports_dir_obj)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access to the specified report path is forbidden.",
        )

    if not file_path_obj.exists() or not file_path_obj.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The requested report file is missing from the server.",
        )

    filename = file_path_obj.name
    return FileResponse(
        path=str(file_path_obj),
        filename=filename,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

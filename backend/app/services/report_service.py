import io
import logging
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from sqlalchemy.orm import Session

from app.core.config import settings
from app.ml.xai_service import explain_student_assessment
from app.models.ats import AtsEvaluation
from app.models.github import GitHubAnalysis
from app.models.profile import StudentProfile
from app.models.readiness import CareerReadinessAssessment
from app.models.recommendation import CareerRecommendation
from app.models.report import Report
from app.models.resume import ResumeAnalysis
from app.models.roadmap import LearningRoadmap
from app.models.skill_gap import SkillGapAnalysis
from app.models.user import User
from app.schemas.report import ALL_REPORT_SECTION_IDS, SECTION_METADATA
from app.services.job_matching_service import match_jobs_for_candidate

logger = logging.getLogger(__name__)

# Base reports directory
REPORTS_DIR = Path(settings.DATABASE_URL.replace("sqlite:///", "")).parent / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

# Brand Color Palette
PRIMARY_COLOR = colors.HexColor("#1E1B4B")     # Dark Indigo
SECONDARY_COLOR = colors.HexColor("#4F46E5")   # Indigo Accent
ACCENT_PURPLE = colors.HexColor("#7C3AED")     # Purple Accent
TEXT_DARK = colors.HexColor("#0F172A")         # Slate 900
TEXT_MUTED = colors.HexColor("#64748B")        # Slate 500
BG_LIGHT = colors.HexColor("#F8FAFC")          # Slate 50
BG_CARD = colors.HexColor("#F1F5F9")           # Slate 100
BORDER_COLOR = colors.HexColor("#E2E8F0")      # Slate 200
SUCCESS_COLOR = colors.HexColor("#059669")     # Emerald 600
WARNING_COLOR = colors.HexColor("#D97706")     # Amber 600
DANGER_COLOR = colors.HexColor("#DC2626")      # Rose 600


class NumberedCanvas(canvas.Canvas):
    """
    Two-pass canvas that computes total page count dynamically
    and draws professional running headers and footers on every page except the cover.
    """

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count: int):
        if self._pageNumber == 1:
            # Skip header/footer on cover page
            return

        self.saveState()
        self.setFont("Helvetica", 8)
        self.setFillColor(TEXT_MUTED)

        # Running Header
        self.drawString(36, 805, "CareerTwin AI — Comprehensive Career Readiness Report")
        self.setStrokeColor(BORDER_COLOR)
        self.setLineWidth(0.5)
        self.line(36, 798, 559, 798)

        # Running Footer
        self.line(36, 45, 559, 45)
        gen_date = datetime.now(timezone.utc).strftime("%B %d, %Y")
        self.drawString(36, 32, f"Confidential Career Readiness Dossier • Generated {gen_date}")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(559, 32, page_str)

        self.restoreState()


def aggregate_student_report_data(
    user_id: int,
    db: Session,
    target_role_override: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Queries latest available records from all 10 CareerTwin AI modules for the authenticated student.
    Returns structured data dictionary and section availability flags.
    """
    user = db.query(User).filter_by(id=user_id).first()
    if not user:
        raise ValueError(f"User ID {user_id} not found.")

    profile = db.query(StudentProfile).filter_by(user_id=user_id).first()
    target_role = (
        target_role_override
        or (profile.target_role if profile and profile.target_role else None)
        or "Data Analyst"
    )

    # 1. Profile Data
    profile_skills = profile.skills if profile and profile.skills else []
    profile_data = {
        "full_name": user.full_name,
        "email": user.email,
        "headline": profile.headline if profile else None,
        "education_level": profile.education_level if profile else None,
        "institution": profile.institution if profile else None,
        "graduation_year": profile.graduation_year if profile else None,
        "experience_months": profile.experience_months if profile else 0,
        "github_url": profile.github_url if profile else None,
        "linkedin_url": profile.linkedin_url if profile else None,
        "target_role": target_role,
        "skills": profile_skills,
    }

    # 2. Career Readiness Assessment (Latest)
    readiness = (
        db.query(CareerReadinessAssessment)
        .filter_by(user_id=user_id)
        .order_by(CareerReadinessAssessment.created_at.desc())
        .first()
    )
    readiness_data = None
    if readiness:
        readiness_data = {
            "readiness_score": readiness.readiness_score,
            "readiness_category": readiness.readiness_category,
            "dimension_scores": readiness.dimension_scores or {},
            "matching_core_skills": readiness.matching_core_skills or [],
            "missing_core_skills": readiness.missing_core_skills or [],
            "supporting_skills": readiness.supporting_skills or [],
            "created_at": readiness.created_at.strftime("%Y-%m-%d %H:%M UTC"),
        }

    # 3. Resume Analysis (Latest)
    resume = (
        db.query(ResumeAnalysis)
        .filter_by(user_id=user_id)
        .order_by(ResumeAnalysis.created_at.desc())
        .first()
    )
    resume_data = None
    if resume:
        resume_data = {
            "filename": resume.filename,
            "skills": resume.skills or [],
            "education": resume.education or [],
            "contact_info": resume.contact_info or {},
            "summary": resume.summary or "Resume successfully parsed and indexed.",
            "created_at": resume.created_at.strftime("%Y-%m-%d %H:%M UTC"),
        }

    # 4. ATS Resume Score (Latest)
    ats = (
        db.query(AtsEvaluation)
        .filter_by(user_id=user_id)
        .order_by(AtsEvaluation.created_at.desc())
        .first()
    )
    ats_data = None
    if ats:
        ats_data = {
            "overall_score": ats.overall_score,
            "grade": ats.grade,
            "category_scores": ats.category_scores or {},
            "matched_skills": ats.matched_skills or [],
            "missing_skills": ats.missing_skills or [],
            "detected_sections": ats.detected_sections or [],
            "missing_sections": ats.missing_sections or [],
            "strengths": ats.strengths or [],
            "weaknesses": ats.weaknesses or [],
            "recommendations": ats.recommendations or [],
            "word_count": ats.word_count,
            "quantifiable_metrics_count": ats.quantifiable_metrics_count,
            "created_at": ats.created_at.strftime("%Y-%m-%d %H:%M UTC"),
        }

    # 5. Skill Gap Analysis (Latest)
    skill_gap = (
        db.query(SkillGapAnalysis)
        .filter_by(user_id=user_id)
        .order_by(SkillGapAnalysis.created_at.desc())
        .first()
    )
    skill_gap_data = None
    if skill_gap:
        skill_gap_data = {
            "target_role": skill_gap.target_role,
            "skill_coverage_percentage": skill_gap.skill_coverage_percentage,
            "proficiency_alignment_percentage": skill_gap.proficiency_alignment_percentage,
            "met_count": skill_gap.met_count,
            "improvement_count": skill_gap.improvement_count,
            "missing_count": skill_gap.missing_count,
            "total_required": skill_gap.total_required,
            "skills_comparison": skill_gap.skills_comparison or [],
            "recommendations": skill_gap.recommendations or [],
            "created_at": skill_gap.created_at.strftime("%Y-%m-%d %H:%M UTC"),
        }

    # 6. Career Recommendations (Latest)
    recommendations = (
        db.query(CareerRecommendation)
        .filter_by(user_id=user_id)
        .order_by(CareerRecommendation.created_at.desc())
        .first()
    )
    recommendations_data = None
    if recommendations:
        recommendations_data = {
            "top_role": recommendations.top_role,
            "top_fit_score": recommendations.top_fit_score,
            "recommended_roles": recommendations.recommended_roles or [],
            "created_at": recommendations.created_at.strftime("%Y-%m-%d %H:%M UTC"),
        }

    # 7. GitHub Portfolio Analysis (Latest)
    github = (
        db.query(GitHubAnalysis)
        .filter_by(user_id=user_id)
        .order_by(GitHubAnalysis.created_at.desc())
        .first()
    )
    github_data = None
    if github:
        github_data = {
            "username": github.username,
            "overall_score": github.overall_score,
            "grade": github.grade,
            "category_scores": github.category_scores or {},
            "profile_info": github.profile_info or {},
            "languages": github.languages or {},
            "detected_technologies": github.detected_technologies or [],
            "matched_skills": github.matched_skills or [],
            "missing_skills": github.missing_skills or [],
            "repositories": github.repositories or [],
            "strengths": github.strengths or [],
            "weaknesses": github.weaknesses or [],
            "recommended_projects": github.recommended_projects or [],
            "total_repos_analyzed": github.total_repos_analyzed,
            "total_stars": github.total_stars,
            "created_at": github.created_at.strftime("%Y-%m-%d %H:%M UTC"),
        }

    # 8. Job Matches (Computed from current student skills)
    job_matches_data = None
    if profile_skills:
        try:
            job_results = match_jobs_for_candidate(
                candidate_skills=profile_skills,
                target_role=target_role,
                experience_months=profile_data.get("experience_months", 0),
            )
            if job_results:
                job_matches_data = {
                    "matched_vacancies": [
                        {
                            "job_id": j.get("job_id"),
                            "title": j.get("title"),
                            "company": j.get("company"),
                            "location": j.get("location"),
                            "match_score": j.get("match_score"),
                            "matched_skills": [s.get("name") for s in j.get("matching_skills", [])],
                            "missing_skills": [s.get("name") for s in j.get("missing_required_skills", [])],
                            "salary_range": j.get("salary_range", "Entry Level"),
                        }
                        for j in job_results[:5]
                    ]
                }
        except Exception as exc:
            logger.warning("Job matching computation failed for report: %s", exc)

    # 9. Explainable AI Insights (SHAP & LIME)
    xai_data = None
    if profile_skills or (readiness and readiness.readiness_score):
        try:
            explanation = explain_student_assessment(
                profile_skills=profile_skills,
                target_role=target_role,
                experience_months=profile_data.get("experience_months", 0),
                education_level=profile_data.get("education_level"),
                github_url=profile_data.get("github_url"),
                linkedin_url=profile_data.get("linkedin_url"),
            )
            xai_data = {
                "base_value": explanation.get("base_value", 50.0),
                "predicted_score": explanation.get("predicted_score", 0.0),
                "shap_attributions": [
                    {
                        "feature_name": attr.get("feature_label") or attr.get("feature_name"),
                        "shap_value": attr.get("shap_value", 0.0),
                        "description": attr.get("description", ""),
                        "is_positive": attr.get("impact") == "positive" or attr.get("shap_value", 0.0) >= 0,
                    }
                    for attr in explanation.get("shap_attributions", [])[:6]
                ],
                "lime_rules": [
                    {
                        "rule": item.get("condition") or item.get("feature_label"),
                        "weight": item.get("weight", 0.0),
                    }
                    for item in explanation.get("lime_attributions", [])[:4]
                ],
                "fidelity": {
                    "is_faithful": explanation.get("fidelity_check", {}).get("is_faithful", True),
                    "discrepancy": explanation.get("fidelity_check", {}).get("discrepancy", 0.0),
                },
            }
        except Exception as exc:
            logger.warning("XAI calculation failed for report: %s", exc)

    # 10. Learning Roadmap (Latest)
    roadmap = (
        db.query(LearningRoadmap)
        .filter_by(user_id=user_id)
        .order_by(LearningRoadmap.created_at.desc())
        .first()
    )
    roadmap_data = None
    if roadmap:
        roadmap_data = {
            "target_role": roadmap.target_role,
            "total_weeks": roadmap.total_weeks,
            "active_week": getattr(roadmap, "current_week", getattr(roadmap, "active_week", 1)),
            "completion_percentage": roadmap.completion_percentage,
            "total_items": roadmap.total_items,
            "completed_items": roadmap.completed_items,
            "weeks": (roadmap.weeks_data or [])[:6],
            "created_at": roadmap.created_at.strftime("%Y-%m-%d %H:%M UTC"),
        }

    # 11. Final Action Plan (Synthesized from actual deficits)
    action_plan_data = _synthesize_career_action_plan(
        target_role=target_role,
        readiness_data=readiness_data,
        skill_gap_data=skill_gap_data,
        ats_data=ats_data,
        github_data=github_data,
        roadmap_data=roadmap_data,
    )

    # Compile Sections Status & Availability
    sections_status = [
        {
            "section_id": "profile",
            "title": SECTION_METADATA["profile"]["title"],
            "order": 1,
            "is_available": bool(profile),
            "data_summary": f"{user.full_name} ({target_role})" if profile else "Profile record not found",
        },
        {
            "section_id": "readiness",
            "title": SECTION_METADATA["readiness"]["title"],
            "order": 2,
            "is_available": readiness_data is not None,
            "data_summary": (
                f"Readiness Score: {readiness_data['readiness_score']}% ({readiness_data['readiness_category']})"
                if readiness_data
                else "Not yet assessed"
            ),
        },
        {
            "section_id": "resume",
            "title": SECTION_METADATA["resume"]["title"],
            "order": 3,
            "is_available": resume_data is not None,
            "data_summary": (
                f"Parsed {len(resume_data['skills'])} skills from {resume_data['filename']}"
                if resume_data
                else "No resume uploaded"
            ),
        },
        {
            "section_id": "ats",
            "title": SECTION_METADATA["ats"]["title"],
            "order": 4,
            "is_available": ats_data is not None,
            "data_summary": (
                f"ATS Score: {ats_data['overall_score']}/100 ({ats_data['grade']})"
                if ats_data
                else "No ATS evaluation run"
            ),
        },
        {
            "section_id": "skill_gap",
            "title": SECTION_METADATA["skill_gap"]["title"],
            "order": 5,
            "is_available": skill_gap_data is not None,
            "data_summary": (
                f"Coverage: {skill_gap_data['skill_coverage_percentage']}% ({skill_gap_data['met_count']} met, {skill_gap_data['missing_count']} missing)"
                if skill_gap_data
                else "No skill gap benchmark executed"
            ),
        },
        {
            "section_id": "recommendations",
            "title": SECTION_METADATA["recommendations"]["title"],
            "order": 6,
            "is_available": recommendations_data is not None,
            "data_summary": (
                f"Top Career Fit: {recommendations_data['top_role']} ({recommendations_data['top_fit_score']}%)"
                if recommendations_data
                else "No recommendations calculated"
            ),
        },
        {
            "section_id": "github",
            "title": SECTION_METADATA["github"]["title"],
            "order": 7,
            "is_available": github_data is not None,
            "data_summary": (
                f"GitHub @{github_data['username']}: {github_data['overall_score']}/100 ({github_data['grade']})"
                if github_data
                else "No GitHub profile analyzed"
            ),
        },
        {
            "section_id": "job_matches",
            "title": SECTION_METADATA["job_matches"]["title"],
            "order": 8,
            "is_available": job_matches_data is not None,
            "data_summary": (
                f"{len(job_matches_data['matched_vacancies'])} curated benchmark vacancies matched"
                if job_matches_data
                else "No vacancies matched (add skills to profile)"
            ),
        },
        {
            "section_id": "xai",
            "title": SECTION_METADATA["xai"]["title"],
            "order": 9,
            "is_available": xai_data is not None,
            "data_summary": (
                f"SHAP base score {xai_data['base_value']}, fidelity confirmed"
                if xai_data
                else "Run career readiness to unlock model explanations"
            ),
        },
        {
            "section_id": "roadmap",
            "title": SECTION_METADATA["roadmap"]["title"],
            "order": 10,
            "is_available": roadmap_data is not None,
            "data_summary": (
                f"{roadmap_data['total_weeks']}-week plan, {roadmap_data['completion_percentage']}% completed"
                if roadmap_data
                else "No learning roadmap generated"
            ),
        },
        {
            "section_id": "action_plan",
            "title": SECTION_METADATA["action_plan"]["title"],
            "order": 11,
            "is_available": True,
            "data_summary": "Actionable career roadmap synthesized from actual assessment results",
        },
    ]

    return {
        "student_name": user.full_name,
        "student_email": user.email,
        "target_role": target_role,
        "sections": sections_status,
        "data_snapshot": {
            "profile": profile_data,
            "readiness": readiness_data,
            "resume": resume_data,
            "ats": ats_data,
            "skill_gap": skill_gap_data,
            "recommendations": recommendations_data,
            "github": github_data,
            "job_matches": job_matches_data,
            "xai": xai_data,
            "roadmap": roadmap_data,
            "action_plan": action_plan_data,
        },
    }


def _synthesize_career_action_plan(
    target_role: str,
    readiness_data: Optional[Dict[str, Any]],
    skill_gap_data: Optional[Dict[str, Any]],
    ats_data: Optional[Dict[str, Any]],
    github_data: Optional[Dict[str, Any]],
    roadmap_data: Optional[Dict[str, Any]],
) -> Dict[str, Any]:
    """
    Synthesizes concrete action priorities derived from real deficit signals across modules.
    Never fabricates experience, qualifications, or metrics.
    """
    priorities = []
    recommended_skills = []
    resume_improvements = []
    portfolio_improvements = []
    suggested_steps = []

    # Missing Skills
    if skill_gap_data and skill_gap_data.get("skills_comparison"):
        for item in skill_gap_data["skills_comparison"]:
            if item.get("status") in ("missing", "needs_improvement"):
                skill_name = item.get("name")
                if skill_name and skill_name not in recommended_skills:
                    recommended_skills.append(skill_name)
                    if len(priorities) < 3:
                        priorities.append(
                            f"Acquire & practice core skill '{skill_name}' (Target level: {item.get('required_level', 3)}/5)."
                        )

    # ATS Feedback
    if ats_data:
        if ats_data.get("missing_sections"):
            resume_improvements.append(
                f"Add missing structural resume sections: {', '.join(ats_data['missing_sections'])}."
            )
        if ats_data.get("quantifiable_metrics_count", 0) < 3:
            resume_improvements.append(
                "Incorporate measurable achievements (percentages, volume metrics, scale multipliers) into bullet points."
            )
        if ats_data.get("weaknesses"):
            priorities.append(f"ATS Optimization: {ats_data['weaknesses'][0]}")

    # GitHub Feedback
    if github_data:
        if github_data.get("weaknesses"):
            portfolio_improvements.append(github_data["weaknesses"][0])
        if github_data.get("recommended_projects"):
            top_proj = github_data["recommended_projects"][0]
            portfolio_improvements.append(
                f"Build portfolio project '{top_proj['title']}' using {', '.join(top_proj.get('suggested_tech', []))}."
            )
            priorities.append(f"Develop GitHub project: {top_proj['title']}.")

    # Roadmap Next Step
    if roadmap_data:
        suggested_steps.append(
            f"Continue week {roadmap_data['active_week']} of your personalized {roadmap_data['target_role']} curriculum."
        )
    else:
        suggested_steps.append(f"Generate a personalized learning roadmap for {target_role} on CareerTwin AI.")

    suggested_steps.append("Keep resume updated with recent projects and re-run ATS scoring prior to job applications.")
    suggested_steps.append("Push regular, documented code commits to GitHub to substantiate claimed technical skills.")

    if not priorities:
        priorities = [
            f"Conduct your first Career Readiness Assessment for {target_role}.",
            "Upload an up-to-date PDF/DOCX resume for NLP skill extraction.",
            "Connect your public GitHub username to evaluate open-source code quality.",
        ]

    return {
        "target_role": target_role,
        "top_priorities": priorities[:5],
        "recommended_skills": recommended_skills[:6],
        "resume_improvements": resume_improvements[:3],
        "portfolio_improvements": portfolio_improvements[:3],
        "suggested_next_steps": suggested_steps[:4],
    }


def generate_career_readiness_pdf(
    report_title: str,
    aggregated_data: Dict[str, Any],
    selected_sections: Optional[List[str]] = None,
    output_path: Optional[str] = None,
) -> str:
    """
    Renders a multi-page, publication-quality A4 PDF dossier incorporating selected assessment sections.
    Returns the absolute path to the generated PDF.
    """
    if selected_sections is None:
        sections_to_render = list(ALL_REPORT_SECTION_IDS)
    else:
        sections_to_render = [s for s in selected_sections if s in ALL_REPORT_SECTION_IDS]

    student_name = aggregated_data.get("student_name", "Student")
    student_email = aggregated_data.get("student_email", "")
    target_role = aggregated_data.get("target_role", "Data Analyst")
    data_snapshot = aggregated_data.get("data_snapshot", {})

    # Determine file destination
    if not output_path:
        timestamp_str = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
        safe_name = "".join(c for c in student_name if c.isalnum() or c in ("-", "_")).lower()
        filename = f"career_report_{safe_name}_{timestamp_str}.pdf"
        output_path = str(REPORTS_DIR / filename)

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=36,
        rightMargin=36,
        topMargin=54,
        bottomMargin=54,
    )

    styles = getSampleStyleSheet()

    # Custom Typography Styles
    style_cover_title = ParagraphStyle(
        "CoverTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=30,
        textColor=PRIMARY_COLOR,
        spaceAfter=12,
    )

    style_cover_subtitle = ParagraphStyle(
        "CoverSubtitle",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=13,
        leading=18,
        textColor=SECONDARY_COLOR,
        spaceAfter=24,
    )

    style_meta_label = ParagraphStyle(
        "MetaLabel",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=12,
        textColor=TEXT_DARK,
    )

    style_meta_val = ParagraphStyle(
        "MetaVal",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=TEXT_MUTED,
    )

    style_section_heading = ParagraphStyle(
        "SectionHeading",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        textColor=PRIMARY_COLOR,
        spaceBefore=12,
        spaceAfter=8,
    )

    style_subheading = ParagraphStyle(
        "SubHeading",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=15,
        textColor=SECONDARY_COLOR,
        spaceBefore=8,
        spaceAfter=4,
    )

    style_body = ParagraphStyle(
        "BodyDark",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=TEXT_DARK,
    )

    style_body_muted = ParagraphStyle(
        "BodyMuted",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        textColor=TEXT_MUTED,
    )

    style_table_header = ParagraphStyle(
        "TableHeader",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=11,
        textColor=colors.white,
    )

    style_table_cell = ParagraphStyle(
        "TableCell",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8,
        leading=11,
        textColor=TEXT_DARK,
    )

    style_table_cell_bold = ParagraphStyle(
        "TableCellBold",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=11,
        textColor=TEXT_DARK,
    )

    story: List[Any] = []

    # =========================================================================
    # COVER PAGE / REPORT OVERVIEW HEADER
    # =========================================================================
    story.append(Spacer(1, 20))
    story.append(
        Paragraph("CAREERTWIN AI — EXECUTIVE DOSSIER", ParagraphStyle("Brand", fontName="Helvetica-Bold", fontSize=10, textColor=ACCENT_PURPLE, spaceAfter=8))
    )
    story.append(Paragraph(report_title, style_cover_title))
    story.append(
        Paragraph(
            f"Comprehensive Multi-Factor Career Readiness & Skill Gap Analysis for <b>{target_role}</b>",
            style_cover_subtitle,
        )
    )

    story.append(HRFlowable(width="100%", thickness=2, color=SECONDARY_COLOR, spaceBefore=4, spaceAfter=16))

    # Candidate Meta Card Table
    gen_time_str = datetime.now(timezone.utc).strftime("%B %d, %Y at %H:%M UTC")
    meta_table_data = [
        [
            Paragraph("Candidate Name:", style_meta_label),
            Paragraph(student_name, style_meta_val),
            Paragraph("Target Role:", style_meta_label),
            Paragraph(f"<b>{target_role}</b>", style_meta_val),
        ],
        [
            Paragraph("Email Address:", style_meta_label),
            Paragraph(student_email, style_meta_val),
            Paragraph("Generated Date:", style_meta_label),
            Paragraph(gen_time_str, style_meta_val),
        ],
        [
            Paragraph("System Version:", style_meta_label),
            Paragraph("CareerTwin AI v2.4 (Explainable ML)", style_meta_val),
            Paragraph("Sections Included:", style_meta_label),
            Paragraph(f"{len(sections_to_render)} Assessment Modules", style_meta_val),
        ],
    ]
    t_meta = Table(meta_table_data, colWidths=[90, 170, 90, 173])
    t_meta.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), BG_CARD),
            ("BOX", (0, 0), (-1, -1), 1, BORDER_COLOR),
            ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ])
    )
    story.append(t_meta)
    story.append(Spacer(1, 16))

    # Executive Summary Highlights Box
    readiness_box = data_snapshot.get("readiness")
    ats_box = data_snapshot.get("ats")
    github_box = data_snapshot.get("github")
    skill_gap_box = data_snapshot.get("skill_gap")

    exec_kpi_data = [
        [
            Paragraph(
                f"<b>Readiness Score</b><br/><font size=16 color='#4F46E5'>{readiness_box['readiness_score'] if readiness_box else 'N/A'}{'%' if readiness_box else ''}</font><br/><font size=7 color='#64748B'>{readiness_box['readiness_category'] if readiness_box else 'Not Assessed'}</font>",
                style_body,
            ),
            Paragraph(
                f"<b>ATS Resume Score</b><br/><font size=16 color='#7C3AED'>{ats_box['overall_score'] if ats_box else 'N/A'}{'/100' if ats_box else ''}</font><br/><font size=7 color='#64748B'>{ats_box['grade'] if ats_box else 'No Resume Scored'}</font>",
                style_body,
            ),
            Paragraph(
                f"<b>GitHub Portfolio</b><br/><font size=16 color='#059669'>{github_box['overall_score'] if github_box else 'N/A'}{'/100' if github_box else ''}</font><br/><font size=7 color='#64748B'>{github_box['grade'] if github_box else 'No GitHub Analyzed'}</font>",
                style_body,
            ),
            Paragraph(
                f"<b>Skill Coverage</b><br/><font size=16 color='#D97706'>{skill_gap_box['skill_coverage_percentage'] if skill_gap_box else 'N/A'}{'%' if skill_gap_box else ''}</font><br/><font size=7 color='#64748B'>{str(skill_gap_box['met_count']) + ' skills met' if skill_gap_box else 'No Gap Analysis'}</font>",
                style_body,
            ),
        ]
    ]
    t_kpis = Table(exec_kpi_data, colWidths=[130, 130, 130, 133])
    t_kpis.setStyle(
        TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), BG_LIGHT),
            ("BOX", (0, 0), (-1, -1), 1, BORDER_COLOR),
            ("INNERGRID", (0, 0), (-1, -1), 1, BORDER_COLOR),
            ("TOPPADDING", (0, 0), (-1, -1), 8),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ])
    )
    story.append(t_kpis)
    story.append(Spacer(1, 14))

    # Executive Overview Narrative
    story.append(Paragraph("Executive Overview", style_subheading))
    overview_text = (
        f"This official readiness dossier integrates verified assessment evaluations across technical competencies, "
        f"resume extraction benchmarks, practical GitHub repository activity, and explainable AI inferences. "
        f"The candidate is actively tracking readiness towards the <b>{target_role}</b> technical profile. "
        f"All metrics are benchmarked against normalized entry-level industry skill requirements."
    )
    story.append(Paragraph(overview_text, style_body))
    story.append(PageBreak())

    # Helper function for rendering "Data Not Available" notice
    def _render_unavailable_notice(sec_title: str) -> None:
        notice_data = [
            [
                Paragraph(
                    f"<b>Data Not Yet Available for {sec_title}</b><br/>"
                    f"<font color='#64748B'>The candidate has not yet generated records for this module. "
                    f"Log in to the CareerTwin AI dashboard and complete this assessment to populate this section.</font>",
                    style_body,
                )
            ]
        ]
        t_not = Table(notice_data, colWidths=[523])
        t_not.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFFBEB")),
                ("BOX", (0, 0), (-1, -1), 1, colors.HexColor("#FDE68A")),
                ("TOPPADDING", (0, 0), (-1, -1), 10),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 10),
                ("LEFTPADDING", (0, 0), (-1, -1), 12),
                ("RIGHTPADDING", (0, 0), (-1, -1), 12),
            ])
        )
        story.append(t_not)
        story.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 1: STUDENT PROFILE
    # =========================================================================
    if "profile" in sections_to_render:
        story.append(Paragraph("1. Student Profile & Academic Background", style_section_heading))
        prof = data_snapshot.get("profile")
        if prof:
            p_data = [
                [Paragraph("Full Name", style_table_cell_bold), Paragraph(prof.get("full_name", "N/A"), style_table_cell), Paragraph("Target Career", style_table_cell_bold), Paragraph(prof.get("target_role", "N/A"), style_table_cell)],
                [Paragraph("Headline", style_table_cell_bold), Paragraph(prof.get("headline") or "Student / Aspiring Professional", style_table_cell), Paragraph("Experience", style_table_cell_bold), Paragraph(f"{prof.get('experience_months', 0)} months", style_table_cell)],
                [Paragraph("Degree / Level", style_table_cell_bold), Paragraph(prof.get("education_level") or "Undergraduate", style_table_cell), Paragraph("Graduation Year", style_table_cell_bold), Paragraph(str(prof.get("graduation_year") or "N/A"), style_table_cell)],
                [Paragraph("Institution", style_table_cell_bold), Paragraph(prof.get("institution") or "Not Specified", style_table_cell), Paragraph("LinkedIn Profile", style_table_cell_bold), Paragraph(prof.get("linkedin_url") or "Not Linked", style_table_cell)],
            ]
            t_prof = Table(p_data, colWidths=[100, 160, 100, 163])
            t_prof.setStyle(
                TableStyle([
                    ("BACKGROUND", (0, 0), (-1, -1), BG_CARD),
                    ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ])
            )
            story.append(t_prof)

            # Verified Skills Pills
            skills_list = prof.get("skills", [])
            if skills_list:
                story.append(Spacer(1, 8))
                story.append(Paragraph("<b>Recorded Technical Skills:</b>", style_subheading))
                skills_str = ", ".join([f"{s.get('name')} (Level {s.get('level', 1)}/5)" for s in skills_list if isinstance(s, dict)])
                story.append(Paragraph(skills_str, style_body_muted))
        else:
            _render_unavailable_notice("Student Profile")
        story.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 2: CAREER READINESS ASSESSMENT
    # =========================================================================
    if "readiness" in sections_to_render:
        story.append(Paragraph("2. Career Readiness Assessment (Random Forest Model)", style_section_heading))
        read = data_snapshot.get("readiness")
        if read:
            read_summary = (
                f"The candidate achieved an overall readiness prediction of <b>{read['readiness_score']}%</b>, "
                f"classifying them into <b>{read['readiness_category']}</b>. The evaluation model employs an ensemble "
                f"of Scikit-Learn Random Forest Regressors and Classifiers trained on fresh graduate entry profiles."
            )
            story.append(Paragraph(read_summary, style_body))
            story.append(Spacer(1, 6))

            # Dimension Breakdown Table
            dims = read.get("dimension_scores", {})
            dim_table_data = [
                [Paragraph("Competency Dimension", style_table_header), Paragraph("Assessed Score", style_table_header), Paragraph("Benchmark Status", style_table_header)],
                [Paragraph("Technical Competency", style_table_cell_bold), Paragraph(f"{dims.get('technical', 'N/A')}%", style_table_cell), Paragraph("Based on core role skill overlap & rated proficiencies", style_table_cell)],
                [Paragraph("Practical Experience", style_table_cell_bold), Paragraph(f"{dims.get('experience', 'N/A')}%", style_table_cell), Paragraph("Normalized against 24-month entry threshold", style_table_cell)],
                [Paragraph("Academic Qualification", style_table_cell_bold), Paragraph(f"{dims.get('education', 'N/A')}%", style_table_cell), Paragraph("Degree relevance score (BCA, B.Tech, MCA, B.Sc)", style_table_cell)],
                [Paragraph("Portfolio & Open-Source Presence", style_table_cell_bold), Paragraph(f"{dims.get('portfolio', 'N/A')}%", style_table_cell), Paragraph("GitHub & verified portfolio validation presence", style_table_cell)],
            ]
            t_dim = Table(dim_table_data, colWidths=[140, 100, 283])
            t_dim.setStyle(
                TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_COLOR),
                    ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BG_CARD]),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ])
            )
            story.append(t_dim)
        else:
            _render_unavailable_notice("Career Readiness Assessment")
        story.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 3: RESUME ANALYSIS
    # =========================================================================
    if "resume" in sections_to_render:
        story.append(Paragraph("3. Resume Skill Extraction & Parsing", style_section_heading))
        res = data_snapshot.get("resume")
        if res:
            r_text = (
                f"Analysis performed on uploaded document <b>{res.get('filename')}</b>. "
                f"Text extraction and NLP regular-expression taxonomy mapping extracted <b>{len(res.get('skills', []))} technical skills</b>."
            )
            story.append(Paragraph(r_text, style_body))
            story.append(Spacer(1, 6))

            skills_extracted = res.get("skills", [])
            ext_names = [s.get("name") for s in skills_extracted if isinstance(s, dict)]
            story.append(Paragraph(f"<b>Extracted Skills:</b> {', '.join(ext_names) if ext_names else 'None detected'}", style_body_muted))
            story.append(Spacer(1, 4))
            story.append(Paragraph(f"<b>Summary:</b> {res.get('summary', 'Document successfully indexed.')}", style_body_muted))
        else:
            _render_unavailable_notice("Resume Analysis")
        story.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 4: ATS RESUME SCORE
    # =========================================================================
    if "ats" in sections_to_render:
        story.append(Paragraph("4. ATS Resume Score & Keyword Optimization", style_section_heading))
        ats_eval = data_snapshot.get("ats")
        if ats_eval:
            ats_summary = (
                f"Overall ATS Compatibility Score: <b>{ats_eval['overall_score']} / 100</b> (Grade: <b>{ats_eval['grade']}</b>). "
                f"Evaluated across 5 objective heuristic dimensions. <i>Disclaimer: This is an independent benchmark, not a vendor algorithm simulation.</i>"
            )
            story.append(Paragraph(ats_summary, style_body))
            story.append(Spacer(1, 6))

            cat_s = ats_eval.get("category_scores", {})
            ats_table_data = [
                [Paragraph("Evaluation Category", style_table_header), Paragraph("Score", style_table_header), Paragraph("Category Benchmark", style_table_header)],
                [Paragraph("Keyword & Skill Matching", style_table_cell_bold), Paragraph(f"{cat_s.get('keyword_matching', 0)} / 30", style_table_cell), Paragraph("Target role technical skill alignment", style_table_cell)],
                [Paragraph("Section Completeness", style_table_cell_bold), Paragraph(f"{cat_s.get('section_completeness', 0)} / 20", style_table_cell), Paragraph("Contact, Summary, Skills, Experience, Education", style_table_cell)],
                [Paragraph("Experience & Relevance", style_table_cell_bold), Paragraph(f"{cat_s.get('experience_relevance', 0)} / 20", style_table_cell), Paragraph("Action verbs, domain keywords & project scope", style_table_cell)],
                [Paragraph("Quantifiable Achievements", style_table_cell_bold), Paragraph(f"{cat_s.get('quantifiable_achievements', 0)} / 15", style_table_cell), Paragraph(f"Metrics detected: {ats_eval.get('quantifiable_metrics_count', 0)}", style_table_cell)],
                [Paragraph("Formatting & Readability", style_table_cell_bold), Paragraph(f"{cat_s.get('formatting_readability', 0)} / 15", style_table_cell), Paragraph(f"Word count: {ats_eval.get('word_count', 0)} (optimal: 250-850)", style_table_cell)],
            ]
            t_ats = Table(ats_table_data, colWidths=[150, 90, 283])
            t_ats.setStyle(
                TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), ACCENT_PURPLE),
                    ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BG_CARD]),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ])
            )
            story.append(t_ats)

            # Recommendations bullet list
            recs = ats_eval.get("recommendations", [])
            if recs:
                story.append(Spacer(1, 6))
                story.append(Paragraph("<b>Key ATS Actionable Recommendations:</b>", style_subheading))
                for r in recs[:2]:
                    if isinstance(r, dict):
                        story.append(Paragraph(f"• <b>{r.get('category')}:</b> {r.get('suggestion')}", style_body_muted))
        else:
            _render_unavailable_notice("ATS Resume Scorer")
        story.append(Spacer(1, 14))

    # Page break after first group of assessments
    story.append(PageBreak())

    # =========================================================================
    # SECTION 5: SKILL GAP ANALYSIS
    # =========================================================================
    if "skill_gap" in sections_to_render:
        story.append(Paragraph("5. Role Benchmark & Skill Gap Analysis", style_section_heading))
        sg = data_snapshot.get("skill_gap")
        if sg:
            sg_text = (
                f"Candidate technical skills evaluated against benchmark profile for <b>{sg['target_role']}</b>. "
                f"Overall skill coverage is <b>{sg['skill_coverage_percentage']}%</b> across {sg['total_required']} required skills. "
                f"Proficiency alignment score: <b>{sg['proficiency_alignment_percentage']}%</b>."
            )
            story.append(Paragraph(sg_text, style_body))
            story.append(Spacer(1, 6))

            # Breakdown Table
            comps = sg.get("skills_comparison", [])
            if comps:
                sg_table_data = [
                    [Paragraph("Skill Name", style_table_header), Paragraph("Required", style_table_header), Paragraph("Candidate Level", style_table_header), Paragraph("Gap Status", style_table_header)],
                ]
                for item in comps[:8]:
                    st = item.get("status", "")
                    st_label = "Met" if st == "met" else ("Needs Improvement" if st == "needs_improvement" else "Missing")
                    sg_table_data.append([
                        Paragraph(item.get("name", ""), style_table_cell_bold),
                        Paragraph(f"Level {item.get('required_level', 3)}/5", style_table_cell),
                        Paragraph(f"Level {item.get('candidate_level', 0)}/5", style_table_cell),
                        Paragraph(st_label, style_table_cell),
                    ])
                t_sg = Table(sg_table_data, colWidths=[150, 110, 110, 153])
                t_sg.setStyle(
                    TableStyle([
                        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_COLOR),
                        ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                        ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BG_CARD]),
                        ("TOPPADDING", (0, 0), (-1, -1), 4),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ])
                )
                story.append(t_sg)
        else:
            _render_unavailable_notice("Skill Gap Analysis")
        story.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 6: CAREER RECOMMENDATIONS
    # =========================================================================
    if "recommendations" in sections_to_render:
        story.append(Paragraph("6. Multi-Factor Career Path Recommendations", style_section_heading))
        cr = data_snapshot.get("recommendations")
        if cr:
            cr_text = (
                f"Multi-factor algorithmic ranking identifies <b>{cr['top_role']}</b> as the primary technical fit "
                f"with a fit score of <b>{cr['top_fit_score']}%</b>. Ranking evaluates core competencies (50%), "
                f"secondary skills (20%), target preferences (15%), and degree alignment (10%)."
            )
            story.append(Paragraph(cr_text, style_body))
            story.append(Spacer(1, 6))

            roles_list = cr.get("recommended_roles", [])
            if roles_list:
                cr_table_data = [
                    [Paragraph("Role Title", style_table_header), Paragraph("Fit Score", style_table_header), Paragraph("Match Tier", style_table_header), Paragraph("Key Matched Competencies", style_table_header)],
                ]
                for r in roles_list[:4]:
                    cr_table_data.append([
                        Paragraph(r.get("role_name", ""), style_table_cell_bold),
                        Paragraph(f"{r.get('fit_score', 0)}%", style_table_cell),
                        Paragraph(r.get("match_tier", ""), style_table_cell),
                        Paragraph(", ".join(r.get("matching_core_skills", [])[:3]), style_table_cell),
                    ])
                t_cr = Table(cr_table_data, colWidths=[140, 70, 110, 203])
                t_cr.setStyle(
                    TableStyle([
                        ("BACKGROUND", (0, 0), (-1, 0), SECONDARY_COLOR),
                        ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                        ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BG_CARD]),
                        ("TOPPADDING", (0, 0), (-1, -1), 5),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                    ])
                )
                story.append(t_cr)
        else:
            _render_unavailable_notice("Career Recommendations")
        story.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 7: GITHUB PORTFOLIO ANALYSIS
    # =========================================================================
    if "github" in sections_to_render:
        story.append(Paragraph("7. GitHub Portfolio & Open-Source Activity", style_section_heading))
        gh = data_snapshot.get("github")
        if gh:
            gh_summary = (
                f"Evaluated public GitHub profile <b>@{gh['username']}</b>. Portfolio score: "
                f"<b>{gh['overall_score']} / 100</b> ({gh['grade']}). "
                f"Total repositories analyzed: {gh['total_repos_analyzed']}, earned stars: {gh['total_stars']}. "
                f"<i>Notice: Public metadata analysis reflects repository curation and activity without evaluating runtime code execution complexity.</i>"
            )
            story.append(Paragraph(gh_summary, style_body))
            story.append(Spacer(1, 6))

            # Languages & Category Scores
            gh_cats = gh.get("category_scores", {})
            gh_table_data = [
                [Paragraph("Portfolio Dimension", style_table_header), Paragraph("Score", style_table_header), Paragraph("Dimension Scope", style_table_header)],
                [Paragraph("Project Quality & Originality", style_table_cell_bold), Paragraph(f"{gh_cats.get('project_quality', 0)} / 25", style_table_cell), Paragraph("Original non-fork repositories & multi-file projects", style_table_cell)],
                [Paragraph("Technical Skill Diversity", style_table_cell_bold), Paragraph(f"{gh_cats.get('skill_diversity', 0)} / 20", style_table_cell), Paragraph("Breadth across programming languages and frameworks", style_table_cell)],
                [Paragraph("Repository Documentation", style_table_cell_bold), Paragraph(f"{gh_cats.get('documentation', 0)} / 15", style_table_cell), Paragraph("Descriptive summaries, topic tags and README completeness", style_table_cell)],
                [Paragraph("Coding Activity & Consistency", style_table_cell_bold), Paragraph(f"{gh_cats.get('coding_activity', 0)} / 20", style_table_cell), Paragraph("Recent push activity & account longevity", style_table_cell)],
                [Paragraph("Community Engagement", style_table_cell_bold), Paragraph(f"{gh_cats.get('community_engagement', 0)} / 10", style_table_cell), Paragraph("Open-source stars, forks & followers", style_table_cell)],
                [Paragraph("Career-Role Relevance", style_table_cell_bold), Paragraph(f"{gh_cats.get('role_relevance', 0)} / 10", style_table_cell), Paragraph(f"Alignment with target profile ({target_role})", style_table_cell)],
            ]
            t_gh = Table(gh_table_data, colWidths=[160, 80, 283])
            t_gh.setStyle(
                TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_COLOR),
                    ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BG_CARD]),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ])
            )
            story.append(t_gh)

            # Tailored Projects preview
            projs = gh.get("recommended_projects", [])
            if projs:
                story.append(Spacer(1, 6))
                story.append(Paragraph("<b>Recommended Portfolio Project Ideas:</b>", style_subheading))
                for p in projs[:2]:
                    story.append(Paragraph(f"• <b>{p.get('title')}:</b> {p.get('description')} <i>(Tech: {', '.join(p.get('suggested_tech', []))})</i>", style_body_muted))
        else:
            _render_unavailable_notice("GitHub Portfolio Analysis")
        story.append(Spacer(1, 14))

    # Page break after second group
    story.append(PageBreak())

    # =========================================================================
    # SECTION 8: JOB MATCHING
    # =========================================================================
    if "job_matches" in sections_to_render:
        story.append(Paragraph("8. Curated Vacancy Matches & Alignment", style_section_heading))
        jm = data_snapshot.get("job_matches")
        if jm and jm.get("matched_vacancies"):
            story.append(
                Paragraph(
                    "Curated benchmark entry-level opportunities evaluated against verified candidate skills. "
                    "<i>Note: These listings represent curated academic benchmark profiles, not verified live employer postings.</i>",
                    style_body,
                )
            )
            story.append(Spacer(1, 6))

            jm_table_data = [
                [Paragraph("Position Title", style_table_header), Paragraph("Organization", style_table_header), Paragraph("Location", style_table_header), Paragraph("Match %", style_table_header)],
            ]
            for job in jm["matched_vacancies"]:
                jm_table_data.append([
                    Paragraph(job.get("title", ""), style_table_cell_bold),
                    Paragraph(job.get("company", ""), style_table_cell),
                    Paragraph(job.get("location", ""), style_table_cell),
                    Paragraph(f"{job.get('match_score', 0)}%", style_table_cell),
                ])
            t_jm = Table(jm_table_data, colWidths=[170, 130, 130, 93])
            t_jm.setStyle(
                TableStyle([
                    ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_COLOR),
                    ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                    ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BG_CARD]),
                    ("TOPPADDING", (0, 0), (-1, -1), 5),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ])
            )
            story.append(t_jm)
        else:
            _render_unavailable_notice("Job Matching")
        story.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 9: EXPLAINABLE AI INSIGHTS
    # =========================================================================
    if "xai" in sections_to_render:
        story.append(Paragraph("9. Explainable AI Insights (SHAP & LIME)", style_section_heading))
        xai_res = data_snapshot.get("xai")
        if xai_res:
            story.append(
                Paragraph(
                    f"Model interpretability audit verifying exact additive feature attribution (SHAP) and local linear decision rules (LIME). "
                    f"Base benchmark value: <b>{xai_res['base_value']}</b>. Mathematical reconstruction fidelity: "
                    f"<b>{'Verified Faithful' if xai_res.get('fidelity', {}).get('is_faithful') else 'Approximate'}</b>. "
                    f"<i>Disclaimer: Feature contributions describe model sensitivity, not real-world hiring causation.</i>",
                    style_body,
                )
            )
            story.append(Spacer(1, 6))

            shap_items = xai_res.get("shap_attributions", [])
            if shap_items:
                xai_table_data = [
                    [Paragraph("Model Feature", style_table_header), Paragraph("SHAP Attribution", style_table_header), Paragraph("Interpretation", style_table_header)],
                ]
                for attr in shap_items:
                    val_str = f"+{attr['shap_value']:.2f}" if attr["is_positive"] else f"{attr['shap_value']:.2f}"
                    xai_table_data.append([
                        Paragraph(attr.get("feature_name", ""), style_table_cell_bold),
                        Paragraph(val_str, style_table_cell),
                        Paragraph(attr.get("description", ""), style_table_cell),
                    ])
                t_xai = Table(xai_table_data, colWidths=[140, 100, 283])
                t_xai.setStyle(
                    TableStyle([
                        ("BACKGROUND", (0, 0), (-1, 0), SECONDARY_COLOR),
                        ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                        ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BG_CARD]),
                        ("TOPPADDING", (0, 0), (-1, -1), 4),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ])
                )
                story.append(t_xai)
        else:
            _render_unavailable_notice("Explainable AI Insights")
        story.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 10: PERSONALIZED LEARNING ROADMAP
    # =========================================================================
    if "roadmap" in sections_to_render:
        story.append(Paragraph("10. Personalized Learning Curriculum", style_section_heading))
        rm = data_snapshot.get("roadmap")
        if rm:
            rm_text = (
                f"Personalized <b>{rm['total_weeks']}-week curriculum</b> for <b>{rm['target_role']}</b>. "
                f"Overall milestone progress: <b>{rm['completion_percentage']}%</b> ({rm['completed_items']} of {rm['total_items']} items completed). "
                f"Currently active learning week: <b>Week {rm['active_week']}</b>."
            )
            story.append(Paragraph(rm_text, style_body))
            story.append(Spacer(1, 6))

            weeks = rm.get("weeks", [])
            if weeks:
                rm_table_data = [
                    [Paragraph("Week", style_table_header), Paragraph("Focus Area", style_table_header), Paragraph("Key Milestone Goal", style_table_header), Paragraph("Est. Hours", style_table_header)],
                ]
                for w in weeks[:5]:
                    rm_table_data.append([
                        Paragraph(f"Week {w.get('week_number')}", style_table_cell_bold),
                        Paragraph(w.get("title", ""), style_table_cell),
                        Paragraph(w.get("milestone_goal", ""), style_table_cell),
                        Paragraph(f"{w.get('estimated_hours', 0)} hrs", style_table_cell),
                    ])
                t_rm = Table(rm_table_data, colWidths=[60, 160, 243, 60])
                t_rm.setStyle(
                    TableStyle([
                        ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_COLOR),
                        ("BOX", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                        ("INNERGRID", (0, 0), (-1, -1), 0.5, BORDER_COLOR),
                        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, BG_CARD]),
                        ("TOPPADDING", (0, 0), (-1, -1), 4),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ])
                )
                story.append(t_rm)
        else:
            _render_unavailable_notice("Personalized Learning Roadmap")
        story.append(Spacer(1, 14))

    # =========================================================================
    # SECTION 11: FINAL CAREER ACTION PLAN
    # =========================================================================
    if "action_plan" in sections_to_render:
        story.append(Paragraph("11. Final Career Action Plan & Next Steps", style_section_heading))
        plan = data_snapshot.get("action_plan", {})

        story.append(Paragraph(f"<b>Synthesized Growth Priorities for {target_role}:</b>", style_subheading))
        for p in plan.get("top_priorities", []):
            story.append(Paragraph(f"• <b>Priority:</b> {p}", style_body))
        story.append(Spacer(1, 6))

        story.append(Paragraph("<b>Resume & Portfolio Improvements:</b>", style_subheading))
        for imp in plan.get("resume_improvements", []):
            story.append(Paragraph(f"• [Resume] {imp}", style_body_muted))
        for p_imp in plan.get("portfolio_improvements", []):
            story.append(Paragraph(f"• [Portfolio] {p_imp}", style_body_muted))
        story.append(Spacer(1, 6))

        story.append(Paragraph("<b>Immediate Recommended Next Steps:</b>", style_subheading))
        for step in plan.get("suggested_next_steps", []):
            story.append(Paragraph(f"• {step}", style_body))
        story.append(Spacer(1, 14))

    # Build the PDF document with professional NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)
    return output_path

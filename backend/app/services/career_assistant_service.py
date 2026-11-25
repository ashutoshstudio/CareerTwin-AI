import logging
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.ats import AtsEvaluation
from app.models.career_assistant import (
    CareerAssistantConversation,
    CareerAssistantMessage,
)
from app.models.github import GitHubAnalysis
from app.models.job import SavedJob
from app.models.profile import StudentProfile
from app.models.readiness import CareerReadinessAssessment
from app.models.recommendation import CareerRecommendation
from app.models.report import Report
from app.models.resume import ResumeAnalysis
from app.models.roadmap import LearningRoadmap
from app.models.skill_gap import SkillGapAnalysis
from app.models.user import User
from app.services.ai_provider import get_configured_ai_provider
from app.services.job_matching_service import match_jobs_for_candidate
from app.core.roles_catalog import SUPPORTED_ROLE_COMPETENCIES

logger = logging.getLogger(__name__)


def build_student_context(
    user_id: int,
    db: Session,
    target_role_override: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Safely retrieves and aggregates the authenticated student's latest information
    across all CareerTwin AI modules without fabricating data or leaking secrets.
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

    profile_skills = profile.skills if profile and profile.skills else []
    profile_data = {
        "full_name": user.full_name,
        "education_level": profile.education_level if profile else None,
        "institution": profile.institution if profile else None,
        "graduation_year": profile.graduation_year if profile else None,
        "experience_months": profile.experience_months if profile else 0,
        "github_url": profile.github_url if profile else None,
        "linkedin_url": profile.linkedin_url if profile else None,
        "target_role": target_role,
        "skills": profile_skills,
    }

    # 1. Career Readiness
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
        }

    # 2. Resume
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
            "skills_count": len(resume.skills or []),
            "skills": [s.get("name") for s in (resume.skills or []) if isinstance(s, dict)],
            "education": resume.education or {},
            "summary": resume.summary,
        }

    # 3. ATS Evaluation
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
            "missing_sections": ats.missing_sections or [],
            "recommendations": ats.recommendations or [],
            "word_count": ats.word_count,
            "quantifiable_metrics_count": ats.quantifiable_metrics_count,
        }

    # 4. Skill Gap
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
            "missing_count": skill_gap.missing_count,
            "skills_comparison": skill_gap.skills_comparison or [],
            "recommendations": skill_gap.recommendations or [],
        }

    # 5. Career Recommendations
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
        }

    # 6. GitHub
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
            "languages": github.languages or {},
            "detected_technologies": github.detected_technologies or [],
            "matched_skills": github.matched_skills or [],
            "missing_skills": github.missing_skills or [],
            "total_repos_analyzed": github.total_repos_analyzed,
            "recommendations": github.recommendations or [],
            "recommended_projects": github.recommended_projects or [],
        }

    # 7. Learning Roadmap
    roadmap = (
        db.query(LearningRoadmap)
        .filter_by(user_id=user_id)
        .order_by(LearningRoadmap.created_at.desc())
        .first()
    )
    roadmap_data = None
    if roadmap:
        active_week_num = getattr(roadmap, "current_week", getattr(roadmap, "active_week", 1))
        weeks = roadmap.weeks_data or []
        current_week_info = None
        for w in weeks:
            if w.get("week_number") == active_week_num:
                current_week_info = w
                break

        roadmap_data = {
            "target_role": roadmap.target_role,
            "total_weeks": roadmap.total_weeks,
            "active_week": active_week_num,
            "completion_percentage": roadmap.completion_percentage,
            "completed_items": roadmap.completed_items,
            "total_items": roadmap.total_items,
            "current_week_info": current_week_info,
            "weeks": weeks[:4],
        }

    # 8. Job Matches
    job_matches_data = None
    if profile_skills:
        try:
            job_results = match_jobs_for_candidate(
                candidate_skills=profile_skills,
                target_role=target_role,
                experience_months=profile_data.get("experience_months", 0),
            )
            if job_results:
                saved_records = db.query(SavedJob).filter_by(user_id=user_id).all()
                saved_ids = {s.job_id for s in saved_records}

                job_matches_data = {
                    "matched_vacancies": [
                        {
                            "job_id": j.get("job_id"),
                            "title": j.get("title"),
                            "company": j.get("company"),
                            "location": j.get("location"),
                            "match_score": j.get("match_score"),
                            "is_saved": j.get("job_id") in saved_ids,
                            "matched_skills": [s.get("name") for s in j.get("matching_skills", [])],
                            "missing_skills": [s.get("name") for s in j.get("missing_required_skills", [])],
                        }
                        for j in job_results[:4]
                    ]
                }
        except Exception as exc:
            logger.warning("Job matching computation failed for assistant context: %s", exc)

    # 9. Latest Generated Report
    latest_report = (
        db.query(Report)
        .filter_by(user_id=user_id)
        .order_by(Report.created_at.desc())
        .first()
    )
    report_data = None
    if latest_report:
        report_data = {
            "report_id": latest_report.id,
            "title": latest_report.title,
            "file_size_bytes": latest_report.file_size_bytes,
            "created_at": latest_report.created_at.strftime("%Y-%m-%d"),
        }

    # Modules coverage tally
    modules = [
        bool(profile),
        bool(resume_data),
        bool(readiness_data),
        bool(skill_gap_data),
        bool(recommendations_data),
        bool(job_matches_data),
        bool(readiness_data and readiness.matching_core_skills),  # XAI proxy
        bool(roadmap_data),
        bool(ats_data),
        bool(github_data),
        bool(report_data),
    ]
    available_count = sum(1 for m in modules if m)

    return {
        "student_name": user.full_name,
        "target_role": target_role,
        "profile": profile_data,
        "readiness": readiness_data,
        "resume": resume_data,
        "ats": ats_data,
        "skill_gap": skill_gap_data,
        "recommendations": recommendations_data,
        "github": github_data,
        "roadmap": roadmap_data,
        "job_matches": job_matches_data,
        "report": report_data,
        "available_modules_count": available_count,
        "total_modules_count": 11,
    }


def format_context_for_prompt(context: Dict[str, Any]) -> str:
    """
    Serializes student context into a clean, structured system prompt markdown block.
    Excludes private identifiers and enforces strict educational advisory guardrails.
    """
    student_name = context.get("student_name", "Student")
    target_role = context.get("target_role", "Data Analyst")
    profile = context.get("profile", {})
    skills = [
        (s.get("name") if isinstance(s, dict) else str(s))
        for s in (profile.get("skills") or [])
        if s
    ]

    lines = [
        "You are the official CareerTwin AI Personal Career Advisor, a dedicated mentor for undergraduate and postgraduate students.",
        "Your role is to guide students on technical skills, career readiness, resume optimization, GitHub portfolios, and learning roadmaps.",
        "",
        "### STRICT GUIDELINES:",
        "1. GROUNDING: Ground your advice strictly in the verified student assessment metrics below. Never invent scores, experiences, or completed projects.",
        "2. REALISM & HONESTY: Provide supportive, objective guidance. Never guarantee employment, hiring, salary brackets, or interview offers.",
        "3. TRANSPARENCY: When a student asks about a module that has NOT been completed yet (e.g. ATS Resume Scorer or GitHub Analyzer), clearly state that the assessment is pending and recommend running that module.",
        "4. ACTIONABILITY: Structure recommendations into clear, numbered action steps. Reference specific skills and milestones.",
        "5. TONE: Professional, encouraging, clear, and focused on student growth.",
        "",
        f"### VERIFIED STUDENT CONTEXT FOR: {student_name}",
        f"- Target Career Role: {target_role}",
        f"- Education: {profile.get('education_level') or 'Not specified'} ({profile.get('institution') or 'University'})",
        f"- Verified Experience: {profile.get('experience_months', 0)} months",
        f"- Current Profile Skills: {', '.join(skills) if skills else 'None recorded yet'}",
    ]

    resume = context.get("resume")
    if resume:
        lines.append(f"- Resume Analysis: {resume.get('filename')} parsed with {resume.get('skills_count', 0)} skills detected")
        if resume.get("summary"):
            lines.append(f"  * Resume Summary: {resume.get('summary')[:150]}")
    else:
        lines.append("- Resume Analysis: Not yet uploaded")

    readiness = context.get("readiness")
    if readiness:
        lines.append(f"- Career Readiness: {round(readiness.get('readiness_score', 0))}% ({readiness.get('readiness_category', 'Assessed')})")
        dims = readiness.get("dimension_scores", {})
        if dims:
            lines.append(f"  * Technical: {dims.get('technical_skills', 0)}% | Problem Solving: {dims.get('problem_solving', 0)}% | Experience: {dims.get('project_experience', 0)}% | Communication: {dims.get('communication', 0)}%")
    else:
        lines.append("- Career Readiness: Not yet assessed (Module pending)")

    ats = context.get("ats")
    if ats:
        lines.append(f"- ATS Resume Score: {round(ats.get('overall_score', 0))}/100 ({ats.get('grade', 'Evaluated')})")
        missing_kw = ats.get("missing_skills", [])
        if missing_kw:
            missing_clean = [(k.get("name") if isinstance(k, dict) else str(k)) for k in missing_kw if k]
            if missing_clean:
                lines.append(f"  * Missing Keywords: {', '.join(missing_clean[:5])}")
    else:
        lines.append("- ATS Resume Score: Not yet evaluated")

    github = context.get("github")
    if github:
        lines.append(f"- GitHub Portfolio: {round(github.get('overall_score', 0))}/100 ({github.get('grade', 'Evaluated')}) across {github.get('total_repos_analyzed', 0)} repos")
        techs = github.get("detected_technologies", [])
        if techs:
            tech_names = [(t.get("name") if isinstance(t, dict) else str(t)) for t in techs if t]
            if tech_names:
                lines.append(f"  * Detected Stack: {', '.join(tech_names[:6])}")
    else:
        lines.append("- GitHub Portfolio: Not yet linked or analyzed")

    skill_gap = context.get("skill_gap")
    if skill_gap:
        lines.append(f"- Skill Gap Coverage: {round(skill_gap.get('skill_coverage_percentage', 0))}% for {target_role}")
        comps = skill_gap.get("skills_comparison", [])
        missing = [
            (c.get("name") or c.get("skill"))
            for c in comps
            if isinstance(c, dict) and c.get("status") in ("missing", "needs_improvement")
        ]
        missing = [str(m) for m in missing if m]
        if missing:
            lines.append(f"  * Critical Competency Gaps: {', '.join(missing[:5])}")
    else:
        lines.append("- Skill Gap Analysis: Not yet benchmarked")

    roadmap = context.get("roadmap")
    if roadmap:
        lines.append(f"- Learning Roadmap: Week {roadmap.get('active_week')} of {roadmap.get('total_weeks')} ({round(roadmap.get('completion_percentage', 0))}% complete)")
        curr_week = roadmap.get("current_week_info")
        if curr_week:
            lines.append(f"  * Current Focus: {curr_week.get('title')} ({curr_week.get('estimated_hours', 10)} hrs)")
    else:
        lines.append("- Learning Roadmap: Not yet generated")

    recom = context.get("recommendations")
    if recom:
        lines.append(f"- Top Career Recommendation: {recom.get('top_role')} ({round(recom.get('top_fit_score', 0))}% fit)")

    jobs = context.get("job_matches", {}).get("matched_vacancies", [])
    if jobs:
        top_j = jobs[0]
        lines.append(f"- Sample Entry-Level Opportunity: {top_j.get('title')} at {top_j.get('company')} ({round(top_j.get('match_score', 0))}% match)")

    return "\n".join(lines)


def generate_deterministic_career_guidance(query: str, context: Dict[str, Any]) -> str:
    """
    Intelligent, deterministic career advice engine tailored to the student's exact
    CareerTwin AI metrics. Used when external AI provider is disabled, unconfigured,
    or encounters network/rate limits.
    """
    q = query.lower()
    target_role = context.get("target_role", "Data Analyst")
    student_name = context.get("student_name", "Student")
    profile = context.get("profile", {})
    skills = [s.get("name") for s in profile.get("skills", []) if isinstance(s, dict)]
    readiness = context.get("readiness")
    ats = context.get("ats")
    github = context.get("github")
    skill_gap = context.get("skill_gap")
    roadmap = context.get("roadmap")
    recommendations = context.get("recommendations")
    job_matches = context.get("job_matches", {}).get("matched_vacancies", [])

    # A. Readiness & General Profile Guidance
    if any(k in q for k in ["readiness", "ready", "score", "am i ready", "career path", "evaluate me"]):
        if not readiness:
            return (
                f"### Career Readiness Evaluation for {student_name}\n\n"
                f"You have not yet run the **Career Readiness Assessment** for your target role (**{target_role}**).\n\n"
                "**Recommended Action Items:**\n"
                "1. Navigate to the **Career Readiness** tab on your sidebar.\n"
                "2. Click **Assess Career Readiness** to trigger the Random Forest machine learning evaluation.\n"
                "3. Review your dimensional breakdown across Technical Competency, Problem Solving, Project Experience, and Academic Qualification."
            )

        score = round(readiness.get("readiness_score", 0))
        tier = readiness.get("readiness_category", "Assessed")
        dims = readiness.get("dimension_scores", {})
        strengths = readiness.get("matching_core_skills", [])
        gaps = readiness.get("missing_core_skills", [])

        response = [
            f"### Career Readiness Analysis: {target_role}\n\n",
            f"Based on your latest assessment, your overall career readiness is **{score}%** (**{tier}**).\n\n",
            "**Key Dimensional Strengths:**\n",
        ]
        if dims:
            response.append(f"- **Technical Competency:** {dims.get('technical_skills', 0)}%\n")
            response.append(f"- **Problem Solving & Logic:** {dims.get('problem_solving', 0)}%\n")
            response.append(f"- **Project Experience:** {dims.get('project_experience', 0)}%\n")
            response.append(f"- **Academic Tier:** {dims.get('communication', 0)}%\n\n")

        if strengths:
            response.append(f"**Verified Core Skills:** {', '.join(strengths)}\n\n")

        if gaps:
            response.append(f"**Critical Growth Areas:** {', '.join(gaps)}\n\n")

        response.append(
            "**Strategic Next Steps:**\n"
            "1. Focus on bridging your top missing technical skills through structured practice.\n"
            "2. Complete the active tasks in your **Learning Roadmap** to elevate your baseline readiness.\n"
            "3. Optimize your resume keyword alignment in the **ATS Score** module."
        )
        return "".join(response)

    # B. Skill Gap & Missing Skills Explanation
    if any(k in q for k in ["skill gap", "missing skill", "why do i need", "what to learn", "improve", "sql", "python"]):
        # Check if asking why a specific skill is needed
        specific_skill = None
        for s in ["sql", "python", "power bi", "tableau", "excel", "docker", "git", "aws", "statistics"]:
            if s in q:
                specific_skill = s.upper()
                break

        if specific_skill:
            return (
                f"### Role Benchmark Rationale: {specific_skill} in {target_role}\n\n"
                f"In modern tech recruitment for **{target_role}**, **{specific_skill}** is a critical benchmark competency:\n\n"
                f"1. **Production Demand:** Industry benchmark frameworks designate {specific_skill} as mandatory for data validation, querying, or pipeline integration.\n"
                f"2. **Model Sensitivity (XAI):** In CareerTwin's Random Forest model, possessing verified {specific_skill} proficiency contributes direct positive points toward your technical baseline.\n"
                f"3. **Recruiter Filtering:** Entry-level ATS filters frequently eliminate resumes missing {specific_skill} before recruiter review.\n\n"
                f"**Action Plan:** Check your **Learning Roadmap** for interactive tutorials and exercises covering {specific_skill}."
            )

        if not skill_gap:
            return (
                f"### Skill Gap Analysis for {target_role}\n\n"
                "You have not yet executed a Skill Gap benchmark comparison for your profile.\n\n"
                "**Action:** Head to the **Skill Gap** page and click **Run Benchmark Analysis** to compare your skills against industry requirements."
            )

        coverage = round(skill_gap.get("skill_coverage_percentage", 0))
        met_count = skill_gap.get("met_count", 0)
        missing_count = skill_gap.get("missing_count", 0)
        comps = skill_gap.get("skills_comparison", [])
        missing_names = [
            (c.get("name") or c.get("skill"))
            for c in comps
            if isinstance(c, dict) and c.get("status") in ("missing", "needs_improvement")
        ]
        missing_names = [str(m) for m in missing_names if m]

        return (
            f"### Skill Gap Analysis for {target_role}\n\n"
            f"Your current skill coverage for **{target_role}** is **{coverage}%** ({met_count} met competencies, {missing_count} missing).\n\n"
            f"**Highest Priority Gaps to Address:**\n"
            + ("\n".join([f"- **{m}**: High industry demand for {target_role}." for m in missing_names[:4]]) if missing_names else "- All primary core requirements are currently satisfied!")
            + "\n\n**Recommendation:** Use the **Learning Roadmap** to close these gaps systematically week by week."
        )

    # C. ATS Resume Scoring & Optimization
    if any(k in q for k in ["ats", "resume", "keyword", "cv", "bullet point"]):
        if not ats:
            return (
                "### ATS Resume Optimization Guidance\n\n"
                "You have not yet analyzed a resume with the **ATS Resume Scorer**.\n\n"
                "**Recommended Action Items:**\n"
                "1. Go to the **ATS Score** tab in the sidebar.\n"
                "2. Upload your latest PDF or DOCX resume, or select your target role.\n"
                "3. Review your keyword match rate, section completeness, and quantifiable metric recommendations."
            )

        ats_score = round(ats.get("overall_score", 0))
        grade = ats.get("grade", "Evaluated")
        missing_kw = ats.get("missing_skills", [])
        recomms = ats.get("recommendations", [])

        res = [
            f"### ATS Resume Evaluation Breakdown ({ats_score}/100 — {grade})\n\n",
            "**Key Optimization Areas:**\n",
        ]
        if missing_kw:
            res.append(f"- **Missing Benchmark Keywords:** {', '.join(missing_kw[:6])}\n")
        if ats.get("quantifiable_metrics_count", 0) < 3:
            res.append("- **Quantifiable Metrics:** Your bullet points lack measurable outcomes (e.g., *'optimized query execution by 35%'* or *'automated 15 weekly reports'*).\n")

        if recomms:
            res.append("\n**Actionable Improvements:**\n")
            for r in recomms[:3]:
                res.append(f"1. {r}\n")

        res.append(
            "\n**Pro Tip:** Incorporate missing keywords directly into your project impact descriptions rather than just listing them in a skills cloud."
        )
        return "".join(res)

    # D. GitHub Portfolio Guidance
    if any(k in q for k in ["github", "portfolio", "repository", "repos", "code"]):
        if not github:
            return (
                "### GitHub Portfolio Guidance\n\n"
                "You haven't analyzed your GitHub profile yet in CareerTwin AI.\n\n"
                "**Next Steps:**\n"
                "1. Go to **GitHub Analyzer** in the sidebar.\n"
                "2. Enter your GitHub username or ensure your profile has your GitHub link.\n"
                "3. Click **Analyze Profile** to evaluate code activity, language diversity, and project depth."
            )

        gh_score = round(github.get("overall_score", 0))
        grade = github.get("grade", "Evaluated")
        techs = github.get("detected_technologies", [])
        tech_names = [(t.get("name") if isinstance(t, dict) else str(t)) for t in techs if t]
        recomms = github.get("recommendations", [])
        proj_ideas = github.get("recommended_projects", [])

        res = [
            f"### GitHub Portfolio Assessment ({gh_score}/100 — {grade})\n\n",
            f"- **Analyzed Repositories:** {github.get('total_repos_analyzed', 0)}\n",
            f"- **Detected Stack:** {', '.join(tech_names) if tech_names else 'None detected'}\n\n",
            "**Portfolio Strengths & Opportunities:**\n",
        ]
        for r in recomms[:2]:
            res.append(f"- {r}\n")

        if proj_ideas:
            res.append("\n**Recommended Project Ideas for Your Portfolio:**\n")
            for p in proj_ideas[:2]:
                title = p.get("title") if isinstance(p, dict) else str(p)
                desc = p.get("description", "") if isinstance(p, dict) else ""
                res.append(f"1. **{title}**: {desc}\n")

        return "".join(res)

    # E. Learning Roadmap Guidance
    if any(k in q for k in ["roadmap", "week", "learn this week", "task", "milestone", "resource"]):
        if not roadmap:
            return (
                "### Learning Roadmap Status\n\n"
                "You have not generated a personalized Learning Roadmap yet.\n\n"
                "**Action:** Navigate to **Learning Roadmap** and click **Generate Personalized Roadmap** to build a tailored weekly milestone plan based on your skill gaps."
            )

        active_wk = roadmap.get("active_week", 1)
        progress = round(roadmap.get("completion_percentage", 0))
        curr_wk = roadmap.get("current_week_info")

        res = [
            f"### Personalized Roadmap: Week {active_wk} Progress ({progress}% Complete)\n\n",
        ]
        if curr_wk:
            res.append(f"**Current Milestone:** {curr_wk.get('title')}\n")
            res.append(f"- **Estimated Time Commitment:** {curr_wk.get('estimated_hours', 10)} hours\n")
            topics = curr_wk.get("topics", [])
            pending = [t.get("title") for t in topics if not t.get("is_completed")]
            if pending:
                res.append(f"- **Pending Action Topics:** {', '.join(pending[:4])}\n")

            resources = curr_wk.get("resources", [])
            if resources:
                res.append("\n**Verified Learning Resources:**\n")
                for r in resources[:2]:
                    res.append(f"- [{r.get('title')}]({r.get('url')})\n")

        res.append(
            "\n**Guidance:** Completing topics updates your roadmap progress and feeds directly into your career readiness score."
        )
        return "".join(res)

    # F. Role Comparison
    if "vs" in q or "compare" in q or ("difference between" in q and "role" in q):
        roles_mentioned = []
        for r in SUPPORTED_ROLE_COMPETENCIES.keys():
            if r.lower() in q:
                roles_mentioned.append(r)

        if len(roles_mentioned) >= 2:
            r1, r2 = roles_mentioned[0], roles_mentioned[1]
            c1 = SUPPORTED_ROLE_COMPETENCIES[r1]
            c2 = SUPPORTED_ROLE_COMPETENCIES[r2]
            skills_lower = {s.lower() for s in skills}

            r1_met = [s for s in c1["core"] if s.lower() in skills_lower]
            r2_met = [s for s in c2["core"] if s.lower() in skills_lower]

            return (
                f"### Career Role Comparison: {r1} vs. {r2}\n\n"
                f"**1. Core Focus & Purpose:**\n"
                f"- **{r1}:** {c1['description']}\n"
                f"- **{r2}:** {c2['description']}\n\n"
                f"**2. Benchmark Skills Comparison:**\n"
                f"- **{r1} Core Stack:** {', '.join(c1['core'])}\n"
                f"- **{r2} Core Stack:** {', '.join(c2['core'])}\n\n"
                f"**3. Your Current Skill Alignment:**\n"
                f"- For **{r1}**: You currently have **{len(r1_met)} of {len(c1['core'])}** core skills ({', '.join(r1_met) if r1_met else 'None'}).\n"
                f"- For **{r2}**: You currently have **{len(r2_met)} of {len(c2['core'])}** core skills ({', '.join(r2_met) if r2_met else 'None'}).\n\n"
                f"**Recommendation:** Based on your existing technical inventory, you are closer to fulfilling entry requirements for **{r1 if len(r1_met) >= len(r2_met) else r2}**."
            )

    # G. Job Preparation Guidance
    if any(k in q for k in ["job", "interview", "vacancy", "prepare", "apply"]):
        if not job_matches:
            return (
                f"### Job Preparation & Vacancy Matching\n\n"
                f"No matched vacancies are currently cached for your profile.\n\n"
                "**Next Steps:**\n"
                "1. Go to **Job Matches** in your sidebar.\n"
                "2. Review academic benchmark vacancies filtered by your target role (**{target_role}**).\n"
                "3. Bookmark target vacancies to prioritize missing skills."
            )

        top_job = job_matches[0]
        return (
            f"### Job Preparation: {top_job.get('title')} ({top_job.get('company')})\n\n"
            f"- **Location:** {top_job.get('location')}\n"
            f"- **Your Match Score:** **{round(top_job.get('match_score', 0))}%**\n"
            f"- **Matched Required Skills:** {', '.join(top_job.get('matched_skills', [])) or 'None'}\n"
            f"- **Missing Skills to Prepare:** {', '.join(top_job.get('missing_skills', [])) or 'None'}\n\n"
            "**Interview Preparation Tips:**\n"
            "1. Be prepared to explain technical design decisions in your portfolio projects.\n"
            "2. Practice writing clean, error-free queries or coding solutions under timed conditions.\n"
            "3. Prepare concise answers detailing challenges you encountered and how you resolved them."
        )

    # General Executive Summary Fallback
    top_recom = recommendations.get("top_role") if recommendations else target_role
    readiness_str = (
        f"{round(readiness.get('readiness_score', 0))}% ({readiness.get('readiness_category', 'Assessed')})"
        if readiness else "Pending Assessment"
    )
    ats_str = (
        f"{round(ats.get('overall_score', 0))}/100 ({ats.get('grade', 'Evaluated')})"
        if ats else "Pending Upload"
    )
    github_str = (
        f"{round(github.get('overall_score', 0))}/100 ({github.get('grade', 'Evaluated')})"
        if github else "Pending Connection"
    )
    roadmap_str = (
        f"{round(roadmap.get('completion_percentage', 0))}% complete"
        if roadmap else "Not Generated"
    )

    return (
        f"### CareerTwin AI Personal Guidance for {student_name}\n\n"
        f"I have reviewed your active CareerTwin AI profile benchmarked against **{target_role}**:\n\n"
        f"- **Primary Target Role:** {target_role}\n"
        f"- **Career Readiness:** {readiness_str}\n"
        f"- **ATS Resume Score:** {ats_str}\n"
        f"- **GitHub Portfolio:** {github_str}\n"
        f"- **Roadmap Progress:** {roadmap_str}\n\n"
        "**What would you like to explore next?**\n"
        "1. *'What are my biggest skill gaps?'* — Deep dive into missing competencies.\n"
        "2. *'How can I improve my ATS score?'* — Specific resume keyword and format fixes.\n"
        "3. *'What should I learn this week?'* — Active roadmap tasks and curated resources.\n"
        "4. *'Compare Data Analyst vs Python Developer'* — Side-by-side competency comparison."
    )


# ---------------------------------------------------------------------------
# Conversation Lifecycle & Chat Processor
# ---------------------------------------------------------------------------

def get_or_create_conversation(
    user_id: int,
    conversation_id: Optional[int],
    target_role: str,
    db: Session,
) -> CareerAssistantConversation:
    """
    Retrieves an existing conversation verifying user isolation, or creates a new one.
    """
    if conversation_id:
        conv = (
            db.query(CareerAssistantConversation)
            .filter_by(id=conversation_id, user_id=user_id)
            .first()
        )
        if conv:
            return conv
        raise ValueError(f"Conversation #{conversation_id} not found or access is unauthorized.")

    # Create new conversation
    title = f"Career Advisory — {target_role}"
    conv = CareerAssistantConversation(
        user_id=user_id,
        title=title,
        target_role=target_role,
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return conv


def list_user_conversations(
    user_id: int,
    db: Session,
) -> List[Dict[str, Any]]:
    """
    Lists all conversations for the authenticated user, sorted newest first.
    """
    conversations = (
        db.query(CareerAssistantConversation)
        .filter_by(user_id=user_id)
        .order_by(CareerAssistantConversation.updated_at.desc())
        .all()
    )

    results = []
    for c in conversations:
        messages = c.messages or []
        last_msg = messages[-1].content if messages else None
        results.append({
            "id": c.id,
            "title": c.title,
            "target_role": c.target_role,
            "message_count": len(messages),
            "last_message_preview": (last_msg[:80] + "...") if last_msg and len(last_msg) > 80 else last_msg,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
        })
    return results


def get_conversation_messages(
    user_id: int,
    conversation_id: int,
    db: Session,
) -> Optional[CareerAssistantConversation]:
    """
    Retrieves a conversation ensuring user isolation.
    """
    return (
        db.query(CareerAssistantConversation)
        .filter_by(id=conversation_id, user_id=user_id)
        .first()
    )


def delete_conversation(
    user_id: int,
    conversation_id: int,
    db: Session,
) -> bool:
    """
    Deletes conversation and cascading messages with strict tenant isolation.
    """
    conv = (
        db.query(CareerAssistantConversation)
        .filter_by(id=conversation_id, user_id=user_id)
        .first()
    )
    if not conv:
        return False

    db.delete(conv)
    db.commit()
    return True


async def process_student_chat(
    user_id: int,
    message: str,
    conversation_id: Optional[int],
    target_role_override: Optional[str],
    db: Session,
) -> Dict[str, Any]:
    """
    Primary chat processing workflow:
    1. Aggregates real student context.
    2. Retrieves or creates isolated conversation.
    3. Persists user message.
    4. Dispatches to configured AI provider or fallback.
    5. Persists assistant message and updates conversation timestamp.
    """
    clean_msg = message.strip()
    if not clean_msg:
        raise ValueError("Message content cannot be empty.")

    # 1. Build Personalized Context
    context = build_student_context(
        user_id=user_id,
        db=db,
        target_role_override=target_role_override,
    )

    # 2. Retrieve / Create Conversation
    conversation = get_or_create_conversation(
        user_id=user_id,
        conversation_id=conversation_id,
        target_role=context.get("target_role", "Data Analyst"),
        db=db,
    )

    # 3. Save User Message
    user_msg_record = CareerAssistantMessage(
        conversation_id=conversation.id,
        role="user",
        content=clean_msg,
    )
    db.add(user_msg_record)
    db.commit()
    db.refresh(user_msg_record)

    # 4. Generate Response via AI Provider or Deterministic Fallback
    provider = get_configured_ai_provider()
    assistant_response = None
    provider_used = "careertwin_deterministic"
    is_fallback = True
    generation_mode = "fallback_mode"
    provider_error = None

    system_prompt = format_context_for_prompt(context)

    if provider:
        try:
            # Build sliding conversation history (last 8 messages)
            recent_msgs = (
                db.query(CareerAssistantMessage)
                .filter_by(conversation_id=conversation.id)
                .order_by(CareerAssistantMessage.created_at.asc())
                .all()
            )[-8:]

            formatted_history = [
                {"role": m.role, "content": m.content}
                for m in recent_msgs
            ]

            raw_ai_res = await provider.generate_response(
                messages=formatted_history,
                system_prompt=system_prompt,
            )
            if raw_ai_res:
                assistant_response = raw_ai_res
                provider_used = provider.provider_name
                is_fallback = False
                generation_mode = "ai_mode"
                provider_error = None
        except Exception as exc:
            logger.warning(
                "External AI Provider '%s' call failed: %s. Engaging deterministic fallback.",
                provider.provider_name,
                exc,
            )
            provider_used = "careertwin_deterministic"
            is_fallback = True
            generation_mode = "ai_unavailable"
            # Sanitize error detail to remove any sensitive token strings
            provider_error = str(exc).split("?")[0].split("&")[0][:200]

    if not assistant_response:
        assistant_response = generate_deterministic_career_guidance(
            query=clean_msg,
            context=context,
        )
        if not provider:
            generation_mode = "fallback_mode"
        is_fallback = True

    # 5. Save Assistant Message
    # Store relevant snapshot metrics and generation status in message context
    snapshot_context = {
        "target_role": context.get("target_role"),
        "readiness_score": context.get("readiness", {}).get("readiness_score") if context.get("readiness") else None,
        "ats_score": context.get("ats", {}).get("overall_score") if context.get("ats") else None,
        "github_score": context.get("github", {}).get("overall_score") if context.get("github") else None,
        "active_week": context.get("roadmap", {}).get("active_week") if context.get("roadmap") else None,
        "is_fallback": is_fallback,
        "generation_mode": generation_mode,
        "provider_error": provider_error,
    }

    asst_msg_record = CareerAssistantMessage(
        conversation_id=conversation.id,
        role="assistant",
        content=assistant_response,
        provider_used=provider_used,
        relevant_context=snapshot_context,
    )
    db.add(asst_msg_record)

    # If first exchange, update conversation title intelligently
    if len(conversation.messages) <= 2:
        snippet = clean_msg[:40]
        conversation.title = f"{context.get('target_role')}: {snippet}..."

    conversation.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(asst_msg_record)

    return {
        "conversation_id": conversation.id,
        "conversation_title": conversation.title,
        "assistant_response": assistant_response,
        "relevant_context": snapshot_context,
        "provider_used": provider_used,
        "is_fallback": is_fallback,
        "generation_mode": generation_mode,
        "provider_error": provider_error,
        "timestamp": asst_msg_record.created_at,
        "message_id": asst_msg_record.id,
    }


async def retry_last_assistant_message(
    user_id: int,
    conversation_id: int,
    db: Session,
) -> Dict[str, Any]:
    """
    Retries generation of the latest assistant message with the active AI provider.
    Replaces deterministic fallback response if AI call succeeds.
    """
    conv = (
        db.query(CareerAssistantConversation)
        .filter_by(id=conversation_id, user_id=user_id)
        .first()
    )
    if not conv:
        raise ValueError(f"Conversation #{conversation_id} not found.")

    messages = (
        db.query(CareerAssistantMessage)
        .filter_by(conversation_id=conversation_id)
        .order_by(CareerAssistantMessage.created_at.asc())
        .all()
    )
    if not messages:
        raise ValueError("Conversation has no messages to retry.")

    last_asst_msg = None
    user_msg = None
    for m in reversed(messages):
        if m.role == "assistant" and last_asst_msg is None:
            last_asst_msg = m
        elif m.role == "user" and last_asst_msg is not None:
            user_msg = m
            break

    if not user_msg or not last_asst_msg:
        raise ValueError("No eligible assistant response found to retry.")

    context = build_student_context(user_id=user_id, db=db, target_role_override=conv.target_role)
    provider = get_configured_ai_provider()
    if not provider:
        raise RuntimeError("AI provider is not configured. Add a valid AI_API_KEY in backend/.env to activate real AI responses.")

    recent_msgs = messages[-8:]
    formatted_history = [
        {"role": m.role, "content": m.content}
        for m in recent_msgs
        if m.id != last_asst_msg.id
    ]

    system_prompt = format_context_for_prompt(context)
    new_res = await provider.generate_response(
        messages=formatted_history,
        system_prompt=system_prompt,
    )
    if not new_res:
        raise RuntimeError("AI provider did not return content. Please check API quota or try again.")

    # Update record
    last_asst_msg.content = new_res
    last_asst_msg.provider_used = provider.provider_name
    ctx = dict(last_asst_msg.relevant_context or {})
    ctx["is_fallback"] = False
    ctx["generation_mode"] = "ai_mode"
    ctx["provider_error"] = None
    ctx["retried_at"] = datetime.now(timezone.utc).isoformat()
    last_asst_msg.relevant_context = ctx
    conv.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(last_asst_msg)

    return {
        "conversation_id": conv.id,
        "conversation_title": conv.title,
        "assistant_response": new_res,
        "relevant_context": ctx,
        "provider_used": provider.provider_name,
        "is_fallback": False,
        "generation_mode": "ai_mode",
        "provider_error": None,
        "timestamp": last_asst_msg.created_at,
        "message_id": last_asst_msg.id,
    }

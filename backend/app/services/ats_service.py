import re
from typing import Any, Dict, List, Optional, Set, Tuple
from app.services.skill_extractor import (
    EMAIL_PATTERN,
    PHONE_PATTERN,
    extract_skills,
)
from app.services.skill_gap_service import ROLE_BENCHMARKS

# Curated action verbs for resume impact analysis
STRONG_ACTION_VERBS: Set[str] = {
    "accelerated", "accomplished", "achieved", "analyzed", "architected", "automated",
    "benchmarked", "built", "centralized", "collaborated", "compiled", "composed",
    "configured", "constructed", "created", "customized", "debugged", "decreased",
    "delivered", "deployed", "designed", "developed", "devised", "discovered",
    "engineered", "enhanced", "established", "evaluated", "executed", "expanded",
    "expedited", "fabricated", "formulated", "generated", "implemented", "improved",
    "increased", "initiated", "innovated", "inspected", "installed", "integrated",
    "launched", "maintained", "managed", "maximized", "minimized", "modeled",
    "modernized", "optimized", "orchestrated", "overhauled", "pioneered", "predicted",
    "produced", "programmed", "quantified", "redesigned", "reduced", "refactored",
    "resolved", "restructured", "scaled", "simulated", "spearheaded", "standardized",
    "streamlined", "structured", "tested", "trained", "transformed", "upgraded",
    "validated", "visualized",
}

# Role-specific domain context keywords
ROLE_DOMAIN_KEYWORDS: Dict[str, Set[str]] = {
    "Data Analyst": {
        "dashboard", "dashboards", "query", "queries", "aggregation", "kpi", "kpis",
        "metric", "metrics", "trend", "trends", "visualization", "visualizations",
        "dataset", "datasets", "cleansing", "wrangling", "reporting", "insights",
        "pivot", "relational", "warehouse", "etl", "stakeholder", "stakeholders",
    },
    "Python Developer": {
        "api", "apis", "endpoint", "endpoints", "backend", "microservice", "microservices",
        "database", "orm", "asynchronous", "async", "testing", "pytest", "unit",
        "git", "branching", "docker", "container", "restful", "json", "request", "response",
    },
    "Machine Learning Engineer": {
        "model", "models", "pipeline", "pipelines", "feature", "features", "training",
        "inference", "cross-validation", "evaluation", "accuracy", "f1", "precision",
        "recall", "supervised", "unsupervised", "neural", "hyperparameter", "loss",
    },
}

# Standard resume section header patterns
SECTION_PATTERNS: Dict[str, re.Pattern] = {
    "Contact Information": re.compile(r"\b(contact|email|phone|mobile|address|portfolio|github|linkedin)\b", re.IGNORECASE),
    "Summary / Objective": re.compile(r"\b(summary|objective|professional\s+summary|about\s+me|career\s+objective|profile)\b", re.IGNORECASE),
    "Technical Skills": re.compile(r"\b(skills|technical\s+skills|technologies|tools|competencies|core\s+competencies|programming\s+languages)\b", re.IGNORECASE),
    "Experience / Projects": re.compile(r"\b(experience|work\s+experience|employment|projects|academic\s+projects|personal\s+projects|internships?)\b", re.IGNORECASE),
    "Education": re.compile(r"\b(education|academic\s+background|qualifications|academics|university|college|degree)\b", re.IGNORECASE),
}

# Quantifiable metric patterns
METRIC_PERCENTAGE = re.compile(r"\b\d+(?:\.\d+)?%\b")
METRIC_MULTIPLIER = re.compile(r"\b\d+(?:\.\d+)?\s*(?:x|times|fold)\b", re.IGNORECASE)
METRIC_SCALE = re.compile(r"\b\d+(?:,\d+)*(?:k|m|\+)?\s*(?:[a-zA-Z]+\s+)?(?:users|requests|rows|records|queries|clients|customers|students|participants|stars|downloads|cases|stakeholders)\b", re.IGNORECASE)
METRIC_FINANCIAL = re.compile(r"(?:\$|€|£|₹)\s*\d+(?:,\d+)*(?:\.\d+)?(?:\s*(?:k|m|million|thousand))?\b", re.IGNORECASE)
METRIC_TIME_SAVING = re.compile(r"\b\d+\s*(?:hours|hrs|days|weeks|months|minutes|mins|ms|seconds|secs)\b", re.IGNORECASE)
METRIC_NUMERICAL_SCALE = re.compile(r"\b\d+(?:,\d+)*\+\s*[a-zA-Z]+\b")


def calculate_ats_score(
    resume_text: str,
    target_role: str = "Data Analyst",
    filename: str = "resume.pdf",
    extracted_skills: Optional[List[Dict[str, Any]]] = None,
) -> Dict[str, Any]:
    """
    Evaluate resume against explainable ATS heuristic benchmarks (100 points maximum):
      1. Keyword & Skill Matching (30 pts)
      2. Resume Section Completeness (20 pts)
      3. Experience & Project Relevance (20 pts)
      4. Quantifiable Achievements (15 pts)
      5. Formatting & Readability (15 pts)
    """
    clean_text = resume_text.strip()
    words = clean_text.split()
    word_count = len(words)
    text_lower = clean_text.lower()

    # 1. Skills Extraction
    if extracted_skills is None:
        extracted_skills = extract_skills(clean_text)

    found_skill_names = {s.get("name", "").strip().lower() for s in extracted_skills if s.get("name")}

    # Get target benchmark
    benchmark = ROLE_BENCHMARKS.get(target_role)
    if not benchmark:
        target_role = "Data Analyst"
        benchmark = ROLE_BENCHMARKS["Data Analyst"]

    core_benchmarks = benchmark.get("core_skills", [])
    sec_benchmarks = benchmark.get("secondary_skills", [])

    matched_core: List[str] = []
    missing_core: List[str] = []
    matched_sec: List[str] = []
    missing_sec: List[str] = []

    for item in core_benchmarks:
        name = item["name"]
        if name.lower() in found_skill_names or re.search(r"\b" + re.escape(name.lower()) + r"\b", text_lower):
            matched_core.append(name)
        else:
            missing_core.append(name)

    for item in sec_benchmarks:
        name = item["name"]
        if name.lower() in found_skill_names or re.search(r"\b" + re.escape(name.lower()) + r"\b", text_lower):
            matched_sec.append(name)
        else:
            missing_sec.append(name)

    # Keyword matching score (max 30)
    core_ratio = len(matched_core) / max(1, len(core_benchmarks))
    sec_ratio = len(matched_sec) / max(1, len(sec_benchmarks))
    score_keywords = round(min(30.0, (core_ratio * 20.0) + (sec_ratio * 10.0)), 1)

    matched_skills_all = matched_core + matched_sec
    missing_skills_all = missing_core + missing_sec

    # 2. Section Completeness (max 20 pts, 4 pts each)
    detected_sections: List[str] = []
    missing_sections: List[str] = []

    has_contact = bool(EMAIL_PATTERN.search(clean_text) or PHONE_PATTERN.search(clean_text) or SECTION_PATTERNS["Contact Information"].search(clean_text))
    if has_contact:
        detected_sections.append("Contact Information")
    else:
        missing_sections.append("Contact Information")

    for sec_name, pattern in SECTION_PATTERNS.items():
        if sec_name == "Contact Information":
            continue
        if pattern.search(clean_text):
            detected_sections.append(sec_name)
        else:
            missing_sections.append(sec_name)

    score_sections = round(min(20.0, len(detected_sections) * 4.0), 1)

    # 3. Work Experience & Project Relevance (max 20 pts)
    # 3a. Action verbs presence (8 pts)
    found_verbs = [v for v in STRONG_ACTION_VERBS if re.search(r"\b" + v + r"\b", text_lower)]
    if len(found_verbs) >= 6:
        verbs_score = 8.0
    elif len(found_verbs) >= 4:
        verbs_score = 6.0
    elif len(found_verbs) >= 2:
        verbs_score = 4.0
    elif len(found_verbs) == 1:
        verbs_score = 2.0
    else:
        verbs_score = 0.0

    # 3b. Domain keywords (8 pts)
    domain_keywords = ROLE_DOMAIN_KEYWORDS.get(target_role, set())
    found_domain_kw = [kw for kw in domain_keywords if re.search(r"\b" + kw + r"\b", text_lower)]
    if len(found_domain_kw) >= 5:
        domain_score = 8.0
    elif len(found_domain_kw) >= 3:
        domain_score = 6.0
    elif len(found_domain_kw) >= 1:
        domain_score = 4.0
    else:
        domain_score = 1.0

    # 3c. Project/Experience depth (4 pts)
    has_proj_exp = "Experience / Projects" in detected_sections
    proj_score = 4.0 if (has_proj_exp and word_count >= 150) else 1.0

    score_experience = round(min(20.0, verbs_score + domain_score + proj_score), 1)

    # 4. Quantifiable Achievements (max 15 pts)
    metric_matches = set()
    for m in METRIC_PERCENTAGE.findall(clean_text):
        metric_matches.add(m.strip())
    for m in METRIC_MULTIPLIER.findall(clean_text):
        metric_matches.add(m.strip())
    for m in METRIC_SCALE.findall(clean_text):
        metric_matches.add(m.strip())
    for m in METRIC_FINANCIAL.findall(clean_text):
        metric_matches.add(m.strip())
    for m in METRIC_TIME_SAVING.findall(clean_text):
        metric_matches.add(m.strip())
    for m in METRIC_NUMERICAL_SCALE.findall(clean_text):
        metric_matches.add(m.strip())

    quant_count = len(metric_matches)
    if quant_count >= 4:
        score_metrics = 15.0
    elif quant_count == 3:
        score_metrics = 12.0
    elif quant_count == 2:
        score_metrics = 9.0
    elif quant_count == 1:
        score_metrics = 5.0
    else:
        score_metrics = 2.0

    # 5. Formatting & Readability (max 15 pts)
    # 5a. Word count & length balance (5 pts)
    if 250 <= word_count <= 850:
        length_score = 5.0
    elif 150 <= word_count < 250 or 850 < word_count <= 1200:
        length_score = 3.0
    else:
        length_score = 1.0

    # 5b. Bullet point structure (5 pts)
    bullet_count = clean_text.count("•") + clean_text.count("- ") + clean_text.count("* ")
    if bullet_count >= 6:
        bullet_score = 5.0
    elif bullet_count >= 2:
        bullet_score = 3.0
    else:
        # Check if line breaks indicate bullet lines
        lines = [line.strip() for line in clean_text.splitlines() if line.strip()]
        bullet_score = 4.0 if len(lines) >= 15 else 1.5

    # 5c. Contact information completeness (5 pts)
    contact_score = 0.0
    if EMAIL_PATTERN.search(clean_text):
        contact_score += 2.5
    if PHONE_PATTERN.search(clean_text):
        contact_score += 1.5
    if re.search(r"\b(github\.com|linkedin\.com)\b", text_lower):
        contact_score += 1.0

    score_formatting = round(min(15.0, length_score + bullet_score + contact_score), 1)

    # Overall Score (0.0 to 100.0)
    overall_score = round(min(100.0, score_keywords + score_sections + score_experience + score_metrics + score_formatting), 1)

    # Grade determination
    if overall_score >= 85:
        grade = "Strong ATS Compatibility"
    elif overall_score >= 70:
        grade = "Good Optimization"
    elif overall_score >= 50:
        grade = "Moderate Optimization"
    else:
        grade = "Needs Significant Optimization"

    # Strengths & Weaknesses compilation
    strengths: List[str] = []
    weaknesses: List[str] = []

    if score_keywords >= 22:
        strengths.append(f"Strong alignment with {target_role} technical keywords ({len(matched_skills_all)} core skills matched).")
    else:
        weaknesses.append(f"Missing {len(missing_skills_all)} expected skills for {target_role}.")

    if len(detected_sections) >= 4:
        strengths.append(f"Well-structured resume with {len(detected_sections)} essential standard ATS sections.")
    if missing_sections:
        weaknesses.append(f"Missing critical standard sections: {', '.join(missing_sections)}.")

    if quant_count >= 3:
        strengths.append(f"Includes {quant_count} quantifiable metrics demonstrating measurable engineering/business impact.")
    else:
        weaknesses.append("Very few quantifiable achievements or measurable impact metrics found in descriptions.")

    if len(found_verbs) >= 5:
        strengths.append(f"Effective use of active verbs ({len(found_verbs)} distinct action verbs detected).")
    else:
        weaknesses.append("Passive wording or repetitive task descriptions without strong active leadership verbs.")

    if 250 <= word_count <= 850:
        strengths.append(f"Ideal document length ({word_count} words), fitting an entry-level technical one-page standard.")
    elif word_count < 200:
        weaknesses.append(f"Resume text is short ({word_count} words); expand on project details and technical responsibilities.")
    elif word_count > 900:
        weaknesses.append(f"Resume exceeds recommended length for fresh graduates ({word_count} words); condense to 1–2 pages.")

    # Tailored, actionable improvement recommendations with before/after examples
    recommendations: List[Dict[str, Any]] = []

    # Recommendation 1: Missing keywords
    if missing_core:
        missing_preview = ", ".join(missing_core[:3])
        recommendations.append({
            "category": "Keyword & Skill Matching",
            "issue": f"Missing core technical skills expected for {target_role}: {missing_preview}.",
            "importance": "Applicant Tracking Systems scan for exact keyword matches. Omitting core role competencies lowers automated search visibility.",
            "suggestion": f"If you have academic, project, or coursework familiarity with {missing_preview}, explicitly list them in your technical skills and project bullets.",
            "example_before": "Built data scripts and database queries.",
            "example_after": f"Wrote optimized {missing_core[0]} scripts and queries to clean, transform, and analyze datasets for class capstone projects.",
        })

    # Recommendation 2: Quantifiable metrics
    if quant_count < 3:
        recommendations.append({
            "category": "Quantifiable Achievements",
            "issue": "Bullet points describe duties rather than measurable results.",
            "importance": "Hiring managers evaluate technical candidates by the scale, speed, or accuracy impact of their work. Numbers provide instant credibility.",
            "suggestion": "Adopt the XYZ impact framework: 'Accomplished [X], as measured by [Y], by doing [Z]'. Incorporate percentages, row counts, user numbers, or latency reductions.",
            "example_before": "Worked on backend API and improved server performance.",
            "example_after": "Refactored backend REST API endpoints using FastAPI and async SQL queries, reducing P95 latency by 35% across 5,000+ daily requests.",
        })

    # Recommendation 3: Missing sections
    if missing_sections:
        for sec in missing_sections[:2]:
            recommendations.append({
                "category": "Resume Section Completeness",
                "issue": f"Missing standard resume section: '{sec}'.",
                "importance": f"Automated ATS parsers rely on recognized headings to classify information into recruiter profiles. Omitting '{sec}' may cause parser rejection.",
                "suggestion": f"Add a clean, bold heading '{sec}' and place relevant qualifications directly underneath.",
                "example_before": f"(No {sec} heading detected)",
                "example_after": f"Add a clear '{sec}' section with structured, concise bullet points.",
            })

    # Recommendation 4: Action verbs
    if len(found_verbs) < 5:
        recommendations.append({
            "category": "Action Verbs & Impact",
            "issue": "Bullet points rely on passive phrases like 'Responsible for' or 'Helped with'.",
            "importance": "Active verbs convey ownership, autonomy, and proactive problem solving.",
            "suggestion": "Start every bullet point with a powerful past-tense action verb (e.g., 'Architected', 'Engineered', 'Optimized', 'Automated').",
            "example_before": "Responsible for managing machine learning models.",
            "example_after": "Engineered Scikit-learn Random Forest regression pipelines, achieving 91.6% cross-validated accuracy on benchmark data.",
        })

    # Recommendation 5: Formatting & Structure
    if bullet_score < 4.0:
        recommendations.append({
            "category": "Formatting & Readability",
            "issue": "Dense paragraphs or inconsistent bullet formatting detected.",
            "importance": "Recruiters spend an average of 6 to 8 seconds on initial resume review. Dense blocks of text are difficult to skim.",
            "suggestion": "Break paragraphs into 2 to 4 concise bullet points per project/experience, keeping each bullet under 2 lines.",
            "example_before": "I developed a data analysis project where I used Python and SQL to extract data and then I made charts in Power BI to present to my college class.",
            "example_after": "• Extracted and cleaned 50,000+ transaction records using SQL queries.\n• Built interactive Power BI dashboards visualizing monthly revenue trends for department presentation.",
        })

    # Role comparisons across all supported benchmarks
    role_comparisons: List[Dict[str, Any]] = []
    for other_role, other_bm in ROLE_BENCHMARKS.items():
        other_core = [s["name"] for s in other_bm.get("core_skills", [])]
        other_matched = [s for s in other_core if s.lower() in found_skill_names or re.search(r"\b" + re.escape(s.lower()) + r"\b", text_lower)]
        other_missing = [s for s in other_core if s not in other_matched]
        other_kw_score = round((len(other_matched) / max(1, len(other_core))) * 30.0, 1)

        # Baseline comparative score
        base_other_score = round(min(100.0, other_kw_score + score_sections + (score_experience * 0.8) + score_metrics + score_formatting), 1)

        role_comparisons.append({
            "role_name": other_role,
            "overall_score": base_other_score if other_role != target_role else overall_score,
            "keyword_score": other_kw_score,
            "matched_skills_count": len(other_matched),
            "missing_skills_count": len(other_missing),
        })

    return {
        "filename": filename,
        "target_role": target_role,
        "overall_score": overall_score,
        "grade": grade,
        "category_scores": {
            "keyword_matching": score_keywords,
            "section_completeness": score_sections,
            "experience_relevance": score_experience,
            "quantifiable_achievements": score_metrics,
            "formatting_readability": score_formatting,
        },
        "matched_skills": matched_skills_all,
        "missing_skills": missing_skills_all,
        "detected_sections": detected_sections,
        "missing_sections": missing_sections,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
        "role_comparisons": role_comparisons,
        "word_count": word_count,
        "quantifiable_metrics_count": quant_count,
    }

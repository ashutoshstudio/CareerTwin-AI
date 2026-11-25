import logging
import re
import time
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
import httpx
from fastapi import HTTPException
from app.core.config import settings
from app.services.skill_gap_service import ROLE_BENCHMARKS

logger = logging.getLogger(__name__)

# In-memory cache: (username_lower, target_role) -> (timestamp, analysis_dict)
_CACHE_TTL_SECONDS = 900  # 15 minutes
_ANALYSIS_CACHE: Dict[Tuple[str, str], Tuple[float, Dict[str, Any]]] = {}

# Canonical skill aliases for repository technology detection
TECH_TAXONOMY: Dict[str, Dict[str, Any]] = {
    # Languages
    "python": {"canonical": "Python", "category": "Languages"},
    "javascript": {"canonical": "JavaScript", "category": "Languages"},
    "typescript": {"canonical": "TypeScript", "category": "Languages"},
    "html": {"canonical": "HTML", "category": "Languages"},
    "css": {"canonical": "CSS", "category": "Languages"},
    "sql": {"canonical": "SQL", "category": "Languages"},
    "java": {"canonical": "Java", "category": "Languages"},
    "c++": {"canonical": "C++", "category": "Languages"},
    "cpp": {"canonical": "C++", "category": "Languages"},
    "c#": {"canonical": "C#", "category": "Languages"},
    "csharp": {"canonical": "C#", "category": "Languages"},
    "go": {"canonical": "Go", "category": "Languages"},
    "golang": {"canonical": "Go", "category": "Languages"},
    "rust": {"canonical": "Rust", "category": "Languages"},
    "r": {"canonical": "R", "category": "Languages"},
    "php": {"canonical": "PHP", "category": "Languages"},
    "shell": {"canonical": "Shell", "category": "Languages"},
    "bash": {"canonical": "Bash", "category": "Languages"},

    # Frameworks & Libraries
    "react": {"canonical": "React", "category": "Frameworks & Libraries"},
    "reactjs": {"canonical": "React", "category": "Frameworks & Libraries"},
    "nextjs": {"canonical": "Next.js", "category": "Frameworks & Libraries"},
    "next": {"canonical": "Next.js", "category": "Frameworks & Libraries"},
    "vue": {"canonical": "Vue", "category": "Frameworks & Libraries"},
    "vuejs": {"canonical": "Vue", "category": "Frameworks & Libraries"},
    "angular": {"canonical": "Angular", "category": "Frameworks & Libraries"},
    "nodejs": {"canonical": "Node.js", "category": "Frameworks & Libraries"},
    "node": {"canonical": "Node.js", "category": "Frameworks & Libraries"},
    "express": {"canonical": "Express", "category": "Frameworks & Libraries"},
    "fastapi": {"canonical": "FastAPI", "category": "Frameworks & Libraries"},
    "django": {"canonical": "Django", "category": "Frameworks & Libraries"},
    "flask": {"canonical": "Flask", "category": "Frameworks & Libraries"},
    "spring": {"canonical": "Spring", "category": "Frameworks & Libraries"},
    "springboot": {"canonical": "Spring Boot", "category": "Frameworks & Libraries"},
    "tailwind": {"canonical": "Tailwind", "category": "Frameworks & Libraries"},
    "tailwindcss": {"canonical": "Tailwind", "category": "Frameworks & Libraries"},
    "bootstrap": {"canonical": "Bootstrap", "category": "Frameworks & Libraries"},
    "pandas": {"canonical": "Pandas", "category": "Frameworks & Libraries"},
    "numpy": {"canonical": "NumPy", "category": "Frameworks & Libraries"},
    "scipy": {"canonical": "SciPy", "category": "Frameworks & Libraries"},
    "scikit-learn": {"canonical": "Scikit-learn", "category": "Frameworks & Libraries"},
    "sklearn": {"canonical": "Scikit-learn", "category": "Frameworks & Libraries"},
    "tensorflow": {"canonical": "TensorFlow", "category": "Frameworks & Libraries"},
    "pytorch": {"canonical": "PyTorch", "category": "Frameworks & Libraries"},
    "torch": {"canonical": "PyTorch", "category": "Frameworks & Libraries"},
    "keras": {"canonical": "Keras", "category": "Frameworks & Libraries"},
    "matplotlib": {"canonical": "Matplotlib", "category": "Frameworks & Libraries"},
    "seaborn": {"canonical": "Seaborn", "category": "Frameworks & Libraries"},

    # Databases & Storage
    "postgresql": {"canonical": "PostgreSQL", "category": "Databases & Storage"},
    "postgres": {"canonical": "PostgreSQL", "category": "Databases & Storage"},
    "mysql": {"canonical": "MySQL", "category": "Databases & Storage"},
    "sqlite": {"canonical": "SQLite", "category": "Databases & Storage"},
    "mongodb": {"canonical": "MongoDB", "category": "Databases & Storage"},
    "redis": {"canonical": "Redis", "category": "Databases & Storage"},
    "firebase": {"canonical": "Firebase", "category": "Databases & Storage"},

    # Tools, Cloud & DevOps
    "docker": {"canonical": "Docker", "category": "Tools, Cloud & DevOps"},
    "kubernetes": {"canonical": "Kubernetes", "category": "Tools, Cloud & DevOps"},
    "k8s": {"canonical": "Kubernetes", "category": "Tools, Cloud & DevOps"},
    "git": {"canonical": "Git", "category": "Tools, Cloud & DevOps"},
    "github-actions": {"canonical": "GitHub Actions", "category": "Tools, Cloud & DevOps"},
    "aws": {"canonical": "AWS", "category": "Tools, Cloud & DevOps"},
    "azure": {"canonical": "Azure", "category": "Tools, Cloud & DevOps"},
    "gcp": {"canonical": "GCP", "category": "Tools, Cloud & DevOps"},
    "linux": {"canonical": "Linux", "category": "Tools, Cloud & DevOps"},
    "power bi": {"canonical": "Power BI", "category": "Tools, Cloud & DevOps"},
    "powerbi": {"canonical": "Power BI", "category": "Tools, Cloud & DevOps"},
    "tableau": {"canonical": "Tableau", "category": "Tools, Cloud & DevOps"},
}

ROLE_PROJECT_IDEAS: Dict[str, List[Dict[str, Any]]] = {
    "Data Analyst": [
        {
            "title": "Interactive Executive Sales Dashboard",
            "description": "Design an automated analytics pipeline transforming raw transaction logs into visual executive KPI reports.",
            "suggested_tech": ["Python", "SQL", "Power BI", "Pandas"],
            "relevance_to_role": "Demonstrates data modeling, business metric extraction, and interactive visual reporting for stakeholders.",
        },
        {
            "title": "Customer Churn Exploratory Analysis",
            "description": "Analyze customer retention trends using statistical tests, hypothesis validation, and cohort breakdown.",
            "suggested_tech": ["Python", "Pandas", "Matplotlib", "Seaborn"],
            "relevance_to_role": "Exhibits statistical reasoning, cohort segmentation, and data storytelling.",
        },
        {
            "title": "Automated ETL Pipeline with SQL & GitHub Actions",
            "description": "Build an automated recurring data pipeline extracting public API data, cleaning it, and loading into a relational store.",
            "suggested_tech": ["Python", "SQL", "PostgreSQL", "GitHub Actions"],
            "relevance_to_role": "Highlights database normalization, query optimization, and automated workflow hygiene.",
        },
    ],
    "Python Developer": [
        {
            "title": "Production REST API with FastAPI & PostgreSQL",
            "description": "Architect a modular REST API featuring JWT authentication, Pydantic validation, Alembic migrations, and full Pytest coverage.",
            "suggested_tech": ["Python", "FastAPI", "PostgreSQL", "Docker", "Git"],
            "relevance_to_role": "Proves mastery of modern Python backend architecture, dependency injection, and clean database transactions.",
        },
        {
            "title": "Containerized Microservices Task Queue",
            "description": "Develop an asynchronous background worker system for processing heavy tasks with Redis and Docker Compose.",
            "suggested_tech": ["Python", "Docker", "Redis", "Linux", "Git"],
            "relevance_to_role": "Demonstrates concurrency, distributed task queuing, and containerization hygiene.",
        },
        {
            "title": "Full-Stack Web Application with Modern UI",
            "description": "Build an interactive full-stack application connecting a FastAPI backend to a responsive React client.",
            "suggested_tech": ["Python", "FastAPI", "React", "JavaScript", "SQL"],
            "relevance_to_role": "Shows end-to-end full-stack capabilities, API contract design, and state management.",
        },
    ],
    "Machine Learning Engineer": [
        {
            "title": "End-to-End Scikit-Learn Model API Service",
            "description": "Train, evaluate, and package an ensemble classification model with FastAPI endpoint serving and Docker deployment.",
            "suggested_tech": ["Python", "Scikit-learn", "Pandas", "FastAPI", "Docker"],
            "relevance_to_role": "Demonstrates complete ML lifecycle: preprocessing, cross-validation, serialization, and production inference.",
        },
        {
            "title": "Model Explainability & Feature Attribution Dashboard",
            "description": "Integrate SHAP and LIME explanations into a model inference pipeline to provide real-time feature attributions.",
            "suggested_tech": ["Python", "Scikit-learn", "NumPy", "Pandas"],
            "relevance_to_role": "Demonstrates advanced XAI competence and model interpretability in regulated domains.",
        },
        {
            "title": "Deep Learning Computer Vision or NLP Classifier",
            "description": "Fine-tune a neural network with PyTorch or TensorFlow, tracking experiments and evaluating validation loss.",
            "suggested_tech": ["Python", "PyTorch", "TensorFlow", "NumPy", "Git"],
            "relevance_to_role": "Proves deep learning capability, tensor operations, and transfer learning understanding.",
        },
    ],
}


def _get_github_headers() -> Dict[str, str]:
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "CareerTwin-AI-Portfolio-Analyzer/1.0",
    }
    token = getattr(settings, "GITHUB_TOKEN", None)
    if token:
        headers["Authorization"] = f"Bearer {token}"
    return headers


async def fetch_github_user_data(username: str) -> Tuple[Dict[str, Any], List[Dict[str, Any]]]:
    """
    Fetches public profile and repositories from official GitHub REST API.
    Raises HTTPException for 404 (user not found), 429 (rate limit exceeded), or connectivity errors.
    """
    clean_username = username.strip().replace("@", "")
    if not clean_username:
        raise HTTPException(status_code=400, detail="GitHub username must not be empty.")

    headers = _get_github_headers()

    async with httpx.AsyncClient(timeout=15.0) as client:
        # 1. Fetch User Profile
        user_url = f"https://api.github.com/users/{clean_username}"
        try:
            user_res = await client.get(user_url, headers=headers)
        except httpx.RequestError as exc:
            logger.error("GitHub connection error: %s", exc)
            raise HTTPException(
                status_code=503,
                detail=f"Unable to reach the GitHub REST API: {str(exc)}",
            )

        if user_res.status_code == 404:
            raise HTTPException(
                status_code=404,
                detail=f"GitHub user '{clean_username}' was not found. Please verify the username.",
            )
        elif user_res.status_code == 403:
            remaining = user_res.headers.get("x-ratelimit-remaining", "")
            if remaining == "0" or "rate limit" in user_res.text.lower():
                raise HTTPException(
                    status_code=429,
                    detail="GitHub API rate limit exceeded. Please wait a few minutes or configure a GitHub Personal Access Token in settings.",
                )
            raise HTTPException(status_code=403, detail="GitHub API access forbidden.")
        elif user_res.status_code != 200:
            raise HTTPException(
                status_code=user_res.status_code,
                detail=f"GitHub API returned error ({user_res.status_code}): {user_res.text[:200]}",
            )

        profile_data = user_res.json()

        # 2. Fetch Public Repositories (up to 100 most recently updated)
        repos_url = f"https://api.github.com/users/{clean_username}/repos?per_page=100&sort=updated"
        try:
            repos_res = await client.get(repos_url, headers=headers)
        except httpx.RequestError as exc:
            logger.error("GitHub repos connection error: %s", exc)
            raise HTTPException(
                status_code=503,
                detail=f"Unable to retrieve repositories from GitHub API: {str(exc)}",
            )

        if repos_res.status_code != 200:
            logger.warning("Failed to fetch repos for %s: status %d", clean_username, repos_res.status_code)
            repos_data = []
        else:
            repos_data = repos_res.json()

    return profile_data, repos_data


def analyze_github_portfolio(
    profile_data: Dict[str, Any],
    repos_data: List[Dict[str, Any]],
    target_role: str = "Data Analyst",
) -> Dict[str, Any]:
    """
    Evaluates a candidate's GitHub portfolio against a target role using transparent heuristic criteria.
    Returns structured analysis dictionary with scores, language stats, detected technologies, recommendations, and project ideas.
    """
    username = profile_data.get("login", "")
    public_repos_count = profile_data.get("public_repos", len(repos_data))
    followers = profile_data.get("followers", 0)
    following = profile_data.get("following", 0)
    account_created_at = profile_data.get("created_at", "")

    # Profile summary object
    profile_info = {
        "username": username,
        "name": profile_data.get("name") or username,
        "avatar_url": profile_data.get("avatar_url", ""),
        "bio": profile_data.get("bio") or "",
        "company": profile_data.get("company") or "",
        "location": profile_data.get("location") or "",
        "blog": profile_data.get("blog") or "",
        "public_repos_count": public_repos_count,
        "followers": followers,
        "following": following,
        "created_at": account_created_at,
        "html_url": profile_data.get("html_url", f"https://github.com/{username}"),
    }

    # 1. Process Repositories
    processed_repos: List[Dict[str, Any]] = []
    original_repos: List[Dict[str, Any]] = []
    forked_repos: List[Dict[str, Any]] = []
    languages_counter: Dict[str, int] = {}
    total_stars = 0
    total_forks = 0
    detected_tech_set: set[str] = set()

    now = datetime.now(timezone.utc)
    most_recent_update_days = 9999

    for r in repos_data:
        is_fork = bool(r.get("fork", False))
        name = r.get("name", "")
        description = r.get("description") or ""
        lang = r.get("language") or ""
        stars = int(r.get("stargazers_count", 0))
        forks = int(r.get("forks_count", 0))
        updated_at_str = r.get("updated_at") or r.get("pushed_at") or ""
        topics = r.get("topics") or []
        html_url = r.get("html_url", f"https://github.com/{username}/{name}")

        total_stars += stars
        total_forks += forks

        if lang:
            languages_counter[lang] = languages_counter.get(lang, 0) + 1
            # Check taxonomy
            lang_key = lang.lower()
            if lang_key in TECH_TAXONOMY:
                detected_tech_set.add(TECH_TAXONOMY[lang_key]["canonical"])
            else:
                detected_tech_set.add(lang)

        # Extract tech from topics, description, and name
        text_to_scan = f"{name} {description} {' '.join(topics)}".lower()
        for alias, item in TECH_TAXONOMY.items():
            pattern = r"\b" + re.escape(alias) + r"\b"
            if re.search(pattern, text_to_scan):
                detected_tech_set.add(item["canonical"])

        # Calculate recency
        if updated_at_str:
            try:
                # Handle ISO timestamps like '2024-03-12T15:00:00Z'
                clean_ts = updated_at_str.replace("Z", "+00:00")
                repo_dt = datetime.fromisoformat(clean_ts)
                diff_days = (now - repo_dt).days
                if diff_days < most_recent_update_days:
                    most_recent_update_days = diff_days
            except Exception:
                pass

        # Individual repo quality score (0.0 - 10.0)
        repo_quality = 0.0
        if len(description) >= 15:
            repo_quality += 3.0
        elif len(description) > 0:
            repo_quality += 1.5
        if lang:
            repo_quality += 2.0
        if topics:
            repo_quality += 2.0
        if stars > 0:
            repo_quality += min(1.5, stars * 0.5)
        if forks > 0:
            repo_quality += 0.5
        if r.get("homepage"):
            repo_quality += 1.0

        repo_item = {
            "name": name,
            "description": description,
            "html_url": html_url,
            "language": lang if lang else None,
            "stars": stars,
            "forks": forks,
            "updated_at": updated_at_str,
            "topics": topics,
            "is_fork": is_fork,
            "quality_score": round(min(10.0, repo_quality), 1),
        }
        processed_repos.append(repo_item)

        if is_fork:
            forked_repos.append(repo_item)
        else:
            original_repos.append(repo_item)

    # Sort processed repos by stars descending, then quality score
    processed_repos.sort(key=lambda x: (x["stars"], x["quality_score"]), reverse=True)

    # Language breakdown statistics
    total_lang_repos = sum(languages_counter.values())
    languages_breakdown: Dict[str, Any] = {}
    for l_name, l_count in sorted(languages_counter.items(), key=lambda x: x[1], reverse=True):
        pct = round((l_count / max(1, total_lang_repos)) * 100.0, 1)
        languages_breakdown[l_name] = {
            "count": l_count,
            "percentage": pct,
        }

    # Group detected technologies into categories
    categorized_tech: List[Dict[str, str]] = []
    for tech_name in sorted(detected_tech_set):
        cat = "Tools, Cloud & DevOps"
        tech_lower = tech_name.lower()
        if tech_lower in TECH_TAXONOMY:
            cat = TECH_TAXONOMY[tech_lower]["category"]
        categorized_tech.append({"name": tech_name, "category": cat})

    # Benchmark comparison against target role
    role_bench = ROLE_BENCHMARKS.get(target_role, ROLE_BENCHMARKS["Data Analyst"])
    role_core = [s["name"] for s in role_bench.get("core_skills", [])]
    role_sec = [s["name"] for s in role_bench.get("secondary_skills", [])]
    all_role_skills = role_core + role_sec

    matched_skills = []
    missing_skills = []
    detected_tech_lower = {t.lower() for t in detected_tech_set}

    for skill in all_role_skills:
        if skill.lower() in detected_tech_lower:
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)

    # 2. Calculate 100-Point Transparent Score
    # Category 1: Project Quality & Diversity (max 25 pts)
    # Original (non-fork) repos are valued much higher than empty forks
    num_orig = len(original_repos)
    if num_orig == 0:
        score_quality = 0.0
    elif num_orig == 1:
        score_quality = 8.0
    elif num_orig == 2:
        score_quality = 14.0
    elif num_orig <= 4:
        score_quality = 18.0
    elif num_orig <= 7:
        score_quality = 21.0
    else:
        score_quality = 23.0

    # Quality bonus for well-curated repos
    if num_orig > 0:
        avg_q = sum(r["quality_score"] for r in original_repos) / num_orig
        quality_bonus = min(2.0, avg_q * 0.25)
        score_quality = min(25.0, score_quality + quality_bonus)
    score_quality = round(score_quality, 1)

    # Category 2: Technical Skill Diversity (max 20 pts)
    num_langs = len(languages_counter)
    if num_langs == 0:
        score_skill_div = 0.0
    elif num_langs == 1:
        score_skill_div = 7.0
    elif num_langs == 2:
        score_skill_div = 12.0
    elif num_langs == 3:
        score_skill_div = 16.0
    else:
        score_skill_div = 18.0

    # Breadth bonus: using tools/frameworks alongside languages
    categories_present = {item["category"] for item in categorized_tech}
    if len(categories_present) >= 3:
        score_skill_div = min(20.0, score_skill_div + 2.0)
    elif len(categories_present) >= 2:
        score_skill_div = min(20.0, score_skill_div + 1.0)
    score_skill_div = round(score_skill_div, 1)

    # Category 3: Repository Documentation (max 15 pts)
    if num_orig == 0:
        score_doc = 0.0
    else:
        described_count = sum(1 for r in original_repos if len(r["description"]) >= 10)
        described_pct = described_count / num_orig
        topics_count = sum(1 for r in original_repos if len(r["topics"]) > 0)
        topics_pct = topics_count / num_orig

        score_doc = (described_pct * 10.0) + (topics_pct * 5.0)
        score_doc = round(min(15.0, score_doc), 1)

    # Category 4: Coding Activity & Consistency (max 20 pts)
    if most_recent_update_days <= 14:
        score_activity_recency = 12.0
    elif most_recent_update_days <= 30:
        score_activity_recency = 10.0
    elif most_recent_update_days <= 90:
        score_activity_recency = 8.0
    elif most_recent_update_days <= 180:
        score_activity_recency = 5.0
    elif most_recent_update_days <= 365:
        score_activity_recency = 3.0
    else:
        score_activity_recency = 1.0

    # Account consistency / longevity bonus
    longevity_pts = 4.0
    if account_created_at:
        try:
            created_dt = datetime.fromisoformat(account_created_at.replace("Z", "+00:00"))
            years_active = (now - created_dt).days / 365.25
            if years_active >= 2.0:
                longevity_pts = 8.0
            elif years_active >= 1.0:
                longevity_pts = 6.0
        except Exception:
            pass

    score_activity = round(min(20.0, score_activity_recency + longevity_pts), 1)

    # Category 5: Community Engagement (max 10 pts)
    if total_stars == 0:
        score_comm = 2.0  # Base point for public visibility
    elif total_stars <= 3:
        score_comm = 4.5
    elif total_stars <= 10:
        score_comm = 6.5
    elif total_stars <= 25:
        score_comm = 8.0
    else:
        score_comm = 9.0

    if total_forks > 0 or followers > 0:
        score_comm = min(10.0, score_comm + 1.0)
    score_comm = round(score_comm, 1)

    # Category 6: Career-Role Relevance (max 10 pts)
    if len(all_role_skills) > 0:
        relevance_ratio = len(matched_skills) / len(all_role_skills)
        score_role_rel = round(min(10.0, relevance_ratio * 10.0), 1)
    else:
        score_role_rel = 5.0

    overall_score = round(
        score_quality + score_skill_div + score_doc + score_activity + score_comm + score_role_rel,
        1,
    )
    overall_score = min(100.0, max(0.0, overall_score))

    # Grade derivation
    if overall_score >= 85.0:
        grade = "A (Outstanding Portfolio)"
    elif overall_score >= 70.0:
        grade = "B (Strong Portfolio)"
    elif overall_score >= 55.0:
        grade = "C (Moderate Portfolio)"
    elif overall_score >= 40.0:
        grade = "D (Developing Portfolio)"
    else:
        grade = "Needs Work"

    # 3. Strengths & Weaknesses
    strengths = []
    weaknesses = []

    if num_orig >= 4:
        strengths.append(f"Strong repository ownership with {num_orig} original non-fork projects.")
    elif num_orig == 0:
        weaknesses.append("Profile contains no original non-fork projects; recruiters prioritize candidate-created code.")

    if num_langs >= 3:
        strengths.append(f"Demonstrates versatility across multiple programming languages ({', '.join(list(languages_counter.keys())[:3])}).")
    elif num_langs == 1:
        weaknesses.append(f"Activity is concentrated in only one language ({list(languages_counter.keys())[0] if languages_counter else 'None'}).")

    if most_recent_update_days <= 30:
        strengths.append("High recent coding activity with repository updates pushed within the last 30 days.")
    elif most_recent_update_days > 180:
        weaknesses.append("Lack of recent repository activity; last update was over 6 months ago.")

    if total_stars >= 5:
        strengths.append(f"Demonstrated open-source impact with {total_stars} stars received across projects.")

    if score_doc < 8.0:
        weaknesses.append("Several repositories lack descriptive summaries or topic tags, harming discoverability.")

    if len(matched_skills) >= 3:
        strengths.append(f"Strong alignment with target role '{target_role}', matching verified skills: {', '.join(matched_skills[:4])}.")
    if len(missing_skills) >= 2:
        weaknesses.append(f"Key competencies for '{target_role}' are not demonstrated on GitHub: {', '.join(missing_skills[:3])}.")

    # 4. Actionable Recommendations
    recommendations = []
    if score_doc < 12.0:
        recommendations.append({
            "category": "Documentation",
            "issue": "Repositories lack concise summaries or topic tags.",
            "importance": "Recruiters and hiring managers spend an average of 30 seconds scanning GitHub before opening code files.",
            "suggestion": "Add 1-2 sentence descriptions to all public repositories explaining the project purpose, architecture, and live links.",
        })

    if len(missing_skills) > 0:
        missing_preview = ", ".join(missing_skills[:3])
        recommendations.append({
            "category": "Target Role Skills",
            "issue": f"Target role '{target_role}' requires competencies missing from your GitHub ({missing_preview}).",
            "importance": "Recruiters look for public code samples proving you have hands-on experience with core stack tools.",
            "suggestion": f"Build or contribute a repository that integrates {missing_preview} into a functional workflow.",
        })

    if most_recent_update_days > 60:
        recommendations.append({
            "category": "Commit Consistency",
            "issue": "Activity has slowed over the past two months.",
            "importance": "Regular commit history demonstrates disciplined software engineering habits and continuous learning.",
            "suggestion": "Push incremental commits or practice problems weekly to maintain an active contribution streak.",
        })

    if total_stars == 0:
        recommendations.append({
            "category": "Community Visibility",
            "issue": "Repositories have not received stars or external engagement.",
            "importance": "Social proof and clear READMEs help establish portfolio credibility for junior candidates.",
            "suggestion": "Include architectural diagrams, installation guides, and demo GIFs in your top project READMEs.",
        })

    # Recommended projects tailored to role
    role_ideas = ROLE_PROJECT_IDEAS.get(target_role, ROLE_PROJECT_IDEAS["Data Analyst"])

    return {
        "username": username,
        "target_role": target_role,
        "overall_score": overall_score,
        "grade": grade,
        "category_scores": {
            "project_quality": score_quality,
            "skill_diversity": score_skill_div,
            "documentation": score_doc,
            "coding_activity": score_activity,
            "community_engagement": score_comm,
            "role_relevance": score_role_rel,
        },
        "profile_info": profile_info,
        "languages": languages_breakdown,
        "detected_technologies": categorized_tech,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "repositories": processed_repos[:20],  # Top 20 repositories
        "strengths": strengths,
        "weaknesses": weaknesses,
        "recommendations": recommendations,
        "recommended_projects": role_ideas,
        "total_repos_analyzed": len(processed_repos),
        "total_stars": total_stars,
        "total_forks": total_forks,
    }


async def get_or_create_github_analysis(
    username: str,
    target_role: str = "Data Analyst",
    force_refresh: bool = False,
) -> Dict[str, Any]:
    """
    Retrieves portfolio analysis from memory cache if fresh, otherwise fetches live from GitHub.
    """
    clean_username = username.strip().replace("@", "").lower()
    cache_key = (clean_username, target_role)

    if not force_refresh and cache_key in _ANALYSIS_CACHE:
        cached_time, cached_data = _ANALYSIS_CACHE[cache_key]
        if time.time() - cached_time < _CACHE_TTL_SECONDS:
            logger.info("Serving GitHub portfolio analysis for '%s' from cache", clean_username)
            return cached_data

    # Fetch live from GitHub REST API
    profile_data, repos_data = await fetch_github_user_data(clean_username)
    analysis = analyze_github_portfolio(profile_data, repos_data, target_role)

    # Store in memory cache
    _ANALYSIS_CACHE[cache_key] = (time.time(), analysis)
    return analysis

from typing import Any, Dict, List, Optional
from app.services.skill_gap_service import ROLE_BENCHMARKS

# Documented catalog metadata for supported roles
ROLE_CATALOG: Dict[str, Dict[str, Any]] = {
    "Data Analyst": {
        "tagline": "Transform raw datasets into actionable executive insights and dashboards.",
        "demand_level": "High",
        "description": (
            "Data Analysts inspect, clean, transform, and model data to discover useful information, "
            "inform conclusions, and support organizational decision-making using SQL, BI tools, and Python."
        ),
        "suitable_backgrounds": ["BCA", "B.Tech CS / IT", "B.Sc Statistics / Mathematics", "B.Com Analytics"],
        "recommended_projects": [
            "End-to-end Sales Analytics Dashboard in Power BI with dynamic DAX metrics",
            "Customer Churn exploratory analysis in Python using Pandas, Seaborn, and SQL queries",
        ],
        "core_skills": ROLE_BENCHMARKS["Data Analyst"]["core_skills"],
        "secondary_skills": ROLE_BENCHMARKS["Data Analyst"]["secondary_skills"],
    },
    "Python Developer": {
        "tagline": "Build scalable backend APIs, web applications, and asynchronous microservices.",
        "demand_level": "Very High",
        "description": (
            "Python Developers architect and develop robust server-side logic, design relational databases, "
            "integrate third-party services, and build high-performance APIs using FastAPI, Django, and modern tooling."
        ),
        "suitable_backgrounds": ["BCA", "B.Tech CS / IT", "B.Sc Computer Science", "MCA"],
        "recommended_projects": [
            "Production-ready RESTful CRUD API with FastAPI, SQLAlchemy ORM, and JWT authentication",
            "Task queue worker service with Redis, Celery, and automated pytest coverage",
        ],
        "core_skills": ROLE_BENCHMARKS["Python Developer"]["core_skills"],
        "secondary_skills": ROLE_BENCHMARKS["Python Developer"]["secondary_skills"],
    },
    "Machine Learning Engineer": {
        "tagline": "Design predictive mathematical models and deploy production AI pipelines.",
        "demand_level": "Extremely High",
        "description": (
            "Machine Learning Engineers bridge data science and software engineering by researching, "
            "building, validating, and deploying machine learning models into low-latency production applications."
        ),
        "suitable_backgrounds": ["BCA / MCA with ML focus", "B.Tech CS / AI / Data Science", "B.Sc Data Science"],
        "recommended_projects": [
            "End-to-end Scikit-learn Pipeline with ColumnTransformer, cross-validation, and FastAPI inference endpoint",
            "Computer vision or NLP classification model deployed inside a containerized Docker service",
        ],
        "core_skills": ROLE_BENCHMARKS["Machine Learning Engineer"]["core_skills"],
        "secondary_skills": ROLE_BENCHMARKS["Machine Learning Engineer"]["secondary_skills"],
    },
    "Cloud Engineer": {
        "tagline": "Architect, provision, and maintain reliable cloud infrastructure and CI/CD pipelines.",
        "demand_level": "High",
        "description": (
            "Cloud Engineers manage cloud architecture, automated deployments, container orchestration, "
            "and infrastructure security across AWS, Azure, and modern Linux environments."
        ),
        "suitable_backgrounds": ["BCA", "B.Tech CS / IT", "B.Sc Computer Science", "MCA"],
        "recommended_projects": [
            "Automated CI/CD pipeline deploying a containerized application to AWS ECS / Kubernetes",
            "Terraform configuration provisioning a VPC, subnets, and auto-scaling group",
        ],
        "core_skills": [
            {"name": "Linux", "required_level": 4, "description": "Shell scripting, system administration, and network troubleshooting"},
            {"name": "Docker", "required_level": 4, "description": "Multi-stage container builds and container networking"},
            {"name": "CI/CD", "required_level": 3, "description": "GitHub Actions, automated test pipelines, and artifact deployment"},
            {"name": "Git", "required_level": 4, "description": "Version control workflows and GitOps practices"},
            {"name": "Python", "required_level": 3, "description": "Infrastructure automation scripting and cloud SDKs"},
        ],
        "secondary_skills": [
            {"name": "SQL", "required_level": 3, "description": "Database management and managed cloud RDS instances"},
            {"name": "Communication", "required_level": 3, "description": "Cross-functional infrastructure documentation"},
            {"name": "Problem Solving", "required_level": 3, "description": "Production incident analysis and root cause remediation"},
        ],
    },
    "Full Stack Developer": {
        "tagline": "Craft complete web experiences spanning interactive user interfaces and robust APIs.",
        "demand_level": "High",
        "description": (
            "Full Stack Developers build complete, responsive web applications from database schemas "
            "and backend services to interactive client-side browser interfaces."
        ),
        "suitable_backgrounds": ["BCA", "B.Tech CS / IT", "B.Sc Computer Science", "MCA"],
        "recommended_projects": [
            "Full-stack web application with React frontend, FastAPI backend, and PostgreSQL database",
            "Interactive dashboard with user authentication, state management, and real-time updates",
        ],
        "core_skills": [
            {"name": "JavaScript", "required_level": 4, "description": "ES6+ syntax, asynchronous programming, and DOM manipulation"},
            {"name": "HTML", "required_level": 4, "description": "Semantic markup, accessibility, and modern web structures"},
            {"name": "CSS", "required_level": 4, "description": "Responsive design, modern CSS grid/flexbox, and layout systems"},
            {"name": "Python", "required_level": 4, "description": "Backend API development, routing, and data modeling"},
            {"name": "SQL", "required_level": 3, "description": "Relational schema design and efficient querying"},
            {"name": "Git", "required_level": 4, "description": "Collaborative code version control"},
        ],
        "secondary_skills": [
            {"name": "FastAPI", "required_level": 3, "description": "RESTful backend services and request validation"},
            {"name": "Docker", "required_level": 3, "description": "Local development containers and environment reproducibility"},
            {"name": "Communication", "required_level": 3, "description": "Design system collaboration and technical documentation"},
            {"name": "Problem Solving", "required_level": 3, "description": "End-to-end debugging across client and server boundaries"},
        ],
    },
}


def get_role_catalog_list() -> List[Dict[str, Any]]:
    """Returns the full documented roles catalog."""
    catalog = []
    for role_name, data in ROLE_CATALOG.items():
        catalog.append({
            "role_name": role_name,
            "tagline": data["tagline"],
            "demand_level": data["demand_level"],
            "description": data["description"],
            "core_skills": data["core_skills"],
            "secondary_skills": data["secondary_skills"],
            "suitable_backgrounds": data["suitable_backgrounds"],
        })
    return catalog


def _generate_fit_reason(
    role_name: str,
    fit_score: float,
    core_alignment: float,
    matching_core_names: List[str],
    is_target_role: bool,
) -> str:
    """Generate a transparent, human-readable reason why this role was scored."""
    if fit_score >= 70.0:
        base = f"Strong candidate profile for {role_name}."
        if matching_core_names:
            skills_str = ", ".join(matching_core_names[:3])
            base += f" Demonstrated proficiency in key requirements ({skills_str})."
        if is_target_role:
            base += " Directly matches your expressed career objective."
        else:
            base += " High transferability of technical skills to this pathway."
        return base
    elif fit_score >= 45.0:
        base = f"Moderate foundation for {role_name}."
        if matching_core_names:
            skills_str = ", ".join(matching_core_names[:2])
            base += f" You have acquired foundational competency in {skills_str}."
        base += " Closing key skill gaps will substantially increase role readiness."
        return base
    else:
        return (
            f"Early developmental stage for {role_name}. Recommended as a future career milestone "
            "after establishing foundational core competencies."
        )


def _generate_next_steps(
    role_name: str,
    missing_core: List[Dict[str, Any]],
    weaker_core: List[Dict[str, Any]],
    recommended_projects: List[str],
) -> List[str]:
    """Generate specific, actionable next steps to qualify for the role."""
    steps: List[str] = []

    if missing_core:
        missing_names = [item["name"] for item in missing_core[:3]]
        steps.append(f"Prioritize acquiring fundamental competency in: {', '.join(missing_names)}.")

    if weaker_core:
        weaker_names = [f"{item['name']} (target level {item['required_level']}/5)" for item in weaker_core[:2]]
        steps.append(f"Deepen proficiency in: {', '.join(weaker_names)}.")

    if recommended_projects:
        steps.append(f"Build a portfolio project: '{recommended_projects[0]}'.")

    steps.append(f"Review benchmark entry-level syllabus topics for {role_name} and complete hands-on practice.")

    return steps


def evaluate_career_recommendations(
    candidate_skills: List[Dict[str, Any]],
    target_role: Optional[str] = None,
    experience_months: int = 0,
    education_level: Optional[str] = None,
    prior_readiness_map: Optional[Dict[str, float]] = None,
    prior_gap_map: Optional[Dict[str, float]] = None,
) -> List[Dict[str, Any]]:
    """
    Transparent, documented multi-factor recommendation engine.
    Computes fit score for each role in ROLE_CATALOG without inventing qualifications.
    """
    if prior_readiness_map is None:
        prior_readiness_map = {}
    if prior_gap_map is None:
        prior_gap_map = {}

    target_role_clean = (target_role or "").strip().lower()

    # Map candidate skills: lowercase -> level (1-5)
    skills_map: Dict[str, int] = {}
    for s in candidate_skills:
        name = (s.get("name") or "").strip().lower()
        if name:
            skills_map[name] = max(1, min(5, int(s.get("level", 3))))

    evaluated_roles: List[Dict[str, Any]] = []

    for role_name, data in ROLE_CATALOG.items():
        core_skills = data["core_skills"]
        secondary_skills = data["secondary_skills"]
        rec_projects = data.get("recommended_projects", [])

        # 1. Core skills alignment (0 to 50 points)
        core_fulfillment_sum = 0.0
        matching_skills: List[Dict[str, Any]] = []
        missing_or_weaker: List[Dict[str, Any]] = []
        matching_core_names: List[str] = []
        missing_core: List[Dict[str, Any]] = []
        weaker_core: List[Dict[str, Any]] = []

        for cs in core_skills:
            name = cs["name"]
            req_level = cs["required_level"]
            curr_level = skills_map.get(name.lower(), 0)

            if curr_level > 0:
                fulfillment = min(1.0, curr_level / float(req_level))
                core_fulfillment_sum += fulfillment
                matching_skills.append({
                    "name": name,
                    "current_level": curr_level,
                    "required_level": req_level,
                    "is_core": True,
                })
                matching_core_names.append(name)
                if curr_level < req_level:
                    gap_item = {
                        "name": name,
                        "current_level": curr_level,
                        "required_level": req_level,
                        "gap": req_level - curr_level,
                        "priority": "high",
                        "is_core": True,
                    }
                    missing_or_weaker.append(gap_item)
                    weaker_core.append(gap_item)
            else:
                gap_item = {
                    "name": name,
                    "current_level": 0,
                    "required_level": req_level,
                    "gap": req_level,
                    "priority": "high",
                    "is_core": True,
                }
                missing_or_weaker.append(gap_item)
                missing_core.append(gap_item)

        core_score = 50.0 * (core_fulfillment_sum / max(1, len(core_skills)))

        # 2. Secondary skills alignment (0 to 20 points)
        sec_fulfillment_sum = 0.0
        for ss in secondary_skills:
            name = ss["name"]
            req_level = ss["required_level"]
            curr_level = skills_map.get(name.lower(), 0)

            if curr_level > 0:
                fulfillment = min(1.0, curr_level / float(req_level))
                sec_fulfillment_sum += fulfillment
                matching_skills.append({
                    "name": name,
                    "current_level": curr_level,
                    "required_level": req_level,
                    "is_core": False,
                })
                if curr_level < req_level:
                    missing_or_weaker.append({
                        "name": name,
                        "current_level": curr_level,
                        "required_level": req_level,
                        "gap": req_level - curr_level,
                        "priority": "medium",
                        "is_core": False,
                    })
            else:
                missing_or_weaker.append({
                    "name": name,
                    "current_level": 0,
                    "required_level": req_level,
                    "gap": req_level,
                    "priority": "medium",
                    "is_core": False,
                })

        sec_score = 20.0 * (sec_fulfillment_sum / max(1, len(secondary_skills)))

        # 3. Role Affinity & Historical Assessments (0 to 15 points)
        affinity_score = 0.0
        is_target_role = (role_name.lower() == target_role_clean)
        if is_target_role:
            affinity_score += 8.0  # Intentional alignment bonus

        # Check empirical prior assessment
        prior_readiness = prior_readiness_map.get(role_name)
        prior_gap_cov = prior_gap_map.get(role_name)
        if prior_readiness is not None:
            affinity_score += 7.0 * (prior_readiness / 100.0)
        elif prior_gap_cov is not None:
            affinity_score += 7.0 * (prior_gap_cov / 100.0)
        else:
            # Baseline proportional affinity based on candidate skills possessed
            coverage_ratio = len(matching_skills) / max(1, len(core_skills) + len(secondary_skills))
            affinity_score += 5.0 * coverage_ratio

        affinity_score = min(15.0, affinity_score)

        # 4. Experience & Education Alignment (0 to 15 points)
        # Entry-level benchmark expects 0-24 months
        exp_score = min(8.0, 5.0 + min(3.0, (experience_months / 12.0) * 3.0))

        edu_clean = (education_level or "").lower()
        if any(term in edu_clean for term in ["bca", "b.tech", "mca", "b.sc", "b.e", "cs", "computer", "information"]):
            edu_score = 7.0
        elif edu_clean:
            edu_score = 5.0
        else:
            edu_score = 4.0

        exp_edu_score = exp_score + edu_score

        # Total Fit Score
        total_fit = round(min(100.0, core_score + sec_score + affinity_score + exp_edu_score), 1)

        # Match Tier
        if total_fit >= 70.0:
            match_tier = "Strong Match"
        elif total_fit >= 45.0:
            match_tier = "Moderate Match"
        else:
            match_tier = "Potential Match"

        # Explainability
        fit_reason = _generate_fit_reason(
            role_name=role_name,
            fit_score=total_fit,
            core_alignment=core_score,
            matching_core_names=matching_core_names,
            is_target_role=is_target_role,
        )

        next_steps = _generate_next_steps(
            role_name=role_name,
            missing_core=missing_core,
            weaker_core=weaker_core,
            recommended_projects=rec_projects,
        )

        evaluated_roles.append({
            "role_name": role_name,
            "fit_score": total_fit,
            "match_tier": match_tier,
            "demand_level": data["demand_level"],
            "core_alignment_score": round(core_score, 1),
            "secondary_alignment_score": round(sec_score, 1),
            "fit_reason": fit_reason,
            "matching_skills": matching_skills,
            "missing_or_weaker_skills": missing_or_weaker,
            "suggested_next_steps": next_steps,
        })

    # Sort descending by fit_score, then core_alignment_score
    evaluated_roles.sort(key=lambda r: (r["fit_score"], r["core_alignment_score"]), reverse=True)

    # Assign rank (1, 2, 3...)
    for idx, role in enumerate(evaluated_roles, start=1):
        role["rank"] = idx

    return evaluated_roles

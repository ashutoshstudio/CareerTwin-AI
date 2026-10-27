from typing import Any, Dict, List, Optional, Tuple

ROLE_BENCHMARKS: Dict[str, Dict[str, Any]] = {
    "Data Analyst": {
        "core_skills": [
            {"name": "SQL", "required_level": 4, "description": "Relational data querying, complex aggregations, joins, and CTEs"},
            {"name": "Python", "required_level": 4, "description": "Data wrangling, scripting, and pipeline automation"},
            {"name": "Excel", "required_level": 4, "description": "Advanced formulas, pivot tables, and spreadsheet data modeling"},
            {"name": "Power BI", "required_level": 3, "description": "Interactive reporting dashboards and DAX metrics"},
            {"name": "Tableau", "required_level": 3, "description": "Visual data storytelling and executive analytics dashboards"},
            {"name": "Statistics", "required_level": 3, "description": "Hypothesis testing, probability distributions, and descriptive analytics"},
        ],
        "secondary_skills": [
            {"name": "Pandas", "required_level": 3, "description": "DataFrame manipulations, cleaning, and ETL transformations"},
            {"name": "NumPy", "required_level": 3, "description": "Vectorized computations and numerical transformations"},
            {"name": "Communication", "required_level": 3, "description": "Stakeholder presentation and translating data findings into business insights"},
            {"name": "Problem Solving", "required_level": 3, "description": "Structured analytical problem decomposition"},
        ],
    },
    "Python Developer": {
        "core_skills": [
            {"name": "Python", "required_level": 4, "description": "Core language features, OOP, data structures, and asynchronous programming"},
            {"name": "SQL", "required_level": 3, "description": "Database design, queries, and ORM integration (SQLAlchemy/Django ORM)"},
            {"name": "Git", "required_level": 4, "description": "Branching workflows, pull requests, rebase, and version control hygiene"},
            {"name": "FastAPI", "required_level": 3, "description": "RESTful API development, Pydantic validation, and dependency injection"},
            {"name": "HTML", "required_level": 3, "description": "Semantic markup and web page structure"},
            {"name": "CSS", "required_level": 3, "description": "Responsive styling, modern CSS layouts, and UI frameworks"},
            {"name": "JavaScript", "required_level": 3, "description": "Frontend scripting and asynchronous DOM interaction"},
        ],
        "secondary_skills": [
            {"name": "Docker", "required_level": 3, "description": "Containerizing backend services and docker-compose configurations"},
            {"name": "Linux", "required_level": 3, "description": "Shell commands, file system navigation, and process management"},
            {"name": "CI/CD", "required_level": 3, "description": "Automated testing pipelines and continuous integration"},
            {"name": "Communication", "required_level": 3, "description": "Collaborative code reviews and technical documentation"},
            {"name": "Problem Solving", "required_level": 3, "description": "Algorithmic thinking and debugging systematic bugs"},
        ],
    },
    "Machine Learning Engineer": {
        "core_skills": [
            {"name": "Python", "required_level": 4, "description": "High-performance Python scripting and object-oriented ML pipelines"},
            {"name": "Machine Learning", "required_level": 4, "description": "Supervised/unsupervised algorithms, evaluation metrics, and bias-variance tradeoff"},
            {"name": "Scikit-learn", "required_level": 4, "description": "Model pipelines, feature preprocessors, and cross-validation grids"},
            {"name": "Pandas", "required_level": 4, "description": "Advanced data cleaning, feature engineering, and exploratory data analysis"},
            {"name": "NumPy", "required_level": 4, "description": "Matrix mathematics, tensor indexing, and linear algebra operations"},
            {"name": "SQL", "required_level": 3, "description": "Extracting large training datasets and aggregating feature stores"},
        ],
        "secondary_skills": [
            {"name": "Deep Learning", "required_level": 3, "description": "Neural network architectures, activations, and backpropagation"},
            {"name": "TensorFlow", "required_level": 3, "description": "Deep learning models, Keras API, and inference graphs"},
            {"name": "PyTorch", "required_level": 3, "description": "Dynamic computation graphs and deep neural network training"},
            {"name": "Docker", "required_level": 3, "description": "Packaging ML model services into deployable containers"},
            {"name": "FastAPI", "required_level": 3, "description": "Building low-latency inference REST APIs for ML model deployment"},
            {"name": "Git", "required_level": 3, "description": "Code and experiment version control"},
            {"name": "Statistics", "required_level": 3, "description": "Statistical modeling, confidence intervals, and significance testing"},
        ],
    },
}

SKILL_ACTION_GUIDANCE: Dict[str, str] = {
    "sql": "Master relational queries, subqueries, indexing, window functions, and schema normalization.",
    "python": "Deepen object-oriented programming, data structures, generators, and testing with pytest.",
    "excel": "Practice advanced functions (XLOOKUP, INDEX/MATCH), pivot tables, and conditional data modeling.",
    "power bi": "Build end-to-end interactive reporting dashboards, data models, and calculated DAX measures.",
    "tableau": "Create visual data stories with calculated fields, parameters, and interactive dashboard actions.",
    "statistics": "Review probability theory, hypothesis testing (t-test, chi-square), and regression diagnostics.",
    "pandas": "Practice multi-index operations, grouping aggregations, timeseries parsing, and vectorized transformations.",
    "numpy": "Work with multi-dimensional array operations, broadcasting, linear algebra, and mathematical masks.",
    "git": "Practice merge conflict resolution, feature-branch workflows, and pull request reviews.",
    "fastapi": "Build RESTful microservices with Pydantic validation, background tasks, and dependency injection.",
    "machine learning": "Train and compare classical models (linear, tree-based, ensemble) and master cross-validation.",
    "scikit-learn": "Construct end-to-end Pipeline objects combining ColumnTransformer and hyperparameter search.",
    "deep learning": "Build convolutional and sequential neural networks with loss tracking and regularization.",
    "docker": "Write multi-stage Dockerfiles and deploy multi-container systems using docker-compose.",
    "communication": "Practice translating technical analytics into clear executive summaries and stakeholder slides.",
    "problem solving": "Solve algorithmic problem sets on LeetCode/HackerRank focusing on efficiency and edge cases.",
}


def analyze_skill_gap(
    candidate_skills: List[Dict[str, Any]],
    target_role: str,
) -> Dict[str, Any]:
    """
    Compare candidate's verified skills and levels against benchmark requirements for target_role.
    Returns:
        Structured gap dictionary with comparisons, statistics, and prioritized recommendations.
    """
    benchmarks = ROLE_BENCHMARKS.get(target_role)
    if not benchmarks:
        target_role = "Data Analyst"
        benchmarks = ROLE_BENCHMARKS["Data Analyst"]

    # Normalize candidate skill map: lowercase name -> level (1-5)
    skills_map: Dict[str, int] = {}
    for item in candidate_skills:
        name = (item.get("name") or "").strip().lower()
        if name:
            skills_map[name] = max(1, min(5, int(item.get("level", 3))))

    comparisons: List[Dict[str, Any]] = []
    recommendations: List[Dict[str, Any]] = []

    total_required_points = 0
    acquired_points = 0
    possessed_count = 0
    met_count = 0
    improvement_count = 0
    missing_count = 0

    all_requirements: List[Tuple[str, str, int]] = []
    for s in benchmarks["core_skills"]:
        all_requirements.append((s["name"], "Core Requirement", s["required_level"]))
    for s in benchmarks["secondary_skills"]:
        all_requirements.append((s["name"], "Secondary Competency", s["required_level"]))

    for name, category, req_level in all_requirements:
        name_lower = name.lower()
        curr_level = skills_map.get(name_lower, 0)
        gap = max(0, req_level - curr_level)

        total_required_points += req_level
        acquired_points += min(curr_level, req_level)

        is_core = category == "Core Requirement"

        if curr_level >= req_level:
            status = "met"
            priority = "none"
            met_count += 1
            possessed_count += 1
        elif curr_level > 0:
            status = "needs_improvement"
            priority = "high" if (is_core and gap >= 2) else "medium"
            improvement_count += 1
            possessed_count += 1
        else:
            status = "missing"
            priority = "high" if is_core else "medium"
            missing_count += 1

        comparisons.append({
            "name": name,
            "category": category,
            "current_level": curr_level,
            "required_level": req_level,
            "gap": gap,
            "status": status,
            "priority": priority,
        })

        if status != "met":
            action_type = "acquire_missing" if status == "missing" else "improve_proficiency"
            default_tip = f"Focus on increasing your {name} proficiency to level {req_level} to meet entry-level benchmarks."
            specific_tip = SKILL_ACTION_GUIDANCE.get(name_lower, default_tip)

            if status == "missing":
                text = f"Acquire foundational knowledge in {name} (target: level {req_level}/5). {specific_tip}"
            else:
                text = f"Advance {name} proficiency from level {curr_level}/5 to {req_level}/5. {specific_tip}"

            recommendations.append({
                "skill_name": name,
                "priority": priority,
                "action_type": action_type,
                "current_level": curr_level,
                "target_level": req_level,
                "recommendation": text,
            })

    total_evaluated = len(all_requirements)
    coverage_pct = round(100.0 * possessed_count / max(1, total_evaluated), 1)
    alignment_pct = round(100.0 * acquired_points / max(1, total_required_points), 1)

    # Sort recommendations by priority (high -> medium -> low)
    priority_order = {"high": 0, "medium": 1, "low": 2, "none": 3}
    recommendations.sort(key=lambda x: (priority_order.get(x["priority"], 99), x["skill_name"]))

    return {
        "target_role": target_role,
        "skill_coverage_percentage": coverage_pct,
        "proficiency_alignment_percentage": alignment_pct,
        "met_count": met_count,
        "improvement_count": improvement_count,
        "missing_count": missing_count,
        "total_required": total_evaluated,
        "skills_comparison": comparisons,
        "recommendations": recommendations,
    }

from typing import Any, Dict, List, Optional

# Curated, documented dataset of entry-level technology vacancies for academic evaluation
CURATED_JOB_DATASET: List[Dict[str, Any]] = [
    {
        "id": "job-da-01",
        "title": "Junior Data Analyst",
        "company": "[Academic Sample] QuantInsights Analytics",
        "role_category": "Data Analyst",
        "experience_required": "0-1 years (Freshers & Recent Graduates eligible)",
        "location": "Bangalore, India (Hybrid)",
        "location_type": "Hybrid",
        "employment_type": "Full-time",
        "is_sample": True,
        "sample_notice": "Academic Demonstration Record — not an active commercial vacancy",
        "source_attribution": "Curated Academic Benchmark Dataset — CareerTwin AI Research v1.0",
        "application_url": "https://demo.careertwin.ai/apply/job-da-01",
        "description": (
            "Responsible for writing SQL queries to extract relational data, preparing exploratory "
            "spreadsheets in Excel, and developing interactive Power BI visual dashboards for business stakeholders."
        ),
        "required_skills": [
            {"name": "SQL", "min_level": 3, "description": "Relational data extraction and aggregation queries"},
            {"name": "Excel", "min_level": 3, "description": "Formulas, lookup functions, and pivot tables"},
            {"name": "Power BI", "min_level": 3, "description": "Interactive data visualization and DAX measures"},
        ],
        "preferred_skills": [
            {"name": "Python", "min_level": 3, "description": "Basic data wrangling and cleaning scripts"},
            {"name": "Tableau", "min_level": 2, "description": "Dashboard storytelling"},
            {"name": "Statistics", "min_level": 2, "description": "Descriptive statistics and trend analysis"},
        ],
    },
    {
        "id": "job-da-02",
        "title": "Graduate Business Intelligence Analyst",
        "company": "[Academic Sample] Apex Data Systems",
        "role_category": "Data Analyst",
        "experience_required": "0-2 years (Entry-Level)",
        "location": "Remote (India)",
        "location_type": "Remote",
        "employment_type": "Full-time",
        "is_sample": True,
        "sample_notice": "Academic Demonstration Record — not an active commercial vacancy",
        "source_attribution": "Curated Academic Benchmark Dataset — CareerTwin AI Research v1.0",
        "application_url": "https://demo.careertwin.ai/apply/job-da-02",
        "description": (
            "Collaborate with product and operations teams to automate weekly KPI reports, clean timeseries data, "
            "and create high-impact Tableau and SQL data models."
        ),
        "required_skills": [
            {"name": "SQL", "min_level": 4, "description": "Complex joins, CTEs, window functions, and indexing"},
            {"name": "Python", "min_level": 3, "description": "Pandas DataFrame operations and data cleaning"},
            {"name": "Tableau", "min_level": 3, "description": "Calculated fields, parameters, and interactive dashboards"},
        ],
        "preferred_skills": [
            {"name": "Excel", "min_level": 3, "description": "Advanced financial and operational modeling"},
            {"name": "Statistics", "min_level": 3, "description": "Hypothesis testing and metric diagnostics"},
            {"name": "Communication", "min_level": 3, "description": "Executive presentation of analytical findings"},
        ],
    },
    {
        "id": "job-py-01",
        "title": "Associate Python Backend Developer",
        "company": "[Academic Sample] DevCraft Microservices",
        "role_category": "Python Developer",
        "experience_required": "0-1 years (Entry-Level)",
        "location": "Pune, India (Hybrid)",
        "location_type": "Hybrid",
        "employment_type": "Full-time",
        "is_sample": True,
        "sample_notice": "Academic Demonstration Record — not an active commercial vacancy",
        "source_attribution": "Curated Academic Benchmark Dataset — CareerTwin AI Research v1.0",
        "application_url": "https://demo.careertwin.ai/apply/job-py-01",
        "description": (
            "Design and build RESTful backend microservices using FastAPI, maintain SQLAlchemy database ORM models, "
            "and participate in code reviews using Git branching workflows."
        ),
        "required_skills": [
            {"name": "Python", "min_level": 4, "description": "Object-oriented programming, data structures, and asynchronous code"},
            {"name": "FastAPI", "min_level": 3, "description": "Routing, Pydantic validation schemas, and dependency injection"},
            {"name": "SQL", "min_level": 3, "description": "Relational schema design and query optimization"},
            {"name": "Git", "min_level": 3, "description": "Version control branching, commits, and pull requests"},
        ],
        "preferred_skills": [
            {"name": "Docker", "min_level": 2, "description": "Containerizing backend services"},
            {"name": "Linux", "min_level": 2, "description": "Shell commands and server logs investigation"},
            {"name": "Problem Solving", "min_level": 3, "description": "Algorithmic thinking and unit testing"},
        ],
    },
    {
        "id": "job-py-02",
        "title": "Junior Python Web Engineer",
        "company": "[Academic Sample] PyScale Software Labs",
        "role_category": "Python Developer",
        "experience_required": "0-2 years (Freshers eligible)",
        "location": "Remote (India)",
        "location_type": "Remote",
        "employment_type": "Full-time",
        "is_sample": True,
        "sample_notice": "Academic Demonstration Record — not an active commercial vacancy",
        "source_attribution": "Curated Academic Benchmark Dataset — CareerTwin AI Research v1.0",
        "application_url": "https://demo.careertwin.ai/apply/job-py-02",
        "description": (
            "Develop server-side features, integrate frontend interfaces, write automated test cases with pytest, "
            "and contribute to clean modular web architecture."
        ),
        "required_skills": [
            {"name": "Python", "min_level": 4, "description": "Core Python proficiency, packaging, and clean code practices"},
            {"name": "Git", "min_level": 3, "description": "Collaborative version control and merge workflows"},
            {"name": "HTML", "min_level": 3, "description": "Web markup and UI template rendering"},
            {"name": "CSS", "min_level": 3, "description": "Styling and responsive web layouts"},
        ],
        "preferred_skills": [
            {"name": "JavaScript", "min_level": 3, "description": "Frontend asynchronous API interaction"},
            {"name": "FastAPI", "min_level": 3, "description": "REST API development"},
            {"name": "SQL", "min_level": 3, "description": "Relational queries and ORM handling"},
        ],
    },
    {
        "id": "job-ml-01",
        "title": "Entry-Level Machine Learning Engineer",
        "company": "[Academic Sample] Nexa AI Research Labs",
        "role_category": "Machine Learning Engineer",
        "experience_required": "0-1 years (Academic / Capstone projects recognized)",
        "location": "Hyderabad, India (Hybrid)",
        "location_type": "Hybrid",
        "employment_type": "Full-time",
        "is_sample": True,
        "sample_notice": "Academic Demonstration Record — not an active commercial vacancy",
        "source_attribution": "Curated Academic Benchmark Dataset — CareerTwin AI Research v1.0",
        "application_url": "https://demo.careertwin.ai/apply/job-ml-01",
        "description": (
            "Train, evaluate, and benchmark classical supervised learning models using Scikit-learn, "
            "perform exploratory feature engineering with Pandas, and deploy inference endpoints."
        ),
        "required_skills": [
            {"name": "Python", "min_level": 4, "description": "High performance Python scripting for data structures"},
            {"name": "Machine Learning", "min_level": 4, "description": "Algorithm selection, evaluation metrics, and cross validation"},
            {"name": "Scikit-learn", "min_level": 3, "description": "Pipelines, ColumnTransformers, and model tuning"},
            {"name": "Pandas", "min_level": 3, "description": "Feature cleaning, missing value imputation, and encoding"},
        ],
        "preferred_skills": [
            {"name": "NumPy", "min_level": 3, "description": "Array vectorization and mathematical operations"},
            {"name": "SQL", "min_level": 3, "description": "Extracting model training sets"},
            {"name": "FastAPI", "min_level": 2, "description": "Wrapping models in inference microservices"},
            {"name": "Docker", "min_level": 2, "description": "Containerizing ML inference services"},
        ],
    },
    {
        "id": "job-ml-02",
        "title": "Junior AI Pipeline & Model Engineer",
        "company": "[Academic Sample] Cortex Cognitive Solutions",
        "role_category": "Machine Learning Engineer",
        "experience_required": "0-2 years (Entry-Level)",
        "location": "Remote (India)",
        "location_type": "Remote",
        "employment_type": "Full-time",
        "is_sample": True,
        "sample_notice": "Academic Demonstration Record — not an active commercial vacancy",
        "source_attribution": "Curated Academic Benchmark Dataset — CareerTwin AI Research v1.0",
        "application_url": "https://demo.careertwin.ai/apply/job-ml-02",
        "description": (
            "Work with senior ML engineers to preprocess large training sets, track experiment validation metrics, "
            "and assist in packaging model weights into production microservices."
        ),
        "required_skills": [
            {"name": "Python", "min_level": 4, "description": "Modular code organization and matrix operations"},
            {"name": "Machine Learning", "min_level": 3, "description": "Supervised/unsupervised algorithms and metric analysis"},
            {"name": "Pandas", "min_level": 4, "description": "Data wrangling, feature engineering, and aggregations"},
            {"name": "NumPy", "min_level": 4, "description": "Numerical transformations and linear algebra operations"},
        ],
        "preferred_skills": [
            {"name": "Deep Learning", "min_level": 2, "description": "Neural network architectures and activations"},
            {"name": "PyTorch", "min_level": 2, "description": "Tensor graphs and loss optimization"},
            {"name": "Git", "min_level": 3, "description": "Version controlling code and experiment pipelines"},
        ],
    },
    {
        "id": "job-fs-01",
        "title": "Junior Full Stack Web Developer",
        "company": "[Academic Sample] StackForge Digital",
        "role_category": "Full Stack Developer",
        "experience_required": "0-2 years (Freshers eligible)",
        "location": "Delhi NCR, India (Hybrid)",
        "location_type": "Hybrid",
        "employment_type": "Full-time",
        "is_sample": True,
        "sample_notice": "Academic Demonstration Record — not an active commercial vacancy",
        "source_attribution": "Curated Academic Benchmark Dataset — CareerTwin AI Research v1.0",
        "application_url": "https://demo.careertwin.ai/apply/job-fs-01",
        "description": (
            "Build responsive client-side web interfaces in modern JavaScript/HTML/CSS and integrate "
            "backend endpoints built with Python and relational SQL databases."
        ),
        "required_skills": [
            {"name": "JavaScript", "min_level": 3, "description": "ES6+ syntax, asynchronous fetch, and DOM operations"},
            {"name": "HTML", "min_level": 3, "description": "Semantic markup and accessibility"},
            {"name": "CSS", "min_level": 3, "description": "Responsive styling and layout systems"},
            {"name": "Python", "min_level": 3, "description": "Backend API development and controllers"},
        ],
        "preferred_skills": [
            {"name": "SQL", "min_level": 3, "description": "Database schema queries"},
            {"name": "FastAPI", "min_level": 2, "description": "REST service validation"},
            {"name": "Git", "min_level": 3, "description": "Collaborative version control"},
        ],
    },
    {
        "id": "job-cloud-01",
        "title": "Graduate Cloud Infrastructure Trainee",
        "company": "[Academic Sample] CloudSphere Systems",
        "role_category": "Cloud Engineer",
        "experience_required": "0-1 years (Entry-Level)",
        "location": "Chennai, India (On-site)",
        "location_type": "On-site",
        "employment_type": "Full-time",
        "is_sample": True,
        "sample_notice": "Academic Demonstration Record — not an active commercial vacancy",
        "source_attribution": "Curated Academic Benchmark Dataset — CareerTwin AI Research v1.0",
        "application_url": "https://demo.careertwin.ai/apply/job-cloud-01",
        "description": (
            "Assist with cloud server configurations on Linux environments, containerize services using Docker, "
            "and assist in managing automated CI/CD continuous deployment pipelines."
        ),
        "required_skills": [
            {"name": "Linux", "min_level": 3, "description": "Bash commands, file system permissions, and system processes"},
            {"name": "Docker", "min_level": 3, "description": "Container image creation and Dockerfile best practices"},
            {"name": "Git", "min_level": 3, "description": "Code and deployment repo branching"},
        ],
        "preferred_skills": [
            {"name": "CI/CD", "min_level": 2, "description": "GitHub Actions or Jenkins automation"},
            {"name": "Python", "min_level": 3, "description": "Infrastructure automation scripts"},
            {"name": "SQL", "min_level": 2, "description": "Cloud RDS connections"},
        ],
    },
]


def get_job_catalog() -> List[Dict[str, Any]]:
    """Returns the raw curated job dataset."""
    return CURATED_JOB_DATASET


def get_job_by_id(job_id: str) -> Optional[Dict[str, Any]]:
    """Lookup job by ID."""
    for job in CURATED_JOB_DATASET:
        if job["id"] == job_id:
            return job
    return None


def calculate_job_match(
    job: Dict[str, Any],
    candidate_skills: List[Dict[str, Any]],
    target_role: Optional[str] = None,
    experience_months: int = 0,
) -> Dict[str, Any]:
    """
    Transparent, documented matching calculation between candidate skills
    and a specific entry-level job vacancy.

    Scoring Weights (Sum = 100):
      - Required Skills Fulfillment: 70%
      - Preferred Skills Fulfillment: 20%
      - Target Role & Experience Affinity: 10%
    """
    # Normalize candidate skill map: lowercase name -> level (1-5)
    skills_map: Dict[str, int] = {}
    for s in candidate_skills:
        name = (s.get("name") or "").strip().lower()
        if name:
            skills_map[name] = max(1, min(5, int(s.get("level", 3))))

    # 1. Required Skills (max 70 points)
    req_skills = job.get("required_skills", [])
    matching_skills: List[Dict[str, Any]] = []
    missing_required_skills: List[Dict[str, Any]] = []

    req_fulfillment_sum = 0.0
    for req in req_skills:
        name = req["name"]
        min_level = req.get("min_level", 3)
        curr_level = skills_map.get(name.lower(), 0)

        if curr_level > 0:
            fulfillment = min(1.0, curr_level / float(min_level))
            req_fulfillment_sum += fulfillment
            matching_skills.append({
                "name": name,
                "student_level": curr_level,
                "required_level": min_level,
                "is_required": True,
            })
            if curr_level < min_level:
                missing_required_skills.append({
                    "name": name,
                    "required_level": min_level,
                    "is_required": True,
                    "gap": min_level - curr_level,
                })
        else:
            missing_required_skills.append({
                "name": name,
                "required_level": min_level,
                "is_required": True,
                "gap": min_level,
            })

    req_score = 70.0 * (req_fulfillment_sum / max(1, len(req_skills)))

    # 2. Preferred Skills (max 20 points)
    pref_skills = job.get("preferred_skills", [])
    missing_preferred_skills: List[Dict[str, Any]] = []

    pref_fulfillment_sum = 0.0
    for pref in pref_skills:
        name = pref["name"]
        min_level = pref.get("min_level", 3)
        curr_level = skills_map.get(name.lower(), 0)

        if curr_level > 0:
            fulfillment = min(1.0, curr_level / float(min_level))
            pref_fulfillment_sum += fulfillment
            matching_skills.append({
                "name": name,
                "student_level": curr_level,
                "required_level": min_level,
                "is_required": False,
            })
        else:
            missing_preferred_skills.append({
                "name": name,
                "required_level": min_level,
                "is_required": False,
                "gap": min_level,
            })

    pref_score = 20.0 * (pref_fulfillment_sum / max(1, len(pref_skills))) if pref_skills else 0.0

    # 3. Target Role & Experience Affinity (max 10 points)
    affinity_score = 0.0
    if target_role and (target_role.strip().lower() == job.get("role_category", "").strip().lower()):
        affinity_score += 6.0  # Career goal alignment

    # Entry-level experience fit (benchmarked at 0-24 months)
    if 0 <= experience_months <= 36:
        affinity_score += 4.0
    else:
        affinity_score += 2.0

    affinity_score = min(10.0, affinity_score)

    total_match = round(min(100.0, req_score + pref_score + affinity_score), 1)

    # If the candidate has 0 matching skills, ensure match score remains strictly low / zero technical match
    if not candidate_skills:
        total_match = 0.0
        req_score = 0.0
        pref_score = 0.0
        affinity_score = 0.0

    # Categorization Grade
    if total_match >= 75.0:
        match_grade = "High Match"
    elif total_match >= 55.0:
        match_grade = "Good Match"
    else:
        match_grade = "Emerging Match"

    return {
        **job,
        "match_score": total_match,
        "match_grade": match_grade,
        "matching_skills": matching_skills,
        "missing_required_skills": missing_required_skills,
        "missing_preferred_skills": missing_preferred_skills,
        "score_breakdown": {
            "required_skills_score": round(req_score, 1),
            "preferred_skills_score": round(pref_score, 1),
            "affinity_score": round(affinity_score, 1),
            "formula": (
                f"Match Score ({total_match}%) = Required Skills ({round(req_score, 1)} / 70 pts) + "
                f"Preferred Skills ({round(pref_score, 1)} / 20 pts) + "
                f"Role & Experience Affinity ({round(affinity_score, 1)} / 10 pts)"
            ),
        },
    }


def match_jobs_for_candidate(
    candidate_skills: List[Dict[str, Any]],
    target_role: Optional[str] = None,
    experience_months: int = 0,
    role_filter: Optional[str] = None,
    location_type_filter: Optional[str] = None,
    min_match_score: Optional[float] = None,
    saved_job_ids: Optional[set] = None,
) -> List[Dict[str, Any]]:
    """
    Evaluates all jobs in the curated dataset against candidate skills,
    applies optional filters, and returns sorted by match_score descending.
    """
    if saved_job_ids is None:
        saved_job_ids = set()

    results: List[Dict[str, Any]] = []

    for job in CURATED_JOB_DATASET:
        # Filter by role category if requested
        if role_filter and role_filter.lower() != "all":
            if job.get("role_category", "").lower() != role_filter.lower():
                continue

        # Filter by location type if requested
        if location_type_filter and location_type_filter.lower() != "all":
            if job.get("location_type", "").lower() != location_type_filter.lower():
                continue

        match_res = calculate_job_match(
            job=job,
            candidate_skills=candidate_skills,
            target_role=target_role,
            experience_months=experience_months,
        )

        if min_match_score is not None and match_res["match_score"] < min_match_score:
            continue

        match_res["is_saved"] = job["id"] in saved_job_ids
        results.append(match_res)

    # Sort descending by match_score
    results.sort(key=lambda j: j["match_score"], reverse=True)

    # Assign ranks
    for idx, job_res in enumerate(results, start=1):
        job_res["rank"] = idx

    return results

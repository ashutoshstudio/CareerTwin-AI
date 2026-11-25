from typing import Any, Dict, List, Optional, Set
from app.core.roles_catalog import ROLES_DATA, get_role_by_id_or_name
from app.services.job_providers.matcher_utils import generate_linkedin_search_url, map_job_to_catalog_role

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
    {
        "id": "job-java-01",
        "title": "Junior Java / Spring Boot Engineer",
        "company": "[Academic Sample] FinTech Core Systems",
        "role_category": "Java Developer",
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "location": "Pune, India (Hybrid)",
        "location_type": "Hybrid",
        "employment_type": "Full-time",
        "is_sample": True,
        "sample_notice": "Academic Demonstration Record — not an active commercial vacancy",
        "source_attribution": "Curated Academic Benchmark Dataset — CareerTwin AI Research v1.0",
        "application_url": "https://demo.careertwin.ai/apply/job-java-01",
        "description": "Develop and maintain backend enterprise services using Java 17, Spring Boot, and PostgreSQL.",
        "required_skills": [
            {"name": "Java", "min_level": 3, "description": "Core Java and OOP fundamentals"},
            {"name": "Spring Boot", "min_level": 3, "description": "REST controllers and JPA entities"},
            {"name": "SQL", "min_level": 3, "description": "Relational queries and transactions"},
        ],
        "preferred_skills": [
            {"name": "Git", "min_level": 3, "description": "Version control hygiene"},
            {"name": "Docker", "min_level": 2, "description": "Local container runs"},
        ],
    },
    {
        "id": "job-fe-01",
        "title": "Junior Frontend Developer (React)",
        "company": "[Academic Sample] PixelCraft Digital",
        "role_category": "Frontend Developer",
        "experience_required": "0-1 years (Entry-Level)",
        "location": "Bangalore, India (Remote)",
        "location_type": "Remote",
        "employment_type": "Full-time",
        "is_sample": True,
        "sample_notice": "Academic Demonstration Record — not an active commercial vacancy",
        "source_attribution": "Curated Academic Benchmark Dataset — CareerTwin AI Research v1.0",
        "application_url": "https://demo.careertwin.ai/apply/job-fe-01",
        "description": "Implement responsive, accessible UI components and dashboards with React, Tailwind CSS, and TypeScript.",
        "required_skills": [
            {"name": "React", "min_level": 3, "description": "Hooks, props, and component trees"},
            {"name": "JavaScript", "min_level": 3, "description": "ES6+ and DOM manipulation"},
            {"name": "CSS3", "min_level": 3, "description": "Flexbox, Grid, and responsive styling"},
        ],
        "preferred_skills": [
            {"name": "Tailwind CSS", "min_level": 3, "description": "Utility classes"},
            {"name": "TypeScript", "min_level": 2, "description": "Typed component props"},
        ],
    },
    {
        "id": "job-ds-01",
        "title": "Graduate Data Scientist",
        "company": "[Academic Sample] NeuralSphere Insights",
        "role_category": "Data Scientist",
        "experience_required": "0-1 years (Freshers eligible)",
        "location": "Hyderabad, India (Hybrid)",
        "location_type": "Hybrid",
        "employment_type": "Full-time",
        "is_sample": True,
        "sample_notice": "Academic Demonstration Record — not an active commercial vacancy",
        "source_attribution": "Curated Academic Benchmark Dataset — CareerTwin AI Research v1.0",
        "application_url": "https://demo.careertwin.ai/apply/job-ds-01",
        "description": "Formulate predictive statistical hypotheses, build Scikit-Learn models, and analyze business telemetry.",
        "required_skills": [
            {"name": "Python", "min_level": 3, "description": "Pandas, NumPy, and scripting"},
            {"name": "Machine Learning", "min_level": 3, "description": "Regression, classification, and validation"},
            {"name": "Statistics", "min_level": 3, "description": "Distributions and hypothesis tests"},
        ],
        "preferred_skills": [
            {"name": "SQL", "min_level": 3, "description": "Data wrangling"},
            {"name": "Scikit-learn", "min_level": 3, "description": "Pipelines and metrics"},
        ],
    },
    {
        "id": "job-devops-01",
        "title": "Associate DevOps Engineer",
        "company": "[Academic Sample] ScaleOps Infrastructure",
        "role_category": "DevOps Engineer",
        "experience_required": "0-1 years (Entry-Level)",
        "location": "Bangalore, India (Hybrid)",
        "location_type": "Hybrid",
        "employment_type": "Full-time",
        "is_sample": True,
        "sample_notice": "Academic Demonstration Record — not an active commercial vacancy",
        "source_attribution": "Curated Academic Benchmark Dataset — CareerTwin AI Research v1.0",
        "application_url": "https://demo.careertwin.ai/apply/job-devops-01",
        "description": "Assist in building continuous integration pipelines, managing Docker containers, and automating cluster deployments.",
        "required_skills": [
            {"name": "CI/CD", "min_level": 3, "description": "GitHub Actions or Jenkins workflows"},
            {"name": "Docker", "min_level": 3, "description": "Container image construction"},
            {"name": "Linux", "min_level": 3, "description": "Bash commands and script automation"},
        ],
        "preferred_skills": [
            {"name": "Kubernetes", "min_level": 2, "description": "Pod manifests and deployments"},
            {"name": "Git", "min_level": 3, "description": "Branching and pull requests"},
        ],
    },
    {
        "id": "job-sec-01",
        "title": "Junior Cybersecurity Analyst",
        "company": "[Academic Sample] SecureShield Defense",
        "role_category": "Cybersecurity Analyst",
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "location": "Delhi NCR, India (On-site)",
        "location_type": "On-site",
        "employment_type": "Full-time",
        "is_sample": True,
        "sample_notice": "Academic Demonstration Record — not an active commercial vacancy",
        "source_attribution": "Curated Academic Benchmark Dataset — CareerTwin AI Research v1.0",
        "application_url": "https://demo.careertwin.ai/apply/job-sec-01",
        "description": "Triage security events, inspect packet captures in Wireshark, and assist in periodic vulnerability assessments.",
        "required_skills": [
            {"name": "Network Security", "min_level": 3, "description": "TCP/IP and firewall rules"},
            {"name": "Threat Analysis", "min_level": 3, "description": "Malware indicators and alert triage"},
            {"name": "Linux", "min_level": 3, "description": "Log inspection and command line"},
        ],
        "preferred_skills": [
            {"name": "Wireshark", "min_level": 2, "description": "Packet inspection"},
            {"name": "Python", "min_level": 2, "description": "Security scripting"},
        ],
    },
    {
        "id": "job-qa-01",
        "title": "QA Test Engineer Trainee",
        "company": "[Academic Sample] QualiTest Labs",
        "role_category": "QA Engineer",
        "experience_required": "0-1 years (Entry-Level)",
        "location": "Pune, India (Remote)",
        "location_type": "Remote",
        "employment_type": "Full-time",
        "is_sample": True,
        "sample_notice": "Academic Demonstration Record — not an active commercial vacancy",
        "source_attribution": "Curated Academic Benchmark Dataset — CareerTwin AI Research v1.0",
        "application_url": "https://demo.careertwin.ai/apply/job-qa-01",
        "description": "Author structured test cases, execute functional and regression test matrices, and report bugs in Jira.",
        "required_skills": [
            {"name": "Test Case Design", "min_level": 3, "description": "Boundary values and edge cases"},
            {"name": "Functional Testing", "min_level": 3, "description": "Manual validation and regression runs"},
            {"name": "REST APIs", "min_level": 3, "description": "Postman endpoint testing"},
        ],
        "preferred_skills": [
            {"name": "SQL", "min_level": 2, "description": "Data verification queries"},
            {"name": "Jira", "min_level": 3, "description": "Defect logging and tracking"},
        ],
    },
    {
        "id": "job-ba-01",
        "title": "Graduate Business Analyst",
        "company": "[Academic Sample] Vantage Consulting",
        "role_category": "Business Analyst",
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "location": "Mumbai, India (Hybrid)",
        "location_type": "Hybrid",
        "employment_type": "Full-time",
        "is_sample": True,
        "sample_notice": "Academic Demonstration Record — not an active commercial vacancy",
        "source_attribution": "Curated Academic Benchmark Dataset — CareerTwin AI Research v1.0",
        "application_url": "https://demo.careertwin.ai/apply/job-ba-01",
        "description": "Gather functional requirements from stakeholders, write user stories, and create BPMN workflow maps.",
        "required_skills": [
            {"name": "Business Analysis", "min_level": 3, "description": "Eliciting requirements and scopes"},
            {"name": "Requirements Gathering", "min_level": 3, "description": "User stories and acceptance criteria"},
            {"name": "Excel", "min_level": 3, "description": "Data modeling and spreadsheets"},
        ],
        "preferred_skills": [
            {"name": "SQL", "min_level": 2, "description": "Hypothesis queries"},
            {"name": "Process Mapping", "min_level": 3, "description": "Flowcharts and diagrams"},
        ],
    },
    {
        "id": "job-ux-01",
        "title": "Junior UI/UX Designer",
        "company": "[Academic Sample] StudioDesign Interactive",
        "role_category": "UI/UX Designer",
        "experience_required": "0-1 years (Entry-Level / Freshers)",
        "location": "Bangalore, India (Remote)",
        "location_type": "Remote",
        "employment_type": "Full-time",
        "is_sample": True,
        "sample_notice": "Academic Demonstration Record — not an active commercial vacancy",
        "source_attribution": "Curated Academic Benchmark Dataset — CareerTwin AI Research v1.0",
        "application_url": "https://demo.careertwin.ai/apply/job-ux-01",
        "description": "Design wireframes, maintain Figma design systems, and run usability tests for modern web and mobile apps.",
        "required_skills": [
            {"name": "Figma", "min_level": 3, "description": "Auto-layout, components, and prototypes"},
            {"name": "User Research", "min_level": 3, "description": "Interviews and journey maps"},
            {"name": "Visual Design", "min_level": 3, "description": "Typography, color harmony, and grids"},
        ],
        "preferred_skills": [
            {"name": "Responsive UI", "min_level": 3, "description": "Mobile and desktop adaptations"},
            {"name": "Prototyping", "min_level": 3, "description": "Interactive click-throughs"},
        ],
    },
]


def get_job_catalog() -> List[Dict[str, Any]]:
    """Returns the raw curated job dataset."""
    return CURATED_JOB_DATASET


def get_job_by_id(job_id: str) -> Optional[Dict[str, Any]]:
    """Lookup job by ID in curated benchmark dataset or external provider cache."""
    for job in CURATED_JOB_DATASET:
        if job["id"] == job_id:
            return job
    # Check external provider service in-memory cache
    try:
        from app.services.job_providers.job_provider_service import get_job_provider_service
        provider_svc = get_job_provider_service()
        norm_job = provider_svc.get_job_by_id(job_id)
        if norm_job:
            return norm_job.to_dict()
    except Exception:
        pass
    return None


def calculate_job_match(
    job: Dict[str, Any],
    candidate_skills: List[Dict[str, Any]],
    target_role: Optional[str] = None,
    experience_months: int = 0,
    candidate_education: Optional[str] = None,
    candidate_degree: Optional[str] = None,
    scoring_model: str = "standard",
) -> Dict[str, Any]:
    """
    Transparent, documented matching calculation between candidate skills
    and a specific job vacancy (curated benchmark or live external listing).

    Supported Scoring Models:
      - 'standard': 70% Required Skills, 20% Preferred Skills, 10% Role & Exp Affinity
      - 'five_factor': 50% Required Skills, 20% Secondary Skills, 15% Experience Alignment,
                       5% Education Alignment, 10% Role Relevance
    """
    # Normalize candidate skill map: lowercase name -> level (1-5)
    skills_map: Dict[str, int] = {}
    for s in candidate_skills:
        name = (s.get("name") or "").strip().lower()
        if name:
            skills_map[name] = max(1, min(5, int(s.get("level", 3))))

    # Look up matched catalog role for learning resources and education benchmarks
    role_info = None
    if job.get("matched_role_id"):
        role_info = get_role_by_id_or_name(job["matched_role_id"])
    if not role_info and job.get("role_category"):
        role_info = get_role_by_id_or_name(job["role_category"])
    if not role_info:
        role_info = map_job_to_catalog_role(job.get("title", ""), job.get("description", ""))

    role_resources = role_info.get("learning_resources", []) if role_info else []

    # 1. Required Skills Match
    req_skills = job.get("required_skills", [])
    matching_skills: List[Dict[str, Any]] = []
    missing_required_skills: List[Dict[str, Any]] = []

    req_fulfillment_sum = 0.0
    for req in req_skills:
        name = req["name"]
        min_level = req.get("min_level", 3)
        curr_level = skills_map.get(name.lower(), 0)

        # Find skill-specific learning resources
        matched_res = [
            r for r in role_resources
            if name.lower() in r.get("title", "").lower() or name.lower() in r.get("url", "").lower()
        ]
        if not matched_res and role_resources:
            matched_res = role_resources[:2]

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
                    "learning_resources": matched_res,
                })
        else:
            missing_required_skills.append({
                "name": name,
                "required_level": min_level,
                "is_required": True,
                "gap": min_level,
                "learning_resources": matched_res,
            })

    # 2. Preferred / Secondary Skills Match
    pref_skills = job.get("preferred_skills", [])
    missing_preferred_skills: List[Dict[str, Any]] = []

    pref_fulfillment_sum = 0.0
    for pref in pref_skills:
        name = pref["name"]
        min_level = pref.get("min_level", 3)
        curr_level = skills_map.get(name.lower(), 0)

        matched_res = [
            r for r in role_resources
            if name.lower() in r.get("title", "").lower() or name.lower() in r.get("url", "").lower()
        ]
        if not matched_res and role_resources:
            matched_res = role_resources[:2]

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
                "learning_resources": matched_res,
            })

    if scoring_model == "five_factor":
        # 5-Factor Scoring Model: 50% Req, 20% Sec, 15% Exp, 5% Edu, 10% Role
        req_score = 50.0 * (req_fulfillment_sum / max(1, len(req_skills)))
        pref_score = 20.0 * (pref_fulfillment_sum / max(1, len(pref_skills))) if pref_skills else 0.0

        # Experience alignment (max 15)
        if 0 <= experience_months <= 24:
            exp_score = 15.0
        elif 25 <= experience_months <= 36:
            exp_score = 12.0
        else:
            exp_score = 8.0

        # Education alignment (max 5)
        edu_text = f"{candidate_education or ''} {candidate_degree or ''}".lower()
        suitable = [b.lower() for b in role_info.get("suitable_backgrounds", [])] if role_info else []
        is_suitable = False
        import re
        for s in suitable:
            if s in edu_text or any(token in edu_text for token in re.split(r"[\s/]+", s) if len(token) > 2 and token not in {"and", "for"}):
                is_suitable = True
                break

        if is_suitable:
            edu_score = 5.0
        elif any(tech in edu_text for tech in ("b.tech", "btech", "bca", "mca", "b.sc", "computer", "cs", "it")):
            edu_score = 4.5
        elif candidate_education or candidate_degree:
            edu_score = 3.5
        else:
            edu_score = 3.0

        # Role relevance (max 10)
        role_score = 0.0
        target_norm = (target_role or "").strip().lower()
        job_role_norm = job.get("role_category", "").strip().lower()
        matched_role_norm = (role_info.get("name", "") if role_info else "").strip().lower()

        if target_norm and (target_norm == job_role_norm or target_norm == matched_role_norm or target_norm in job.get("title", "").lower()):
            role_score = 10.0
        elif target_norm:
            role_score = 5.0
        else:
            role_score = 2.0

        affinity_score = round(exp_score + edu_score + role_score, 1)
        total_match = round(min(100.0, req_score + pref_score + exp_score + edu_score + role_score), 1)

        breakdown = {
            "required_skills_score": round(req_score, 1),
            "preferred_skills_score": round(pref_score, 1),
            "affinity_score": affinity_score,
            "experience_score": round(exp_score, 1),
            "education_score": round(edu_score, 1),
            "role_relevance_score": round(role_score, 1),
            "formula": (
                f"Match Score ({total_match}%) = Required Skills ({round(req_score, 1)} / 50 pts) + "
                f"Secondary Skills ({round(pref_score, 1)} / 20 pts) + "
                f"Experience Alignment ({round(exp_score, 1)} / 15 pts) + "
                f"Education Suitability ({round(edu_score, 1)} / 5 pts) + "
                f"Role Relevance ({round(role_score, 1)} / 10 pts)"
            ),
        }
    else:
        # Standard Model (70% Req, 20% Pref, 10% Affinity)
        req_score = 70.0 * (req_fulfillment_sum / max(1, len(req_skills)))
        pref_score = 20.0 * (pref_fulfillment_sum / max(1, len(pref_skills))) if pref_skills else 0.0

        affinity_score = 0.0
        if target_role and (target_role.strip().lower() == job.get("role_category", "").strip().lower()):
            affinity_score += 6.0
        if 0 <= experience_months <= 36:
            affinity_score += 4.0
        else:
            affinity_score += 2.0
        affinity_score = min(10.0, affinity_score)

        total_match = round(min(100.0, req_score + pref_score + affinity_score), 1)

        breakdown = {
            "required_skills_score": round(req_score, 1),
            "preferred_skills_score": round(pref_score, 1),
            "affinity_score": round(affinity_score, 1),
            "formula": (
                f"Match Score ({total_match}%) = Required Skills ({round(req_score, 1)} / 70 pts) + "
                f"Preferred Skills ({round(pref_score, 1)} / 20 pts) + "
                f"Role & Experience Affinity ({round(affinity_score, 1)} / 10 pts)"
            ),
        }

    # Candidate with 0 skills receives 0.0 total match
    if not candidate_skills:
        total_match = 0.0
        breakdown["required_skills_score"] = 0.0
        breakdown["preferred_skills_score"] = 0.0
        breakdown["affinity_score"] = 0.0
        if "experience_score" in breakdown:
            breakdown["experience_score"] = 0.0
            breakdown["education_score"] = 0.0
            breakdown["role_relevance_score"] = 0.0

    # Categorization Grade
    if total_match >= 75.0:
        match_grade = "High Match"
    elif total_match >= 55.0:
        match_grade = "Good Match"
    else:
        match_grade = "Emerging Match"

    # Generate LinkedIn external search link
    linkedin_url = generate_linkedin_search_url(job.get("title", ""), job.get("location"))

    return {
        **job,
        "match_score": total_match,
        "match_grade": match_grade,
        "matching_skills": matching_skills,
        "missing_required_skills": missing_required_skills,
        "missing_preferred_skills": missing_preferred_skills,
        "score_breakdown": breakdown,
        "linkedin_search_url": linkedin_url,
        "recommended_resources": role_resources[:3],
    }


def match_jobs_for_candidate(
    candidate_skills: List[Dict[str, Any]],
    target_role: Optional[str] = None,
    experience_months: int = 0,
    candidate_education: Optional[str] = None,
    candidate_degree: Optional[str] = None,
    role_filter: Optional[str] = None,
    location_type_filter: Optional[str] = None,
    remote_only: bool = False,
    source_filter: Optional[str] = None,
    min_match_score: Optional[float] = None,
    saved_job_ids: Optional[set] = None,
    live_jobs: Optional[List[Dict[str, Any]]] = None,
    scoring_model: str = "standard",
    sort_by: str = "match_score",
) -> List[Dict[str, Any]]:
    """
    Evaluates jobs against candidate competencies, applying filters,
    and returns ranked listings. Supports combining curated benchmarks and live jobs.
    """
    if saved_job_ids is None:
        saved_job_ids = set()

    # Determine job pool
    pool: List[Dict[str, Any]] = []

    # 1. Curated jobs (unless source_filter is strictly external)
    if not source_filter or source_filter.lower() in {"all", "curated"}:
        pool.extend(CURATED_JOB_DATASET)

    # 2. Live jobs
    if live_jobs:
        for lj in live_jobs:
            if not source_filter or source_filter.lower() == "all" or source_filter.lower() == lj.get("source", "").lower() or (source_filter.lower() == "live" and lj.get("source") != "curated"):
                pool.append(lj)

    results: List[Dict[str, Any]] = []

    for job in pool:
        # Filter by role category if requested
        if role_filter and role_filter.lower() != "all":
            role_cat = job.get("role_category", "").lower()
            matched_name = (job.get("matched_role_name") or "").lower()
            rf = role_filter.lower()
            if role_cat != rf and matched_name != rf and rf not in job.get("title", "").lower():
                continue

        # Filter by location type if requested
        if location_type_filter and location_type_filter.lower() != "all":
            if job.get("location_type", "").lower() != location_type_filter.lower():
                continue

        # Filter by remote only
        if remote_only and not job.get("is_remote", False) and job.get("location_type", "").lower() != "remote":
            continue

        # Filter by source if requested
        if source_filter and source_filter.lower() not in {"all", "live"}:
            j_src = (job.get("source") or ("curated" if job.get("is_sample") else "unknown")).lower()
            if j_src != source_filter.lower():
                continue

        match_res = calculate_job_match(
            job=job,
            candidate_skills=candidate_skills,
            target_role=target_role,
            experience_months=experience_months,
            candidate_education=candidate_education,
            candidate_degree=candidate_degree,
            scoring_model=scoring_model,
        )

        if min_match_score is not None and match_res["match_score"] < min_match_score:
            continue

        match_res["is_saved"] = job["id"] in saved_job_ids
        results.append(match_res)

    # Sort
    if sort_by in {"newest", "published_at"}:
        results.sort(key=lambda j: (j.get("published_at") or "", j["match_score"]), reverse=True)
    else:
        results.sort(key=lambda j: j["match_score"], reverse=True)

    # Assign ranks
    for idx, job_res in enumerate(results, start=1):
        job_res["rank"] = idx

    return results

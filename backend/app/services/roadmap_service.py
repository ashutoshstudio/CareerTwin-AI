from typing import Any, Dict, List, Optional, Set, Tuple
from app.services.skill_gap_service import ROLE_BENCHMARKS, analyze_skill_gap

# Curated, verified, real learning resources (no fabricated URLs)
VERIFIED_SKILL_RESOURCES: Dict[str, List[Dict[str, Any]]] = {
    "sql": [
        {"title": "SQLBolt - Interactive SQL Lessons", "url": "https://sqlbolt.com/", "type": "Interactive", "is_free": True},
        {"title": "PostgreSQL Official Tutorial", "url": "https://www.postgresqltutorial.com/", "type": "Tutorial", "is_free": True},
        {"title": "Mode Analytics SQL Tutorial for Data Analysis", "url": "https://mode.com/sql-tutorial/", "type": "Course", "is_free": True},
    ],
    "python": [
        {"title": "Official Python 3 Tutorial", "url": "https://docs.python.org/3/tutorial/", "type": "Documentation", "is_free": True},
        {"title": "Real Python - Python Basics & Fundamentals", "url": "https://realpython.com/", "type": "Tutorial", "is_free": True},
        {"title": "W3Schools Python Tutorial", "url": "https://www.w3schools.com/python/", "type": "Interactive", "is_free": True},
    ],
    "pandas": [
        {"title": "Pandas Getting Started Guide", "url": "https://pandas.pydata.org/docs/getting_started/index.html", "type": "Documentation", "is_free": True},
        {"title": "Kaggle - Pandas Hands-On Micro-Course", "url": "https://www.kaggle.com/learn/pandas", "type": "Interactive", "is_free": True},
    ],
    "numpy": [
        {"title": "NumPy for Absolute Beginners", "url": "https://numpy.org/doc/stable/user/absolute_beginners.html", "type": "Documentation", "is_free": True},
        {"title": "W3Schools NumPy Tutorial", "url": "https://www.w3schools.com/python/numpy/default.asp", "type": "Interactive", "is_free": True},
    ],
    "excel": [
        {"title": "Microsoft Excel Video Training", "url": "https://support.microsoft.com/en-us/office/excel-video-training-9bc05390-e94c-46af-a5b3-d7c22f6990bb", "type": "Tutorial", "is_free": True},
        {"title": "Excel Easy - Complete Online Tutorial", "url": "https://www.excel-easy.com/", "type": "Tutorial", "is_free": True},
    ],
    "power bi": [
        {"title": "Microsoft Learn - Power BI Learning Path", "url": "https://learn.microsoft.com/en-us/training/powerplatform/power-bi", "type": "Course", "is_free": True},
        {"title": "Microsoft Power BI Guided Documentation", "url": "https://learn.microsoft.com/en-us/power-bi/fundamentals/desktop-getting-started", "type": "Documentation", "is_free": True},
    ],
    "tableau": [
        {"title": "Tableau Free Training Videos & Tutorials", "url": "https://www.tableau.com/learn/training", "type": "Tutorial", "is_free": True},
        {"title": "Tableau Desktop Starter Guide", "url": "https://help.tableau.com/current/pro/desktop/en-us/default.htm", "type": "Documentation", "is_free": True},
    ],
    "statistics": [
        {"title": "Khan Academy - Probability & Statistics", "url": "https://www.khanacademy.org/math/statistics-probability", "type": "Course", "is_free": True},
        {"title": "OpenIntro Statistics (Free Textbook & Exercises)", "url": "https://www.openintro.org/book/os/", "type": "Documentation", "is_free": True},
    ],
    "git": [
        {"title": "Pro Git Book (Free Official Open Source Book)", "url": "https://git-scm.com/book/en/v2", "type": "Documentation", "is_free": True},
        {"title": "Atlassian Git Tutorial - Workflows & Branching", "url": "https://www.atlassian.com/git/tutorials", "type": "Tutorial", "is_free": True},
    ],
    "fastapi": [
        {"title": "FastAPI First Steps & Tutorial", "url": "https://fastapi.tiangolo.com/tutorial/first-steps/", "type": "Tutorial", "is_free": True},
        {"title": "FastAPI Official Documentation", "url": "https://fastapi.tiangolo.com/", "type": "Documentation", "is_free": True},
    ],
    "machine learning": [
        {"title": "Kaggle - Intro to Machine Learning", "url": "https://www.kaggle.com/learn/intro-to-machine-learning", "type": "Interactive", "is_free": True},
        {"title": "Google Machine Learning Crash Course", "url": "https://developers.google.com/machine-learning/crash-course", "type": "Course", "is_free": True},
        {"title": "Scikit-Learn Machine Learning in Python", "url": "https://scikit-learn.org/stable/tutorial/basic/tutorial.html", "type": "Documentation", "is_free": True},
    ],
    "scikit-learn": [
        {"title": "Scikit-Learn Official User Guide", "url": "https://scikit-learn.org/stable/user_guide.html", "type": "Documentation", "is_free": True},
        {"title": "Kaggle - Intermediate Machine Learning with Pipelines", "url": "https://www.kaggle.com/learn/intermediate-machine-learning", "type": "Interactive", "is_free": True},
    ],
    "deep learning": [
        {"title": "PyTorch Official Tutorials & Quickstart", "url": "https://pytorch.org/tutorials/", "type": "Tutorial", "is_free": True},
        {"title": "TensorFlow Core Tutorials", "url": "https://www.tensorflow.org/tutorials", "type": "Tutorial", "is_free": True},
    ],
    "docker": [
        {"title": "Docker Getting Started Guide", "url": "https://docs.docker.com/get-started/", "type": "Documentation", "is_free": True},
        {"title": "Docker 101 Tutorial", "url": "https://www.docker.com/101-tutorial/", "type": "Interactive", "is_free": True},
    ],
    "html": [
        {"title": "MDN Web Docs - HTML Basics", "url": "https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML", "type": "Documentation", "is_free": True},
    ],
    "css": [
        {"title": "MDN Web Docs - CSS Layout & Flexbox", "url": "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout", "type": "Documentation", "is_free": True},
    ],
    "javascript": [
        {"title": "javascript.info - Modern JavaScript Tutorial", "url": "https://javascript.info/", "type": "Tutorial", "is_free": True},
        {"title": "MDN Web Docs - JavaScript Guide", "url": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide", "type": "Documentation", "is_free": True},
    ],
    "communication": [
        {"title": "Toastmasters - Effective Technical Communication Tips", "url": "https://www.toastmasters.org/", "type": "Guide", "is_free": True},
    ],
    "problem solving": [
        {"title": "HackerRank Problem Solving Track", "url": "https://www.hackerrank.com/domains/algorithms", "type": "Interactive", "is_free": True},
        {"title": "LeetCode Curated Problem Library", "url": "https://leetcode.com/problemset/all/", "type": "Interactive", "is_free": True},
    ],
    "java": [
        {"title": "Oracle Official Java Tutorials", "url": "https://docs.oracle.com/javase/tutorial/", "type": "Documentation", "is_free": True},
        {"title": "Baeldung Java Tutorials & Guides", "url": "https://www.baeldung.com/", "type": "Tutorial", "is_free": True},
    ],
    "spring boot": [
        {"title": "Spring Boot Official Getting Started Guides", "url": "https://spring.io/guides", "type": "Documentation", "is_free": True},
        {"title": "Baeldung Spring Boot Masterclass", "url": "https://www.baeldung.com/spring-boot", "type": "Tutorial", "is_free": True},
    ],
    "typescript": [
        {"title": "Official TypeScript Handbook", "url": "https://www.typescriptlang.org/docs/handbook/intro.html", "type": "Documentation", "is_free": True},
        {"title": "Execute Program TypeScript Course", "url": "https://www.executeprogram.com/courses/typescript", "type": "Interactive", "is_free": False},
    ],
    "react": [
        {"title": "React Official Documentation & Interactive Quickstart", "url": "https://react.dev/", "type": "Documentation", "is_free": True},
        {"title": "FreeCodeCamp React Course", "url": "https://www.freecodecamp.org/learn/front-end-development-libraries/#react", "type": "Course", "is_free": True},
    ],
    "node.js": [
        {"title": "Node.js Official Documentation & Guides", "url": "https://nodejs.org/en/learn", "type": "Documentation", "is_free": True},
    ],
    "tailwind css": [
        {"title": "Tailwind CSS Official Documentation", "url": "https://tailwindcss.com/docs", "type": "Documentation", "is_free": True},
    ],
    "kotlin": [
        {"title": "Kotlin Official Documentation & Tour", "url": "https://kotlinlang.org/docs/home.html", "type": "Documentation", "is_free": True},
    ],
    "android sdk": [
        {"title": "Android Developers Official Training Guides", "url": "https://developer.android.com/get-started", "type": "Documentation", "is_free": True},
    ],
    "flutter": [
        {"title": "Flutter Official Documentation", "url": "https://docs.flutter.dev/", "type": "Documentation", "is_free": True},
    ],
    "dart": [
        {"title": "Dart Language Tour & Guides", "url": "https://dart.dev/guides", "type": "Documentation", "is_free": True},
    ],
    "cloud computing": [
        {"title": "AWS Cloud Practitioner Essentials", "url": "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/", "type": "Course", "is_free": True},
    ],
    "aws services": [
        {"title": "AWS Documentation Hub", "url": "https://docs.aws.amazon.com/", "type": "Documentation", "is_free": True},
    ],
    "microsoft azure": [
        {"title": "Microsoft Learn Azure Documentation", "url": "https://learn.microsoft.com/en-us/azure/", "type": "Documentation", "is_free": True},
    ],
    "terraform": [
        {"title": "HashiCorp Terraform Tutorials", "url": "https://developer.hashicorp.com/terraform/tutorials", "type": "Documentation", "is_free": True},
    ],
    "kubernetes": [
        {"title": "Kubernetes Official Interactive Tutorials", "url": "https://kubernetes.io/docs/tutorials/", "type": "Documentation", "is_free": True},
    ],
    "linux": [
        {"title": "Linux Journey - Interactive OS Tutorial", "url": "https://linuxjourney.com/", "type": "Interactive", "is_free": True},
    ],
    "ci/cd": [
        {"title": "GitHub Actions Documentation", "url": "https://docs.github.com/en/actions", "type": "Documentation", "is_free": True},
    ],
    "network security": [
        {"title": "Cybrary Network Security Fundamentals", "url": "https://www.cybrary.it/", "type": "Course", "is_free": True},
        {"title": "Wireshark Official User Guide", "url": "https://www.wireshark.org/docs/wsug_html_chunked/", "type": "Documentation", "is_free": True},
    ],
    "siem": [
        {"title": "Splunk Free Training & Tutorials", "url": "https://www.splunk.com/en_us/training/free-courses/overview.html", "type": "Course", "is_free": True},
    ],
    "web application security": [
        {"title": "PortSwigger Web Security Academy", "url": "https://portswigger.net/web-security", "type": "Interactive", "is_free": True},
        {"title": "OWASP Top Ten Web Vulnerabilities", "url": "https://owasp.org/www-project-top-ten/", "type": "Documentation", "is_free": True},
    ],
    "selenium": [
        {"title": "Selenium Official Documentation", "url": "https://www.selenium.dev/documentation/", "type": "Documentation", "is_free": True},
    ],
    "playwright": [
        {"title": "Playwright Official Getting Started Guide", "url": "https://playwright.dev/docs/intro", "type": "Documentation", "is_free": True},
    ],
    "test case design": [
        {"title": "Guru99 Software Testing Fundamentals", "url": "https://www.guru99.com/software-testing.html", "type": "Tutorial", "is_free": True},
    ],
    "business analysis": [
        {"title": "IIBA Business Analysis Resources", "url": "https://www.iiba.org/business-analysis-resources/", "type": "Documentation", "is_free": True},
    ],
    "product analytics": [
        {"title": "Amplitude Academy Free Product Analytics", "url": "https://academy.amplitude.com/", "type": "Course", "is_free": True},
    ],
    "figma": [
        {"title": "Figma Learn Interactive Tutorials", "url": "https://help.figma.com/hc/en-us/categories/360002051613-Learn-design", "type": "Documentation", "is_free": True},
    ],
    "solidity": [
        {"title": "Solidity Official Language Documentation", "url": "https://docs.soliditylang.org/", "type": "Documentation", "is_free": True},
        {"title": "CryptoZombies Solidity Interactive Course", "url": "https://cryptozombies.io/", "type": "Interactive", "is_free": True},
    ],
    "ros/ros2": [
        {"title": "ROS 2 Official Documentation", "url": "https://docs.ros.org/en/humble/", "type": "Documentation", "is_free": True},
    ],
    "embedded c/c++": [
        {"title": "Arduino Official Documentation & Tutorials", "url": "https://docs.arduino.cc/", "type": "Documentation", "is_free": True},
    ],
}


def _get_resources_for_skill(skill_name: str) -> List[Dict[str, Any]]:
    """Retrieve verified learning resources for a skill name with fallback."""
    key = skill_name.strip().lower()
    if key in VERIFIED_SKILL_RESOURCES:
        return list(VERIFIED_SKILL_RESOURCES[key])
    for known_key, res in VERIFIED_SKILL_RESOURCES.items():
        if known_key in key or key in known_key:
            return list(res)
    # Generic high-quality free learning fallbacks
    return [
        {"title": f"W3Schools {skill_name} Guide", "url": f"https://www.w3schools.com/", "type": "Tutorial", "is_free": True},
        {"title": f"FreeCodeCamp - Learn {skill_name}", "url": "https://www.freecodecamp.org/news/", "type": "Tutorial", "is_free": True},
    ]


def generate_personalized_roadmap(
    candidate_skills: List[Dict[str, Any]],
    target_role: str,
    target_weeks: Optional[int] = None,
    completed_item_ids: Optional[Set[str]] = None,
) -> Dict[str, Any]:
    """
    Synthesize an actionable, weekly learning roadmap tailored to candidate's skill gaps
    for target_role.
    """
    if completed_item_ids is None:
        completed_item_ids = set()

    # 1. Analyze skill gaps against benchmark
    gap_data = analyze_skill_gap(candidate_skills, target_role)
    comparisons = gap_data.get("skills_comparison", [])

    # Separate into missing and needs_improvement, prioritized by importance
    missing_skills = [c for c in comparisons if c.get("status") == "missing"]
    improve_skills = [c for c in comparisons if c.get("status") == "needs_improvement"]
    met_skills = [c for c in comparisons if c.get("status") == "met"]

    # Sort high priority first
    def _priority_score(c: Dict[str, Any]) -> int:
        score = 0
        if c.get("category") == "Core Requirement":
            score += 10
        if c.get("priority") == "high":
            score += 5
        elif c.get("priority") == "medium":
            score += 2
        score += c.get("gap", 0)
        return score

    missing_skills.sort(key=_priority_score, reverse=True)
    improve_skills.sort(key=_priority_score, reverse=True)

    # 2. Determine duration in weeks (4 to 8 weeks)
    total_gaps = len(missing_skills) + len(improve_skills)
    if target_weeks:
        num_weeks = max(3, min(10, target_weeks))
    else:
        if total_gaps <= 2:
            num_weeks = 4
        elif total_gaps <= 5:
            num_weeks = 6
        else:
            num_weeks = 8

    # 3. Build weekly modules
    weeks: List[Dict[str, Any]] = []
    item_counter = 1

    # Pool of gaps to address
    gap_pool: List[Dict[str, Any]] = missing_skills + improve_skills

    # If candidate has very few or zero gaps, provide advanced masterclass modules
    if not gap_pool:
        # Generate 4-week advanced specialization plan
        weeks = _generate_advanced_mastery_weeks(target_role, met_skills, completed_item_ids)
    else:
        # Distribute gaps across weeks (leaving final week for capstone project & interview prep)
        content_weeks = max(2, num_weeks - 1)
        skills_per_week = max(1, (len(gap_pool) + content_weeks - 1) // content_weeks)

        for w_idx in range(content_weeks):
            week_num = w_idx + 1
            start_i = w_idx * skills_per_week
            end_i = min(len(gap_pool), start_i + skills_per_week)
            assigned_gaps = gap_pool[start_i:end_i]

            if not assigned_gaps:
                # If we have extra weeks, use reinforcement
                assigned_gaps = gap_pool[:1]

            skill_names = [g["name"] for g in assigned_gaps]
            primary_skill = skill_names[0] if skill_names else "Core Competency"

            # Check if majority are missing or improve
            has_missing = any(g["status"] == "missing" for g in assigned_gaps)
            if has_missing:
                theme_prefix = "Foundations & Acquisition"
            else:
                theme_prefix = "Proficiency Mastery & Practical Depth"

            week_title = f"{theme_prefix}: {', '.join(skill_names)}"
            focus_area = f"Targeted gap closure in {', '.join(skill_names)} with practical hands-on exercises"
            milestone = f"Complete guided projects and quizzes demonstrating benchmark proficiency in {primary_skill}"
            est_hours = 8 + (len(assigned_gaps) * 2)

            week_items: List[Dict[str, Any]] = []
            for gap in assigned_gaps:
                s_name = gap["name"]
                resources = _get_resources_for_skill(s_name)
                is_missing = gap["status"] == "missing"
                req_level = gap["required_level"]

                if is_missing:
                    # Item 1: Conceptual fundamentals
                    item_id_1 = f"w{week_num}-{s_name.lower().replace(' ', '-')}-core"
                    week_items.append({
                        "id": item_id_1,
                        "title": f"Study {s_name} Fundamentals & Core Syntax",
                        "description": f"Read official documentation and complete beginner modules to build foundational intuition for {s_name}.",
                        "skills": [s_name],
                        "resources": resources[:2],
                        "is_completed": item_id_1 in completed_item_ids,
                    })

                    # Item 2: Hands-on implementation
                    item_id_2 = f"w{week_num}-{s_name.lower().replace(' ', '-')}-applied"
                    week_items.append({
                        "id": item_id_2,
                        "title": f"Solve Applied {s_name} Exercises & Challenges",
                        "description": f"Build practical exercises targeting level {req_level} proficiency standard required for {target_role}.",
                        "skills": [s_name],
                        "resources": resources[1:],
                        "is_completed": item_id_2 in completed_item_ids,
                    })
                else:
                    # Item: Deepening existing skill
                    curr_level = gap["current_level"]
                    item_id_up = f"w{week_num}-{s_name.lower().replace(' ', '-')}-upgrade"
                    week_items.append({
                        "id": item_id_up,
                        "title": f"Elevate {s_name} from Level {curr_level} to Level {req_level}",
                        "description": f"Focus on advanced features, edge cases, error handling, and performance optimization in {s_name}.",
                        "skills": [s_name],
                        "resources": resources,
                        "is_completed": item_id_up in completed_item_ids,
                    })

            # Check if all items in week are completed
            all_week_done = bool(week_items) and all(it["is_completed"] for it in week_items)

            weeks.append({
                "week_number": week_num,
                "title": week_title,
                "focus_area": focus_area,
                "estimated_hours": est_hours,
                "milestone": milestone,
                "skills": skill_names,
                "items": week_items,
                "is_completed": all_week_done,
            })

        # Capstone Final Week
        final_week_num = len(weeks) + 1
        capstone_items = [
            {
                "id": f"w{final_week_num}-capstone-build",
                "title": f"Build End-to-End {target_role} Portfolio Project",
                "description": f"Synthesize all acquired skills into a showcase project with clean repository structure, documentation, and live demo.",
                "skills": [gap_pool[0]["name"] if gap_pool else target_role, "Git"],
                "resources": [
                    {"title": "GitHub Guides - Mastering Markdown & Documentation", "url": "https://docs.github.com/en/get-started/writing-on-github", "type": "Guide", "is_free": True},
                    {"title": "Awesome Portfolio Projects for Developers & Analysts", "url": "https://github.com/", "type": "Interactive", "is_free": True},
                ],
                "is_completed": f"w{final_week_num}-capstone-build" in completed_item_ids,
            },
            {
                "id": f"w{final_week_num}-capstone-interview",
                "title": f"Technical Interview Simulation & Q&A Review",
                "description": f"Prepare for technical screening questions, system behavior discussions, and coding rounds specific to entry-level {target_role} roles.",
                "skills": ["Communication", "Problem Solving"],
                "resources": [
                    {"title": "LeetCode Curated Problem Library", "url": "https://leetcode.com/problemset/all/", "type": "Interactive", "is_free": True},
                    {"title": "HackerRank Problem Solving Track", "url": "https://www.hackerrank.com/domains/algorithms", "type": "Interactive", "is_free": True},
                ],
                "is_completed": f"w{final_week_num}-capstone-interview" in completed_item_ids,
            },
        ]

        weeks.append({
            "week_number": final_week_num,
            "title": f"Capstone Synthesis & {target_role} Interview Readiness",
            "focus_area": "Portfolio deliverable integration, GitHub repository polish, and technical interview simulations",
            "estimated_hours": 12,
            "milestone": f"Publish a comprehensive GitHub showcase project and pass candidate readiness checklist for {target_role}",
            "skills": [target_role, "Git", "Problem Solving", "Communication"],
            "items": capstone_items,
            "is_completed": all(it["is_completed"] for it in capstone_items),
        })

    # 4. Compute overall statistics
    total_items = 0
    completed_items = 0
    next_recommended_task = None
    milestone_summary = None

    current_week = 1
    found_active_week = False

    for w in weeks:
        w_done = True
        for it in w["items"]:
            total_items += 1
            if it["is_completed"]:
                completed_items += 1
            else:
                w_done = False
                if next_recommended_task is None:
                    next_recommended_task = it["title"]
        w["is_completed"] = w_done and len(w["items"]) > 0

        if not w["is_completed"] and not found_active_week:
            current_week = w["week_number"]
            milestone_summary = w["milestone"]
            found_active_week = True

    if not found_active_week and weeks:
        current_week = len(weeks)
        milestone_summary = weeks[-1]["milestone"]
        if not next_recommended_task:
            next_recommended_task = "All current roadmap topics mastered! Review capstone and explore next role."

    completion_percentage = (
        round((completed_items / total_items) * 100.0, 1) if total_items > 0 else 0.0
    )

    return {
        "target_role": target_role,
        "total_weeks": len(weeks),
        "current_week": current_week,
        "completion_percentage": completion_percentage,
        "total_items": total_items,
        "completed_items": completed_items,
        "weeks": weeks,
        "next_recommended_task": next_recommended_task,
        "current_milestone": milestone_summary,
    }


def _generate_advanced_mastery_weeks(
    target_role: str,
    met_skills: List[Dict[str, Any]],
    completed_item_ids: Set[str],
) -> List[Dict[str, Any]]:
    """Generate advanced specialization plan for students who meet all baseline requirements."""
    skills_names = [m["name"] for m in met_skills[:4]] or ["Python", "SQL", "Git"]
    return [
        {
            "week_number": 1,
            "title": f"Advanced Performance Optimization & Architecture",
            "focus_area": f"Profiling, latency minimization, and scalable patterns in {target_role}",
            "estimated_hours": 10,
            "milestone": "Implement memory-efficient queries, pipeline vectorization, and caching strategies",
            "skills": skills_names[:2],
            "items": [
                {
                    "id": "w1-adv-arch",
                    "title": f"Production Architecture in {target_role}",
                    "description": "Design modular components adhering to Clean Architecture and SOLID principles.",
                    "skills": skills_names[:2],
                    "resources": _get_resources_for_skill(skills_names[0]),
                    "is_completed": "w1-adv-arch" in completed_item_ids,
                },
                {
                    "id": "w1-adv-profiling",
                    "title": "Profiling and Computational Bottleneck Diagnostics",
                    "description": "Benchmark execution times and optimize memory footprints.",
                    "skills": skills_names[:1],
                    "resources": _get_resources_for_skill(skills_names[0]),
                    "is_completed": "w1-adv-profiling" in completed_item_ids,
                },
            ],
            "is_completed": "w1-adv-arch" in completed_item_ids and "w1-adv-profiling" in completed_item_ids,
        },
        {
            "week_number": 2,
            "title": "Automated Testing, CI/CD, and Containerization",
            "focus_area": "Automated regression testing, GitHub Actions workflows, and Docker deployment",
            "estimated_hours": 10,
            "milestone": "Ship automated CI pipeline with test coverage > 85% and Dockerized execution",
            "skills": ["Git", "Docker", "CI/CD"],
            "items": [
                {
                    "id": "w2-cicd-setup",
                    "title": "Configure GitHub Actions Automated CI/CD",
                    "description": "Create automated linting, type-checking, and test runner workflows on pull requests.",
                    "skills": ["Git", "CI/CD"],
                    "resources": _get_resources_for_skill("git"),
                    "is_completed": "w2-cicd-setup" in completed_item_ids,
                },
                {
                    "id": "w2-docker-deploy",
                    "title": "Multi-Stage Docker Containerization",
                    "description": "Write lean Dockerfile images for deployment in containerized production environments.",
                    "skills": ["Docker"],
                    "resources": _get_resources_for_skill("docker"),
                    "is_completed": "w2-docker-deploy" in completed_item_ids,
                },
            ],
            "is_completed": "w2-cicd-setup" in completed_item_ids and "w2-docker-deploy" in completed_item_ids,
        },
        {
            "week_number": 3,
            "title": f"Industry Capstone Project & Technical Portfolio",
            "focus_area": "Building an enterprise-scale showcase project demonstrating complete technical autonomy",
            "estimated_hours": 12,
            "milestone": "Publish open-source GitHub showcase repository with interactive documentation",
            "skills": [target_role, "Git", "Problem Solving"],
            "items": [
                {
                    "id": "w3-capstone-build",
                    "title": "Deploy Full-Scale Showcase Solution",
                    "description": "Implement an end-to-end industry scenario handling real-world datasets or APIs.",
                    "skills": [target_role],
                    "resources": _get_resources_for_skill(skills_names[0]),
                    "is_completed": "w3-capstone-build" in completed_item_ids,
                },
            ],
            "is_completed": "w3-capstone-build" in completed_item_ids,
        },
        {
            "week_number": 4,
            "title": "Technical Interview Simulation & Career Twin Finalization",
            "focus_area": "Behavioral STAR questions, live coding scenarios, and system design interviews",
            "estimated_hours": 10,
            "milestone": "Ace mock technical interviews and optimize portfolio for direct recruiter outreach",
            "skills": ["Communication", "Problem Solving"],
            "items": [
                {
                    "id": "w4-interview-mock",
                    "title": "Perform Mock Technical Interview Session",
                    "description": "Simulate whiteboard coding and analytical problem walkthroughs under timed conditions.",
                    "skills": ["Problem Solving", "Communication"],
                    "resources": _get_resources_for_skill("problem solving"),
                    "is_completed": "w4-interview-mock" in completed_item_ids,
                },
            ],
            "is_completed": "w4-interview-mock" in completed_item_ids,
        },
    ]


def recalculate_roadmap_progress(
    weeks_data: List[Dict[str, Any]],
    completed_item_ids: Set[str],
) -> Tuple[List[Dict[str, Any]], int, int, float, int, Optional[str], Optional[str]]:
    """
    Update item completion status across weeks_data according to completed_item_ids,
    and recalculate total_items, completed_items, completion_percentage, current_week,
    next_task, and milestone.
    """
    total_items = 0
    completed_items = 0
    next_task = None
    milestone = None
    current_week = 1
    found_active = False

    for w in weeks_data:
        w_done = True
        for it in w.get("items", []):
            total_items += 1
            is_done = it["id"] in completed_item_ids
            it["is_completed"] = is_done
            if is_done:
                completed_items += 1
            else:
                w_done = False
                if next_task is None:
                    next_task = it.get("title")

        w["is_completed"] = w_done and len(w.get("items", [])) > 0
        if not w["is_completed"] and not found_active:
            current_week = w.get("week_number", 1)
            milestone = w.get("milestone")
            found_active = True

    if not found_active and weeks_data:
        current_week = len(weeks_data)
        milestone = weeks_data[-1].get("milestone")
        if not next_task:
            next_task = "Roadmap complete! Re-assess readiness or evaluate higher-tier roles."

    pct = round((completed_items / total_items) * 100.0, 1) if total_items > 0 else 0.0

    return weeks_data, total_items, completed_items, pct, current_week, next_task, milestone

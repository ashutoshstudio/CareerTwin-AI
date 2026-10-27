import re
from typing import Any, Dict, List, Optional, Tuple

# Maintainable skill taxonomy: (Canonical Name, Category, Regex Pattern)
SKILL_TAXONOMY: List[Tuple[str, str, str]] = [
    # Programming Languages
    ("Python", "Programming Languages", r"\bpython\b"),
    ("Java", "Programming Languages", r"\bjava\b"),
    ("JavaScript", "Programming Languages", r"\b(javascript|js)\b"),
    ("TypeScript", "Programming Languages", r"\b(typescript|ts)\b"),
    ("C++", "Programming Languages", r"(?<![a-zA-Z0-9])c\+\+(?![a-zA-Z0-9])"),
    ("C#", "Programming Languages", r"(?<![a-zA-Z0-9])c#(?![a-zA-Z0-9])"),
    ("SQL", "Programming Languages", r"\bsql\b"),
    ("PHP", "Programming Languages", r"\bphp\b"),
    ("Ruby", "Programming Languages", r"\bruby\b"),
    ("Go", "Programming Languages", r"\b(golang|go\s+language)\b"),
    ("Rust", "Programming Languages", r"\brust\b"),
    ("Kotlin", "Programming Languages", r"\bkotlin\b"),
    ("Swift", "Programming Languages", r"\bswift\b"),

    # Data Science & AI
    ("Machine Learning", "Data Science & AI", r"\b(machine\s+learning|ml)\b"),
    ("Deep Learning", "Data Science & AI", r"\b(deep\s+learning|dl)\b"),
    ("NLP", "Data Science & AI", r"\b(natural\s+language\s+processing|nlp)\b"),
    ("Computer Vision", "Data Science & AI", r"\b(computer\s+vision|cv)\b"),
    ("Statistics", "Data Science & AI", r"\b(statistics|statistical\s+analysis)\b"),
    ("Pandas", "Data Science & AI", r"\bpandas\b"),
    ("NumPy", "Data Science & AI", r"\bnumpy\b"),
    ("Scikit-learn", "Data Science & AI", r"\b(scikit-learn|sklearn)\b"),
    ("TensorFlow", "Data Science & AI", r"\b(tensorflow|tf)\b"),
    ("PyTorch", "Data Science & AI", r"\bpytorch\b"),
    ("Keras", "Data Science & AI", r"\bkeras\b"),
    ("Excel", "Data Science & AI", r"\b(microsoft\s+excel|ms\s+excel|excel)\b"),
    ("Power BI", "Data Science & AI", r"\b(power\s*bi)\b"),
    ("Tableau", "Data Science & AI", r"\btableau\b"),

    # Web & Frameworks
    ("React", "Web Development", r"\breact(?:\.js)?\b"),
    ("Node.js", "Web Development", r"\bnode(?:\.js)?\b"),
    ("Express.js", "Web Development", r"\bexpress(?:\.js)?\b"),
    ("Django", "Web Development", r"\bdjango\b"),
    ("Flask", "Web Development", r"\bflask\b"),
    ("FastAPI", "Web Development", r"\bfastapi\b"),
    ("HTML", "Web Development", r"\bhtml5?\b"),
    ("CSS", "Web Development", r"\bcss3?\b"),
    ("Tailwind CSS", "Web Development", r"\btailwind(?:\s*css)?\b"),
    ("Bootstrap", "Web Development", r"\bbootstrap\b"),
    ("Angular", "Web Development", r"\bangular(?:\.js)?\b"),
    ("Vue.js", "Web Development", r"\bvue(?:\.js)?\b"),

    # Cloud & DevOps
    ("AWS", "Cloud & DevOps", r"\b(aws|amazon\s+web\s+services)\b"),
    ("Azure", "Cloud & DevOps", r"\b(azure|microsoft\s+azure)\b"),
    ("GCP", "Cloud & DevOps", r"\b(gcp|google\s+cloud(?:\s+platform)?)\b"),
    ("Docker", "Cloud & DevOps", r"\bdocker\b"),
    ("Kubernetes", "Cloud & DevOps", r"\b(kubernetes|k8s)\b"),
    ("Git", "Cloud & DevOps", r"\bgit\b"),
    ("GitHub", "Cloud & DevOps", r"\bgithub\b"),
    ("Linux", "Cloud & DevOps", r"\blinux\b"),
    ("CI/CD", "Cloud & DevOps", r"\b(ci\/cd|continuous\s+integration)\b"),

    # Soft Skills
    ("Communication", "Soft Skills", r"\b(communication(?:\s+skills)?)\b"),
    ("Problem Solving", "Soft Skills", r"\b(problem\s+solving)\b"),
    ("Leadership", "Soft Skills", r"\bleadership\b"),
    ("Teamwork", "Soft Skills", r"\b(teamwork|collaboration)\b"),
    ("Critical Thinking", "Soft Skills", r"\bcritical\s+thinking\b"),
]

# Precompile skill regexes
COMPILED_SKILLS = [
    (name, category, re.compile(pattern, re.IGNORECASE))
    for name, category, pattern in SKILL_TAXONOMY
]

# Degree mapping: (Canonical Name, Regex Pattern)
DEGREE_PATTERNS = [
    ("Bachelor of Computer Applications (BCA)", r"\b(bca|bachelor\s+of\s+computer\s+applications)\b"),
    ("Bachelor of Technology (B.Tech / B.E.)", r"\b(b\.?tech(?:nology)?|b\.?e\.?|bachelor\s+of\s+technology|bachelor\s+of\s+engineering)\b"),
    ("Master of Computer Applications (MCA)", r"\b(mca|master\s+of\s+computer\s+applications)\b"),
    ("Master of Technology (M.Tech / M.E.)", r"\b(m\.?tech(?:nology)?|m\.?e\.?|master\s+of\s+technology)\b"),
    ("Bachelor of Science (B.Sc)", r"\b(b\.?sc(?:ience)?|bachelor\s+of\s+science)\b"),
    ("Master of Science (M.Sc)", r"\b(m\.?sc(?:ience)?|master\s+of\s+science)\b"),
    ("Diploma in Computer Engineering", r"\b(diploma(?:\s+in\s+computer(?:\s+engineering)?)?)\b"),
]

COMPILED_DEGREES = [
    (name, re.compile(pattern, re.IGNORECASE))
    for name, pattern in DEGREE_PATTERNS
]

# Contact Info Patterns
EMAIL_PATTERN = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,7}\b")
PHONE_PATTERN = re.compile(r"(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}")
GITHUB_PATTERN = re.compile(r"(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)", re.IGNORECASE)
LINKEDIN_PATTERN = re.compile(r"(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)", re.IGNORECASE)


def extract_skills(text: str) -> List[Dict[str, str]]:
    """
    Extract skills from text based on curated taxonomy and regex patterns.
    Ensures word-boundary preservation and prevents duplicate skill entries.
    """
    if not text:
        return []

    found_skills = []
    seen = set()

    for name, category, pattern in COMPILED_SKILLS:
        if pattern.search(text):
            if name.lower() not in seen:
                seen.add(name.lower())
                found_skills.append({
                    "name": name,
                    "category": category,
                    "confidence": "high",
                })

    return found_skills


def extract_education(text: str) -> Dict[str, Any]:
    """
    Detect degree, institution patterns, and graduation year from resume text.
    Returns structured education dictionary.
    """
    if not text:
        return {"degree": None, "institution": None, "graduation_year": None}

    detected_degree = None
    for name, pattern in COMPILED_DEGREES:
        if pattern.search(text):
            detected_degree = name
            break

    # Look for graduation year near education keywords or anywhere in text
    years = [int(y) for y in re.findall(r"\b(20[0-3]\d|19[89]\d)\b", text)]
    # Filter plausible graduation years
    plausible_years = [y for y in years if 1990 <= y <= 2035]
    detected_year = max(plausible_years) if plausible_years else None

    # Detect institution (e.g., Delhi University, Stanford University, XYZ College of Engineering)
    institution = None
    inst_match = re.search(
        r"\b([A-Z][A-Za-z\s&]{2,40}(?:University|Institute(?:\s+of\s+[A-Za-z\s]+)?|College))\b",
        text,
    )
    if inst_match:
        institution = inst_match.group(1).strip()

    return {
        "degree": detected_degree,
        "institution": institution,
        "graduation_year": detected_year,
    }


def extract_contact_info(text: str) -> Dict[str, Optional[str]]:
    """
    Extract contact details: email, phone, github, and linkedin profiles.
    """
    if not text:
        return {"email": None, "phone": None, "github_url": None, "linkedin_url": None}

    email_match = EMAIL_PATTERN.search(text)
    email = email_match.group(0).lower() if email_match else None

    phone_match = PHONE_PATTERN.search(text)
    phone = phone_match.group(0) if phone_match else None

    github_match = GITHUB_PATTERN.search(text)
    github_url = f"https://github.com/{github_match.group(1)}" if github_match else None

    linkedin_match = LINKEDIN_PATTERN.search(text)
    linkedin_url = f"https://linkedin.com/in/{linkedin_match.group(1)}" if linkedin_match else None

    return {
        "email": email,
        "phone": phone,
        "github_url": github_url,
        "linkedin_url": linkedin_url,
    }


def analyze_resume_text(text: str) -> Dict[str, Any]:
    """
    High-level orchestrator for analyzing raw resume text.
    Extracts skills, education, contact info, generates summary, and issues warnings.
    """
    warnings: List[str] = []

    clean_text = text.strip() if text else ""
    word_count = len(clean_text.split())

    if not clean_text:
        return {
            "text_preview": "",
            "skills": [],
            "education": {"degree": None, "institution": None, "graduation_year": None},
            "contact_info": {"email": None, "phone": None, "github_url": None, "linkedin_url": None},
            "summary": "No readable text found in the document.",
            "warnings": [
                "The file contains no extractable text. If this is a scanned document, please note that Optical Character Recognition (OCR) is not currently supported."
            ],
            "status": "unreadable",
        }

    if word_count < 20:
        warnings.append(
            f"The document contains very little text ({word_count} words). Skill and education extraction may be incomplete."
        )

    skills = extract_skills(clean_text)
    education = extract_education(clean_text)
    contact_info = extract_contact_info(clean_text)

    if not skills:
        warnings.append("No technical or professional skills from our taxonomy were identified in this document.")

    if not education.get("degree"):
        warnings.append("No recognized academic degree was detected.")

    status = "completed"

    # Build concise summary
    summary_parts = []
    if skills:
        summary_parts.append(f"Identified {len(skills)} skills")
    if education.get("degree"):
        summary_parts.append(f"Degree: {education['degree']}")
    if contact_info.get("email"):
        summary_parts.append(f"Email: {contact_info['email']}")

    summary = "; ".join(summary_parts) if summary_parts else "Processed resume text successfully."

    # Preview: first 800 characters
    text_preview = clean_text[:800] + ("..." if len(clean_text) > 800 else "")

    return {
        "text_preview": text_preview,
        "skills": skills,
        "education": education,
        "contact_info": contact_info,
        "summary": summary,
        "warnings": warnings,
        "status": status,
    }

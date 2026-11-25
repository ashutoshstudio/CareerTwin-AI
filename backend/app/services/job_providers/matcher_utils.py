"""
Intelligent matching utilities for job listings and the 42-role catalog.
Maps raw job titles and descriptions to supported CareerTwin AI profiles,
extracts technical skills, and attaches relevant learning resources.
"""
from typing import Any, Dict, List, Optional, Set, Tuple
import re
import urllib.parse

from app.core.roles_catalog import ROLES_DATA, get_role_by_id_or_name

# Precompiled inverted index of role keywords and normalized skill terms
_ROLE_KEYWORDS: List[Tuple[Dict[str, Any], List[str], int]] = []
_SKILL_NAME_TO_DATA: Dict[str, Dict[str, Any]] = {}

# Build keyword lookup structures once at startup
for _role in ROLES_DATA:
    name_lower = _role["name"].lower()
    # Distinctive words in role title
    tokens = [t for t in re.split(r"[\s/\-_]+", name_lower) if len(t) > 2 and t not in {"and", "for", "the"}]
    # Collect core skill names as keywords
    core_skill_names = [_s["name"].lower() for _s in _role.get("core_skills", [])]
    _ROLE_KEYWORDS.append((_role, tokens + core_skill_names, len(tokens)))

    for _s in _role.get("core_skills", []) + _role.get("secondary_skills", []):
        s_norm = _s["name"].strip().lower()
        if s_norm not in _SKILL_NAME_TO_DATA:
            _SKILL_NAME_TO_DATA[s_norm] = {
                "name": _s["name"],
                "required_level": _s.get("required_level", 3),
                "description": _s.get("description", f"Proficiency in {_s['name']}"),
            }


def map_job_to_catalog_role(
    title: str,
    description: Optional[str] = None,
    tags: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Finds the closest matching role from the 42 supported job profiles
    based on title keywords, tag overlap, and description cues.
    Defaults to 'Python Developer' or 'Full Stack Developer' if no strong match.
    """
    if not title:
        title = ""
    title_lower = title.lower()
    desc_lower = (description or "")[:800].lower()
    tags_lower = [t.lower() for t in (tags or [])]
    tags_text = " ".join(tags_lower)

    best_role: Optional[Dict[str, Any]] = None
    best_score: float = -1.0

    for role, keywords, title_token_count in _ROLE_KEYWORDS:
        score = 0.0
        role_name_lower = role["name"].lower()

        # 1. Exact or substring match in job title (strongest signal)
        if role_name_lower in title_lower:
            score += 100.0
        else:
            # Check individual title tokens
            matched_tokens = 0
            for kw in keywords[:title_token_count]:
                if kw in title_lower:
                    matched_tokens += 1
            if title_token_count > 0:
                score += (matched_tokens / title_token_count) * 60.0

        # 2. Check tags for role keywords
        for kw in keywords:
            if kw in tags_text:
                score += 15.0

        # 3. Check description for role title or core skills
        if role_name_lower in desc_lower:
            score += 10.0

        if score > best_score:
            best_score = score
            best_role = role

    # Fallback to Software Development entry-level profile if score too low
    if best_role is None or best_score < 10.0:
        # Check simple tech indicators
        if "data" in title_lower or "analyst" in title_lower or "analytics" in title_lower:
            return get_role_by_id_or_name("data-analyst") or ROLES_DATA[8]
        if "frontend" in title_lower or "react" in title_lower:
            return get_role_by_id_or_name("frontend-developer") or ROLES_DATA[3]
        if "devops" in title_lower or "cloud" in title_lower:
            return get_role_by_id_or_name("cloud-engineer") or ROLES_DATA[17]
        return get_role_by_id_or_name("full-stack-developer") or ROLES_DATA[5]

    return best_role


def extract_skills_from_job(
    title: str,
    description: Optional[str] = None,
    tags: Optional[List[str]] = None,
    matched_role: Optional[Dict[str, Any]] = None,
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Extracts required and preferred technical skills from a job listing.
    Leverages matched catalog role competencies as baseline requirements,
    supplemented by skills explicitly mentioned in tags or description.
    """
    if matched_role is None:
        matched_role = map_job_to_catalog_role(title, description, tags)

    role_core_skills = matched_role.get("core_skills", [])
    role_sec_skills = matched_role.get("secondary_skills", [])

    text_to_search = f"{title} {description or ''} {' '.join(tags or [])}".lower()

    # Identify which role skills are explicitly mentioned
    detected_required: List[Dict[str, Any]] = []
    detected_preferred: List[Dict[str, Any]] = []
    seen_skills: Set[str] = set()

    # Priority 1: Core skills from the matched role
    for s in role_core_skills:
        name = s["name"]
        norm = name.strip().lower()
        # Word boundary check for short skills like 'C', 'R', 'Go'
        pattern = rf"(?:\b|\s){re.escape(norm)}(?:\b|\s)"
        if norm in seen_skills:
            continue
        # If explicitly found or role is closely aligned, include
        if re.search(pattern, text_to_search) or norm in title.lower():
            detected_required.append({
                "name": name,
                "min_level": s.get("required_level", 4),
                "description": s.get("description", f"Proficiency in {name}"),
            })
            seen_skills.add(norm)

    # Priority 2: Check raw tags for known technical skills
    for tag in (tags or []):
        tag_norm = tag.strip().lower()
        if tag_norm in _SKILL_NAME_TO_DATA and tag_norm not in seen_skills:
            data = _SKILL_NAME_TO_DATA[tag_norm]
            detected_required.append({
                "name": data["name"],
                "min_level": data["required_level"],
                "description": data["description"],
            })
            seen_skills.add(tag_norm)

    # If too few required skills detected, populate from role's top core skills
    if len(detected_required) < 2:
        for s in role_core_skills[:3]:
            norm = s["name"].strip().lower()
            if norm not in seen_skills:
                detected_required.append({
                    "name": s["name"],
                    "min_level": s.get("required_level", 3),
                    "description": s.get("description", f"Proficiency in {s['name']}"),
                })
                seen_skills.add(norm)

    # Priority 3: Secondary / preferred skills
    for s in role_sec_skills:
        name = s["name"]
        norm = name.strip().lower()
        if norm in seen_skills:
            continue
        pattern = rf"(?:\b|\s){re.escape(norm)}(?:\b|\s)"
        if re.search(pattern, text_to_search):
            detected_preferred.append({
                "name": name,
                "min_level": s.get("required_level", 2),
                "description": s.get("description", f"Familiarity with {name}"),
            })
            seen_skills.add(norm)

    # If still few preferred skills, add top 2 from role
    if len(detected_preferred) < 2:
        for s in role_sec_skills[:2]:
            norm = s["name"].strip().lower()
            if norm not in seen_skills:
                detected_preferred.append({
                    "name": s["name"],
                    "min_level": s.get("required_level", 2),
                    "description": s.get("description", f"Familiarity with {s['name']}"),
                })
                seen_skills.add(norm)

    return detected_required[:6], detected_preferred[:4]


def generate_linkedin_search_url(title: str, location: Optional[str] = None) -> str:
    """
    Generates a direct external search URL to LinkedIn Jobs.
    Clearly labeled as an external browser search, NOT an internal API result.
    """
    keywords = (title or "").strip()
    params = {"keywords": keywords}
    if location and "remote" not in location.lower():
        # Keep clean location string (strip country notes or parenthesis)
        clean_loc = re.sub(r"\(.*?\)", "", location).strip()
        if clean_loc:
            params["location"] = clean_loc
    return f"https://www.linkedin.com/jobs/search/?{urllib.parse.urlencode(params)}"


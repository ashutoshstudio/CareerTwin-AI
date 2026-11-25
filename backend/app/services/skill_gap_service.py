from typing import Any, Dict, List, Optional, Tuple
from app.core.roles_catalog import (
    ROLE_BENCHMARKS,
    SKILL_ACTION_GUIDANCE,
    SUPPORTED_ROLES,
)


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

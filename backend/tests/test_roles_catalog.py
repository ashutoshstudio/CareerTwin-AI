import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.roles_catalog import (
    ROLES_DATA,
    SUPPORTED_ROLES,
    ROLE_CATEGORIES,
    ROLE_BENCHMARKS,
    ROLE_COMPETENCIES,
    SUPPORTED_ROLE_COMPETENCIES,
    ROLE_CATALOG,
    SKILL_ACTION_GUIDANCE,
    get_all_roles,
    get_role_by_id_or_name,
    get_roles_by_category,
    get_all_categories,
)
from app.services.skill_gap_service import analyze_skill_gap
from app.services.recommendation_service import get_role_catalog_list, evaluate_career_recommendations
from app.ml.readiness_model import get_model_bundle, assess_readiness
from app.ml.xai_service import explain_student_assessment
from app.services.job_matching_service import CURATED_JOB_DATASET, match_jobs_for_candidate
from app.services.mock_interview_service import SUPPORTED_ROLE_COMPETENCIES as MOCK_ROLES

def test_roles_catalog_counts():
    assert len(ROLES_DATA) == 42, f"Expected 42 roles, got {len(ROLES_DATA)}"
    assert len(SUPPORTED_ROLES) == 42
    assert len(ROLE_BENCHMARKS) == 42
    assert len(ROLE_COMPETENCIES) == 42
    assert len(SUPPORTED_ROLE_COMPETENCIES) == 42
    assert len(ROLE_CATALOG) == 42
    assert len(MOCK_ROLES) == 42
    assert len(ROLE_CATEGORIES) == 9

def test_all_categories_have_roles():
    categories = get_all_categories()
    assert len(categories) == 9
    for cat in categories:
        roles = get_roles_by_category(cat)
        assert len(roles) >= 3, f"Category {cat} has only {len(roles)} roles"

def test_roles_structure():
    for role in ROLES_DATA:
        assert role["id"], "Role missing id"
        assert role["name"], "Role missing name"
        assert role["category"], "Role missing category"
        assert role["tagline"], f"Role {role['name']} missing tagline"
        assert role["description"], f"Role {role['name']} missing description"
        assert len(role["core_skills"]) >= 4, f"Role {role['name']} has fewer than 4 core skills"
        assert len(role["secondary_skills"]) >= 3, f"Role {role['name']} has fewer than 3 secondary skills"
        assert len(role["recommended_projects"]) >= 2, f"Role {role['name']} has fewer than 2 recommended projects"
        assert role["tools"], f"Role {role['name']} missing tools"
        assert role["interview_topics"], f"Role {role['name']} missing interview topics"

def test_skill_gap_analysis_new_roles():
    skills = [{"name": "Python", "level": 4}, {"name": "SQL", "level": 3}]
    # Test across multiple new roles
    res_sec = analyze_skill_gap(skills, "Cybersecurity Analyst")
    assert res_sec["target_role"] == "Cybersecurity Analyst"
    assert "skill_coverage_percentage" in res_sec
    assert len(res_sec["skills_comparison"]) > 0

    res_devops = analyze_skill_gap(skills, "DevOps Engineer")
    assert res_devops["target_role"] == "DevOps Engineer"

    res_bc = analyze_skill_gap(skills, "Blockchain Developer")
    assert res_bc["target_role"] == "Blockchain Developer"

def test_readiness_model_new_roles():
    bundle, meta = get_model_bundle()
    assert len(meta.get("supported_roles", [])) == 42, f"Expected 42 roles in model metadata, got {len(meta.get('supported_roles', []))}"
    
    skills = [{"name": "Python", "level": 4}, {"name": "Docker", "level": 3}, {"name": "Linux", "level": 4}]
    res = assess_readiness(skills, "DevOps Engineer", experience_months=6)
    assert res["readiness_score"] > 0
    assert res["readiness_category"] in ["High Readiness", "Moderate Readiness", "Needs Development"]

def test_xai_service_new_roles():
    skills = [{"name": "Solidity", "level": 4}, {"name": "JavaScript", "level": 3}]
    exp = explain_student_assessment(skills, "Blockchain Developer")
    assert exp["target_role"] == "Blockchain Developer"
    assert "positive_contributors" in exp
    assert "shap_attributions" in exp
    assert "fidelity_check" in exp
    assert exp["fidelity_check"]["is_faithful"] is True

def test_recommendations_catalog_endpoint_data():
    cat_list = get_role_catalog_list()
    assert len(cat_list) == 42

if __name__ == "__main__":
    test_roles_catalog_counts()
    test_all_categories_have_roles()
    test_roles_structure()
    test_skill_gap_analysis_new_roles()
    test_readiness_model_new_roles()
    test_xai_service_new_roles()
    test_recommendations_catalog_endpoint_data()
    print("ALL 7 VERIFICATION TESTS PASSED SUCCESSFULLY!")

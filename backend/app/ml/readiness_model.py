import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import joblib
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, f1_score, mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split

logger = logging.getLogger(__name__)

# Directory where trained ML model artifacts are stored
ARTIFACTS_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "ml"
MODEL_PATH = ARTIFACTS_DIR / "readiness_models.joblib"
METADATA_PATH = ARTIFACTS_DIR / "readiness_metadata.json"

from app.core.roles_catalog import (
    ROLE_COMPETENCIES,
    SUPPORTED_ROLES,
)

DEGREE_WEIGHTS: Dict[str, float] = {
    "Master of Computer Applications (MCA)": 1.0,
    "Master of Technology (M.Tech / M.E.)": 1.0,
    "Master of Science (M.Sc)": 0.95,
    "Bachelor of Technology (B.Tech / B.E.)": 0.85,
    "Bachelor of Computer Applications (BCA)": 0.75,
    "Bachelor of Science (B.Sc)": 0.75,
    "Diploma in Computer Engineering": 0.50,
}

FEATURE_NAMES = [
    "core_coverage",
    "core_avg_proficiency",
    "secondary_coverage",
    "total_skills_count",
    "experience_normalized",
    "degree_score",
    "has_github",
    "has_linkedin",
    "role_code",
]


def extract_features_from_profile(
    profile_skills: List[Dict[str, Any]],
    target_role: str,
    experience_months: int = 0,
    education_level: Optional[str] = None,
    github_url: Optional[str] = None,
    linkedin_url: Optional[str] = None,
) -> Tuple[np.ndarray, Dict[str, Any], List[str], List[str], List[str]]:
    """
    Extract a standardized numerical feature vector from student profile data.
    Returns:
        (feature_vector, raw_features_dict, matching_core, missing_core, supporting_skills)
    """
    role_info = ROLE_COMPETENCIES.get(target_role)
    if not role_info:
        # Default fallback to Data Analyst
        role_info = ROLE_COMPETENCIES["Data Analyst"]

    core_skills_required = role_info["core_skills"]
    secondary_skills_required = role_info["secondary_skills"]
    role_code = float(role_info["code"])

    # Map candidate skills (name -> level)
    candidate_skills: Dict[str, int] = {}
    for s in profile_skills:
        name = (s.get("name") or "").strip().lower()
        if name:
            candidate_skills[name] = int(s.get("level", 3))

    matching_core: List[str] = []
    missing_core: List[str] = []
    core_levels: List[float] = []

    for req in core_skills_required:
        req_lower = req.lower()
        if req_lower in candidate_skills:
            matching_core.append(req)
            # Level normalized from 1-5 to 0.2-1.0
            core_levels.append(candidate_skills[req_lower] / 5.0)
        else:
            missing_core.append(req)

    supporting_skills: List[str] = []
    for sec in secondary_skills_required:
        if sec.lower() in candidate_skills:
            supporting_skills.append(sec)

    # 1. Core coverage
    core_coverage = len(matching_core) / max(1, len(core_skills_required))

    # 2. Core average proficiency
    core_avg_prof = float(np.mean(core_levels)) if core_levels else 0.0

    # 3. Secondary coverage
    secondary_coverage = len(supporting_skills) / max(1, len(secondary_skills_required))

    # 4. Total skills normalized (cap at 12 skills)
    total_skills_count = min(1.0, len(candidate_skills) / 12.0)

    # 5. Experience normalized (cap at 24 months for entry level)
    experience_normalized = min(1.0, max(0, experience_months) / 24.0)

    # 6. Degree score
    degree_score = 0.20
    if education_level:
        for deg_name, weight in DEGREE_WEIGHTS.items():
            if deg_name.lower() in education_level.lower():
                degree_score = weight
                break

    # 7. GitHub portfolio
    has_github = 1.0 if github_url and github_url.strip() else 0.0

    # 8. LinkedIn profile
    has_linkedin = 1.0 if linkedin_url and linkedin_url.strip() else 0.0

    feature_vector = np.array([
        core_coverage,
        core_avg_prof,
        secondary_coverage,
        total_skills_count,
        experience_normalized,
        degree_score,
        has_github,
        has_linkedin,
        role_code,
    ], dtype=np.float64)

    raw_features = {
        "core_coverage": round(core_coverage, 4),
        "core_avg_proficiency": round(core_avg_prof, 4),
        "secondary_coverage": round(secondary_coverage, 4),
        "total_skills_count": len(candidate_skills),
        "experience_months": experience_months,
        "degree_score": round(degree_score, 2),
        "has_github": bool(has_github),
        "has_linkedin": bool(has_linkedin),
    }

    return feature_vector, raw_features, matching_core, missing_core, supporting_skills


def _train_and_save_benchmark_model() -> Dict[str, Any]:
    """
    Generate synthetic candidate benchmark dataset, train Scikit-learn models,
    evaluate on held-out test set, and persist trained models and metrics.
    """
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    rng = np.random.RandomState(42)
    N = 1800

    core_cov = rng.beta(2.5, 2.0, size=N)
    core_prof = rng.uniform(0.2, 1.0, size=N)
    sec_cov = rng.beta(2.0, 2.0, size=N)
    tot_skills = rng.uniform(0.1, 1.0, size=N)
    exp_norm = rng.exponential(scale=0.25, size=N).clip(0, 1.0)
    degree = rng.choice([0.2, 0.5, 0.75, 0.85, 1.0], size=N, p=[0.1, 0.15, 0.35, 0.30, 0.10])
    github = rng.binomial(1, 0.55, size=N).astype(float)
    linkedin = rng.binomial(1, 0.65, size=N).astype(float)
    role_code = rng.choice(len(SUPPORTED_ROLES), size=N)

    X = np.column_stack([
        core_cov,
        core_prof,
        sec_cov,
        tot_skills,
        exp_norm,
        degree,
        github,
        linkedin,
        role_code,
    ])

    # Ground-truth continuous readiness score with realistic noise
    true_score = (
        100.0 * (
            0.35 * core_cov +
            0.15 * core_prof +
            0.12 * sec_cov +
            0.08 * tot_skills +
            0.15 * exp_norm +
            0.08 * degree +
            0.04 * github +
            0.03 * linkedin
        ) + rng.normal(0, 1.5, size=N)
    ).clip(10.0, 96.0)

    # Discretize into balanced readiness classes
    cats = []
    for s in true_score:
        if s >= 68.0:
            cats.append("High Readiness")
        elif s >= 45.0:
            cats.append("Moderate Readiness")
        else:
            cats.append("Needs Development")
    cats = np.array(cats)

    X_train, X_test, y_s_train, y_s_test, y_c_train, y_c_test = train_test_split(
        X, true_score, cats, test_size=0.2, random_state=42, stratify=cats
    )

    reg = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
    reg.fit(X_train, y_s_train)
    pred_s = reg.predict(X_test)
    r2 = float(r2_score(y_s_test, pred_s))
    mae = float(mean_absolute_error(y_s_test, pred_s))

    clf = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    clf.fit(X_train, y_c_train)
    pred_c = clf.predict(X_test)
    acc = float(accuracy_score(y_c_test, pred_c))
    f1 = float(f1_score(y_c_test, pred_c, average="macro"))

    models_bundle = {
        "regressor": reg,
        "classifier": clf,
        "feature_names": FEATURE_NAMES,
    }
    joblib.dump(models_bundle, MODEL_PATH)

    metadata = {
        "model_name": "CareerReadinessRandomForest",
        "model_version": "rf_v1.0",
        "algorithm": "RandomForest Ensemble (Classifier + Regressor)",
        "supported_roles": SUPPORTED_ROLES,
        "features": FEATURE_NAMES,
        "metrics": {
            "accuracy": round(acc, 4),
            "macro_f1": round(f1, 4),
            "r2_score": round(r2, 4),
            "mae": round(mae, 2),
            "train_samples": len(X_train),
            "test_samples": len(X_test),
        },
        "dataset_description": (
            "Reproducible synthetic benchmark dataset (N=1,800) generated with deterministic distribution "
            "parameters simulating entry-level student skill profiles, academic backgrounds, and experience tiers."
        ),
        "disclaimer": (
            "The model provides a baseline educational estimate of career readiness for entry-level roles. "
            "It does not represent actual hiring outcomes, commercial applicant tracking rankings, or interview guarantees."
        ),
    }

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    logger.info("Trained and saved readiness ML model. R2: %.4f, Acc: %.4f", r2, acc)
    return metadata


def get_model_bundle() -> Tuple[Any, Dict[str, Any]]:
    """
    Load cached models and metadata, training on the fly if artifacts do not yet exist
    or if the supported roles count has expanded.
    """
    needs_train = False
    if not MODEL_PATH.exists() or not METADATA_PATH.exists():
        needs_train = True
    else:
        try:
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                meta = json.load(f)
            if len(meta.get("supported_roles", [])) < len(SUPPORTED_ROLES):
                needs_train = True
        except Exception:
            needs_train = True

    if needs_train:
        _train_and_save_benchmark_model()

    bundle = joblib.load(MODEL_PATH)
    with open(METADATA_PATH, "r", encoding="utf-8") as f:
        metadata = json.load(f)

    return bundle, metadata


def assess_readiness(
    profile_skills: List[Dict[str, Any]],
    target_role: str,
    experience_months: int = 0,
    education_level: Optional[str] = None,
    github_url: Optional[str] = None,
    linkedin_url: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Run Scikit-learn inference to produce calibrated readiness score, category, and dimensional breakdowns.
    """
    if target_role not in ROLE_COMPETENCIES:
        target_role = "Data Analyst"

    feat_vector, raw_features, matching_core, missing_core, supporting = extract_features_from_profile(
        profile_skills=profile_skills,
        target_role=target_role,
        experience_months=experience_months,
        education_level=education_level,
        github_url=github_url,
        linkedin_url=linkedin_url,
    )

    bundle, metadata = get_model_bundle()
    regressor = bundle["regressor"]
    classifier = bundle["classifier"]

    # Predict readiness score (0-100)
    pred_score = float(regressor.predict([feat_vector])[0])
    pred_score = round(max(5.0, min(98.0, pred_score)), 1)

    # Predict readiness category
    pred_category = str(classifier.predict([feat_vector])[0])

    # Dimensional scores (0-100)
    tech_score = round(100.0 * (0.7 * raw_features["core_coverage"] + 0.3 * raw_features["secondary_coverage"]), 1)
    exp_score = round(100.0 * raw_features["experience_months"] / 24.0, 1) if raw_features["experience_months"] <= 24 else 100.0
    edu_score = round(100.0 * raw_features["degree_score"], 1)
    port_score = round(100.0 * (0.6 * (1.0 if raw_features["has_github"] else 0.0) + 0.4 * (1.0 if raw_features["has_linkedin"] else 0.0)), 1)

    dimension_scores = {
        "technical_skills": min(100.0, max(0.0, tech_score)),
        "experience": min(100.0, max(0.0, exp_score)),
        "education": min(100.0, max(0.0, edu_score)),
        "portfolio": min(100.0, max(0.0, port_score)),
    }

    limitations = [
        "Benchmark estimates are derived from an educational Scikit-learn model and do not guarantee hiring or job placement.",
        "Skill proficiency is based on self-reported levels and resume keywords; practical code quality is not verified.",
        "Project depth, communication in live interviews, and behavioral suitability are not measured by this model.",
    ]

    return {
        "target_role": target_role,
        "readiness_score": pred_score,
        "readiness_category": pred_category,
        "model_version": metadata.get("model_version", "rf_v1.0"),
        "dimension_scores": dimension_scores,
        "matching_core_skills": matching_core,
        "missing_core_skills": missing_core,
        "supporting_skills": supporting,
        "features_snapshot": raw_features,
        "limitations": limitations,
        "model_metadata": metadata,
    }

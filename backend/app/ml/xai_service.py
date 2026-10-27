import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
import lime.lime_tabular
import numpy as np
import shap

from app.ml.readiness_model import (
    FEATURE_NAMES,
    ROLE_COMPETENCIES,
    assess_readiness,
    extract_features_from_profile,
    get_model_bundle,
)

logger = logging.getLogger(__name__)

FEATURE_METADATA: Dict[str, Dict[str, str]] = {
    "core_coverage": {
        "label": "Core Skills Coverage",
        "description": "Proportion of mandatory benchmark competencies for the role possessed by the student.",
        "category": "Technical Competency",
    },
    "core_avg_proficiency": {
        "label": "Core Average Proficiency",
        "description": "Average skill proficiency level (normalized 0.2 to 1.0) across possessed core skills.",
        "category": "Technical Competency",
    },
    "secondary_coverage": {
        "label": "Secondary Skills Coverage",
        "description": "Proportion of complementary frameworks, tools, and supporting competencies possessed.",
        "category": "Technical Competency",
    },
    "total_skills_count": {
        "label": "Total Skills Count",
        "description": "Breadth of complete technical skill inventory (normalized against 12-skill ceiling).",
        "category": "Skill Breadth",
    },
    "experience_normalized": {
        "label": "Practical Experience",
        "description": "Verified internship and work experience (normalized against 24-month entry-level window).",
        "category": "Experience",
    },
    "degree_score": {
        "label": "Academic Qualification Tier",
        "description": "Curriculum relevance weight based on computer science / IT degree specialization.",
        "category": "Education",
    },
    "has_github": {
        "label": "GitHub Code Portfolio",
        "description": "Binary indicator for public code repositories and software projects.",
        "category": "Portfolio",
    },
    "has_linkedin": {
        "label": "Professional Profile (LinkedIn)",
        "description": "Binary indicator for complete professional networking profile.",
        "category": "Portfolio",
    },
    "role_code": {
        "label": "Target Role Baseline",
        "description": "Categorical baseline offset for specific role complexity (Data Analyst, Python Dev, ML Engineer).",
        "category": "Target Role",
    },
}

# Cached singleton explainers to ensure low-latency inference
_CACHED_TREE_EXPLAINER: Optional[shap.TreeExplainer] = None
_CACHED_LIME_EXPLAINER: Optional[lime.lime_tabular.LimeTabularExplainer] = None
_CACHED_BACKGROUND_DATA: Optional[np.ndarray] = None


def _get_background_dataset() -> np.ndarray:
    """
    Generate or return deterministic background dataset matching the benchmark training distribution.
    Used by LIME for local perturbation and SHAP for background statistics.
    """
    global _CACHED_BACKGROUND_DATA
    if _CACHED_BACKGROUND_DATA is not None:
        return _CACHED_BACKGROUND_DATA

    rng = np.random.RandomState(42)
    N = 300
    core_cov = rng.beta(2.5, 2.0, size=N)
    core_prof = rng.uniform(0.2, 1.0, size=N)
    sec_cov = rng.beta(2.0, 2.0, size=N)
    tot_skills = rng.uniform(0.1, 1.0, size=N)
    exp_norm = rng.exponential(scale=0.25, size=N).clip(0, 1.0)
    degree = rng.choice([0.2, 0.5, 0.75, 0.85, 1.0], size=N, p=[0.1, 0.15, 0.35, 0.30, 0.10])
    github = rng.binomial(1, 0.55, size=N).astype(float)
    linkedin = rng.binomial(1, 0.65, size=N).astype(float)
    role_code = rng.choice([0, 1, 2], size=N).astype(float)

    _CACHED_BACKGROUND_DATA = np.column_stack([
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
    return _CACHED_BACKGROUND_DATA


def get_tree_explainer() -> shap.TreeExplainer:
    """Returns cached SHAP TreeExplainer fitted on actual RandomForestRegressor."""
    global _CACHED_TREE_EXPLAINER
    if _CACHED_TREE_EXPLAINER is None:
        bundle, _ = get_model_bundle()
        regressor = bundle["regressor"]
        _CACHED_TREE_EXPLAINER = shap.TreeExplainer(regressor)
    return _CACHED_TREE_EXPLAINER


def get_lime_explainer() -> lime.lime_tabular.LimeTabularExplainer:
    """Returns cached LimeTabularExplainer configured for tabular regression."""
    global _CACHED_LIME_EXPLAINER
    if _CACHED_LIME_EXPLAINER is None:
        bg_data = _get_background_dataset()
        _CACHED_LIME_EXPLAINER = lime.lime_tabular.LimeTabularExplainer(
            training_data=bg_data,
            feature_names=FEATURE_NAMES,
            mode="regression",
            random_state=42,
            verbose=False,
        )
    return _CACHED_LIME_EXPLAINER


def get_global_model_explanation() -> Dict[str, Any]:
    """
    Computes global feature importances from the actual model:
    Gini importance from RandomForest, and mean absolute SHAP values across background samples.
    """
    bundle, metadata = get_model_bundle()
    regressor = bundle["regressor"]
    bg_data = _get_background_dataset()

    explainer = get_tree_explainer()
    bg_shap = explainer.shap_values(bg_data)
    mean_abs_shap = np.mean(np.abs(bg_shap), axis=0)

    importances = regressor.feature_importances_

    items: List[Dict[str, Any]] = []
    for idx, fname in enumerate(FEATURE_NAMES):
        meta = FEATURE_METADATA.get(fname, {"label": fname, "category": "General"})
        items.append({
            "feature_name": fname,
            "feature_label": meta["label"],
            "importance_score": round(float(importances[idx]), 4),
            "mean_abs_shap": round(float(mean_abs_shap[idx]), 4),
            "category": meta["category"],
        })

    # Sort descending by Gini importance
    items.sort(key=lambda x: x["importance_score"], reverse=True)
    for rank, item in enumerate(items, start=1):
        item["rank"] = rank

    raw_base = explainer.expected_value
    base_val = float(raw_base[0]) if hasattr(raw_base, "__len__") else float(raw_base)

    methodology_notes = {
        "tree_explainer": (
            "SHAP TreeExplainer computes exact additive Shapley values based on cooperative game theory, "
            "fairly distributing the prediction margin among all features."
        ),
        "lime_tabular": (
            "LIME trains an interpretable local surrogate ridge regressor on perturbed instances around "
            "the candidate's profile to explain the local decision boundary."
        ),
        "gini_importance": (
            "RandomForest feature_importances_ represents mean decrease in impurity (MDI) across all decision trees."
        ),
    }

    limitations = [
        "Global feature importance reflects average influence across the synthetic benchmark dataset and may not describe an individual student's specific bottlenecks.",
        "MDI (Gini importance) can exhibit bias toward continuous features over discrete indicators.",
        "Feature attributions are mathematical associations within the model, not real-world causal determinants of employment offers.",
    ]

    return {
        "model_name": metadata.get("model_name", "CareerReadinessRandomForest"),
        "model_version": metadata.get("model_version", "rf_v1.0"),
        "algorithm": metadata.get("algorithm", "RandomForest Ensemble (Classifier + Regressor)"),
        "base_value": round(base_val, 2),
        "global_importances": items,
        "methodology_notes": methodology_notes,
        "limitations": limitations,
    }


def explain_student_assessment(
    profile_skills: List[Dict[str, Any]],
    target_role: str,
    experience_months: int = 0,
    education_level: Optional[str] = None,
    github_url: Optional[str] = None,
    linkedin_url: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Generate unified SHAP and LIME explanations for an individual student's assessment.
    Verifies that the SHAP explanation faithfully reconstructs the actual model prediction.
    """
    if target_role not in ROLE_COMPETENCIES:
        target_role = "Data Analyst"

    # 1. Extract feature vector with exact same preprocessing as prediction pipeline
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

    # 2. Actual model predictions
    actual_pred_score = float(regressor.predict([feat_vector])[0])
    actual_category = str(classifier.predict([feat_vector])[0])

    # 3. SHAP TreeExplainer calculation
    tree_explainer = get_tree_explainer()
    shap_vals = tree_explainer.shap_values(feat_vector)

    raw_base = tree_explainer.expected_value
    base_val = float(raw_base[0]) if hasattr(raw_base, "__len__") else float(raw_base)

    sum_shap = float(np.sum(shap_vals))
    reconstructed_score = round(base_val + sum_shap, 4)
    actual_pred_rounded = round(actual_pred_score, 4)
    discrepancy = round(abs(actual_pred_rounded - reconstructed_score), 5)
    is_faithful = discrepancy < 0.05

    # Build SHAP feature attribution items
    shap_attributions: List[Dict[str, Any]] = []
    positive_contributors: List[Dict[str, Any]] = []
    negative_contributors: List[Dict[str, Any]] = []

    for idx, fname in enumerate(FEATURE_NAMES):
        meta = FEATURE_METADATA.get(fname, {"label": fname, "description": fname, "category": "General"})
        sv = float(shap_vals[idx])
        val = float(feat_vector[idx])

        if sv > 0.05:
            impact = "positive"
        elif sv < -0.05:
            impact = "negative"
        else:
            impact = "neutral"

        item = {
            "feature_name": fname,
            "feature_label": meta["label"],
            "feature_value": round(val, 4),
            "shap_value": round(sv, 2),
            "impact": impact,
            "category": meta["category"],
            "description": meta["description"],
        }
        shap_attributions.append(item)

        if impact == "positive":
            positive_contributors.append(item)
        elif impact == "negative":
            negative_contributors.append(item)

    # Sort positive contributors descending by points added
    positive_contributors.sort(key=lambda x: x["shap_value"], reverse=True)
    # Sort negative contributors ascending by points deducted (most damaging first)
    negative_contributors.sort(key=lambda x: x["shap_value"])

    # 4. LIME Local Tabular Explanation
    lime_explainer = get_lime_explainer()
    exp = lime_explainer.explain_instance(
        data_row=feat_vector,
        predict_fn=regressor.predict,
        num_features=len(FEATURE_NAMES),
    )

    lime_items: List[Dict[str, Any]] = []
    for cond_str, weight in exp.as_list():
        # Match condition to feature name
        matched_fname = "unknown"
        for fname in FEATURE_NAMES:
            if fname in cond_str:
                matched_fname = fname
                break

        meta = FEATURE_METADATA.get(matched_fname, {"label": matched_fname})
        lime_items.append({
            "feature_name": matched_fname,
            "feature_label": meta.get("label", matched_fname),
            "weight": round(float(weight), 2),
            "condition": cond_str,
            "impact": "positive" if weight >= 0 else "negative",
        })

    # 5. Global feature importances
    global_xai = get_global_model_explanation()

    limitations = [
        "Attributions are local mathematical linearizations (LIME) and tree path attributions (SHAP) of the Scikit-learn model, not human recruiter appraisals.",
        "A positive SHAP score indicates the feature increased the model's estimate above the benchmark baseline, not that this skill alone qualifies the candidate.",
        "Correlation within synthetic training distributions does not establish real-world causality: updating profile text without actual mastery will not yield job offers.",
    ]

    return {
        "target_role": target_role,
        "predicted_score": round(max(5.0, min(98.0, actual_pred_score)), 1),
        "predicted_category": actual_category,
        "model_version": metadata.get("model_version", "rf_v1.0"),
        "base_value": round(base_val, 2),
        "features_snapshot": raw_features,
        "shap_attributions": shap_attributions,
        "positive_contributors": positive_contributors,
        "negative_contributors": negative_contributors,
        "lime_attributions": lime_items,
        "global_importances": global_xai["global_importances"],
        "fidelity_check": {
            "base_value": round(base_val, 2),
            "sum_shap": round(sum_shap, 2),
            "reconstructed_score": round(reconstructed_score, 2),
            "actual_prediction": round(actual_pred_score, 2),
            "discrepancy": discrepancy,
            "is_faithful": is_faithful,
        },
        "causal_disclaimer": (
            "Attribution values (SHAP and LIME) explain how the mathematical model weighted individual "
            "features to produce its internal score. They represent mathematical model sensitivity, NOT real-world "
            "causal mechanisms. Adding a keyword to a profile does not guarantee an interview or cause employment."
        ),
        "limitations": limitations,
        "created_at": datetime.now(timezone.utc),
    }

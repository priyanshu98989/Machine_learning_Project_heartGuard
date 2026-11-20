import os
from functools import lru_cache

import joblib
import numpy as np

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(SCRIPT_DIR, "models")
MODEL_PATH = os.path.join(SCRIPT_DIR, "model.joblib")
PIPELINE_PATH = os.path.join(SCRIPT_DIR, "pipeline.joblib")
METRICS_PATH = os.path.join(SCRIPT_DIR, "metrics.joblib")

HIGH_RISK_THRESHOLD = 0.7
MODERATE_RISK_THRESHOLD = 0.4

ALIAS_ID_TO_NAME = {
    "logistic": "Logistic Regression",
    "random_forest": "Random Forest",
    "svm": "Support Vector Machine",
    "gradient_boost": "Gradient Boosting",
    "knn": "K-Nearest Neighbors",
}


@lru_cache(maxsize=1)
def load_base_artifacts():
    pipeline = joblib.load(PIPELINE_PATH)
    metrics = joblib.load(METRICS_PATH)
    return pipeline, metrics


@lru_cache(maxsize=8)
def load_model_for(alias: str):
    """Load a specific model by alias id. Falls back to the default best model."""
    path = os.path.join(MODELS_DIR, f"{alias}.joblib")
    if os.path.exists(path):
        return joblib.load(path)
    return joblib.load(MODEL_PATH)


def get_pipeline_and_metrics():
    return load_base_artifacts()


def _resolve_model_id(model: str | None) -> str:
    if not model or model == "best":
        return "best"
    if model in ALIAS_ID_TO_NAME:
        return model
    return "best"


def predict_heart_disease(features: list, model: str | None = None) -> dict:
    """Predict heart disease risk using a selected model (or best by default)."""
    pipeline, metrics = get_pipeline_and_metrics()
    model_id = _resolve_model_id(model)
    estimator = load_model_for(model_id)

    if model_id == "best":
        model_name = metrics.get("best_model", "Unknown")
    else:
        model_name = ALIAS_ID_TO_NAME.get(model_id, model_id)

    X = np.array(features).reshape(1, -1)
    X_scaled = pipeline.transform(X)

    probability = float(estimator.predict_proba(X_scaled)[0][1])

    if probability >= HIGH_RISK_THRESHOLD:
        risk_level = "High Risk"
    elif probability >= MODERATE_RISK_THRESHOLD:
        risk_level = "Moderate Risk"
    else:
        risk_level = "Low Risk"

    return {
        "probability": round(probability, 4),
        "risk_level": risk_level,
        "prediction": int(probability >= 0.5),
        "model_name": model_name,
        "model_id": model_id,
    }


def preload():
    """Load model artifacts and derived values once at startup."""
    get_pipeline_and_metrics()
    load_model_for("best")
    get_feature_importance()


def clear_model_cache():
    """Drop cached artifacts so the next call reloads from disk."""
    load_base_artifacts.cache_clear()
    load_model_for.cache_clear()
    get_feature_importance.cache_clear()


@lru_cache(maxsize=1)
def get_feature_importance() -> dict:
    _, metrics = get_pipeline_and_metrics()
    estimator = load_model_for("best")
    feature_names = metrics.get("feature_names", [])

    if hasattr(estimator, "feature_importances_"):
        importances = estimator.feature_importances_
    elif hasattr(estimator, "coef_"):
        importances = np.abs(estimator.coef_[0])
    else:
        return {}

    importance_dict = {}
    for i, name in enumerate(feature_names):
        if i < len(importances):
            importance_dict[name] = round(float(importances[i]), 4)

    total = sum(importance_dict.values())
    if total > 0:
        importance_dict = {k: round(v / total, 4) for k, v in importance_dict.items()}

    return dict(sorted(importance_dict.items(), key=lambda x: x[1], reverse=True))


def get_model_metrics() -> dict:
    _, metrics = get_pipeline_and_metrics()
    return metrics


def is_model_loaded() -> bool:
    try:
        get_pipeline_and_metrics()
        return True
    except Exception:
        return False

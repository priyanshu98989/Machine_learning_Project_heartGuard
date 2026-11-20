import os
import sys
import warnings

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.svm import SVC

warnings.filterwarnings("ignore")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(SCRIPT_DIR, "..", "data", "heart.csv")
MODEL_DIR = os.path.join(SCRIPT_DIR, "models")
MODEL_PATH = os.path.join(SCRIPT_DIR, "model.joblib")
PIPELINE_PATH = os.path.join(SCRIPT_DIR, "pipeline.joblib")
METRICS_PATH = os.path.join(SCRIPT_DIR, "metrics.joblib")
FEATURE_NAMES_PATH = os.path.join(SCRIPT_DIR, "feature_names.joblib")

MODEL_ALIASES = {
    "logistic": "Logistic Regression",
    "random_forest": "Random Forest",
    "svm": "Support Vector Machine",
    "gradient_boost": "Gradient Boosting",
    "knn": "K-Nearest Neighbors",
    "best": "best",
}


def get_available_models() -> list[dict]:
    return [
        {"id": "logistic", "name": "Logistic Regression"},
        {"id": "random_forest", "name": "Random Forest"},
        {"id": "svm", "name": "Support Vector Machine"},
        {"id": "gradient_boost", "name": "Gradient Boosting"},
        {"id": "knn", "name": "K-Nearest Neighbors"},
    ]


def load_data():
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(
            f"Dataset not found at {DATA_PATH}. "
            "Place your heart.csv file in the backend/data/ directory."
        )

    df = pd.read_csv(DATA_PATH)
    print(f"Dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")
    print(f"Columns: {list(df.columns)}")
    return df


def preprocess(df):
    df = df.copy()

    target_col = None
    for col in ["target", "condition", "num", "HeartDisease", "heart disease"]:
        if col in df.columns:
            target_col = col
            break

    if target_col is None:
        target_col = df.columns[-1]
        print(f"No standard target column found. Using last column: '{target_col}'")

    print(f"Target column: '{target_col}'")

    df[target_col] = df[target_col].apply(lambda x: 1 if x > 0 else 0)

    y = df[target_col].values
    X = df.drop(columns=[target_col])

    cat_cols = X.select_dtypes(include=["object", "category"]).columns.tolist()
    num_cols = X.select_dtypes(include=["int64", "float64"]).columns.tolist()

    label_encoders = {}
    for col in cat_cols:
        le = LabelEncoder()
        X[col] = le.fit_transform(X[col].astype(str))
        label_encoders[col] = le

    X = X.fillna(X.median(numeric_only=True))

    feature_names = list(X.columns)
    print(f"Features ({len(feature_names)}): {feature_names}")
    print(f"Categorical encoded: {cat_cols}")
    print(f"Class distribution: 0={sum(y==0)}, 1={sum(y==1)}")

    return X.values, y, feature_names, label_encoders


def train_and_evaluate(X_train, X_test, y_train, y_test):
    models = {
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1),
        "Support Vector Machine": SVC(probability=True, random_state=42),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, random_state=42),
        "K-Nearest Neighbors": KNeighborsClassifier(n_neighbors=7),
    }

    results = {}
    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        y_proba = model.predict_proba(X_test)[:, 1]

        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)
        f1 = f1_score(y_test, y_pred, zero_division=0)
        auc = roc_auc_score(y_test, y_proba)

        results[name] = {
            "model": model,
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1": round(f1, 4),
            "roc_auc": round(auc, 4),
        }

        print(f"\n--- {name} ---")
        print(f"Accuracy:  {acc:.4f}")
        print(f"Precision: {prec:.4f}")
        print(f"Recall:    {rec:.4f}")
        print(f"F1-Score:  {f1:.4f}")
        print(f"ROC-AUC:   {auc:.4f}")
        print(classification_report(y_test, y_pred, target_names=["Low Risk", "High Risk"]))

    return results


def retrain() -> dict:
    """Retrain all models from the dataset, persist artifacts, and return metrics."""
    df = load_data()
    X, y, feature_names, label_encoders = preprocess(df)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\nTrain: {X_train.shape[0]} samples | Test: {X_test.shape[0]} samples")

    results = train_and_evaluate(X_train, X_test, y_train, y_test)

    best_name = max(results, key=lambda k: results[k]["roc_auc"])
    best_result = results[best_name]
    best_model = best_result["model"]

    print(f"\n{'=' * 60}")
    print(f"BEST MODEL: {best_name} (ROC-AUC: {best_result['roc_auc']})")
    print(f"{'=' * 60}")

    scaler = StandardScaler()
    scaler.fit(X_train)

    pipeline = Pipeline([
        ("scaler", scaler),
    ])

    os.makedirs(MODEL_DIR, exist_ok=True)
    id_to_name = {v: k for k, v in MODEL_ALIASES.items() if v != "best"}

    for name, result in results.items():
        model_id = id_to_name.get(name, name.lower().replace(" ", "_"))
        joblib.dump(result["model"], os.path.join(MODEL_DIR, f"{model_id}.joblib"))

    joblib.dump(best_model, MODEL_PATH)
    joblib.dump(pipeline, PIPELINE_PATH)

    metrics = {name: {k: v for k, v in vals.items() if k != "model"} for name, vals in results.items()}
    metrics["best_model"] = best_name
    metrics["feature_names"] = feature_names
    metrics["label_encoders"] = {k: v.classes_.tolist() for k, v in label_encoders.items()}
    metrics["available_models"] = get_available_models()

    joblib.dump(metrics, METRICS_PATH)
    joblib.dump(feature_names, FEATURE_NAMES_PATH)

    print(f"\nModel saved to: {MODEL_PATH}")
    print(f"All models saved to: {MODEL_DIR}")
    print(f"Pipeline saved to: {PIPELINE_PATH}")
    print(f"Metrics saved to: {METRICS_PATH}")

    return metrics


def main():
    print("=" * 60)
    print("Heart Disease Model Training")
    print("=" * 60)
    try:
        metrics = retrain()
    except Exception as exc:
        print(f"\nERROR: {exc}")
        sys.exit(1)
    print(f"\nDone. Best model: {metrics.get('best_model')}")


if __name__ == "__main__":
    main()

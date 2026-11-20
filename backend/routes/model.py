from fastapi import APIRouter, HTTPException

from ml.predict import (
    clear_model_cache,
    get_feature_importance,
    get_model_metrics,
    is_model_loaded,
    preload,
)
from ml.train_model import retrain

router = APIRouter(prefix="/api/model", tags=["Model"])


@router.get("/metrics")
def model_metrics():
    try:
        metrics = get_model_metrics()
        return {
            "loaded": is_model_loaded(),
            "best_model": metrics.get("best_model", "Unknown"),
            "feature_names": metrics.get("feature_names", []),
            "available_models": metrics.get("available_models", []),
            "metrics": {
                name: {
                    k: v
                    for k, v in vals.items()
                    if k not in ("best_model", "feature_names", "label_encoders", "available_models")
                }
                for name, vals in metrics.items()
                if isinstance(vals, dict) and "roc_auc" in vals
            },
            "feature_importance": get_feature_importance(),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model not available: {str(e)}")


@router.post("/retrain")
def retrain_model():
    try:
        metrics = retrain()
        clear_model_cache()
        preload()
        best = metrics.get("best_model", "Unknown")
        return {
            "success": True,
            "best_model": best,
            "message": f"Model retrained successfully. Best model: {best}",
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retraining failed: {str(e)}")
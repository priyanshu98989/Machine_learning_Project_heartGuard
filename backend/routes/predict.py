import io

import pandas as pd
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import ValidationError
from sqlalchemy.orm import Session

from database import get_db
from schemas import (
    BulkPredictionResponse,
    BulkPredictionRowError,
    PredictionRequest,
    PredictionResponse,
)
from services.prediction_service import make_prediction

router = APIRouter(prefix="/api", tags=["Prediction"])

REQUIRED_COLUMNS = [
    "age", "sex", "cp", "trestbps", "chol", "fbs", "restecg",
    "thalach", "exang", "oldpeak", "slope", "ca", "thal",
]


@router.post("/predict", response_model=PredictionResponse)
def predict(request: PredictionRequest, db: Session = Depends(get_db)):
    try:
        data = request.model_dump()
        result = make_prediction(db, data)
        return PredictionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/predict/bulk", response_model=BulkPredictionResponse)
def predict_bulk(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400, detail="Please upload a CSV file (.csv)"
        )

    try:
        contents = file.file.read().decode("utf-8-sig")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read file: {str(e)}")

    try:
        df = pd.read_csv(io.StringIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid CSV: {str(e)}")

    df.columns = [str(c).strip().lower() for c in df.columns]

    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {', '.join(missing)}. Required: {', '.join(REQUIRED_COLUMNS)}",
        )

    results = []
    errors = []
    for idx, row in df.iterrows():
        try:
            data = row.to_dict()
            data.pop("target", None)
            if "patient_name" not in data or pd.isna(data.get("patient_name")):
                data["patient_name"] = f"Patient {idx + 1}"

            request = PredictionRequest(**data)
            payload = request.model_dump()
            try:
                result = make_prediction(db, payload)
                results.append(PredictionResponse(**result))
            except Exception as e:
                errors.append(
                    BulkPredictionRowError(row=int(idx) + 2, error=f"prediction: {str(e)}")
                )
        except ValidationError as e:
            errors.append(
                BulkPredictionRowError(
                    row=int(idx) + 2, error="; ".join(err["msg"] for err in e.errors())
                )
            )
        except Exception as e:
            errors.append(BulkPredictionRowError(row=int(idx) + 2, error=str(e)))

    high = sum(1 for r in results if r.risk_level == "High Risk")
    moderate = sum(1 for r in results if r.risk_level == "Moderate Risk")
    low = sum(1 for r in results if r.risk_level == "Low Risk")

    return BulkPredictionResponse(
        total=len(df),
        high_risk_count=high,
        moderate_risk_count=moderate,
        low_risk_count=low,
        success_count=len(results),
        error_count=len(errors),
        results=results,
        errors=errors,
    )

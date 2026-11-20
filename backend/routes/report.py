from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from database import get_db
from ml.predict import get_feature_importance, get_model_metrics
from models import PredictionHistory
from services.email_service import email_configured
from services.pdf_service import generate_report_bytes

router = APIRouter(prefix="/api", tags=["Report"])


@router.get("/report/{prediction_id}")
def download_report(prediction_id: int, db: Session = Depends(get_db)):
    record = db.query(PredictionHistory).filter(PredictionHistory.id == prediction_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Prediction not found")

    importance = get_feature_importance()
    pdf_bytes = generate_report_bytes(record, importance)

    filename = f"heartguard_report_{record.patient_name.replace(' ', '_')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/models")
def list_models():
    try:
        metrics = get_model_metrics()
        available = metrics.get("available_models", [])
        best = metrics.get("best_model", "Unknown")
        return {"models": available, "best_model": best}
    except Exception:
        return {"models": [], "best_model": "Unknown"}


@router.get("/email/status")
def email_status():
    return {"configured": email_configured()}

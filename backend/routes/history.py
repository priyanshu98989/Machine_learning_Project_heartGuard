from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import PredictionHistory
from schemas import PredictionRecord

router = APIRouter(prefix="/api", tags=["History"])


@router.get("/history", response_model=list[PredictionRecord])
def get_history(
    limit: int = 50,
    offset: int = 0,
    risk_level: str = None,
    q: str = None,
    db: Session = Depends(get_db),
):
    query = db.query(PredictionHistory).order_by(PredictionHistory.created_at.desc())

    if risk_level:
        query = query.filter(PredictionHistory.risk_level == risk_level)

    if q and q.strip():
        query = query.filter(PredictionHistory.patient_name.ilike(f"%{q.strip()}%"))

    records = query.offset(offset).limit(limit).all()

    return [
        PredictionRecord(
            id=r.id,
            patient_name=r.patient_name,
            age=r.age,
            sex=r.sex,
            cp=r.cp,
            trestbps=r.trestbps,
            chol=r.chol,
            fbs=r.fbs,
            restecg=r.restecg,
            thalach=r.thalach,
            exang=r.exang,
            oldpeak=r.oldpeak,
            slope=r.slope,
            ca=r.ca,
            thal=r.thal,
            risk_level=r.risk_level,
            probability=r.probability,
            model_used=r.model_used,
            created_at=r.created_at.isoformat() if r.created_at else "",
        )
        for r in records
    ]


@router.delete("/history/{prediction_id}")
def delete_record(prediction_id: int, db: Session = Depends(get_db)):
    record = (
        db.query(PredictionHistory)
        .filter(PredictionHistory.id == prediction_id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="Prediction not found")

    db.delete(record)
    db.commit()
    return {"deleted": prediction_id, "status": "success"}

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from models import PredictionHistory
from schemas import CompareItem, CompareResponse

router = APIRouter(prefix="/api", tags=["Compare"])


class CompareRequest(BaseModel):
    ids: list[int] = Field(..., min_length=2, description="At least two prediction ids")


@router.post("/compare", response_model=CompareResponse)
def compare(payload: CompareRequest, db: Session = Depends(get_db)):
    if len(payload.ids) < 2:
        raise HTTPException(status_code=400, detail="Select at least two predictions to compare")

    records = (
        db.query(PredictionHistory)
        .filter(PredictionHistory.id.in_(payload.ids))
        .all()
    )
    if len(records) != len(set(payload.ids)):
        raise HTTPException(status_code=404, detail="Some prediction records not found")

    items = [
        CompareItem(
            id=r.id,
            patient_name=r.patient_name,
            age=r.age,
            sex=r.sex,
            risk_level=r.risk_level,
            probability=r.probability,
            model_used=r.model_used,
            created_at=r.created_at.isoformat() if r.created_at else "",
        )
        for r in records
    ]

    items.sort(key=lambda x: x.probability, reverse=True)

    summary = {
        "count": len(items),
        "highest_risk": items[0].risk_level,
        "highest_probability": items[0].probability,
        "lowest_risk": items[-1].risk_level,
        "lowest_probability": items[-1].probability,
        "average_probability": round(
            sum(x.probability for x in items) / len(items), 4
        ),
    }

    return CompareResponse(records=items, summary=summary)

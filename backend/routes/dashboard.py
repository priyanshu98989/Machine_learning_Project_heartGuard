from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import PredictionHistory
from schemas import DashboardStats

router = APIRouter(prefix="/api", tags=["Dashboard"])

TREND_LIMIT = 200

AGE_BINS = [
    (18, 30, "18-30"),
    (31, 40, "31-40"),
    (41, 50, "41-50"),
    (51, 60, "51-60"),
    (61, 70, "61-70"),
    (71, 120, "70+"),
]


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(db: Session = Depends(get_db)):
    total, avg_prob = (
        db.query(
            func.count(PredictionHistory.id),
            func.coalesce(func.avg(PredictionHistory.probability), 0.0),
        ).first()
    )

    risk_counts = dict(
        db.query(PredictionHistory.risk_level, func.count(PredictionHistory.id))
        .group_by(PredictionHistory.risk_level)
        .all()
    )

    high_risk = risk_counts.get("High Risk", 0)
    moderate_risk = risk_counts.get("Moderate Risk", 0)
    low_risk = risk_counts.get("Low Risk", 0)

    risk_distribution = {
        "High Risk": high_risk,
        "Moderate Risk": moderate_risk,
        "Low Risk": low_risk,
    }

    age_counts = dict(
        db.query(PredictionHistory.age, func.count(PredictionHistory.id))
        .group_by(PredictionHistory.age)
        .all()
    )
    age_distribution = [
        {
            "age_group": label,
            "count": sum(c for a, c in age_counts.items() if low <= a <= high),
        }
        for (low, high, label) in AGE_BINS
    ]

    all_probs = (
        db.query(PredictionHistory.probability, PredictionHistory.created_at)
        .order_by(PredictionHistory.created_at.desc())
        .limit(TREND_LIMIT)
        .all()
    )
    all_probs.reverse()
    probability_trends = [
        {
            "probability": round(p, 4),
            "date": t.isoformat() if t else "",
        }
        for p, t in all_probs
    ]

    recent = (
        db.query(PredictionHistory)
        .order_by(PredictionHistory.created_at.desc())
        .limit(5)
        .all()
    )
    recent_predictions = [
        {
            "id": r.id,
            "patient_name": r.patient_name,
            "age": r.age,
            "risk_level": r.risk_level,
            "probability": r.probability,
            "created_at": r.created_at.isoformat() if r.created_at else "",
        }
        for r in recent
    ]

    return DashboardStats(
        total_predictions=int(total),
        high_risk_count=high_risk,
        moderate_risk_count=moderate_risk,
        low_risk_count=low_risk,
        average_probability=round(float(avg_prob), 4),
        risk_distribution=risk_distribution,
        age_distribution=age_distribution,
        probability_trends=probability_trends,
        recent_predictions=recent_predictions,
    )
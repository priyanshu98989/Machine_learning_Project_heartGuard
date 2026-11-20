from sqlalchemy.orm import Session

from models import PredictionHistory
from ml.predict import predict_heart_disease, get_feature_importance
from services.email_service import send_report_email
from services.pdf_service import generate_report_bytes

DISCLAIMER = (
    "This prediction is for educational and demonstration purposes only. "
    "It is NOT a medical diagnosis. Always consult a qualified healthcare "
    "professional for any health concerns."
)


def make_prediction(db: Session, data: dict) -> dict:
    features = [
        data["age"], data["sex"], data["cp"], data["trestbps"],
        data["chol"], data["fbs"], data["restecg"], data["thalach"],
        data["exang"], data["oldpeak"], data["slope"], data["ca"], data["thal"],
    ]

    selected_model = data.get("model", "best")
    result = predict_heart_disease(features, selected_model)
    feature_importance = get_feature_importance()

    record = PredictionHistory(
        patient_name=data.get("patient_name", "Anonymous"),
        age=data["age"],
        sex=data["sex"],
        cp=data["cp"],
        trestbps=data["trestbps"],
        chol=data["chol"],
        fbs=data["fbs"],
        restecg=data["restecg"],
        thalach=data["thalach"],
        exang=data["exang"],
        oldpeak=data["oldpeak"],
        slope=data["slope"],
        ca=data["ca"],
        thal=data["thal"],
        risk_level=result["risk_level"],
        probability=result["probability"],
        model_used=result["model_name"],
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    response = {
        "id": record.id,
        "patient_name": record.patient_name,
        "risk_level": result["risk_level"],
        "probability": result["probability"],
        "model_used": result["model_name"],
        "model_id": result.get("model_id", "best"),
        "feature_importance": feature_importance,
        "disclaimer": DISCLAIMER,
    }

    if data.get("notify_email") and data.get("email"):
        try:
            pdf_bytes = generate_report_bytes(record, feature_importance)
            send_report_email(
                to_email=data["email"],
                patient_name=record.patient_name,
                risk_level=result["risk_level"],
                probability=result["probability"],
                model_used=result["model_name"],
                pdf_bytes=pdf_bytes,
            )
            response["email_status"] = "sent"
        except Exception as exc:
            response["email_status"] = f"failed: {str(exc)}"

    return response

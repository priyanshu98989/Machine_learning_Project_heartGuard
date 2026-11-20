from pydantic import BaseModel, Field, EmailStr
from typing import Optional, Dict


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=128)
    full_name: Optional[str] = Field(default="", max_length=120)


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    is_active: bool
    created_at: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class PredictionRequest(BaseModel):
    patient_name: Optional[str] = Field(default="Anonymous", max_length=100)
    age: int = Field(..., ge=1, le=120, description="Age in years")
    sex: int = Field(..., ge=0, le=1, description="Sex: 0 = female, 1 = male")
    cp: int = Field(..., ge=0, le=3, description="Chest pain type (0-3)")
    trestbps: int = Field(..., ge=50, le=300, description="Resting blood pressure (mm Hg)")
    chol: int = Field(..., ge=50, le=800, description="Serum cholesterol (mg/dl)")
    fbs: int = Field(..., ge=0, le=1, description="Fasting blood sugar > 120 mg/dl: 1=true, 0=false")
    restecg: int = Field(..., ge=0, le=2, description="Resting ECG results (0-2)")
    thalach: int = Field(..., ge=40, le=250, description="Maximum heart rate achieved")
    exang: int = Field(..., ge=0, le=1, description="Exercise induced angina: 1=yes, 0=no")
    oldpeak: float = Field(..., ge=-5.0, le=15.0, description="ST depression induced by exercise")
    slope: int = Field(..., ge=0, le=2, description="Slope of peak exercise ST segment (0-2)")
    ca: int = Field(..., ge=0, le=4, description="Number of major vessels colored by fluoroscopy (0-4)")
    thal: int = Field(..., ge=0, le=3, description="Thalassemia: 0=normal, 1=fixed defect, 2=reversible defect, 3=unknown")
    model: Optional[str] = Field(default="best", description="Model to use: best, logistic, random_forest, svm, gradient_boost, knn")
    email: Optional[str] = Field(default=None, description="Email to send the report to")
    notify_email: Optional[bool] = Field(default=False, description="Send report over email")

    class Config:
        json_schema_extra = {
            "example": {
                "patient_name": "John Doe",
                "age": 63,
                "sex": 1,
                "cp": 3,
                "trestbps": 145,
                "chol": 233,
                "fbs": 1,
                "restecg": 0,
                "thalach": 150,
                "exang": 0,
                "oldpeak": 2.3,
                "slope": 0,
                "ca": 0,
                "thal": 1,
            }
        }


class PredictionResponse(BaseModel):
    id: Optional[int] = None
    patient_name: str
    risk_level: str
    probability: float
    model_used: str
    model_id: Optional[str] = None
    feature_importance: Optional[Dict[str, float]] = None
    disclaimer: str
    email_status: Optional[str] = None


class PredictionRecord(BaseModel):
    id: int
    patient_name: str
    age: int
    sex: int
    cp: int
    trestbps: int
    chol: int
    fbs: int
    restecg: int
    thalach: int
    exang: int
    oldpeak: float
    slope: int
    ca: int
    thal: int
    risk_level: str
    probability: float
    model_used: str
    created_at: str

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_predictions: int
    high_risk_count: int
    moderate_risk_count: int
    low_risk_count: int
    average_probability: float
    risk_distribution: Dict[str, int]
    age_distribution: list
    probability_trends: list
    recent_predictions: list


class CompareItem(BaseModel):
    id: int
    patient_name: str
    age: int
    sex: int
    risk_level: str
    probability: float
    model_used: str
    created_at: str


class CompareResponse(BaseModel):
    records: list[CompareItem]
    summary: dict


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=500)


class ChatResponse(BaseModel):
    reply: str


class ReportRequest(BaseModel):
    prediction_id: int


class BulkPredictionRowError(BaseModel):
    row: int
    error: str


class BulkPredictionResponse(BaseModel):
    total: int
    high_risk_count: int
    moderate_risk_count: int
    low_risk_count: int
    success_count: int
    error_count: int
    results: list[PredictionResponse]
    errors: list[BulkPredictionRowError]

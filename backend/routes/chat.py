import re

from fastapi import APIRouter

from schemas import ChatRequest, ChatResponse

router = APIRouter(prefix="/api", tags=["Chatbot"])

RULES = [
    (["high blood pressure", "bph", "hypertension", "trestbps"], (
        "High blood pressure (hypertension) is a major risk factor for heart disease. "
        "A healthy resting blood pressure is generally below 120/80 mm Hg. Regular "
        "monitoring, a balanced diet (less salt), exercise, and consulting your doctor "
        "are important. This is general information, not medical advice."
    )),
    (["cholesterol", "chol"], (
        "High cholesterol can clog arteries and raise heart disease risk. Total "
        "cholesterol is ideally under 200 mg/dl. Healthy fats, fiber, exercise, and "
        "medical guidance help manage it. Always consult a healthcare professional."
    )),
    (["chest pain", "angina", "cp"], (
        "Chest pain or angina can be a sign of reduced blood flow to the heart. "
        "If you experience chest pain, seek medical attention immediately. The tool's "
        "'Chest Pain Type' field captures this as a clinical input."
    )),
    (["smoke", "smoking", "tobacco"], (
        "Smoking damages blood vessels and significantly increases heart disease and "
        "stroke risk. Quitting is one of the best things you can do for your heart. "
        "Talk to a professional about cessation support."
    )),
    (["exercise", "physical", "activity", "workout"], (
        "Regular moderate exercise (about 150 minutes a week) strengthens the heart, "
        "lowers blood pressure, and improves cholesterol. Always check with a doctor "
        "before starting a new routine."
    )),
    (["diet", "food", "eat", "nutrition", "salt", "fat"], (
        "A heart-healthy diet includes fruits, vegetables, whole grains, lean protein, "
        "and limits salt, added sugars, and saturated/trans fats. Small consistent "
        "changes help the most."
    )),
    (["stress", "anxiety", "mental"], (
        "Chronic stress can raise blood pressure and affect heart health. Managing "
        "stress through rest, mindfulness, activity, and support systems is helpful. "
        "Please reach out to a professional if you are struggling."
    )),
    (["diabetes", "fbs", "blood sugar", "sugar"], (
        "Diabetes and high blood sugar damage blood vessels and increase heart disease "
        "risk. Managing blood sugar, diet, and medication as prescribed is important."
    )),
    (["risk", "chance", "probability", "likely"], (
        "The Risk Assessment tool outputs a probability (0-100%) and a risk level "
        "(Low/Moderate/High) based on machine learning. Use it to understand potential "
        "risk factors and always confirm findings with your doctor."
    )),
    (["bmr", "heart rate", "pulse", "thalach"], (
        "Maximum heart rate achieved during exercise (thalach) is a clinical input here. "
        "A lower peak heart rate during exercise can be associated with higher risk. "
        "Normal resting heart rate is usually 60-100 bpm."
    )),
    (["ml", "machine learning", "model", "algorithm", "random forest", "svm", "gradient"], (
        "This system trains several ML models: Logistic Regression, Random Forest, SVM, "
        "Gradient Boosting, and K-Nearest Neighbors. The best model (by ROC-AUC) is used "
        "by default, and you can choose a specific model in the Risk Assessment form."
    )),
    (["age", "elderly", "older"], (
        "Age is a non-modifiable risk factor for heart disease. Risk tends to increase "
        "with age, which is why regular checkups become more important over time."
    )),
    (["hello", "hi", "hey", "namaste", "namaskar"], (
        "Hello! I'm the HeartGuard assistant. I can explain heart disease risk factors, "
        "what the ML models do, or how to use this app. How can I help?"
    )),
    (["thank"], (
        "You're welcome! Remember, this tool is educational only. Please consult a "
        "healthcare professional for any real health concerns."
    )),
    (["help", "what can you do", "features"], (
        "You can: run a risk assessment (/predict), bulk-predict from a CSV "
        "(/predict/bulk), view/search history (/history), download PDF reports, "
        "compare predictions, retrain the model, and see model details (/model). "
        "You can also register/login to personalize your experience."
    )),
]

DEFAULT_REPLY = (
    "I can help explain heart disease risk factors and how this app works. Try asking "
    "about risk, cholesterol, blood pressure, exercise, diet, or the ML models. "
    "Note: I'm an educational assistant, not a doctor."
)


def _reply(message: str) -> str:
    text = message.lower()
    for keywords, answer in RULES:
        if any(k in text for k in keywords):
            return answer
    return DEFAULT_REPLY


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest):
    return ChatResponse(reply=_reply(payload.message))

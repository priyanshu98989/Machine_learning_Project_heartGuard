# Heart Disease Risk Assessment & Prediction System

A full-stack web application that uses machine learning to assess heart disease risk based on clinical parameters. Built with React (Vite + Tailwind CSS) frontend and Python FastAPI backend.

> **Medical Disclaimer:** This application is built strictly for **educational and demonstration purposes only**. It is **NOT** a medical diagnostic tool. The predictions made by this system should **NEVER** be used as a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for any health concerns.

---

## Project Structure

```
ML Project/
├── README.md
├── .env.example
├── .gitignore
├── backend/
│   ├── main.py                  # FastAPI application entry point
│   ├── database.py              # SQLAlchemy database setup
│   ├── models.py                # Database ORM models
│   ├── schemas.py               # Pydantic request/response schemas
│   ├── requirements.txt         # Python dependencies
│   ├── routes/
│   │   ├── __init__.py
│   │   ├── predict.py           # /api/predict + /api/predict/bulk
│   │   ├── history.py           # /api/history (search) + delete
│   │   ├── dashboard.py         # /api/dashboard endpoint
│   │   ├── model.py             # /api/model/metrics + /api/model/retrain
│   │   ├── compare.py           # /api/compare endpoint
│   │   ├── chat.py              # /api/chat rule-based assistant
│   │   ├── report.py            # /api/report/{id} PDF download
│   │   └── auth.py              # /api/auth register/login
│   ├── services/
│   │   ├── __init__.py
│   │   └── prediction_service.py # ML model loading & prediction logic
│   ├── ml/
│   │   ├── __init__.py
│   │   ├── train_model.py       # Model training script
│   │   └── predict.py           # Reusable prediction function
│   └── data/
│       └── heart.csv            # UCI Heart Disease dataset (user-provided)
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── pages/
        │   ├── Dashboard.jsx
        │   ├── RiskAssessment.jsx
        │   ├── BulkPrediction.jsx
        │   ├── PredictionHistory.jsx
        │   └── ModelInfo.jsx
        ├── components/
        │   ├── Layout.jsx
        │   ├── Header.jsx
        │   ├── Sidebar.jsx
        │   ├── ResultCard.jsx
        │   ├── ThemeToggle.jsx
        │   └── Toast.jsx
        ├── charts/
        │   ├── RiskDistributionChart.jsx
        │   ├── AgeDistributionChart.jsx
        │   └── ProbabilityTrendChart.jsx
        ├── context/
        │   └── ThemeContext.jsx
        ├── services/
        │   └── api.js
        └── utils/
            └── helpers.js
```

---

## Setup Instructions

### Prerequisites

- **Python 3.9+**
- **Node.js 18+** and **npm**
- **Heart Disease Dataset** (`heart.csv`) — place it in `backend/data/`

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Place your heart.csv dataset in backend/data/

# Train the ML model
python ml/train_model.py

# Start the backend server
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The backend will be available at `http://127.0.0.1:8000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

---

## API Documentation

### Base URL: `http://127.0.0.1:8000`

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | API status check |
| `/health` | GET | Health check with model status |
| `/api/predict` | POST | Make a heart disease risk prediction |
| `/api/predict/bulk` | POST | Bulk prediction from a CSV file upload |
| `/api/history` | GET | Retrieve prediction history (filters: `risk_level`, `q`, `limit`, `offset`) |
| `/api/history/{id}` | DELETE | Delete a prediction record |
| `/api/dashboard` | GET | Dashboard statistics |
| `/api/model/metrics` | GET | Live model metrics and feature importance |
| `/api/model/retrain` | POST | Retrain models on the current dataset |

### POST `/api/predict`

**Request Body:**

```json
{
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
  "patient_name": "John Doe"
}
```

**Response:**

```json
{
  "patient_name": "John Doe",
  "risk_level": "High Risk",
  "probability": 0.82,
  "model_used": "Random Forest",
  "feature_importance": { ... },
  "disclaimer": "This prediction is for educational purposes only..."
}
```

### GET `/api/history`

Returns all stored prediction records sorted by most recent first.

### GET `/api/dashboard`

Returns aggregated statistics: total predictions, risk distribution, average probability, age demographics.

---

## Features

- **Risk Assessment Form** — Input clinical parameters for heart disease prediction (model selectable)
- **Bulk Prediction** — Upload a CSV of many patients; invalid rows are skipped and reported
- **Prediction History** — Search by patient name, filter by risk level, pagination, delete records
- **PDF Reports** — Download a printable PDF report for any prediction (from history or the result screen)
- **Email Reports** — Optionally email the PDF report to a patient (requires SMTP config)
- **Dashboard** — Visual overview with charts (risk distribution, age distribution, probability trends)
- **Model Info** — Live evaluation metrics for all models, feature importance chart, and one-click retrain
- **Dark/Light Mode** — Toggle between themes
- **Responsive Design** — Works on desktop and mobile
- **Toast Notifications** — Real-time feedback on actions
- **Input Validation** — Server-side validation with Pydantic (single + bulk)

---

## ML Pipeline

- **Models:** Logistic Regression, Random Forest
- **Selection:** Best model selected based on ROC-AUC score
- **Preprocessing:** StandardScaler for numerical features, LabelEncoder for categoricals
- **Evaluation Metrics:** Accuracy, Precision, Recall, F1-Score, ROC-AUC
- **Persistence:** Model and preprocessing pipeline saved as `.joblib` files

---

## License

Educational project. Not for production medical use.

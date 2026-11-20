import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from config import FRONTEND_URL
from database import Base, engine
from ml.predict import is_model_loaded, preload
from routes.auth import router as auth_router
from routes.chat import router as chat_router
from routes.compare import router as compare_router
from routes.dashboard import router as dashboard_router
from routes.history import router as history_router
from routes.model import router as model_router
from routes.predict import router as predict_router
from routes.report import router as report_router

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    try:
        preload()
        print("ML model artifacts preloaded at startup.")
    except Exception as exc:
        print(f"WARNING: Could not preload ML model: {exc}")
    yield


app = FastAPI(
    title="Heart Disease Risk Assessment API",
    description="ML-powered heart disease risk prediction system",
    version="1.1.0",
    lifespan=lifespan,
)

app.add_middleware(GZipMiddleware, minimum_size=500)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(predict_router)
app.include_router(history_router)
app.include_router(dashboard_router)
app.include_router(model_router)
app.include_router(compare_router)
app.include_router(chat_router)
app.include_router(report_router)


@app.get("/")
def root():
    return {
        "message": "Heart Disease Risk Assessment API",
        "version": "1.1.0",
        "model_loaded": is_model_loaded(),
        "endpoints": {
            "predict": "POST /api/predict",
            "predict_bulk": "POST /api/predict/bulk",
            "history": "GET /api/history | DELETE /api/history/{id}",
            "dashboard": "GET /api/dashboard",
            "compare": "POST /api/compare",
            "chat": "POST /api/chat",
            "report": "GET /api/report/{id}",
            "model_metrics": "GET /api/model/metrics",
            "model_retrain": "POST /api/model/retrain",
            "auth": "POST /api/auth/register | /login",
        },
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": is_model_loaded(),
        "database": "connected",
    }

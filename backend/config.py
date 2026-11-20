import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./heart_disease.db")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "ml")
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")

SECRET_KEY = os.getenv("SECRET_KEY", "change-me-super-secret-key-for-jwt-signing")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "720"))

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM = os.getenv("SMTP_FROM", "")
SMTP_TLS = os.getenv("SMTP_TLS", "true").lower() == "true"

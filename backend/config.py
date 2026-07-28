import os
from pydantic import BaseModel
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

class Settings(BaseModel):
    PROJECT_NAME: str = "YantraGuru MVP"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")

    class Config:
        arbitrary_types_allowed = True

settings = Settings()

# Fast verification to fail early if security credentials are missing
if not settings.GEMINI_API_KEY:
    raise RuntimeError(
        "CRITICAL ERROR: 'GEMINI_API_KEY' is missing in environment variables. "
        "Check your .env file or Vercel Environment Variables configuration."
    )
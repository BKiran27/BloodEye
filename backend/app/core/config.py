from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./bloodeye.db"
    UPLOAD_DIR: str = "./uploads"
    MODEL_DIR: str = "./models"
    SECRET_KEY: str = "supersecretkey"
    DEMO_MODE: bool = True
    CORS_ORIGINS: List[str] = ["*"]
    
    class Config:
        env_file = ".env"

settings = Settings()

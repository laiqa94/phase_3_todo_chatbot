from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    PROJECT_NAME: str = "Todo Backend API"
    API_V1_STR: str = "/api/v1"
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002", "http://localhost:3003", "https://laiqak-chatbot-ai.hf.space"]  # Common frontend ports and deployed backend

    # Database settings
    DATABASE_URL: str = "sqlite:///./todo_backend.db"  # Default to SQLite for development

    # Secret key for JWT
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"  # Default dev key
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Password hashing
    PASSWORD_HASH_SCHEME: str = "bcrypt"

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
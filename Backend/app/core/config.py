import json
import os
from typing import List, Union
from pydantic import Field, field_validator
try:
    from pydantic_settings import BaseSettings, SettingsConfigDict
    USE_PYDANTIC_SETTINGS = True
except ImportError:
    from pydantic import BaseModel as BaseSettings  # fallback
    SettingsConfigDict = None
    USE_PYDANTIC_SETTINGS = False


class Settings(BaseSettings):
    PROJECT_NAME: str = "MiniHardware API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = Field(
        default="postgresql+asyncpg://postgres:postgres@localhost:5432/minihardware",
        description="Async PostgreSQL Database connection string"
    )
    DATABASE_URL_SYNC: str = Field(
        default="postgresql://postgres:postgres@localhost:5432/minihardware",
        description="Sync PostgreSQL Database connection string for Alembic"
    )

    # JWT Authentication
    JWT_SECRET_KEY: str = Field(
        default="super_secret_jwt_key_for_minihardware_app_2026_change_in_production",
        description="Secret key for JWT generation and verification"
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # CORS configuration
    CORS_ORIGINS: Union[List[str], str] = "*"

    # Environment
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # Default Seed Admin Credentials
    SEED_ADMIN_NAME: str = "Super Admin"
    SEED_ADMIN_EMAIL: str = "admin@minihardware.com"
    SEED_ADMIN_PASSWORD: str = "Admin123!"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except json.JSONDecodeError:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

    @property
    def async_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgresql://"):
            return url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    @property
    def sync_database_url(self) -> str:
        if self.DATABASE_URL_SYNC:
            return self.DATABASE_URL_SYNC
        url = self.DATABASE_URL
        if url.startswith("postgresql+asyncpg://"):
            return url.replace("postgresql+asyncpg://", "postgresql://", 1)
        return url

    if USE_PYDANTIC_SETTINGS:
        model_config = SettingsConfigDict(
            env_file=".env",
            env_file_encoding="utf-8",
            case_sensitive=True,
            extra="ignore"
        )


settings = Settings()

from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "SentinelText Enterprise Engine"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False
    DATABASE_URL: str = "sqlite:///./sentineltext_enterprise.db"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"]

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()

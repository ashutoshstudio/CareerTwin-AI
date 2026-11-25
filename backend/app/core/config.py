from pathlib import Path
from typing import Any, Dict, List, Optional, Union
from dotenv import dotenv_values
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent
ROOT_ENV_PATH = BASE_DIR.parent / ".env"
BACKEND_ENV_PATH = BASE_DIR / ".env"


class Settings(BaseSettings):
    APP_NAME: str = "CareerTwin AI Backend"
    APP_ENV: str = "development"
    DEBUG: bool = True
    HOST: str = "127.0.0.1"
    PORT: int = 8000

    SECRET_KEY: str = "careertwin-development-insecure-secret-key-change-in-production-12345"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours

    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'data' / 'careertwin.db'}"

    # Optional GitHub Personal Access Token to avoid public API rate limits (60/hr -> 5000/hr)
    GITHUB_TOKEN: Optional[str] = None

    # Google OAuth 2.0 Settings (Authorization Code Flow)
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    GOOGLE_REDIRECT_URI: str = "http://127.0.0.1:8000/api/v1/auth/google/callback"
    FRONTEND_URL: str = "http://localhost:5173"

    # External Job Provider API Settings (Adzuna, Remotive, Arbeitnow)
    ADZUNA_APP_ID: Optional[str] = None
    ADZUNA_APP_KEY: Optional[str] = None
    ADZUNA_COUNTRY: str = "in"  # Default 'in' (India), fallback to 'gb'/'us' if unsupported
    JOB_CACHE_TTL_MINUTES: int = 15  # In-memory provider caching duration

    # Configurable AI Provider Settings for Career Assistant
    # Supported: "none" (deterministic fallback), "openai", "groq", "gemini", "ollama"
    AI_PROVIDER: str = "none"
    AI_API_KEY: Optional[str] = None
    GEMINI_API_KEY: Optional[str] = None
    AI_MODEL: Optional[str] = "gemini-3.5-flash-lite"
    AI_BASE_URL: Optional[str] = None
    AI_TIMEOUT_SECONDS: float = 45.0
    AI_MAX_TOKENS: int = 3500

    ALLOWED_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    @field_validator("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "AI_API_KEY", "GEMINI_API_KEY", "ADZUNA_APP_ID", "ADZUNA_APP_KEY", mode="before")
    @classmethod
    def blank_str_to_none(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str) and not v.strip():
            return None
        return v.strip() if isinstance(v, str) else v

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [i.strip() for i in v.split(",") if i.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=[
            str(ROOT_ENV_PATH),
            str(BACKEND_ENV_PATH),
        ],
        env_file_encoding="utf-8",
        extra="ignore",
    )

    def get_google_oauth_diagnostics(self) -> Dict[str, Any]:
        """
        Safe diagnostic reporting whether each Google credential is present
        and which .env files exist, without exposing or logging secret values.
        """
        active_files = [str(p) for p in (ROOT_ENV_PATH, BACKEND_ENV_PATH) if p.exists()]
        return {
            "google_client_id_present": bool((self.GOOGLE_CLIENT_ID or "").strip()),
            "google_client_secret_present": bool((self.GOOGLE_CLIENT_SECRET or "").strip()),
            "google_redirect_uri_present": bool((self.GOOGLE_REDIRECT_URI or "").strip()),
            "env_files_detected": active_files,
        }


settings = Settings()
_ENV_MTIMES: Dict[str, float] = {
    str(p): p.stat().st_mtime for p in (ROOT_ENV_PATH, BACKEND_ENV_PATH) if p.exists()
}


def refresh_env_settings_if_changed() -> None:
    """
    Reloads .env overrides in non-testing environments if backend/.env or root .env
    was modified on disk after server startup (uvicorn --reload does not watch .env).
    """
    if settings.APP_ENV == "testing":
        return

    changed = False
    for p in (ROOT_ENV_PATH, BACKEND_ENV_PATH):
        key = str(p)
        mtime = p.stat().st_mtime if p.exists() else 0.0
        if _ENV_MTIMES.get(key, 0.0) != mtime:
            changed = True
            _ENV_MTIMES[key] = mtime

    if not changed:
        return

    # Merge root .env then backend/.env without letting empty entries erase non-empty values
    merged: Dict[str, str] = {}
    for p in (ROOT_ENV_PATH, BACKEND_ENV_PATH):
        if p.exists():
            for k, v in dotenv_values(p).items():
                if v is not None and v.strip() != "":
                    merged[k] = v.strip()

    for field in (
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "GOOGLE_REDIRECT_URI",
        "FRONTEND_URL",
        "ADZUNA_APP_ID",
        "ADZUNA_APP_KEY",
        "ADZUNA_COUNTRY",
        "AI_PROVIDER",
        "AI_API_KEY",
        "AI_MODEL",
        "AI_BASE_URL",
    ):
        if field in merged:
            setattr(settings, field, merged[field])

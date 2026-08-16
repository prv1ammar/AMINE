from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    project_name: str = "LHT Store API"
    api_v1_prefix: str = "/api/v1"
    environment: str = "development"

    database_url: str = "sqlite:///./lht_store.db"

    cors_origins: list[str] = ["http://localhost:5173"]

    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 60 * 12
    algorithm: str = "HS256"

    admin_email: str = "hello@lhtstore.com"

    # Resend (preferred — a plain HTTPS call). Falls back to SMTP below if unset.
    resend_api_key: str | None = None
    resend_from: str = "LHT Store <onboarding@resend.dev>"

    smtp_host: str | None = None
    smtp_port: int = 587
    smtp_user: str | None = None
    smtp_password: str | None = None
    smtp_from: str = "hello@lhtstore.com"
    smtp_use_tls: bool = True

    upload_dir: str = "uploads"
    max_upload_size_mb: int = 5

    # When set, uploads go to Supabase Storage instead of local disk — required on
    # hosts with no persistent/writable filesystem between requests (e.g. Netlify
    # Functions). Local disk remains the fallback when these are unset.
    supabase_url: str | None = None
    supabase_service_key: str | None = None
    supabase_storage_bucket: str = "product-images"


@lru_cache
def get_settings() -> Settings:
    return Settings()

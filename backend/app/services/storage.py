import uuid
from pathlib import Path

import httpx

from app.core.config import get_settings

settings = get_settings()


def supabase_storage_configured() -> bool:
    return bool(settings.supabase_url and settings.supabase_service_key)


def save_upload(filename: str, content_type: str, contents: bytes) -> str:
    """Store an uploaded file and return the URL to serve it from.

    Uses Supabase Storage when configured (required on hosts with no persistent
    disk, e.g. Netlify Functions); falls back to local disk for local dev.
    """
    extension = Path(filename or "").suffix.lower() or ".jpg"
    object_name = f"{uuid.uuid4().hex}{extension}"

    if supabase_storage_configured():
        url = (
            f"{settings.supabase_url}/storage/v1/object/"
            f"{settings.supabase_storage_bucket}/{object_name}"
        )
        response = httpx.post(
            url,
            content=contents,
            headers={
                "Authorization": f"Bearer {settings.supabase_service_key}",
                "apikey": settings.supabase_service_key,
                "Content-Type": content_type,
                "x-upsert": "true",
            },
            timeout=30,
        )
        response.raise_for_status()
        return (
            f"{settings.supabase_url}/storage/v1/object/public/"
            f"{settings.supabase_storage_bucket}/{object_name}"
        )

    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    (upload_dir / object_name).write_bytes(contents)
    return f"/uploads/{object_name}"

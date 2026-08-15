import logging
import smtplib
from email.message import EmailMessage

from app.core.config import get_settings

logger = logging.getLogger("lht_store.email")
settings = get_settings()


def send_email(*, to: str, subject: str, body: str) -> None:
    """Send a plain-text email. Falls back to logging when SMTP isn't configured (local/dev)."""
    if not settings.smtp_host:
        logger.info("SMTP not configured — logging email instead.\nTo: %s\nSubject: %s\n%s", to, subject, body)
        return

    message = EmailMessage()
    message["From"] = settings.smtp_from
    message["To"] = to
    message["Subject"] = subject
    message.set_content(body)

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        if settings.smtp_use_tls:
            server.starttls()
        if settings.smtp_user and settings.smtp_password:
            server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(message)


def notify_new_inquiry(
    *,
    name: str,
    email: str,
    phone: str | None,
    address: str | None,
    subject: str,
    message: str,
    product_slug: str | None,
    items: list[dict] | None = None,
    total_cents: int | None = None,
) -> None:
    items_block = ""
    if items:
        lines = "\n".join(
            f"  - {item['quantity']} x {item['name']} — {item['line_total_cents'] / 100:.2f} MAD"
            for item in items
        )
        items_block = f"\nArticles commandés:\n{lines}\nTotal: {(total_cents or 0) / 100:.2f} MAD\n"

    body = (
        f"Nouvelle demande reçue via le site.\n\n"
        f"Nom: {name}\n"
        f"Email: {email}\n"
        f"Téléphone: {phone or 'non précisé'}\n"
        f"Adresse: {address or 'non précisée'}\n"
        f"Sujet: {subject}\n"
        f"Modèle: {product_slug or 'non précisé'}\n"
        f"{items_block}\n"
        f"Message:\n{message}"
    )
    send_email(to=settings.admin_email, subject=f"[LHT Store] Nouvelle demande — {subject}", body=body)

    confirmation = (
        f"Bonjour {name},\n\n"
        "Merci pour votre message — nous revenons vers vous sous 24 heures ouvrées.\n\n"
        "À bientôt,\nL'équipe LHT Store"
    )
    send_email(to=email, subject="LHT Store — nous avons bien reçu votre message", body=confirmation)

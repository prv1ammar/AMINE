import nodemailer from "nodemailer";
import { config } from "./config.mts";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!transporter && config.smtpHost) {
    transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: false,
      requireTLS: config.smtpUseTls,
      auth: config.smtpUser && config.smtpPassword ? { user: config.smtpUser, pass: config.smtpPassword } : undefined,
    });
  }
  return transporter;
}

/** Sends a plain-text email. Falls back to logging when SMTP isn't configured (local/dev). */
export async function sendEmail({ to, subject, body }: { to: string; subject: string; body: string }): Promise<void> {
  const client = getTransporter();
  if (!client) {
    console.log(`SMTP not configured — logging email instead.\nTo: ${to}\nSubject: ${subject}\n${body}`);
    return;
  }
  await client.sendMail({ from: config.smtpFrom, to, subject, text: body });
}

interface CartItemSnapshot {
  quantity: number;
  name: string;
  line_total_cents: number;
}

export async function notifyNewInquiry(params: {
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  subject: string;
  message: string;
  productSlug: string | null;
  items: CartItemSnapshot[] | null;
  totalCents: number | null;
}): Promise<void> {
  let itemsBlock = "";
  if (params.items?.length) {
    const lines = params.items
      .map((item) => `  - ${item.quantity} x ${item.name} — ${(item.line_total_cents / 100).toFixed(2)} MAD`)
      .join("\n");
    itemsBlock = `\nArticles commandés:\n${lines}\nTotal: ${((params.totalCents ?? 0) / 100).toFixed(2)} MAD\n`;
  }

  const body =
    `Nouvelle demande reçue via le site.\n\n` +
    `Nom: ${params.name}\n` +
    `Email: ${params.email}\n` +
    `Téléphone: ${params.phone || "non précisé"}\n` +
    `Adresse: ${params.address || "non précisée"}\n` +
    `Sujet: ${params.subject}\n` +
    `Modèle: ${params.productSlug || "non précisé"}\n` +
    `${itemsBlock}\n` +
    `Message:\n${params.message}`;

  await sendEmail({ to: config.adminEmail, subject: `[LHT Store] Nouvelle demande — ${params.subject}`, body });

  const confirmation =
    `Bonjour ${params.name},\n\n` +
    "Merci pour votre message — nous revenons vers vous sous 24 heures ouvrées.\n\n" +
    "À bientôt,\nL'équipe LHT Store";
  await sendEmail({ to: params.email, subject: "LHT Store — nous avons bien reçu votre message", body: confirmation });
}

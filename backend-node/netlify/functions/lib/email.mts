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

async function sendViaResend(to: string, subject: string, body: string): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: config.resendFrom, to: [to], subject, text: body }),
  });
  if (!response.ok) {
    // Resend's own error text (e.g. "You can only send testing emails to your
    // own email address" pre-domain-verification) is far more useful than a
    // generic failure, so surface it rather than swallow it.
    throw new Error(`Resend API error ${response.status}: ${await response.text()}`);
  }
}

/**
 * Sends a plain-text email. Prefers Resend (a plain HTTPS call — no SMTP
 * connection to negotiate from inside a serverless function); falls back to
 * SMTP if Resend isn't configured, then to console logging if neither is.
 */
export async function sendEmail({ to, subject, body }: { to: string; subject: string; body: string }): Promise<void> {
  if (config.resendApiKey) {
    await sendViaResend(to, subject, body);
    return;
  }

  const client = getTransporter();
  if (!client) {
    console.log(`No email provider configured — logging email instead.\nTo: ${to}\nSubject: ${subject}\n${body}`);
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
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  subject: string;
  message: string;
  productSlug: string | null;
  items: CartItemSnapshot[] | null;
  totalCents: number | null;
  deliveryCents: number | null;
}): Promise<void> {
  let itemsBlock = "";
  if (params.items?.length) {
    const lines = params.items
      .map((item) => `  - ${item.quantity} x ${item.name} — ${(item.line_total_cents / 100).toFixed(2)} MAD`)
      .join("\n");
    const delivery = params.deliveryCents ?? 0;
    const grandTotal = (params.totalCents ?? 0) + delivery;
    itemsBlock =
      `\nArticles commandés:\n${lines}\n` +
      `Sous-total: ${((params.totalCents ?? 0) / 100).toFixed(2)} MAD\n` +
      `Livraison: ${(delivery / 100).toFixed(2)} MAD\n` +
      `Total: ${(grandTotal / 100).toFixed(2)} MAD\n`;
  }

  const body =
    `Nouvelle demande reçue via le site.\n\n` +
    `Nom: ${params.name}\n` +
    `Email: ${params.email || "non précisé"}\n` +
    `Téléphone: ${params.phone || "non précisé"}\n` +
    `Adresse: ${params.address || "non précisée"}\n` +
    `Ville: ${params.city || "non précisée"}\n` +
    `Sujet: ${params.subject}\n` +
    `Modèle: ${params.productSlug || "non précisé"}\n` +
    `${itemsBlock}\n` +
    `Message:\n${params.message}`;

  await sendEmail({ to: config.adminEmail, subject: `[LHT Store] Nouvelle demande — ${params.subject}`, body });

  // Email is optional — the store runs on phone/address (COD), so there's
  // often nothing to send a confirmation to.
  if (!params.email) return;

  const confirmation =
    `Bonjour ${params.name},\n\n` +
    "Merci pour votre message — nous revenons vers vous sous 24 heures ouvrées.\n\n" +
    "À bientôt,\nL'équipe LHT Store";
  await sendEmail({ to: params.email, subject: "LHT Store — nous avons bien reçu votre message", body: confirmation });
}

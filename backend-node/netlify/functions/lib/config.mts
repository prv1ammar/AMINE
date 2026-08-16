function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const config = {
  databaseUrl: required("DATABASE_URL"),
  corsOrigins: JSON.parse(process.env.CORS_ORIGINS ?? '["http://localhost:5174"]') as string[],
  secretKey: process.env.SECRET_KEY ?? "change-me-in-production",
  accessTokenExpireMinutes: Number(process.env.ACCESS_TOKEN_EXPIRE_MINUTES ?? 720),
  adminEmail: process.env.ADMIN_EMAIL ?? "hello@lhtstore.com",

  // Resend (preferred — a plain HTTPS call, no SMTP connection to negotiate
  // from inside a serverless function). Falls back to SMTP below if unset.
  resendApiKey: process.env.RESEND_API_KEY || null,
  // Sandbox sender until a domain is verified in Resend — see lib/email.mts.
  resendFrom: process.env.RESEND_FROM ?? "LHT Store <onboarding@resend.dev>",

  smtpHost: process.env.SMTP_HOST || null,
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpUser: process.env.SMTP_USER || null,
  smtpPassword: process.env.SMTP_PASSWORD || null,
  smtpFrom: process.env.SMTP_FROM ?? "hello@lhtstore.com",
  smtpUseTls: (process.env.SMTP_USE_TLS ?? "true") === "true",

  supabaseUrl: process.env.SUPABASE_URL || null,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || null,
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? "product-images",

  // Netlify Functions cap request bodies at 6MB total; binary uploads are
  // base64-encoded in transit (~30% overhead), so the real ceiling for image
  // bytes is ~4.5MB. Default stays safely under that so the app's own check
  // returns a clear error instead of Netlify silently rejecting the request.
  maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB ?? 4),
};

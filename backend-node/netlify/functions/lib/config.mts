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

  smtpHost: process.env.SMTP_HOST || null,
  smtpPort: Number(process.env.SMTP_PORT ?? 587),
  smtpUser: process.env.SMTP_USER || null,
  smtpPassword: process.env.SMTP_PASSWORD || null,
  smtpFrom: process.env.SMTP_FROM ?? "hello@lhtstore.com",
  smtpUseTls: (process.env.SMTP_USE_TLS ?? "true") === "true",

  supabaseUrl: process.env.SUPABASE_URL || null,
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || null,
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? "product-images",

  maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB ?? 5),
};

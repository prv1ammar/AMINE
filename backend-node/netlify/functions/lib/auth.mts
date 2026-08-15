import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { config } from "./config.mts";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export function createAccessToken(subject: string, expiresMinutes?: number): string {
  const expiresInSeconds = (expiresMinutes ?? config.accessTokenExpireMinutes) * 60;
  return jwt.sign({ sub: subject }, config.secretKey, { algorithm: "HS256", expiresIn: expiresInSeconds });
}

/** Returns the token's subject (admin email) if valid, otherwise null — never throws. */
export function decodeAccessToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, config.secretKey, { algorithms: ["HS256"] });
    if (typeof payload === "object" && typeof payload.sub === "string") return payload.sub;
    return null;
  } catch {
    return null;
  }
}

export function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length);
}

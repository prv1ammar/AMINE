import type { Config } from "@netlify/functions";
import { z } from "zod";
import { sql } from "./lib/db.mts";
import { createAccessToken, verifyPassword } from "./lib/auth.mts";
import { HttpError, withHandler, type AdminUser } from "./lib/http.mts";

const LoginRequest = z.object({
  email: z.string().email(),
  password: z.string(),
});

export default withHandler(async (req) => {
  const parsed = LoginRequest.safeParse(await req.json());
  if (!parsed.success) throw new HttpError(422, "Email ou mot de passe invalide.");
  const { email, password } = parsed.data;

  const rows = await sql<AdminUser[]>`select * from admin_users where email = ${email}`;
  const admin = rows[0];
  if (!admin || !(await verifyPassword(password, admin.hashed_password))) {
    throw new HttpError(401, "Email ou mot de passe incorrect.");
  }

  return { access_token: createAccessToken(admin.email), token_type: "bearer" };
});

export const config: Config = {
  path: "/api/v1/auth/login",
  method: ["POST", "OPTIONS"],
};

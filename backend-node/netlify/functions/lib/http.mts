import type { Context } from "@netlify/functions";
import { corsHeaders } from "./cors.mts";
import { bearerToken, decodeAccessToken } from "./auth.mts";
import { sql } from "./db.mts";

/** Thrown by handlers to short-circuit with a specific status + {"detail": ...} body. */
export class HttpError extends Error {
  status: number;
  detail: unknown;
  constructor(status: number, detail: unknown) {
    super(typeof detail === "string" ? detail : "Une erreur est survenue.");
    this.status = status;
    this.detail = detail;
  }
}

export function jsonResponse(req: Request, data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(req) },
  });
}

export function noContent(req: Request): Response {
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}

/** Admin row shape as stored — matches app/models/admin_user.py. */
export interface AdminUser {
  id: number;
  email: string;
  hashed_password: string;
}

/** Resolves the authenticated admin from the request's bearer token, or throws HttpError(401). */
export async function requireAdmin(req: Request): Promise<AdminUser> {
  const unauthorized = new HttpError(401, "Identifiants invalides ou expirés.");
  const token = bearerToken(req);
  if (!token) throw unauthorized;
  const email = decodeAccessToken(token);
  if (!email) throw unauthorized;
  const rows = await sql<AdminUser[]>`select * from admin_users where email = ${email}`;
  if (!rows[0]) throw unauthorized;
  return rows[0];
}

type Handler = (req: Request, context: Context) => Promise<Response | unknown>;

/**
 * Wraps a function body with CORS (incl. OPTIONS preflight) and uniform error
 * handling, so individual route files only contain business logic. A handler
 * may return a Response directly (CORS headers get merged in) or plain data
 * (wrapped as a 200 JSON response).
 */
export function withHandler(handler: Handler) {
  return async (req: Request, context: Context): Promise<Response> => {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(req) });
    }
    try {
      const result = await handler(req, context);
      if (result instanceof Response) {
        const merged = new Headers(result.headers);
        for (const [key, value] of Object.entries(corsHeaders(req))) merged.set(key, value);
        return new Response(result.body, { status: result.status, headers: merged });
      }
      return jsonResponse(req, result);
    } catch (err) {
      if (err instanceof HttpError) return jsonResponse(req, { detail: err.detail }, err.status);
      console.error(err);
      // TEMPORARY while wiring up the live deployment — surfaces the real error
      // instead of a generic message. Revert to a generic 500 before this is
      // treated as production-ready (this can leak internal details otherwise).
      const message = err instanceof Error ? err.message : String(err);
      return jsonResponse(req, { detail: `DEBUG: ${message}` }, 500);
    }
  };
}

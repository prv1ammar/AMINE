import type { Config } from "@netlify/functions";
import { z } from "zod";
import { sql } from "./lib/db.mts";
import { HttpError, jsonResponse, noContent, requireAdmin, withHandler } from "./lib/http.mts";

const StatCreate = z.object({
  value: z.string().min(1).max(20),
  label: z.string().max(60).default(""),
  body: z.string().max(500).default(""),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});
const StatUpdate = StatCreate.partial();

export default withHandler(async (req, context) => {
  await requireAdmin(req);
  const id = context.params.id ? Number(context.params.id) : null;

  if (req.method === "GET") {
    return sql`select * from stats order by sort_order, id`;
  }

  if (req.method === "POST") {
    const parsed = StatCreate.parse(await req.json());
    const [stat] = await sql`insert into stats ${sql(parsed)} returning *`;
    return jsonResponse(req, stat, 201);
  }

  if (!id) throw new HttpError(404, "Statistique introuvable.");

  if (req.method === "PUT") {
    const found = await sql`select id from stats where id = ${id}`;
    if (!found[0]) throw new HttpError(404, "Statistique introuvable.");
    const updates = Object.fromEntries(Object.entries(StatUpdate.parse(await req.json())).filter(([, v]) => v !== undefined));
    if (Object.keys(updates).length === 0) {
      const [stat] = await sql`select * from stats where id = ${id}`;
      return stat;
    }
    const [stat] = await sql`update stats set ${sql(updates)} where id = ${id} returning *`;
    return stat;
  }

  if (req.method === "DELETE") {
    const result = await sql`delete from stats where id = ${id}`;
    if (result.count === 0) throw new HttpError(404, "Statistique introuvable.");
    return noContent(req);
  }

  throw new HttpError(405, "Méthode non autorisée.");
});

export const config: Config = {
  path: ["/api/v1/admin/stats", "/api/v1/admin/stats/:id"],
  method: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

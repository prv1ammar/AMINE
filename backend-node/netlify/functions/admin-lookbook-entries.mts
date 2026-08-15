import type { Config } from "@netlify/functions";
import { z } from "zod";
import { sql } from "./lib/db.mts";
import { HttpError, jsonResponse, noContent, requireAdmin, withHandler } from "./lib/http.mts";

const LookbookEntryCreate = z.object({
  eyebrow: z.string().default(""),
  title: z.string(),
  body: z.string().default(""),
  image_placeholder: z.string().default(""),
  image_url: z.string().nullish(),
  link_url: z.string().default("/collection"),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});
const LookbookEntryUpdate = LookbookEntryCreate.partial();

export default withHandler(async (req, context) => {
  await requireAdmin(req);
  const id = context.params.id ? Number(context.params.id) : null;

  if (req.method === "GET") {
    return sql`select * from lookbook_entries order by sort_order, id`;
  }

  if (req.method === "POST") {
    const parsed = LookbookEntryCreate.parse(await req.json());
    const [entry] = await sql`insert into lookbook_entries ${sql(parsed)} returning *`;
    return jsonResponse(req, entry, 201);
  }

  if (!id) throw new HttpError(404, "Entrée introuvable.");

  if (req.method === "PUT") {
    const found = await sql`select id from lookbook_entries where id = ${id}`;
    if (!found[0]) throw new HttpError(404, "Entrée introuvable.");
    const updates = Object.fromEntries(Object.entries(LookbookEntryUpdate.parse(await req.json())).filter(([, v]) => v !== undefined));
    if (Object.keys(updates).length === 0) {
      const [entry] = await sql`select * from lookbook_entries where id = ${id}`;
      return entry;
    }
    const [entry] = await sql`update lookbook_entries set ${sql(updates)} where id = ${id} returning *`;
    return entry;
  }

  if (req.method === "DELETE") {
    const result = await sql`delete from lookbook_entries where id = ${id}`;
    if (result.count === 0) throw new HttpError(404, "Entrée introuvable.");
    return noContent(req);
  }

  throw new HttpError(405, "Méthode non autorisée.");
});

export const config: Config = {
  path: ["/api/v1/admin/lookbook-entries", "/api/v1/admin/lookbook-entries/:id"],
  method: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

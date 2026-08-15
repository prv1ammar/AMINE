import type { Config } from "@netlify/functions";
import { z } from "zod";
import { sql } from "./lib/db.mts";
import { HttpError, jsonResponse, noContent, requireAdmin, withHandler } from "./lib/http.mts";

const SocialImageCreate = z.object({
  caption: z.string().default(""),
  image_url: z.string().nullish(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});
const SocialImageUpdate = SocialImageCreate.partial();

export default withHandler(async (req, context) => {
  await requireAdmin(req);
  const id = context.params.id ? Number(context.params.id) : null;

  if (req.method === "GET") {
    return sql`select * from social_images order by sort_order, id`;
  }

  if (req.method === "POST") {
    const parsed = SocialImageCreate.parse(await req.json());
    const [image] = await sql`insert into social_images ${sql(parsed)} returning *`;
    return jsonResponse(req, image, 201);
  }

  if (!id) throw new HttpError(404, "Image introuvable.");

  if (req.method === "PUT") {
    const found = await sql`select id from social_images where id = ${id}`;
    if (!found[0]) throw new HttpError(404, "Image introuvable.");
    const updates = Object.fromEntries(Object.entries(SocialImageUpdate.parse(await req.json())).filter(([, v]) => v !== undefined));
    if (Object.keys(updates).length === 0) {
      const [image] = await sql`select * from social_images where id = ${id}`;
      return image;
    }
    const [image] = await sql`update social_images set ${sql(updates)} where id = ${id} returning *`;
    return image;
  }

  if (req.method === "DELETE") {
    const result = await sql`delete from social_images where id = ${id}`;
    if (result.count === 0) throw new HttpError(404, "Image introuvable.");
    return noContent(req);
  }

  throw new HttpError(405, "Méthode non autorisée.");
});

export const config: Config = {
  path: ["/api/v1/admin/social-images", "/api/v1/admin/social-images/:id"],
  method: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

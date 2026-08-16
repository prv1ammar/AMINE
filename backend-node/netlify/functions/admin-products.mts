import type { Config } from "@netlify/functions";
import { z } from "zod";
import { sql } from "./lib/db.mts";
import { HttpError, jsonResponse, noContent, requireAdmin, withHandler } from "./lib/http.mts";

const ProductCreate = z.object({
  slug: z.string(),
  name: z.string(),
  shape: z.string(),
  price_cents: z.number().int(),
  delivery_price_cents: z.number().int().min(0).default(0),
  currency: z.string().default("MAD"),
  tagline: z.string().default(""),
  description: z.string().default(""),
  image_placeholder: z.string().default(""),
  image_url: z.string().nullish(),
  badge: z.string().nullish(),
  is_bestseller: z.boolean().default(false),
  is_new: z.boolean().default(false),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});
const ProductUpdate = ProductCreate.partial();

export default withHandler(async (req, context) => {
  await requireAdmin(req);
  const id = context.params.id ? Number(context.params.id) : null;

  if (req.method === "GET") {
    return sql`select * from products order by sort_order, id`;
  }

  if (req.method === "POST") {
    const parsed = ProductCreate.parse(await req.json());
    const existing = await sql`select id from products where slug = ${parsed.slug}`;
    if (existing[0]) throw new HttpError(409, "Ce slug existe déjà.");
    const [product] = await sql`insert into products ${sql(parsed)} returning *`;
    return jsonResponse(req, product, 201);
  }

  if (!id) throw new HttpError(404, "Produit introuvable.");

  if (req.method === "PUT") {
    const found = await sql`select id from products where id = ${id}`;
    if (!found[0]) throw new HttpError(404, "Produit introuvable.");
    const updates = Object.fromEntries(Object.entries(ProductUpdate.parse(await req.json())).filter(([, v]) => v !== undefined));
    if (Object.keys(updates).length === 0) {
      const [product] = await sql`select * from products where id = ${id}`;
      return product;
    }
    const [product] = await sql`update products set ${sql(updates)} where id = ${id} returning *`;
    return product;
  }

  if (req.method === "DELETE") {
    const result = await sql`delete from products where id = ${id}`;
    if (result.count === 0) throw new HttpError(404, "Produit introuvable.");
    return noContent(req);
  }

  throw new HttpError(405, "Méthode non autorisée.");
});

export const config: Config = {
  path: ["/api/v1/admin/products", "/api/v1/admin/products/:id"],
  method: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

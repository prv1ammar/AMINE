import type { Config } from "@netlify/functions";
import { z } from "zod";
import { sql } from "./lib/db.mts";
import { HttpError, jsonResponse, noContent, requireAdmin, withHandler } from "./lib/http.mts";

const CollectionCreate = z.object({
  slug: z.string(),
  name: z.string(),
  description: z.string().default(""),
  image_placeholder: z.string().default(""),
  image_url: z.string().nullish(),
  is_active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});
const CollectionUpdate = CollectionCreate.partial();
const CollectionProductAdd = z.object({
  product_id: z.number().int(),
  position: z.number().int().default(0),
});

async function productCount(collectionId: number): Promise<number> {
  const [row] = await sql`select count(*)::int as n from product_collections where collection_id = ${collectionId}`;
  return row.n;
}

export default withHandler(async (req) => {
  await requireAdmin(req);

  // Parsed manually (rather than relying on multi-pattern context.params merging)
  // so the /collections/:id vs /collections/:id/products/:productId split is
  // unambiguous regardless of Netlify's exact param-matching behavior.
  const segments = new URL(req.url).pathname.split("/").filter(Boolean);
  const collectionsIdx = segments.indexOf("collections");
  const id = segments[collectionsIdx + 1] ? Number(segments[collectionsIdx + 1]) : null;
  const isProductsRoute = segments[collectionsIdx + 2] === "products";
  const productId = segments[collectionsIdx + 3] ? Number(segments[collectionsIdx + 3]) : null;

  if (req.method === "GET" && !id) {
    const collections = await sql`
      select c.*, count(pc.product_id)::int as product_count
      from collections c
      left join product_collections pc on pc.collection_id = c.id
      group by c.id
      order by c.sort_order, c.id
    `;
    return collections;
  }

  if (req.method === "POST" && !id) {
    const parsed = CollectionCreate.parse(await req.json());
    const existing = await sql`select id from collections where slug = ${parsed.slug}`;
    if (existing[0]) throw new HttpError(409, "Ce slug existe déjà.");
    const [collection] = await sql`insert into collections ${sql(parsed)} returning *`;
    return jsonResponse(req, { ...collection, product_count: 0 }, 201);
  }

  if (!id) throw new HttpError(404, "Collection introuvable.");
  const foundRows = await sql`select * from collections where id = ${id}`;
  const collection = foundRows[0];

  if (isProductsRoute) {
    if (req.method === "GET") {
      if (!collection) throw new HttpError(404, "Collection introuvable.");
      const products = await sql`
        select p.* from products p
        join product_collections pc on pc.product_id = p.id
        where pc.collection_id = ${id}
        order by pc.position, p.id
      `;
      return { ...collection, product_count: products.length, products };
    }

    if (req.method === "POST") {
      if (!collection) throw new HttpError(404, "Collection introuvable.");
      const { product_id, position } = CollectionProductAdd.parse(await req.json());
      const product = await sql`select id from products where id = ${product_id}`;
      if (!product[0]) throw new HttpError(404, "Produit introuvable.");
      await sql`
        insert into product_collections (product_id, collection_id, position)
        values (${product_id}, ${id}, ${position})
        on conflict (product_id, collection_id) do update set position = excluded.position
      `;
      return noContent(req);
    }

    if (req.method === "DELETE") {
      if (!productId) throw new HttpError(404, "Association introuvable.");
      const result = await sql`
        delete from product_collections where collection_id = ${id} and product_id = ${productId}
      `;
      if (result.count === 0) throw new HttpError(404, "Association introuvable.");
      return noContent(req);
    }
  }

  if (req.method === "PUT") {
    if (!collection) throw new HttpError(404, "Collection introuvable.");
    const updates = Object.fromEntries(Object.entries(CollectionUpdate.parse(await req.json())).filter(([, v]) => v !== undefined));
    const updated = Object.keys(updates).length
      ? (await sql`update collections set ${sql(updates)} where id = ${id} returning *`)[0]
      : collection;
    return { ...updated, product_count: await productCount(id) };
  }

  if (req.method === "DELETE") {
    const result = await sql`delete from collections where id = ${id}`;
    if (result.count === 0) throw new HttpError(404, "Collection introuvable.");
    return noContent(req);
  }

  throw new HttpError(405, "Méthode non autorisée.");
});

export const config: Config = {
  path: [
    "/api/v1/admin/collections",
    "/api/v1/admin/collections/:id",
    "/api/v1/admin/collections/:id/products",
    "/api/v1/admin/collections/:id/products/:productId",
  ],
  method: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
};

import type { Config } from "@netlify/functions";
import { sql } from "./lib/db.mts";
import { HttpError, withHandler } from "./lib/http.mts";

export default withHandler(async (req, context) => {
  const slug = context.params.slug;

  if (!slug) {
    return sql`
      select c.*, count(pc.product_id)::int as product_count
      from collections c
      left join product_collections pc on pc.collection_id = c.id
      where c.is_active = true
      group by c.id
      order by c.sort_order, c.id
    `;
  }

  const collections = await sql`select * from collections where slug = ${slug}`;
  const collection = collections[0];
  if (!collection || !collection.is_active) throw new HttpError(404, "Collection introuvable.");

  const products = await sql`
    select p.* from products p
    join product_collections pc on pc.product_id = p.id
    where pc.collection_id = ${collection.id} and p.is_active = true
    order by pc.position, p.id
  `;

  return { ...collection, product_count: products.length, products };
});

export const config: Config = {
  path: ["/api/v1/collections", "/api/v1/collections/:slug"],
  method: ["GET", "OPTIONS"],
};

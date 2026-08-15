import type { Config } from "@netlify/functions";
import { sql } from "./lib/db.mts";
import { HttpError, withHandler } from "./lib/http.mts";

export default withHandler(async (req, context) => {
  const slug = context.params.slug;

  if (!slug) {
    return sql`
      select * from products where is_active = true order by sort_order, id
    `;
  }

  const rows = await sql`select * from products where slug = ${slug}`;
  if (!rows[0]) throw new HttpError(404, "Modèle introuvable.");
  return rows[0];
});

export const config: Config = {
  path: ["/api/v1/products", "/api/v1/products/:slug"],
  method: ["GET", "OPTIONS"],
};

import type { Config } from "@netlify/functions";
import { sql } from "./lib/db.mts";
import { requireAdmin, withHandler } from "./lib/http.mts";

export default withHandler(async (req) => {
  await requireAdmin(req);
  return sql`select * from newsletter_subscribers order by created_at desc`;
});

export const config: Config = {
  path: "/api/v1/admin/newsletter",
  method: ["GET", "OPTIONS"],
};

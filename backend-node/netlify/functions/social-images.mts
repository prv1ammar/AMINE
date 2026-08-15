import type { Config } from "@netlify/functions";
import { sql } from "./lib/db.mts";
import { withHandler } from "./lib/http.mts";

export default withHandler(async () => {
  return sql`select * from social_images where is_active = true order by sort_order, id`;
});

export const config: Config = {
  path: "/api/v1/social-images",
  method: ["GET", "OPTIONS"],
};

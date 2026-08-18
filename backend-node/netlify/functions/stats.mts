import type { Config } from "@netlify/functions";
import { sql } from "./lib/db.mts";
import { withHandler } from "./lib/http.mts";

export default withHandler(async () => {
  return sql`select * from stats where is_active = true order by sort_order, id`;
});

export const config: Config = {
  path: "/api/v1/stats",
  method: ["GET", "OPTIONS"],
};

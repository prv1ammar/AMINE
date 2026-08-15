import postgres from "postgres";
import { config } from "./config.mts";

// Reused across invocations within the same warm function instance —
// postgres.js pools internally, so this is safe to hold as a module-level singleton.
export const sql = postgres(config.databaseUrl, { ssl: "require" });

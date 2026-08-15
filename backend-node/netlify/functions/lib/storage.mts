import { randomUUID } from "node:crypto";
import { config } from "./config.mts";

/**
 * Uploads to Supabase Storage and returns the public URL. Netlify Functions
 * have no writable disk between invocations at all, so unlike the Python
 * version there's no local-disk fallback here — Supabase Storage is required.
 */
export async function saveUpload(filename: string, contentType: string, contents: Uint8Array): Promise<string> {
  if (!config.supabaseUrl || !config.supabaseServiceKey) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_KEY must be set — uploads have nowhere to persist otherwise.");
  }

  const extension = filename.includes(".") ? filename.slice(filename.lastIndexOf(".")).toLowerCase() : ".jpg";
  const objectName = `${randomUUID().replace(/-/g, "")}${extension}`;
  const uploadUrl = `${config.supabaseUrl}/storage/v1/object/${config.supabaseStorageBucket}/${objectName}`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.supabaseServiceKey}`,
      apikey: config.supabaseServiceKey,
      "Content-Type": contentType,
      "x-upsert": "true",
    },
    body: contents,
  });
  if (!response.ok) {
    throw new Error(`Supabase Storage upload failed: ${response.status} ${await response.text()}`);
  }

  return `${config.supabaseUrl}/storage/v1/object/public/${config.supabaseStorageBucket}/${objectName}`;
}

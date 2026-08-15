import type { Config } from "@netlify/functions";
import { config as appConfig } from "./lib/config.mts";
import { HttpError, requireAdmin, withHandler } from "./lib/http.mts";
import { saveUpload } from "./lib/storage.mts";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export default withHandler(async (req) => {
  await requireAdmin(req);

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) throw new HttpError(400, "Aucun fichier fourni.");

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new HttpError(400, "Format d'image non supporté.");
  }

  const contents = new Uint8Array(await file.arrayBuffer());
  const maxBytes = appConfig.maxUploadSizeMb * 1024 * 1024;
  if (contents.byteLength > maxBytes) {
    throw new HttpError(400, `L'image dépasse ${appConfig.maxUploadSizeMb} Mo.`);
  }

  const url = await saveUpload(file.name, file.type, contents);
  return { url };
});

export const config: Config = {
  path: "/api/v1/admin/uploads",
  method: ["POST", "OPTIONS"],
};

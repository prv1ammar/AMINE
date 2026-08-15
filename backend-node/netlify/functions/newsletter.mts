import type { Config } from "@netlify/functions";
import { z } from "zod";
import { sql } from "./lib/db.mts";
import { HttpError, jsonResponse, withHandler } from "./lib/http.mts";

const NewsletterSubscribeCreate = z.object({
  email: z.string().email(),
});

export default withHandler(async (req) => {
  const parsed = NewsletterSubscribeCreate.safeParse(await req.json());
  if (!parsed.success) throw new HttpError(422, parsed.error.issues[0]?.message ?? "Email invalide.");
  const { email } = parsed.data;

  const existing = await sql`select id from newsletter_subscribers where email = ${email}`;
  if (existing[0]) throw new HttpError(409, "Cette adresse est déjà inscrite.");

  const [subscriber] = await sql`
    insert into newsletter_subscribers (email) values (${email}) returning *
  `;
  return jsonResponse(req, subscriber, 201);
});

export const config: Config = {
  path: "/api/v1/newsletter",
  method: ["POST", "OPTIONS"],
};

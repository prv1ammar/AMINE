import type { Config } from "@netlify/functions";
import { z } from "zod";
import { sql } from "./lib/db.mts";
import { HttpError, jsonResponse, withHandler } from "./lib/http.mts";
import { notifyNewInquiry } from "./lib/email.mts";
import { INQUIRY_SUBJECT_VALUES, SUBJECT_DB_TO_VALUE, SUBJECT_VALUE_TO_DB } from "./lib/inquirySubject.mts";

const CartItemInput = z.object({
  product_id: z.number().int(),
  quantity: z.number().int().min(1).max(20).default(1),
});

// Local mobile/landline (0 + 5/6/7 + 8 digits) or international (+212 + same).
const MOROCCAN_PHONE = /^(?:\+212|0)[5-7]\d{8}$/;
function normalizePhone(raw: string): string {
  return raw.replace(/[\s.-]/g, "");
}

const InquiryCreate = z
  .object({
    name: z.string().min(1).max(120),
    // Optional — the store operates on phone/address (COD), not email.
    email: z.union([z.literal(""), z.string().email()]).default(""),
    phone: z.string().max(30).nullish(),
    address: z.string().max(2000).nullish(),
    city: z.string().max(120).nullish(),
    subject: z.enum(INQUIRY_SUBJECT_VALUES as [string, ...string[]]).default("Commander un modèle"),
    message: z.string().max(4000).default(""),
    product_slug: z.string().nullish(),
    items: z.array(CartItemInput).nullish(),
  })
  .superRefine((data, ctx) => {
    if (data.subject === "Commander un modèle" || data.items?.length) {
      const missing = [
        ["téléphone", data.phone] as const,
        ["adresse", data.address] as const,
        ["ville", data.city] as const,
      ]
        .filter(([, value]) => !value || !value.trim())
        .map(([label]) => label);
      if (missing.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Merci de préciser votre ${missing.join(" et votre ")} pour passer commande.`,
        });
      }
    }
    if (data.phone && !MOROCCAN_PHONE.test(normalizePhone(data.phone))) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Numéro de téléphone invalide — format attendu : 06XXXXXXXX ou +212XXXXXXXXX.",
      });
    }
    if (!data.items?.length && !data.message.trim()) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Merci de préciser votre message." });
    }
  });

interface ProductRow {
  id: number;
  slug: string;
  name: string;
  price_cents: number;
  delivery_price_cents: number;
  is_active: boolean;
}

export default withHandler(async (req) => {
  const parsed = InquiryCreate.safeParse(await req.json());
  if (!parsed.success) throw new HttpError(422, parsed.error.issues[0]?.message ?? "Données invalides.");
  const payload = parsed.data;

  // Cart pricing is computed server-side from the DB, never trusted from the client.
  const items: { product_id: number; slug: string; name: string; price_cents: number; quantity: number; line_total_cents: number }[] = [];
  let totalCents = 0;
  let deliveryCents = 0;
  for (const cartItem of payload.items ?? []) {
    const rows = await sql<ProductRow[]>`select * from products where id = ${cartItem.product_id}`;
    const product = rows[0];
    if (!product || !product.is_active) {
      throw new HttpError(400, `Un des produits de votre panier n'est plus disponible (id=${cartItem.product_id}).`);
    }
    const lineTotal = product.price_cents * cartItem.quantity;
    totalCents += lineTotal;
    // One real shipment, one delivery fee — not additive per item.
    deliveryCents = Math.max(deliveryCents, product.delivery_price_cents);
    items.push({
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      price_cents: product.price_cents,
      quantity: cartItem.quantity,
      line_total_cents: lineTotal,
    });
  }

  const subjectDb = SUBJECT_VALUE_TO_DB[payload.subject];
  const [inquiry] = await sql`
    insert into inquiries (name, email, phone, address, city, subject, message, product_slug, items, total_cents, delivery_cents)
    values (
      ${payload.name}, ${payload.email}, ${payload.phone ? normalizePhone(payload.phone) : null}, ${payload.address ?? null},
      ${payload.city ?? null}, ${subjectDb}, ${payload.message}, ${payload.product_slug ?? null},
      ${items.length ? sql.json(items) : null}, ${items.length ? totalCents : null}, ${items.length ? deliveryCents : null}
    )
    returning *
  `;

  // The order is already committed above — a notification failure (bad SMTP
  // credentials, Gmail hiccup, etc.) must not fail the customer's checkout.
  try {
    await notifyNewInquiry({
      name: inquiry.name,
      email: inquiry.email || null,
      phone: inquiry.phone,
      address: inquiry.address,
      city: inquiry.city,
      subject: payload.subject,
      message: inquiry.message,
      productSlug: inquiry.product_slug,
      items: inquiry.items,
      totalCents: inquiry.total_cents,
      deliveryCents: inquiry.delivery_cents,
    });
  } catch (err) {
    console.error("notifyNewInquiry failed (order still saved):", err);
  }

  return jsonResponse(req, { ...inquiry, subject: SUBJECT_DB_TO_VALUE[inquiry.subject] }, 201);
});

export const config: Config = {
  path: "/api/v1/inquiries",
  method: ["POST", "OPTIONS"],
};

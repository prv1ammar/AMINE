import type { Config } from "@netlify/functions";
import { z } from "zod";
import { sql } from "./lib/db.mts";
import { HttpError, requireAdmin, withHandler } from "./lib/http.mts";
import { SUBJECT_DB_TO_VALUE } from "./lib/inquirySubject.mts";

const InquiryStatusUpdate = z.object({
  status: z.enum(["new", "contacted", "closed"]),
});

function present(row: Record<string, unknown>) {
  return { ...row, subject: SUBJECT_DB_TO_VALUE[row.subject as string] };
}

export default withHandler(async (req, context) => {
  await requireAdmin(req);
  const id = context.params.id ? Number(context.params.id) : null;

  if (req.method === "GET") {
    const rows = await sql`select * from inquiries order by created_at desc`;
    return rows.map(present);
  }

  if (req.method === "PATCH") {
    if (!id) throw new HttpError(404, "Demande introuvable.");
    const found = await sql`select id from inquiries where id = ${id}`;
    if (!found[0]) throw new HttpError(404, "Demande introuvable.");
    const { status } = InquiryStatusUpdate.parse(await req.json());
    const [inquiry] = await sql`update inquiries set status = ${status} where id = ${id} returning *`;
    return present(inquiry);
  }

  throw new HttpError(405, "Méthode non autorisée.");
});

export const config: Config = {
  path: ["/api/v1/admin/inquiries", "/api/v1/admin/inquiries/:id"],
  method: ["GET", "PATCH", "OPTIONS"],
};

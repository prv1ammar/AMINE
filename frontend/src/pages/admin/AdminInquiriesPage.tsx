import { useAdminInquiries, useUpdateInquiryStatus } from "@/features/inquiries/hooks";
import { INQUIRY_STATUSES, type InquiryStatus } from "@/features/inquiries/types";
import "@/styles/admin.css";

const STATUS_LABELS: Record<InquiryStatus, string> = {
  new: "Nouvelle",
  contacted: "Contacté",
  closed: "Clôturée",
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

function formatCents(cents: number): string {
  return new Intl.NumberFormat("fr-MA", { style: "currency", currency: "MAD", minimumFractionDigits: 0 }).format(
    cents / 100
  );
}

export function AdminInquiriesPage() {
  const { data: inquiries, isLoading } = useAdminInquiries();
  const updateStatus = useUpdateInquiryStatus();

  return (
    <div className="admin">
      <div className="admin-topbar">
        <div>
          <p className="admin-title">Demandes</p>
          <p className="admin-subtitle">{inquiries?.length ?? 0} demande(s) reçue(s) via le formulaire de contact</p>
        </div>
      </div>

      <div className="admin-table-wrap">
        {isLoading ? (
          <p className="admin-empty">Chargement…</p>
        ) : !inquiries?.length ? (
          <p className="admin-empty">Aucune demande pour le moment.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Reçue le</th>
                <th>Contact</th>
                <th>Adresse</th>
                <th>Sujet</th>
                <th>Modèle(s)</th>
                <th>Total</th>
                <th>Message</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inquiry) => (
                <tr key={inquiry.id}>
                  <td style={{ whiteSpace: "nowrap" }}>{formatDate(inquiry.created_at)}</td>
                  <td>
                    <strong>{inquiry.name}</strong>
                    {inquiry.email && <div className="admin-subtitle">{inquiry.email}</div>}
                    {inquiry.phone && <div className="admin-subtitle">{inquiry.phone}</div>}
                  </td>
                  <td style={{ maxWidth: 220, whiteSpace: "normal" }}>
                    {inquiry.address ?? "—"}
                    {inquiry.city && <div className="admin-subtitle">{inquiry.city}</div>}
                  </td>
                  <td>{inquiry.subject}</td>
                  <td style={{ maxWidth: 220, whiteSpace: "normal" }}>
                    {inquiry.items?.length ? (
                      <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {inquiry.items.map((item) => (
                          <li key={item.product_id} className="admin-subtitle">
                            {item.quantity} × {item.name}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      inquiry.product_slug ?? "—"
                    )}
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    {inquiry.total_cents != null ? (
                      <>
                        <strong>{formatCents(inquiry.total_cents + (inquiry.delivery_cents ?? 0))}</strong>
                        {!!inquiry.delivery_cents && (
                          <div className="admin-subtitle">dont livraison {formatCents(inquiry.delivery_cents)}</div>
                        )}
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={{ maxWidth: 260, whiteSpace: "normal" }}>{inquiry.message || <span className="admin-subtitle">—</span>}</td>
                  <td>
                    <select
                      value={inquiry.status}
                      disabled={updateStatus.isPending}
                      onChange={(e) =>
                        updateStatus.mutate({ id: inquiry.id, status: e.target.value as InquiryStatus })
                      }
                      style={{
                        padding: "6px 10px",
                        borderRadius: 8,
                        border: "1px solid var(--admin-line)",
                        fontSize: 12.5,
                      }}
                    >
                      {INQUIRY_STATUSES.map((status) => (
                        <option key={status} value={status}>
                          {STATUS_LABELS[status]}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

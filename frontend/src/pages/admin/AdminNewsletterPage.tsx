import { useAdminNewsletterSubscribers } from "@/features/newsletter/hooks";
import "@/styles/admin.css";

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(iso));
}

export function AdminNewsletterPage() {
  const { data: subscribers, isLoading } = useAdminNewsletterSubscribers();

  return (
    <div className="admin">
      <div className="admin-topbar">
        <div>
          <p className="admin-title">Newsletter</p>
          <p className="admin-subtitle">{subscribers?.length ?? 0} inscrit(e)s</p>
        </div>
      </div>

      <div className="admin-table-wrap">
        {isLoading ? (
          <p className="admin-empty">Chargement…</p>
        ) : !subscribers?.length ? (
          <p className="admin-empty">Aucun inscrit pour le moment.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id}>
                  <td>{subscriber.email}</td>
                  <td>{formatDate(subscriber.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

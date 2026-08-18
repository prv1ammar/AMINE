import { FormEvent, useState } from "react";
import { useAdminStats, useCreateStat, useDeleteStat, useUpdateStat } from "@/features/stats/hooks";
import type { Stat, StatInput } from "@/features/stats/types";
import { ApiError } from "@/lib/apiClient";
import "@/styles/admin.css";

type FormState = {
  value: string;
  label: string;
  body: string;
  is_active: boolean;
  sort_order: string;
};

const EMPTY_FORM: FormState = {
  value: "",
  label: "",
  body: "",
  is_active: true,
  sort_order: "0",
};

function statToForm(stat: Stat): FormState {
  return {
    value: stat.value,
    label: stat.label,
    body: stat.body,
    is_active: stat.is_active,
    sort_order: stat.sort_order.toString(),
  };
}

function formToInput(form: FormState): StatInput {
  return {
    value: form.value.trim(),
    label: form.label.trim(),
    body: form.body.trim(),
    is_active: form.is_active,
    sort_order: parseInt(form.sort_order || "0", 10),
  };
}

export function AdminStatsPage() {
  const { data: stats, isLoading } = useAdminStats();
  const createStat = useCreateStat();
  const updateStat = useUpdateStat();
  const deleteStat = useDeleteStat();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  }

  function openEditForm(stat: Stat) {
    setEditingId(stat.id);
    setForm(statToForm(stat));
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      const input = formToInput(form);
      if (editingId) {
        await updateStat.mutateAsync({ id: editingId, data: input });
      } else {
        await createStat.mutateAsync(input);
      }
      closeForm();
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Une erreur est survenue.");
    }
  }

  async function handleDelete(stat: Stat) {
    if (!window.confirm(`Supprimer « ${stat.value} — ${stat.label} » ?`)) return;
    await deleteStat.mutateAsync(stat.id);
  }

  const isSaving = createStat.isPending || updateStat.isPending;

  return (
    <div className="admin">
      <div className="admin-topbar">
        <div>
          <p className="admin-title">Chiffres clés</p>
          <p className="admin-subtitle">{stats?.length ?? 0} statistique(s) — section « À Propos »</p>
        </div>
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreateForm}>
          + Nouvelle statistique
        </button>
      </div>

      {showForm && (
        <div className="admin-panel">
          <div className="admin-panel__head">
            <p className="admin-panel__title">{editingId ? "Modifier la statistique" : "Nouvelle statistique"}</p>
            <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={closeForm}>
              Fermer
            </button>
          </div>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form-row">
              <div className="admin-field">
                <label htmlFor="s-value">Valeur (ex. « 6 », « UV400 », « 30j »)</label>
                <input
                  id="s-value"
                  required
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label htmlFor="s-label">Libellé (ex. « Modèles »)</label>
                <input
                  id="s-label"
                  value={form.label}
                  onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                />
              </div>
            </div>

            <div className="admin-field">
              <label htmlFor="s-body">Description</label>
              <textarea
                id="s-body"
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-field">
                <label htmlFor="s-sort">Ordre d'affichage</label>
                <input
                  id="s-sort"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                />
              </div>
              <div className="admin-field admin-field--checkbox">
                <input
                  id="s-active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                />
                <label htmlFor="s-active">Visible sur le site</label>
              </div>
            </div>

            {error && <p className="admin-error">{error}</p>}

            <div className="admin-form__actions">
              <button type="submit" className="admin-btn admin-btn--primary" disabled={isSaving}>
                {isSaving ? "Enregistrement…" : editingId ? "Enregistrer" : "Créer"}
              </button>
              <button type="button" className="admin-btn" onClick={closeForm}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-table-wrap">
        {isLoading ? (
          <p className="admin-empty">Chargement…</p>
        ) : !stats?.length ? (
          <p className="admin-empty">Aucune statistique pour le moment.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Valeur</th>
                <th>Libellé</th>
                <th>Description</th>
                <th>Ordre</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {stats.map((stat) => (
                <tr key={stat.id}>
                  <td>
                    <strong>{stat.value}</strong>
                  </td>
                  <td>{stat.label || <span className="admin-subtitle">—</span>}</td>
                  <td style={{ maxWidth: 260, whiteSpace: "normal" }} className="admin-subtitle">
                    {stat.body || "—"}
                  </td>
                  <td>{stat.sort_order}</td>
                  <td>
                    {stat.is_active ? (
                      <span className="admin-pill admin-pill--new">Visible</span>
                    ) : (
                      <span className="admin-pill admin-pill--inactive">Masqué</span>
                    )}
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <button type="button" className="admin-btn admin-btn--sm" onClick={() => openEditForm(stat)}>
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--sm admin-btn--danger"
                        onClick={() => handleDelete(stat)}
                      >
                        Supprimer
                      </button>
                    </div>
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

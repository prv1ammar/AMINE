import { FormEvent, useState } from "react";
import {
  useAdminLookbookEntries,
  useCreateLookbookEntry,
  useDeleteLookbookEntry,
  useUpdateLookbookEntry,
  useUploadLookbookImage,
} from "@/features/lookbookEntries/hooks";
import type { LookbookEntry, LookbookEntryInput } from "@/features/lookbookEntries/types";
import { ApiError, toMediaUrl } from "@/lib/apiClient";
import "@/styles/admin.css";

type FormState = {
  eyebrow: string;
  title: string;
  body: string;
  image_placeholder: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
  sort_order: string;
};

const EMPTY_FORM: FormState = {
  eyebrow: "",
  title: "",
  body: "",
  image_placeholder: "",
  image_url: "",
  link_url: "/collection",
  is_active: true,
  sort_order: "0",
};

function entryToForm(entry: LookbookEntry): FormState {
  return {
    eyebrow: entry.eyebrow,
    title: entry.title,
    body: entry.body,
    image_placeholder: entry.image_placeholder,
    image_url: entry.image_url ?? "",
    link_url: entry.link_url,
    is_active: entry.is_active,
    sort_order: entry.sort_order.toString(),
  };
}

function formToInput(form: FormState): LookbookEntryInput {
  return {
    eyebrow: form.eyebrow.trim(),
    title: form.title.trim(),
    body: form.body.trim(),
    image_placeholder: form.image_placeholder.trim(),
    image_url: form.image_url.trim() || null,
    link_url: form.link_url.trim() || "/collection",
    is_active: form.is_active,
    sort_order: parseInt(form.sort_order || "0", 10),
  };
}

export function AdminLookbookPage() {
  const { data: entries, isLoading } = useAdminLookbookEntries();
  const createEntry = useCreateLookbookEntry();
  const updateEntry = useUpdateLookbookEntry();
  const deleteEntry = useDeleteLookbookEntry();
  const uploadImage = useUploadLookbookImage();

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

  function openEditForm(entry: LookbookEntry) {
    setEditingId(entry.id);
    setForm(entryToForm(entry));
    setError(null);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setError(null);
  }

  async function handleImageChange(file: File | null) {
    if (!file) return;
    try {
      const { url } = await uploadImage.mutateAsync(file);
      setForm((f) => ({ ...f, image_url: url }));
    } catch (err) {
      setError(
        err instanceof ApiError
          ? String(err.detail)
          : "Échec de l'envoi de l'image — le fichier est peut-être trop volumineux (4 Mo max). Essayez une photo compressée."
      );
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      const input = formToInput(form);
      if (editingId) {
        await updateEntry.mutateAsync({ id: editingId, data: input });
      } else {
        await createEntry.mutateAsync(input);
      }
      closeForm();
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Une erreur est survenue.");
    }
  }

  async function handleDelete(entry: LookbookEntry) {
    if (!window.confirm(`Supprimer l'entrée « ${entry.title} » ?`)) return;
    await deleteEntry.mutateAsync(entry.id);
  }

  const isSaving = createEntry.isPending || updateEntry.isPending;

  return (
    <div className="admin">
      <div className="admin-topbar">
        <div>
          <p className="admin-title">Lookbook</p>
          <p className="admin-subtitle">{entries?.length ?? 0} entrée(s) sur la page Lookbook</p>
        </div>
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreateForm}>
          + Nouvelle entrée
        </button>
      </div>

      {showForm && (
        <div className="admin-panel">
          <div className="admin-panel__head">
            <p className="admin-panel__title">{editingId ? "Modifier l'entrée" : "Nouvelle entrée"}</p>
            <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={closeForm}>
              Fermer
            </button>
          </div>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form-row">
              <div className="admin-field">
                <label htmlFor="l-eyebrow">Étiquette (ex. « 01 — Été 2024 »)</label>
                <input
                  id="l-eyebrow"
                  value={form.eyebrow}
                  onChange={(e) => setForm((f) => ({ ...f, eyebrow: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label htmlFor="l-title">Titre</label>
                <input
                  id="l-title"
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
            </div>

            <div className="admin-field">
              <label htmlFor="l-body">Texte</label>
              <textarea
                id="l-body"
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="l-placeholder">Légende (tant qu'il n'y a pas de vraie photo)</label>
              <input
                id="l-placeholder"
                value={form.image_placeholder}
                onChange={(e) => setForm((f) => ({ ...f, image_placeholder: e.target.value }))}
              />
            </div>

            <div className="admin-field">
              <label>Photo</label>
              <div className="admin-image-picker">
                <div className="admin-image-picker__preview">
                  {form.image_url ? <img src={toMediaUrl(form.image_url)} alt="" /> : "Aucune"}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e.target.files?.[0] ?? null)}
                />
                {uploadImage.isPending && <span className="admin-subtitle">Envoi…</span>}
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-field">
                <label htmlFor="l-link">Lien du bouton « Voir le modèle »</label>
                <input
                  id="l-link"
                  value={form.link_url}
                  onChange={(e) => setForm((f) => ({ ...f, link_url: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label htmlFor="l-sort">Ordre d'affichage</label>
                <input
                  id="l-sort"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                />
              </div>
            </div>

            <div className="admin-field admin-field--checkbox">
              <input
                id="l-active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              />
              <label htmlFor="l-active">Visible sur le site</label>
            </div>

            {error && <p className="admin-error">{error}</p>}

            <div className="admin-form__actions">
              <button type="submit" className="admin-btn admin-btn--primary" disabled={isSaving}>
                {isSaving ? "Enregistrement…" : editingId ? "Enregistrer" : "Créer l'entrée"}
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
        ) : !entries?.length ? (
          <p className="admin-empty">Aucune entrée pour le moment.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Titre</th>
                <th>Étiquette</th>
                <th>Ordre</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <div className="admin-table__thumb">
                      {entry.image_url && <img src={toMediaUrl(entry.image_url)} alt="" />}
                    </div>
                  </td>
                  <td>
                    <strong>{entry.title}</strong>
                  </td>
                  <td className="admin-subtitle">{entry.eyebrow || "—"}</td>
                  <td>{entry.sort_order}</td>
                  <td>
                    {entry.is_active ? (
                      <span className="admin-pill admin-pill--new">Visible</span>
                    ) : (
                      <span className="admin-pill admin-pill--inactive">Masqué</span>
                    )}
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <button type="button" className="admin-btn admin-btn--sm" onClick={() => openEditForm(entry)}>
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--sm admin-btn--danger"
                        onClick={() => handleDelete(entry)}
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

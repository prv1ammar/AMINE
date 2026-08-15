import { FormEvent, useState } from "react";
import {
  useAdminSocialImages,
  useCreateSocialImage,
  useDeleteSocialImage,
  useUpdateSocialImage,
  useUploadSocialImage,
} from "@/features/socialImages/hooks";
import type { SocialImage, SocialImageInput } from "@/features/socialImages/types";
import { ApiError, toMediaUrl } from "@/lib/apiClient";
import "@/styles/admin.css";

type FormState = {
  caption: string;
  image_url: string;
  is_active: boolean;
  sort_order: string;
};

const EMPTY_FORM: FormState = {
  caption: "",
  image_url: "",
  is_active: true,
  sort_order: "0",
};

function imageToForm(image: SocialImage): FormState {
  return {
    caption: image.caption,
    image_url: image.image_url ?? "",
    is_active: image.is_active,
    sort_order: image.sort_order.toString(),
  };
}

function formToInput(form: FormState): SocialImageInput {
  return {
    caption: form.caption.trim(),
    image_url: form.image_url.trim() || null,
    is_active: form.is_active,
    sort_order: parseInt(form.sort_order || "0", 10),
  };
}

export function AdminSocialImagesPage() {
  const { data: images, isLoading } = useAdminSocialImages();
  const createImage = useCreateSocialImage();
  const updateImage = useUpdateSocialImage();
  const deleteImage = useDeleteSocialImage();
  const uploadImage = useUploadSocialImage();

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

  function openEditForm(image: SocialImage) {
    setEditingId(image.id);
    setForm(imageToForm(image));
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
      setError(err instanceof ApiError ? String(err.detail) : "Échec de l'envoi de l'image.");
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      const input = formToInput(form);
      if (editingId) {
        await updateImage.mutateAsync({ id: editingId, data: input });
      } else {
        await createImage.mutateAsync(input);
      }
      closeForm();
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Une erreur est survenue.");
    }
  }

  async function handleDelete(image: SocialImage) {
    if (!window.confirm(`Supprimer cette tuile (« ${image.caption} ») ?`)) return;
    await deleteImage.mutateAsync(image.id);
  }

  const isSaving = createImage.isPending || updateImage.isPending;

  return (
    <div className="admin">
      <div className="admin-topbar">
        <div>
          <p className="admin-title">Instagram</p>
          <p className="admin-subtitle">{images?.length ?? 0} tuile(s) sur la grille « @lhtstore »</p>
        </div>
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreateForm}>
          + Nouvelle tuile
        </button>
      </div>

      {showForm && (
        <div className="admin-panel">
          <div className="admin-panel__head">
            <p className="admin-panel__title">{editingId ? "Modifier la tuile" : "Nouvelle tuile"}</p>
            <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={closeForm}>
              Fermer
            </button>
          </div>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-field">
              <label htmlFor="s-caption">Légende (tant qu'il n'y a pas de vraie photo)</label>
              <input
                id="s-caption"
                value={form.caption}
                onChange={(e) => setForm((f) => ({ ...f, caption: e.target.value }))}
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
                {isSaving ? "Enregistrement…" : editingId ? "Enregistrer" : "Créer la tuile"}
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
        ) : !images?.length ? (
          <p className="admin-empty">Aucune tuile pour le moment.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Légende</th>
                <th>Ordre</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {images.map((image) => (
                <tr key={image.id}>
                  <td>
                    <div className="admin-table__thumb">
                      {image.image_url && <img src={toMediaUrl(image.image_url)} alt="" />}
                    </div>
                  </td>
                  <td>{image.caption || <span className="admin-subtitle">—</span>}</td>
                  <td>{image.sort_order}</td>
                  <td>
                    {image.is_active ? (
                      <span className="admin-pill admin-pill--new">Visible</span>
                    ) : (
                      <span className="admin-pill admin-pill--inactive">Masqué</span>
                    )}
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <button type="button" className="admin-btn admin-btn--sm" onClick={() => openEditForm(image)}>
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--sm admin-btn--danger"
                        onClick={() => handleDelete(image)}
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

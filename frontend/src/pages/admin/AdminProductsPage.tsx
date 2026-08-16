import { FormEvent, useState } from "react";
import {
  useAdminProducts,
  useCreateProduct,
  useDeleteProduct,
  useUpdateProduct,
  useUploadProductImage,
} from "@/features/products/hooks";
import { formatPrice, type Product, type ProductInput } from "@/features/products/types";
import { ApiError } from "@/lib/apiClient";
import { toMediaUrl } from "@/lib/apiClient";
import "@/styles/admin.css";

type FormState = {
  slug: string;
  name: string;
  shape: string;
  price: string;
  tagline: string;
  description: string;
  image_placeholder: string;
  image_url: string;
  badge: string;
  is_bestseller: boolean;
  is_new: boolean;
  is_active: boolean;
  sort_order: string;
};

const EMPTY_FORM: FormState = {
  slug: "",
  name: "",
  shape: "",
  price: "",
  tagline: "",
  description: "",
  image_placeholder: "",
  image_url: "",
  badge: "",
  is_bestseller: false,
  is_new: false,
  is_active: true,
  sort_order: "0",
};

function productToForm(product: Product): FormState {
  return {
    slug: product.slug,
    name: product.name,
    shape: product.shape,
    price: (product.price_cents / 100).toString(),
    tagline: product.tagline,
    description: product.description,
    image_placeholder: product.image_placeholder,
    image_url: product.image_url ?? "",
    badge: product.badge ?? "",
    is_bestseller: product.is_bestseller,
    is_new: product.is_new,
    is_active: product.is_active,
    sort_order: product.sort_order.toString(),
  };
}

function formToInput(form: FormState): ProductInput {
  return {
    slug: form.slug.trim(),
    name: form.name.trim(),
    shape: form.shape.trim(),
    price_cents: Math.round(parseFloat(form.price || "0") * 100),
    tagline: form.tagline.trim(),
    description: form.description.trim(),
    image_placeholder: form.image_placeholder.trim(),
    image_url: form.image_url.trim() || null,
    badge: form.badge.trim() || null,
    is_bestseller: form.is_bestseller,
    is_new: form.is_new,
    is_active: form.is_active,
    sort_order: parseInt(form.sort_order || "0", 10),
  };
}

export function AdminProductsPage() {
  const { data: products, isLoading } = useAdminProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const uploadImage = useUploadProductImage();

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

  function openEditForm(product: Product) {
    setEditingId(product.id);
    setForm(productToForm(product));
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
        await updateProduct.mutateAsync({ id: editingId, data: input });
      } else {
        await createProduct.mutateAsync(input);
      }
      closeForm();
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Une erreur est survenue.");
    }
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`Supprimer « ${product.name} » ? Cette action est irréversible.`)) return;
    await deleteProduct.mutateAsync(product.id);
  }

  const isSaving = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="admin">
      <div className="admin-topbar">
        <div>
          <p className="admin-title">Produits</p>
          <p className="admin-subtitle">{products?.length ?? 0} modèle(s) au catalogue</p>
        </div>
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreateForm}>
          + Nouveau produit
        </button>
      </div>

      {showForm && (
        <div className="admin-panel">
          <div className="admin-panel__head">
            <p className="admin-panel__title">{editingId ? "Modifier le produit" : "Nouveau produit"}</p>
            <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={closeForm}>
              Fermer
            </button>
          </div>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form-row">
              <div className="admin-field">
                <label htmlFor="p-name">Nom</label>
                <input
                  id="p-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label htmlFor="p-slug">Slug</label>
                <input
                  id="p-slug"
                  required
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label htmlFor="p-shape">Forme</label>
                <input
                  id="p-shape"
                  required
                  value={form.shape}
                  onChange={(e) => setForm((f) => ({ ...f, shape: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label htmlFor="p-price">Prix (MAD)</label>
                <input
                  id="p-price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                />
              </div>
            </div>

            <div className="admin-field">
              <label htmlFor="p-tagline">Accroche</label>
              <input
                id="p-tagline"
                value={form.tagline}
                onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value }))}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="p-description">Description</label>
              <textarea
                id="p-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="p-placeholder">Légende (tant qu'il n'y a pas de vraie photo)</label>
              <input
                id="p-placeholder"
                value={form.image_placeholder}
                onChange={(e) => setForm((f) => ({ ...f, image_placeholder: e.target.value }))}
              />
            </div>

            <div className="admin-field">
              <label>Photo</label>
              <div className="admin-image-picker">
                <div className="admin-image-picker__preview">
                  {form.image_url ? (
                    <img src={toMediaUrl(form.image_url)} alt="" />
                  ) : (
                    "Aucune"
                  )}
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
                <label htmlFor="p-badge">Badge (ex. Nouveau, Bestseller)</label>
                <input
                  id="p-badge"
                  value={form.badge}
                  onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label htmlFor="p-sort">Ordre d'affichage</label>
                <input
                  id="p-sort"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                />
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-field admin-field--checkbox">
                <input
                  id="p-bestseller"
                  type="checkbox"
                  checked={form.is_bestseller}
                  onChange={(e) => setForm((f) => ({ ...f, is_bestseller: e.target.checked }))}
                />
                <label htmlFor="p-bestseller">Bestseller</label>
              </div>
              <div className="admin-field admin-field--checkbox">
                <input
                  id="p-new"
                  type="checkbox"
                  checked={form.is_new}
                  onChange={(e) => setForm((f) => ({ ...f, is_new: e.target.checked }))}
                />
                <label htmlFor="p-new">Nouveau</label>
              </div>
              <div className="admin-field admin-field--checkbox">
                <input
                  id="p-active"
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                />
                <label htmlFor="p-active">Visible sur le site</label>
              </div>
            </div>

            {error && <p className="admin-error">{error}</p>}

            <div className="admin-form__actions">
              <button type="submit" className="admin-btn admin-btn--primary" disabled={isSaving}>
                {isSaving ? "Enregistrement…" : editingId ? "Enregistrer" : "Créer le produit"}
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
        ) : !products?.length ? (
          <p className="admin-empty">Aucun produit pour le moment.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th></th>
                <th>Nom</th>
                <th>Forme</th>
                <th>Prix</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <div className="admin-table__thumb">
                      {product.image_url && <img src={toMediaUrl(product.image_url)} alt="" />}
                    </div>
                  </td>
                  <td>
                    <strong>{product.name}</strong>
                    <div className="admin-subtitle">/{product.slug}</div>
                  </td>
                  <td>{product.shape}</td>
                  <td>{formatPrice(product)}</td>
                  <td>
                    {product.is_active ? (
                      <span className="admin-pill admin-pill--new">Visible</span>
                    ) : (
                      <span className="admin-pill admin-pill--inactive">Masqué</span>
                    )}
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <button type="button" className="admin-btn admin-btn--sm" onClick={() => openEditForm(product)}>
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--sm admin-btn--danger"
                        onClick={() => handleDelete(product)}
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

import { FormEvent, useState } from "react";
import {
  useAddProductToCollection,
  useAdminCollectionProducts,
  useAdminCollections,
  useCreateCollection,
  useDeleteCollection,
  useRemoveProductFromCollection,
  useUpdateCollection,
} from "@/features/collections/hooks";
import type { Collection, CollectionInput } from "@/features/collections/types";
import { useAdminProducts } from "@/features/products/hooks";
import { ApiError } from "@/lib/apiClient";
import "@/styles/admin.css";

type FormState = {
  slug: string;
  name: string;
  description: string;
  image_placeholder: string;
  is_active: boolean;
  sort_order: string;
};

const EMPTY_FORM: FormState = {
  slug: "",
  name: "",
  description: "",
  image_placeholder: "",
  is_active: true,
  sort_order: "0",
};

function collectionToForm(collection: Collection): FormState {
  return {
    slug: collection.slug,
    name: collection.name,
    description: collection.description,
    image_placeholder: collection.image_placeholder,
    is_active: collection.is_active,
    sort_order: collection.sort_order.toString(),
  };
}

function formToInput(form: FormState): CollectionInput {
  return {
    slug: form.slug.trim(),
    name: form.name.trim(),
    description: form.description.trim(),
    image_placeholder: form.image_placeholder.trim(),
    is_active: form.is_active,
    sort_order: parseInt(form.sort_order || "0", 10),
  };
}

function ManageProductsPanel({ collection, onClose }: { collection: Collection; onClose: () => void }) {
  const { data: detail } = useAdminCollectionProducts(collection.id);
  const { data: allProducts } = useAdminProducts();
  const addProduct = useAddProductToCollection();
  const removeProduct = useRemoveProductFromCollection();

  const memberIds = new Set((detail?.products ?? []).map((p) => p.id));
  const available = (allProducts ?? []).filter((p) => !memberIds.has(p.id));

  return (
    <div className="admin-panel">
      <div className="admin-panel__head">
        <p className="admin-panel__title">Produits de « {collection.name} »</p>
        <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={onClose}>
          Fermer
        </button>
      </div>
      <div className="admin-collection-manager">
        <div>
          <p className="admin-subtitle" style={{ marginBottom: 8 }}>
            Dans la collection ({detail?.products.length ?? 0})
          </p>
          <div className="admin-pick-list">
            {!detail?.products.length && <p className="admin-empty">Aucun produit ajouté.</p>}
            {detail?.products.map((product) => (
              <div className="admin-pick-list__row" key={product.id}>
                <span>{product.name}</span>
                <button
                  type="button"
                  className="admin-btn admin-btn--sm"
                  disabled={removeProduct.isPending}
                  onClick={() =>
                    removeProduct.mutate({ collectionId: collection.id, productId: product.id })
                  }
                >
                  Retirer
                </button>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="admin-subtitle" style={{ marginBottom: 8 }}>
            Disponibles ({available.length})
          </p>
          <div className="admin-pick-list">
            {!available.length && <p className="admin-empty">Tous les produits sont déjà dans cette collection.</p>}
            {available.map((product) => (
              <div className="admin-pick-list__row" key={product.id}>
                <span>{product.name}</span>
                <button
                  type="button"
                  className="admin-btn admin-btn--sm admin-btn--primary"
                  disabled={addProduct.isPending}
                  onClick={() => addProduct.mutate({ collectionId: collection.id, productId: product.id })}
                >
                  Ajouter
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminCollectionsPage() {
  const { data: collections, isLoading } = useAdminCollections();
  const createCollection = useCreateCollection();
  const updateCollection = useUpdateCollection();
  const deleteCollection = useDeleteCollection();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [managingCollection, setManagingCollection] = useState<Collection | null>(null);

  function openCreateForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  }

  function openEditForm(collection: Collection) {
    setEditingId(collection.id);
    setForm(collectionToForm(collection));
    setError(null);
    setShowForm(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    try {
      const input = formToInput(form);
      if (editingId) {
        await updateCollection.mutateAsync({ id: editingId, data: input });
      } else {
        await createCollection.mutateAsync(input);
      }
      setShowForm(false);
    } catch (err) {
      setError(err instanceof ApiError ? String(err.detail) : "Une erreur est survenue.");
    }
  }

  async function handleDelete(collection: Collection) {
    if (!window.confirm(`Supprimer la collection « ${collection.name} » ?`)) return;
    await deleteCollection.mutateAsync(collection.id);
    if (managingCollection?.id === collection.id) setManagingCollection(null);
  }

  const isSaving = createCollection.isPending || updateCollection.isPending;

  return (
    <div className="admin">
      <div className="admin-topbar">
        <div>
          <p className="admin-title">Collections</p>
          <p className="admin-subtitle">{collections?.length ?? 0} collection(s)</p>
        </div>
        <button type="button" className="admin-btn admin-btn--primary" onClick={openCreateForm}>
          + Nouvelle collection
        </button>
      </div>

      {showForm && (
        <div className="admin-panel">
          <div className="admin-panel__head">
            <p className="admin-panel__title">{editingId ? "Modifier la collection" : "Nouvelle collection"}</p>
            <button type="button" className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => setShowForm(false)}>
              Fermer
            </button>
          </div>
          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form-row">
              <div className="admin-field">
                <label htmlFor="c-name">Nom</label>
                <input
                  id="c-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label htmlFor="c-slug">Slug</label>
                <input
                  id="c-slug"
                  required
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                />
              </div>
              <div className="admin-field">
                <label htmlFor="c-sort">Ordre d'affichage</label>
                <input
                  id="c-sort"
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))}
                />
              </div>
            </div>
            <div className="admin-field">
              <label htmlFor="c-description">Description</label>
              <textarea
                id="c-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="admin-field">
              <label htmlFor="c-placeholder">Légende visuelle</label>
              <input
                id="c-placeholder"
                value={form.image_placeholder}
                onChange={(e) => setForm((f) => ({ ...f, image_placeholder: e.target.value }))}
              />
            </div>
            <div className="admin-field admin-field--checkbox">
              <input
                id="c-active"
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
              />
              <label htmlFor="c-active">Visible sur le site</label>
            </div>
            {error && <p className="admin-error">{error}</p>}
            <div className="admin-form__actions">
              <button type="submit" className="admin-btn admin-btn--primary" disabled={isSaving}>
                {isSaving ? "Enregistrement…" : editingId ? "Enregistrer" : "Créer la collection"}
              </button>
              <button type="button" className="admin-btn" onClick={() => setShowForm(false)}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {managingCollection && (
        <ManageProductsPanel collection={managingCollection} onClose={() => setManagingCollection(null)} />
      )}

      <div className="admin-table-wrap">
        {isLoading ? (
          <p className="admin-empty">Chargement…</p>
        ) : !collections?.length ? (
          <p className="admin-empty">Aucune collection pour le moment.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Produits</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {collections.map((collection) => (
                <tr key={collection.id}>
                  <td>
                    <strong>{collection.name}</strong>
                    <div className="admin-subtitle">/{collection.slug}</div>
                  </td>
                  <td>{collection.product_count}</td>
                  <td>
                    {collection.is_active ? (
                      <span className="admin-pill admin-pill--new">Visible</span>
                    ) : (
                      <span className="admin-pill admin-pill--inactive">Masqué</span>
                    )}
                  </td>
                  <td>
                    <div className="admin-table__actions">
                      <button
                        type="button"
                        className="admin-btn admin-btn--sm"
                        onClick={() => setManagingCollection(collection)}
                      >
                        Produits
                      </button>
                      <button type="button" className="admin-btn admin-btn--sm" onClick={() => openEditForm(collection)}>
                        Modifier
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--sm admin-btn--danger"
                        onClick={() => handleDelete(collection)}
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

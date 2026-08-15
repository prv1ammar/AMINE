import { apiClient } from "@/lib/apiClient";
import { adminApiClient } from "@/lib/adminApiClient";
import type { Collection, CollectionInput, CollectionWithProducts } from "./types";

export const collectionsApi = {
  list: () => apiClient.get<Collection[]>("/collections"),
  getBySlug: (slug: string) => apiClient.get<CollectionWithProducts>(`/collections/${slug}`),
};

export const adminCollectionsApi = {
  list: () => adminApiClient.get<Collection[]>("/admin/collections"),
  create: (data: CollectionInput) => adminApiClient.post<Collection>("/admin/collections", data),
  update: (id: number, data: Partial<CollectionInput>) =>
    adminApiClient.put<Collection>(`/admin/collections/${id}`, data),
  remove: (id: number) => adminApiClient.delete<void>(`/admin/collections/${id}`),
  getProducts: (id: number) =>
    adminApiClient.get<CollectionWithProducts>(`/admin/collections/${id}/products`),
  addProduct: (id: number, productId: number, position = 0) =>
    adminApiClient.post<void>(`/admin/collections/${id}/products`, { product_id: productId, position }),
  removeProduct: (id: number, productId: number) =>
    adminApiClient.delete<void>(`/admin/collections/${id}/products/${productId}`),
};

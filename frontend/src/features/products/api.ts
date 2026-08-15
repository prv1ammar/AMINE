import { apiClient } from "@/lib/apiClient";
import { adminApiClient } from "@/lib/adminApiClient";
import type { Product, ProductInput } from "./types";

export const productsApi = {
  list: () => apiClient.get<Product[]>("/products"),
  getBySlug: (slug: string) => apiClient.get<Product>(`/products/${slug}`),
};

export const adminProductsApi = {
  list: () => adminApiClient.get<Product[]>("/admin/products"),
  create: (data: ProductInput) => adminApiClient.post<Product>("/admin/products", data),
  update: (id: number, data: Partial<ProductInput>) =>
    adminApiClient.put<Product>(`/admin/products/${id}`, data),
  remove: (id: number) => adminApiClient.delete<void>(`/admin/products/${id}`),
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return adminApiClient.post<{ url: string }>("/admin/uploads", form);
  },
};

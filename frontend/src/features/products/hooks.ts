import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminProductsApi, productsApi } from "./api";
import type { ProductInput } from "./types";

export function useProducts() {
  return useQuery({ queryKey: ["products"], queryFn: productsApi.list });
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ["products", slug],
    queryFn: () => productsApi.getBySlug(slug!),
    enabled: Boolean(slug),
  });
}

export function useAdminProducts() {
  return useQuery({ queryKey: ["admin", "products"], queryFn: adminProductsApi.list });
}

function useInvalidateProducts() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
  };
}

export function useCreateProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (data: ProductInput) => adminProductsApi.create(data),
    onSuccess: invalidate,
  });
}

export function useUpdateProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProductInput> }) =>
      adminProductsApi.update(id, data),
    onSuccess: invalidate,
  });
}

export function useDeleteProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (id: number) => adminProductsApi.remove(id),
    onSuccess: invalidate,
  });
}

export function useUploadProductImage() {
  return useMutation({ mutationFn: (file: File) => adminProductsApi.uploadImage(file) });
}

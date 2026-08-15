import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminCollectionsApi, collectionsApi } from "./api";
import type { CollectionInput } from "./types";

export function useCollections() {
  return useQuery({ queryKey: ["collections"], queryFn: collectionsApi.list });
}

export function useCollection(slug: string | undefined) {
  return useQuery({
    queryKey: ["collections", slug],
    queryFn: () => collectionsApi.getBySlug(slug!),
    enabled: Boolean(slug),
  });
}

export function useAdminCollections() {
  return useQuery({ queryKey: ["admin", "collections"], queryFn: adminCollectionsApi.list });
}

export function useAdminCollectionProducts(id: number | undefined) {
  return useQuery({
    queryKey: ["admin", "collections", id, "products"],
    queryFn: () => adminCollectionsApi.getProducts(id!),
    enabled: Boolean(id),
  });
}

function useInvalidateCollections() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["collections"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "collections"] });
  };
}

export function useCreateCollection() {
  const invalidate = useInvalidateCollections();
  return useMutation({
    mutationFn: (data: CollectionInput) => adminCollectionsApi.create(data),
    onSuccess: invalidate,
  });
}

export function useUpdateCollection() {
  const invalidate = useInvalidateCollections();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CollectionInput> }) =>
      adminCollectionsApi.update(id, data),
    onSuccess: invalidate,
  });
}

export function useDeleteCollection() {
  const invalidate = useInvalidateCollections();
  return useMutation({
    mutationFn: (id: number) => adminCollectionsApi.remove(id),
    onSuccess: invalidate,
  });
}

export function useAddProductToCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, productId }: { collectionId: number; productId: number }) =>
      adminCollectionsApi.addProduct(collectionId, productId),
    onSuccess: (_data, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "collections", collectionId, "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "collections"] });
    },
  });
}

export function useRemoveProductFromCollection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, productId }: { collectionId: number; productId: number }) =>
      adminCollectionsApi.removeProduct(collectionId, productId),
    onSuccess: (_data, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "collections", collectionId, "products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "collections"] });
    },
  });
}

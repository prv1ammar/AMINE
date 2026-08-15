import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminLookbookEntriesApi, lookbookEntriesApi } from "./api";
import type { LookbookEntryInput } from "./types";

export function useLookbookEntries() {
  return useQuery({ queryKey: ["lookbook-entries"], queryFn: lookbookEntriesApi.list });
}

export function useAdminLookbookEntries() {
  return useQuery({ queryKey: ["admin", "lookbook-entries"], queryFn: adminLookbookEntriesApi.list });
}

function useInvalidateLookbookEntries() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["lookbook-entries"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "lookbook-entries"] });
  };
}

export function useCreateLookbookEntry() {
  const invalidate = useInvalidateLookbookEntries();
  return useMutation({
    mutationFn: (data: LookbookEntryInput) => adminLookbookEntriesApi.create(data),
    onSuccess: invalidate,
  });
}

export function useUpdateLookbookEntry() {
  const invalidate = useInvalidateLookbookEntries();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<LookbookEntryInput> }) =>
      adminLookbookEntriesApi.update(id, data),
    onSuccess: invalidate,
  });
}

export function useDeleteLookbookEntry() {
  const invalidate = useInvalidateLookbookEntries();
  return useMutation({
    mutationFn: (id: number) => adminLookbookEntriesApi.remove(id),
    onSuccess: invalidate,
  });
}

export function useUploadLookbookImage() {
  return useMutation({ mutationFn: (file: File) => adminLookbookEntriesApi.uploadImage(file) });
}

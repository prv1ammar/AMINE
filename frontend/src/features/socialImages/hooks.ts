import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminSocialImagesApi, socialImagesApi } from "./api";
import type { SocialImageInput } from "./types";

export function useSocialImages() {
  return useQuery({ queryKey: ["social-images"], queryFn: socialImagesApi.list });
}

export function useAdminSocialImages() {
  return useQuery({ queryKey: ["admin", "social-images"], queryFn: adminSocialImagesApi.list });
}

function useInvalidateSocialImages() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["social-images"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "social-images"] });
  };
}

export function useCreateSocialImage() {
  const invalidate = useInvalidateSocialImages();
  return useMutation({
    mutationFn: (data: SocialImageInput) => adminSocialImagesApi.create(data),
    onSuccess: invalidate,
  });
}

export function useUpdateSocialImage() {
  const invalidate = useInvalidateSocialImages();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SocialImageInput> }) =>
      adminSocialImagesApi.update(id, data),
    onSuccess: invalidate,
  });
}

export function useDeleteSocialImage() {
  const invalidate = useInvalidateSocialImages();
  return useMutation({
    mutationFn: (id: number) => adminSocialImagesApi.remove(id),
    onSuccess: invalidate,
  });
}

export function useUploadSocialImage() {
  return useMutation({ mutationFn: (file: File) => adminSocialImagesApi.uploadImage(file) });
}

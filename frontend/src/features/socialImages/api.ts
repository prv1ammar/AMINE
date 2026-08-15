import { apiClient } from "@/lib/apiClient";
import { adminApiClient } from "@/lib/adminApiClient";
import type { SocialImage, SocialImageInput } from "./types";

export const socialImagesApi = {
  list: () => apiClient.get<SocialImage[]>("/social-images"),
};

export const adminSocialImagesApi = {
  list: () => adminApiClient.get<SocialImage[]>("/admin/social-images"),
  create: (data: SocialImageInput) => adminApiClient.post<SocialImage>("/admin/social-images", data),
  update: (id: number, data: Partial<SocialImageInput>) =>
    adminApiClient.put<SocialImage>(`/admin/social-images/${id}`, data),
  remove: (id: number) => adminApiClient.delete<void>(`/admin/social-images/${id}`),
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return adminApiClient.post<{ url: string }>("/admin/uploads", form);
  },
};

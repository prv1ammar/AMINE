import { apiClient } from "@/lib/apiClient";
import { adminApiClient } from "@/lib/adminApiClient";
import type { LookbookEntry, LookbookEntryInput } from "./types";

export const lookbookEntriesApi = {
  list: () => apiClient.get<LookbookEntry[]>("/lookbook-entries"),
};

export const adminLookbookEntriesApi = {
  list: () => adminApiClient.get<LookbookEntry[]>("/admin/lookbook-entries"),
  create: (data: LookbookEntryInput) => adminApiClient.post<LookbookEntry>("/admin/lookbook-entries", data),
  update: (id: number, data: Partial<LookbookEntryInput>) =>
    adminApiClient.put<LookbookEntry>(`/admin/lookbook-entries/${id}`, data),
  remove: (id: number) => adminApiClient.delete<void>(`/admin/lookbook-entries/${id}`),
  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return adminApiClient.post<{ url: string }>("/admin/uploads", form);
  },
};

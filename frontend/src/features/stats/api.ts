import { apiClient } from "@/lib/apiClient";
import { adminApiClient } from "@/lib/adminApiClient";
import type { Stat, StatInput } from "./types";

export const statsApi = {
  list: () => apiClient.get<Stat[]>("/stats"),
};

export const adminStatsApi = {
  list: () => adminApiClient.get<Stat[]>("/admin/stats"),
  create: (data: StatInput) => adminApiClient.post<Stat>("/admin/stats", data),
  update: (id: number, data: Partial<StatInput>) => adminApiClient.put<Stat>(`/admin/stats/${id}`, data),
  remove: (id: number) => adminApiClient.delete<void>(`/admin/stats/${id}`),
};

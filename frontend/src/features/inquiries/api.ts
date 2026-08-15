import { apiClient } from "@/lib/apiClient";
import { adminApiClient } from "@/lib/adminApiClient";
import type { Inquiry, InquiryCreate, InquiryStatus } from "./types";

export const inquiriesApi = {
  create: (data: InquiryCreate) => apiClient.post<Inquiry>("/inquiries", data),
};

export const adminInquiriesApi = {
  list: () => adminApiClient.get<Inquiry[]>("/admin/inquiries"),
  updateStatus: (id: number, status: InquiryStatus) =>
    adminApiClient.patch<Inquiry>(`/admin/inquiries/${id}`, { status }),
};

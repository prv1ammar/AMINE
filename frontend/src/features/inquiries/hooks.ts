import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminInquiriesApi, inquiriesApi } from "./api";
import type { InquiryStatus } from "./types";

export function useCreateInquiry() {
  return useMutation({ mutationFn: inquiriesApi.create });
}

export function useAdminInquiries() {
  return useQuery({ queryKey: ["admin", "inquiries"], queryFn: adminInquiriesApi.list });
}

export function useUpdateInquiryStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: InquiryStatus }) =>
      adminInquiriesApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "inquiries"] }),
  });
}

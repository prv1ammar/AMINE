import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { adminStatsApi, statsApi } from "./api";
import type { StatInput } from "./types";

export function useStats() {
  return useQuery({ queryKey: ["stats"], queryFn: statsApi.list });
}

export function useAdminStats() {
  return useQuery({ queryKey: ["admin", "stats"], queryFn: adminStatsApi.list });
}

function useInvalidateStats() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["stats"] });
    queryClient.invalidateQueries({ queryKey: ["admin", "stats"] });
  };
}

export function useCreateStat() {
  const invalidate = useInvalidateStats();
  return useMutation({
    mutationFn: (data: StatInput) => adminStatsApi.create(data),
    onSuccess: invalidate,
  });
}

export function useUpdateStat() {
  const invalidate = useInvalidateStats();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<StatInput> }) => adminStatsApi.update(id, data),
    onSuccess: invalidate,
  });
}

export function useDeleteStat() {
  const invalidate = useInvalidateStats();
  return useMutation({
    mutationFn: (id: number) => adminStatsApi.remove(id),
    onSuccess: invalidate,
  });
}

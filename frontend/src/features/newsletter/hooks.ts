import { useMutation, useQuery } from "@tanstack/react-query";
import { adminNewsletterApi, newsletterApi } from "./api";

export function useSubscribeNewsletter() {
  return useMutation({ mutationFn: newsletterApi.subscribe });
}

export function useAdminNewsletterSubscribers() {
  return useQuery({ queryKey: ["admin", "newsletter"], queryFn: adminNewsletterApi.list });
}

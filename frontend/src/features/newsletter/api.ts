import { apiClient } from "@/lib/apiClient";
import { adminApiClient } from "@/lib/adminApiClient";

export interface NewsletterSubscriber {
  id: number;
  email: string;
  created_at: string;
}

export const newsletterApi = {
  subscribe: (email: string) => apiClient.post<NewsletterSubscriber>("/newsletter", { email }),
};

export const adminNewsletterApi = {
  list: () => adminApiClient.get<NewsletterSubscriber[]>("/admin/newsletter"),
};

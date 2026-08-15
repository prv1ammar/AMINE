import { apiClient } from "@/lib/apiClient";

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export const adminAuthApi = {
  login: (email: string, password: string) =>
    apiClient.post<TokenResponse>("/auth/login", { email, password }),
};

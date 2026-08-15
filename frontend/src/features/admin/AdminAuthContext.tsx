import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { clearAdminToken, getAdminToken, setAdminToken } from "@/lib/adminApiClient";
import { adminAuthApi } from "./auth";

interface AdminAuthContextValue {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getAdminToken()));

  const login = useCallback(async (email: string, password: string) => {
    const { access_token } = await adminAuthApi.login(email, password);
    setAdminToken(access_token);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    clearAdminToken();
    setIsAuthenticated(false);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  return ctx;
}

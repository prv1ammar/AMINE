import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/features/admin/AdminAuthContext";

export function RequireAdmin() {
  const { isAuthenticated } = useAdminAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

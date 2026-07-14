import { Navigate, Outlet } from "react-router-dom";
import { hasPermission } from "@/constants/rbac";
import { useAuthStore } from "@/stores/authStore";
import type { Permission } from "@/types/rbac";

export function ProtectedRoute({ permission }: { permission: Permission }) {
  const { isAuthenticated, role } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!hasPermission(role, permission)) return <Navigate to="/app/403" replace />;
  return <Outlet />;
}

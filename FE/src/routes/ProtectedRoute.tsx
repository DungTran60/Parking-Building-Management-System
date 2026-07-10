import { Navigate, Outlet } from "react-router-dom";
import { hasPermission } from "@/constants/rbac";
import { useAuthStore } from "@/stores/authStore";
import type { Permission } from "@/types/rbac";

export function ProtectedRoute({ permission }: { permission: Permission | Permission[] }) {
  const { isAuthenticated, role } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const permissions = Array.isArray(permission) ? permission : [permission];
  const allowed = permissions.some((p) => hasPermission(role, p));
  if (!allowed) return <Navigate to="/app/403" replace />;
  return <Outlet />;
}

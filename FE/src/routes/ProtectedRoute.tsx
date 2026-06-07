import { Navigate, Outlet } from "react-router-dom";
import { hasPermission } from "@/constants/rbac";
import { useAuthStore } from "@/stores/authStore";
import type { Permission } from "@/types/rbac";

export function ProtectedRoute({ permission }: { permission: Permission }) {
  const role = useAuthStore((state) => state.role);
  if (!hasPermission(role, permission)) return <Navigate to="/app/403" replace />;
  return <Outlet />;
}

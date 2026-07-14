import { Navigate, Outlet } from "react-router-dom";
import { AppLayout } from "@/layouts/AppLayout";
import { useAuthStore } from "@/stores/authStore";

export default function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

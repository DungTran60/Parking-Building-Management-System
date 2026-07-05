import type { ReactNode } from "react";
import { LogOut, Menu, ParkingCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/common/Button";
import { ROLE_LABELS } from "@/constants/rbac";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";

export function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { role, userName, logout } = useAuthStore();
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/95 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="h-10 w-10 px-0 lg:hidden" onClick={toggleSidebar} aria-label="Mở menu">
              <Menu size={20} />
            </Button>
            <div className="hidden items-center gap-2 md:flex">
              <ParkingCircle className="text-primary" />
              <span className="font-semibold text-slate-900">Parking Building Management</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right text-sm md:block">
              <p className="font-medium text-slate-900">{userName}</p>
              <p className="text-slate-500">{ROLE_LABELS[role]}</p>
            </div>
            <Button variant="secondary" onClick={handleLogout} aria-label="Đăng xuất">
              <LogOut size={17} />
              <span className="hidden sm:inline">Đăng xuất</span>
            </Button>
          </div>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

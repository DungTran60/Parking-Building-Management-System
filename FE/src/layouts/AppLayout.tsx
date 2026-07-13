import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, LogOut, Menu, ParkingCircle, Settings, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { settingApi } from "@/api/settingApi";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/common/Button";
import { ROLE_LABELS } from "@/constants/rbac";
import { authApi } from "@/api/authApi";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";

export function AppLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { role, userName, logout } = useAuthStore();
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const { data: settings } = useQuery({
    queryKey: ["system-settings"],
    queryFn: settingApi.get,
    staleTime: 60000
  });
  const systemName = settings?.systemName ?? "Parking Building Management";
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => { document.title = systemName; }, [systemName]);

  useEffect(() => {
    const closeUserMenu = (event: MouseEvent) => {
      if (!userMenuRef.current?.contains(event.target as Node)) setUserMenuOpen(false);
    };
    const closeUserMenuOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setUserMenuOpen(false);
    };

    document.addEventListener("mousedown", closeUserMenu);
    document.addEventListener("keydown", closeUserMenuOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeUserMenu);
      document.removeEventListener("keydown", closeUserMenuOnEscape);
    };
  }, []);

  const navigateFromUserMenu = (path: string) => {
    setUserMenuOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    try { await authApi.logout(); } catch { /* ignore */ }
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
              <span className="font-semibold text-slate-900">{systemName}</span>
            </div>
          </div>
          <div ref={userMenuRef} className="relative">
            <button
              type="button"
              onClick={() => setUserMenuOpen((open) => !open)}
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-slate-100"
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-primary">
                <UserRound size={20} />
              </span>
              <span className="hidden min-w-0 sm:block">
                <span className="block truncate text-sm font-semibold text-slate-900">{userName}</span>
                <span className="block truncate text-xs text-slate-500">{ROLE_LABELS[role]}</span>
              </span>
              <ChevronDown className={`text-slate-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} size={16} />
            </button>

            {userMenuOpen && (
              <div role="menu" className="absolute right-0 mt-2 w-52 overflow-hidden rounded-lg border border-border bg-white py-1 shadow-lg">
                <button type="button" role="menuitem" onClick={() => navigateFromUserMenu("/app/profile")} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                  <UserRound size={17} />
                  Hồ sơ
                </button>
                {/* <button type="button" role="menuitem" onClick={() => navigateFromUserMenu("/app/settings")} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                  <Settings size={17} />
                  Cài đặt
                </button> */}
                <div className="my-1 border-t border-border" />
                <button type="button" role="menuitem" onClick={handleLogout} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                  <LogOut size={17} />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </header>
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

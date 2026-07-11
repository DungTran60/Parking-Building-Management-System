import { NavLink } from "react-router-dom";
import { ParkingCircle } from "lucide-react";
import { NAV_ITEMS } from "@/constants/navigation";
import { hasPermission } from "@/constants/rbac";
import { useAuthStore } from "@/stores/authStore";
import { useUiStore } from "@/stores/uiStore";
import { cn } from "@/utils/cn";

export function Sidebar() {
  const role = useAuthStore((state) => state.role);
  const { sidebarOpen, closeSidebar } = useUiStore();
  const items = NAV_ITEMS.filter((item) =>
    (Array.isArray(item.permission) ? item.permission : [item.permission]).some((p) => hasPermission(role, p))
  );

  return (
    <>
      {sidebarOpen && <button className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden" onClick={closeSidebar} aria-label="Đóng menu" />}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col border-r border-slate-800 bg-slate-950 text-white transition lg:translate-x-0",
          sidebarOpen && "translate-x-0"
        )}
      >
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-800 px-5">
          <ParkingCircle className="text-blue-400" />
          <div>
            <p className="font-semibold">Parking Admin</p>
            <p className="text-xs text-slate-400">Enterprise Control</p>
          </div>
        </div>
        <nav className="grid flex-1 gap-1 overflow-y-auto p-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeSidebar}
                className={({ isActive }) =>
                  cn("flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-900 hover:text-white", isActive && "bg-blue-600 text-white")
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

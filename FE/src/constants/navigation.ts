import {
  BarChart3,
  Bot,
  Building2,
  CalendarClock,
  Car,
  CreditCard,
  DoorClosed,
  Gauge,
  LayoutGrid,
  LogIn,
  LogOut,
  Settings,
  Shield,
  SquareParking,
  Users
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Permission } from "@/types/rbac";

export interface NavItem {
  label: string;
  path: string;
  permission: Permission;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/app", permission: "dashboard:view", icon: Gauge },
  { label: "Tòa nhà", path: "/app/buildings", permission: "buildings:manage", icon: Building2 },
  { label: "Loại xe", path: "/app/vehicle-types", permission: "vehicleTypes:manage", icon: Car },
  { label: "Tầng", path: "/app/floors", permission: "floors:manage", icon: DoorClosed },
  { label: "Slot", path: "/app/slots", permission: "slots:manage", icon: LayoutGrid },
  { label: "Bảng giá", path: "/app/pricing", permission: "pricing:manage", icon: CreditCard },
  { label: "Xe vào", path: "/app/check-in", permission: "checkin:create", icon: LogIn },
  { label: "Xe ra", path: "/app/check-out", permission: "checkout:create", icon: LogOut },
  { label: "Parking Session", path: "/app/sessions", permission: "sessions:manage", icon: SquareParking },
  { label: "Đặt chỗ", path: "/app/reservations", permission: "reservations:manage", icon: CalendarClock },
  { label: "Báo cáo", path: "/app/reports", permission: "reports:view", icon: BarChart3 },
  { label: "AI Optimization", path: "/app/ai-optimization", permission: "ai:view", icon: Bot },
  { label: "User", path: "/app/users", permission: "users:manage", icon: Users },
  { label: "Phân quyền", path: "/app/roles", permission: "roles:manage", icon: Shield },
  { label: "Settings", path: "/app/settings", permission: "settings:manage", icon: Settings }
];

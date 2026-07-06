import {
  AlertTriangle,
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
  MapPin,
  MessageSquareWarning,
  Settings,
  Shield,
  SquareParking,
  Users,
  WalletCards
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
  { label: "Dashboard", path: "/app/dashboard", permission: "dashboard:view", icon: Gauge },
  { label: "Tòa nhà", path: "/app/buildings", permission: "buildings:manage", icon: Building2 },
  { label: "Thông tin bãi xe", path: "/app/parking-info", permission: "parkingInfo:view", icon: SquareParking },
  { label: "Loại xe", path: "/app/vehicle-types", permission: "vehicleTypes:manage", icon: Car },
  { label: "Tầng", path: "/app/floors", permission: "floors:manage", icon: DoorClosed },
  { label: "Slot", path: "/app/slots", permission: "slots:manage", icon: LayoutGrid },
  { label: "Bảng giá", path: "/app/pricing", permission: "pricing:manage", icon: CreditCard },
  { label: "Xe vào", path: "/app/check-in", permission: "checkin:create", icon: LogIn },
  { label: "Xe ra", path: "/app/check-out", permission: "checkout:create", icon: LogOut },
  { label: "Parking Session", path: "/app/sessions", permission: "sessions:manage", icon: SquareParking },
  { label: "Đặt chỗ", path: "/app/reservations", permission: "reservations:manage", icon: CalendarClock },
  { label: "Lượt gửi hiện tại", path: "/app/current-session", permission: "currentSession:view", icon: MapPin },
  { label: "Thanh toán", path: "/app/payments", permission: "payments:create", icon: WalletCards },
  { label: "Phản hồi sự cố", path: "/app/feedback", permission: "feedback:create", icon: MessageSquareWarning },
  { label: "Quản lý sự cố", path: "/app/incidents", permission: "incidents:manage", icon: AlertTriangle },
  { label: "Báo cáo", path: "/app/reports", permission: "reports:view", icon: BarChart3 },
  { label: "AI Optimization", path: "/app/ai-optimization", permission: "ai:view", icon: Bot },
  { label: "User", path: "/app/users", permission: "users:manage", icon: Users },
  { label: "Phân quyền", path: "/app/roles", permission: "roles:manage", icon: Shield },
  { label: "Settings", path: "/app/settings", permission: "settings:manage", icon: Settings }
];

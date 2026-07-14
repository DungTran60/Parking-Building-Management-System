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
  { label: "Tổng quan", path: "/app/dashboard", permission: "dashboard:view", icon: Gauge },
  { label: "Tòa nhà", path: "/app/buildings", permission: "buildings:manage", icon: Building2 },
  { label: "Thông tin chung", path: "/app/parking-info", permission: "parkingInfo:view", icon: SquareParking },
  { label: "Phân tầng", path: "/app/floors", permission: "floors:manage", icon: DoorClosed },
  { label: "Loại xe", path: "/app/vehicle-types", permission: "vehicleTypes:manage", icon: Car },
  { label: "Quản lý chỗ đỗ xe", path: "/app/slots", permission: "slots:view", icon: LayoutGrid },
  { label: "Bảng giá", path: "/app/pricing", permission: "pricing:manage", icon: CreditCard },
  { label: "Xe vào", path: "/app/check-in", permission: "checkin:create", icon: LogIn },
  { label: "Xe ra", path: "/app/check-out", permission: "checkout:create", icon: LogOut },
  { label: "Lượt gửi xe", path: "/app/sessions", permission: "sessions:view", icon: SquareParking },
  { label: "Đặt chỗ", path: "/app/reservations", permission: "reservations:selfManage", icon: CalendarClock },
  { label: "Xe đang gửi", path: "/app/current-session", permission: "currentSession:view", icon: MapPin },
  { label: "Thanh toán", path: "/app/payments", permission: "payments:pay", icon: WalletCards },
  { label: "Xử lý sự cố", path: "/app/incidents", permission: "exceptions:manage", icon: MessageSquareWarning },
  { label: "Phản ánh sự cố", path: "/app/feedback", permission: "feedback:create", icon: MessageSquareWarning },
  { label: "Báo cáo", path: "/app/reports", permission: "reports:view", icon: BarChart3 },
  { label: "Tài khoản", path: "/app/users", permission: "users:manage", icon: Users },
  { label: "Cài đặt", path: "/app/settings", permission: "settings:manage", icon: Settings },
  { label: "Bảo mật", path: "/app/audit-logs", permission: "audit:view", icon: Shield }
  // { label: "AI Optimization", path: "/app/ai-optimization", permission: "ai:view", icon: Bot },
];

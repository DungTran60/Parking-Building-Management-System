import type { Permission, Role } from "@/types/rbac";

export const ROLE_LABELS: Record<Role, string> = {
  SYSTEM_ADMIN: "Quản trị hệ thống",
  PARKING_MANAGER: "Quản lý bãi xe",
  PARKING_STAFF: "Nhân viên bãi xe",
  PARKING_USER: "Người dùng / Tài xế"
};

export const PERMISSION_LABELS: Record<Permission, string> = {
  "users:manage": "Quản lý tài khoản",
  "settings:manage": "Quản lý cài đặt",
  "profile:view": "Xem thông tin cá nhân",

  "dashboard:view": "Xem tổng quan",
  "buildings:manage": "Quản lý tòa nhà",
  "parkingInfo:view": "Xem bãi đỗ xe",
  "vehicleTypes:manage": "Quản lý loại xe",
  "floors:manage": "Quản lý tầng",
  "slots:manage": "Quản lý vị trí đỗ",
  "slots:view": "Xem vị trí đỗ",
  "slots:updateStatus": "Cập nhật trạng thái vị trí đỗ",

  "pricing:manage": "Quản lý bảng giá",

  "checkin:create": "Ghi nhận xe vào",
  "checkout:create": "Ghi nhận xe ra",

  "sessions:manage": "Quản lý lịch sử gửi xe",
  "sessions:view": "Xem lịch sử gửi xe",
  "exceptions:manage": "Xử lý trường hợp ngoại lệ",
  "incidents:create": "Ghi nhận sự cố",
  "incidents:assign": "Phân công sự cố",
  "incidents:process": "Nhận xử lý sự cố",
  "incidents:resolve": "Giải quyết sự cố",
  "incidents:close": "Đóng sự cố",
  "incidents:delete": "Xóa sự cố",
  "currentSession:view": "Xem xe đang gửi",
  "reservations:selfManage": "Quản lý đặt chỗ cá nhân",

  "payments:pay": "Thanh toán phí gửi xe",
  "payments:collect": "Thu phí gửi xe",
  "feedback:create": "Gửi phản ánh",

  "reports:view": "Xem báo cáo",
  "ai:view": "Sử dụng AI",
  "audit:view": "Xem nhật ký bảo mật"
};

const RBAC_SCHEMA_VERSION = 7;
const ROLE_PERMISSIONS_STORAGE_KEY = `parking-bms-role-permissions-v${RBAC_SCHEMA_VERSION}`;
const LEGACY_ROLE_PERMISSIONS_STORAGE_KEY = "parking-bms-role-permissions";

const DEFAULT_ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SYSTEM_ADMIN: [
    "profile:view",
    "users:manage",
    "settings:manage",
    "audit:view",
    "incidents:assign",
    "incidents:close",
    "incidents:delete"
  ],
  PARKING_MANAGER: [
    "dashboard:view",
    "profile:view",
    "buildings:manage",
    "floors:manage",
    "vehicleTypes:manage",
    "slots:view",
    "slots:manage",
    "pricing:manage",
    "sessions:view",
    "exceptions:manage",
    "reports:view",
    "incidents:assign",
    "incidents:close"
  ],
  PARKING_STAFF: [
    "dashboard:view",
    "profile:view",
    "slots:view",
    "slots:updateStatus",
    "sessions:view",
    "exceptions:manage",
    "checkin:create",
    "checkout:create",
    "payments:collect",
    "incidents:create",
    "incidents:process",
    "incidents:resolve"
  ],
  PARKING_USER: [
    "parkingInfo:view",
    "profile:view",
    "reservations:selfManage",
    "currentSession:view",
    "payments:pay",
    "feedback:create"
  ]
};

const getStoredRolePermissions = (): Record<Role, Permission[]> => {
  if (typeof window === "undefined") return DEFAULT_ROLE_PERMISSIONS;

  localStorage.removeItem(LEGACY_ROLE_PERMISSIONS_STORAGE_KEY);
  const storedValue = localStorage.getItem(ROLE_PERMISSIONS_STORAGE_KEY);
  if (!storedValue) return DEFAULT_ROLE_PERMISSIONS;

  try {
    const parsedValue = JSON.parse(storedValue) as Partial<Record<Role, Permission[]>>;
    const validPermissions = new Set(Object.keys(PERMISSION_LABELS) as Permission[]);
    return Object.fromEntries(
      (Object.keys(DEFAULT_ROLE_PERMISSIONS) as Role[]).map((role) => [
        role,
        Array.isArray(parsedValue[role])
          ? Array.from(new Set(parsedValue[role].filter((permission) => validPermissions.has(permission))))
          : DEFAULT_ROLE_PERMISSIONS[role]
      ])
    ) as Record<Role, Permission[]>;
  } catch {
    localStorage.removeItem(ROLE_PERMISSIONS_STORAGE_KEY);
    return DEFAULT_ROLE_PERMISSIONS;
  }
};

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = getStoredRolePermissions();

export const hasPermission = (role: Role, permission: Permission) => ROLE_PERMISSIONS[role].includes(permission);

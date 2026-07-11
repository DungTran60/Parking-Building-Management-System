import type { Permission, Role } from "@/types/rbac";

export const ROLE_LABELS: Record<Role, string> = {
  SYSTEM_ADMIN: "Quản trị hệ thống",
  PARKING_MANAGER: "Quản lý bãi xe",
  PARKING_STAFF: "Nhân viên bãi xe",
  PARKING_USER: "Người dùng / Tài xế"
};

export const PERMISSION_LABELS: Record<Permission, string> = {
  "users:manage": "Quản lý tài khoản",
  "users:view": "Xem danh sách nhân viên",
  "roles:manage": "Quản lý phân quyền",
  "settings:manage": "Quản lý cài đặt",
  "audit:view": "Xem nhật ký hệ thống",

  "dashboard:view": "Xem tổng quan",
  "buildings:manage": "Quản lý tòa nhà",
  "parkingInfo:view": "Xem thông tin bãi xe",
  "vehicleTypes:manage": "Quản lý loại xe",
  "floors:manage": "Quản lý tầng",
  "slots:manage": "Quản lý vị trí đỗ",
  "slots:view": "Xem vị trí đỗ",
  "slots:updateStatus": "Cập nhật trạng thái vị trí đỗ",
  "vehicles:manage": "Quản lý phương tiện",

  "pricing:manage": "Quản lý bảng giá",

  "sessions:manage": "Quản lý phiên gửi xe",
  "sessions:view": "Xem phiên gửi xe",
  "checkin:create": "Ghi nhận xe vào",
  "checkout:create": "Ghi nhận xe ra",
  "exceptions:manage": "Xử lý trường hợp ngoại lệ",

  "currentSession:view": "Xem xe đang gửi",
  "reservations:selfManage": "Quản lý đặt chỗ cá nhân",
  "reservations:manage": "Quản lý & xác nhận đặt chỗ",

  "payments:pay": "Thanh toán phí gửi xe",
  "payments:collect": "Thu phí gửi xe",

  "feedback:create": "Gửi phản ánh",
  "feedback:resolve": "Xử lý phản ánh",

  "reports:view": "Xem báo cáo",
  "ai:view": "Sử dụng AI"
};

const RBAC_SCHEMA_VERSION = 8;
const ROLE_PERMISSIONS_STORAGE_KEY = `parking-bms-role-permissions-v${RBAC_SCHEMA_VERSION}`;
const LEGACY_ROLE_PERMISSIONS_STORAGE_KEY = "parking-bms-role-permissions";

const DEFAULT_ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SYSTEM_ADMIN: [
    "dashboard:view",
    "parkingInfo:view",
    "currentSession:view",
    "ai:view",
    "slots:view",
    "slots:manage",
    "slots:updateStatus",
    "sessions:view",
    "sessions:manage",
    "checkin:create",
    "checkout:create",
    "exceptions:manage",
    "payments:pay",
    "payments:collect",
    "vehicles:manage",
    "vehicleTypes:manage",
    "floors:manage",
    "buildings:manage",
    "pricing:manage",
    "feedback:create",
    "feedback:resolve",
    "reservations:selfManage",
    "reservations:manage",
    "reports:view",
    "users:view",
    "users:manage",
    "roles:manage",
    "settings:manage",
    "audit:view"
  ],
  PARKING_MANAGER: [
    "dashboard:view",
    "parkingInfo:view",
    "currentSession:view",
    "ai:view",
    "slots:view",
    "slots:manage",
    "slots:updateStatus",
    "sessions:view",
    "sessions:manage",
    "checkin:create",
    "checkout:create",
    "exceptions:manage",
    "payments:pay",
    "payments:collect",
    "vehicles:manage",
    "vehicleTypes:manage",
    "floors:manage",
    "buildings:manage",
    "pricing:manage",
    "feedback:create",
    "feedback:resolve",
    "reservations:selfManage",
    "reservations:manage",
    "reports:view",
    "users:view",
    "audit:view"
  ],
  PARKING_STAFF: [
    "dashboard:view",
    "parkingInfo:view",
    "currentSession:view",
    "ai:view",
    "slots:view",
    "slots:updateStatus",
    "sessions:view",
    "checkin:create",
    "checkout:create",
    "exceptions:manage",
    "payments:pay",
    "payments:collect",
    "vehicles:manage",
    "feedback:create",
    "reservations:selfManage"
  ],
  PARKING_USER: [
    "dashboard:view",
    "parkingInfo:view",
    "currentSession:view",
    "ai:view",
    "slots:view",
    "sessions:view",
    "payments:pay",
    "feedback:create",
    "reservations:selfManage"
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
      (Object.keys(DEFAULT_ROLE_PERMISSIONS) as Role[]).map((role) => {
        const stored = Array.isArray(parsedValue[role])
          ? Array.from(new Set(parsedValue[role].filter((permission) => validPermissions.has(permission))))
          : null;
        return [role, stored?.length ? stored : DEFAULT_ROLE_PERMISSIONS[role]];
      })
    ) as Record<Role, Permission[]>;
  } catch {
    localStorage.removeItem(ROLE_PERMISSIONS_STORAGE_KEY);
    return DEFAULT_ROLE_PERMISSIONS;
  }
};

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = getStoredRolePermissions();

export const saveRolePermissions = (role: Role, permissions: Permission[]) => {
  ROLE_PERMISSIONS[role] = [...permissions];
  localStorage.setItem(ROLE_PERMISSIONS_STORAGE_KEY, JSON.stringify(ROLE_PERMISSIONS));
};

export const hasPermission = (role: Role, permission: Permission) => ROLE_PERMISSIONS[role].includes(permission);

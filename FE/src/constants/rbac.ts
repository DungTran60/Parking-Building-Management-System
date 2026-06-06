import type { Permission, Role } from "@/types/rbac";

export const ROLE_LABELS: Record<Role, string> = {
  SYSTEM_ADMIN: "System Administrator",
  PARKING_MANAGER: "Parking Manager",
  PARKING_STAFF: "Parking Staff",
  PARKING_USER: "Parking User / Driver"
};

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SYSTEM_ADMIN: [
    "dashboard:view",
    "vehicleTypes:manage",
    "floors:manage",
    "slots:manage",
    "pricing:manage",
    "sessions:manage",
    "checkin:create",
    "checkout:create",
    "reservations:manage",
    "reports:view",
    "users:manage",
    "roles:manage",
    "settings:manage",
    "ai:view"
  ],
  PARKING_MANAGER: [
    "dashboard:view",
    "vehicleTypes:manage",
    "floors:manage",
    "slots:manage",
    "pricing:manage",
    "sessions:manage",
    "reservations:manage",
    "reports:view",
    "ai:view"
  ],
  PARKING_STAFF: ["dashboard:view", "slots:manage", "sessions:manage", "checkin:create", "checkout:create", "reservations:manage"],
  PARKING_USER: ["dashboard:view", "reservations:manage"]
};

export const hasPermission = (role: Role, permission: Permission) => ROLE_PERMISSIONS[role].includes(permission);

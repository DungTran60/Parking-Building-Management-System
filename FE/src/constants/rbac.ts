import type { Permission, Role } from "@/types/rbac";

export const ROLE_LABELS: Record<Role, string> = {
  SYSTEM_ADMIN: "System Administrator",
  PARKING_MANAGER: "Parking Manager",
  PARKING_STAFF: "Parking Staff",
  PARKING_USER: "Parking User / Driver"
};

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  SYSTEM_ADMIN: [ 
    "users:manage",
    "roles:manage",
    "settings:manage"
  ],
  PARKING_MANAGER: [
    "dashboard:view",
    "buildings:manage",
    "floors:manage",
    "vehicleTypes:manage",
    "slots:manage",
    "pricing:manage",
    "sessions:manage",
    "reports:view",
    "ai:view",
    "incidents:manage"
  ],
  PARKING_STAFF: [
    "dashboard:view",
    "slots:manage",
    "sessions:manage",
    "checkin:create",
    "checkout:create",
    "incidents:manage"
  ],
  PARKING_USER: [
    "parkingInfo:view",
    "parkingEntry:create",
    "reservations:manage",
    "currentSession:view",
    "payments:create",
    "feedback:create"
  ]
};

export const hasPermission = (role: Role, permission: Permission) => ROLE_PERMISSIONS[role].includes(permission);

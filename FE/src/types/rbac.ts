export type Role = "SYSTEM_ADMIN" | "PARKING_MANAGER" | "PARKING_STAFF" | "PARKING_USER";

export type Permission =
  | "dashboard:view"
  | "vehicleTypes:manage"
  | "floors:manage"
  | "slots:manage"
  | "pricing:manage"
  | "sessions:manage"
  | "checkin:create"
  | "checkout:create"
  | "reservations:manage"
  | "reports:view"
  | "users:manage"
  | "roles:manage"
  | "settings:manage"
  | "ai:view";

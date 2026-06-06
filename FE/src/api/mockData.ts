import dayjs from "dayjs";
import type {
  Building,
  Floor,
  ParkingSession,
  ParkingSlot,
  PricingPolicy,
  Reservation,
  User,
  VehicleType
} from "@/types/domain";

export const vehicleTypes: VehicleType[] = [
  { id: "motorbike", name: "Xe máy", size: "0.8m x 2m", capacityUnit: 1, color: "#2563eb" },
  { id: "car", name: "Ô tô", size: "2.5m x 5m", capacityUnit: 3, color: "#16a34a" },
  { id: "ev", name: "Xe điện", size: "2.5m x 5m", capacityUnit: 3, color: "#0891b2" },
  { id: "truck", name: "Xe tải", size: "3m x 8m", capacityUnit: 5, color: "#f59e0b" },
  { id: "coach", name: "Xe khách", size: "3m x 12m", capacityUnit: 8, color: "#dc2626" }
];

export const floors: Floor[] = [
  { id: "f1", buildingId: "b1", name: "B1", zone: "Motorbike A", supportedVehicleTypes: ["motorbike"], slotCount: 180 },
  { id: "f2", buildingId: "b1", name: "B2", zone: "Car B", supportedVehicleTypes: ["car", "ev"], slotCount: 120 },
  { id: "f3", buildingId: "b1", name: "L1", zone: "Mixed C", supportedVehicleTypes: ["car", "truck"], slotCount: 96 },
  { id: "f4", buildingId: "b2", name: "B1", zone: "Coach D", supportedVehicleTypes: ["coach", "truck"], slotCount: 52 }
];

const statuses = ["AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE", "BLOCKED"] as const;
export const slots: ParkingSlot[] = Array.from({ length: 80 }).map((_, index) => {
  const floor = floors[index % floors.length];
  const type = floor.supportedVehicleTypes[index % floor.supportedVehicleTypes.length];
  return {
    id: `s${index + 1}`,
    code: `${floor.name}-${String(index + 1).padStart(3, "0")}`,
    floorId: floor.id,
    vehicleTypeId: type,
    status: statuses[index % statuses.length],
    updatedAt: dayjs().subtract(index * 7, "minute").toISOString()
  };
});

export const pricingPolicies: PricingPolicy[] = vehicleTypes.map((type, index) => ({
  id: `p${index + 1}`,
  vehicleTypeId: type.id,
  firstHour: [5000, 25000, 30000, 45000, 60000][index],
  nextHour: [3000, 15000, 18000, 28000, 35000][index],
  dayPrice: [30000, 180000, 220000, 380000, 500000][index],
  overnightFee: [10000, 50000, 60000, 100000, 130000][index],
  lostTicketFee: [80000, 250000, 300000, 500000, 650000][index],
  wrongZoneFee: [20000, 70000, 80000, 140000, 180000][index],
  overtimeFee: [5000, 30000, 35000, 55000, 70000][index]
}));

export const sessions: ParkingSession[] = Array.from({ length: 18 }).map((_, index) => ({
  id: `ps${index + 1}`,
  ticketCode: `QR-${dayjs().format("YYMMDD")}-${1000 + index}`,
  plateNumber: index % 2 ? `51G-${12345 + index}` : `59X1-${23456 + index}`,
  vehicleTypeId: vehicleTypes[index % vehicleTypes.length].id,
  slotId: slots[index].id,
  entryGate: `Gate ${1 + (index % 4)}`,
  checkInAt: dayjs().subtract(index + 1, "hour").toISOString(),
  checkOutAt: index % 3 === 0 ? dayjs().subtract(index * 10, "minute").toISOString() : undefined,
  fee: 15000 + index * 7000,
  status: ["ACTIVE", "COMPLETED", "UNPAID", "LOST_TICKET", "EXPIRED"][index % 5] as ParkingSession["status"]
}));

export const reservations: Reservation[] = Array.from({ length: 10 }).map((_, index) => ({
  id: `r${index + 1}`,
  plateNumber: `RES-${8000 + index}`,
  vehicleTypeId: vehicleTypes[index % vehicleTypes.length].id,
  slotId: slots[index + 20].id,
  startAt: dayjs().add(index + 1, "hour").toISOString(),
  endAt: dayjs().add(index + 3, "hour").toISOString(),
  status: ["PENDING", "CONFIRMED", "CANCELLED"][index % 3] as Reservation["status"]
}));

export const users: User[] = [
  { id: "u1", username: "sysadmin", email: "admin@parking.vn", phone: "0901000001", role: "SYSTEM_ADMIN", status: "ACTIVE" },
  { id: "u2", username: "manager.hcm", email: "manager@parking.vn", phone: "0901000002", role: "PARKING_MANAGER", status: "ACTIVE" },
  { id: "u3", username: "staff.gate1", email: "staff1@parking.vn", phone: "0901000003", role: "PARKING_STAFF", status: "ACTIVE" },
  { id: "u4", username: "driver.lan", email: "driver@parking.vn", phone: "0901000004", role: "PARKING_USER", status: "INACTIVE" }
];

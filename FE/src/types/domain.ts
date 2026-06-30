import type { Role } from "@/types/rbac";

export type Status = "ACTIVE" | "INACTIVE";
export type SlotStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "MAINTENANCE" | "BLOCKED";
export type SessionStatus = "ACTIVE" | "COMPLETED" | "UNPAID" | "LOST_TICKET" | "EXPIRED";
export type ReservationStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
export type ExceptionType = "LOST_TICKET" | "WRONG_PLATE" | "WRONG_ZONE" | "OVERTIME" | "UNPAID";

export interface Building {
  id: string;
  name: string;
  address: string;
  floors: number;
  status: Status;
  capacity: number;
}

export interface VehicleType {
  id: string;
  name: string;
  size: string;
  capacityUnit: number;
  color: string;
}

export interface Floor {
  id: string;
  buildingId: string;
  name: string;
  zone: string;
  supportedVehicleTypes: string[];
  slotCount: number;
}

export interface ParkingSlot {
  id: string;
  code: string;
  floorId: string;
  vehicleTypeId: string;
  status: SlotStatus;
  updatedAt: string;
}

export interface PricingPolicy {
  id: string;
  vehicleTypeId: string;
  firstHour: number;
  nextHour: number;
  dayPrice: number;
  overnightFee: number;
  lostTicketFee: number;
  wrongZoneFee: number;
  overtimeFee: number;
}

export interface ParkingSession {
  id: string;
  ticketCode: string;
  plateNumber: string;
  vehicleTypeId: string;
  slotId: string;
  entryGate: string;
  checkInAt: string;
  checkOutAt?: string;
  fee: number;
  status: SessionStatus;
}

export interface Reservation {
  id: string;
  plateNumber: string;
  vehicleTypeId: string;
  slotId: string;
  startAt: string;
  endAt: string;
  status: ReservationStatus;
}

export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  role: Role;
  status: Status;
}

export interface ReportMetric {
  label: string;
  value: number;
}

export interface AiOptimizationResult {
  floorSuggestion: string;
  slotSuggestion: string;
  occupancyForecast: number;
  peakHourForecast: string;
  confidence: number;
}

export type PaymentMethod = "QR_CODE" | "BANK_CARD" | "CASH";

export interface PaymentRecord {
  id: string;
  sessionId: string;
  amount: number;
  method: PaymentMethod;
  paidAt: string;
}

import dayjs from "dayjs";
import { floors, pricingPolicies, reservations, sessions, slots, users, vehicleTypes } from "@/api/mockData";
import type { AiOptimizationResult, ParkingSession, PricingPolicy } from "@/types/domain";

const database = {
  vehicleTypes,
  floors,
  slots,
  pricingPolicies,
  sessions,
  reservations,
  users
};

export type ResourceName = keyof typeof database;

const wait = () => new Promise((resolve) => window.setTimeout(resolve, 180));

export async function listResource<T>(name: ResourceName): Promise<T[]> {
  await wait();
  return [...(database[name] as T[])];
}

export async function createResource<T extends { id: string }>(name: ResourceName, payload: Omit<T, "id">): Promise<T> {
  await wait();
  const item = { ...payload, id: crypto.randomUUID() } as T;
  (database[name] as unknown as T[]).unshift(item);
  return item;
}

export async function updateResource<T extends { id: string }>(name: ResourceName, id: string, payload: Partial<T>): Promise<T> {
  await wait();
  const rows = database[name] as unknown as T[];
  const index = rows.findIndex((item) => item.id === id);
  rows[index] = { ...rows[index], ...payload };
  return rows[index];
}

export async function deleteResource(name: ResourceName, id: string) {
  await wait();
  const rows = database[name] as { id: string }[];
  const index = rows.findIndex((item) => item.id === id);
  if (index >= 0) rows.splice(index, 1);
}

export async function calculateFee(vehicleTypeId: string, hours: number, extras: Partial<Record<"lostTicket" | "wrongZone" | "overtime", boolean>>) {
  await wait();
  const policy = pricingPolicies.find((item) => item.vehicleTypeId === vehicleTypeId) as PricingPolicy;
  const base = policy.firstHour + Math.max(0, Math.ceil(hours) - 1) * policy.nextHour;
  return base + (extras.lostTicket ? policy.lostTicketFee : 0) + (extras.wrongZone ? policy.wrongZoneFee : 0) + (extras.overtime ? policy.overtimeFee : 0);
}

export async function checkIn(payload: { plateNumber: string; vehicleTypeId: string; entryGate: string }): Promise<ParkingSession> {
  await wait();
  const slot = slots.find((item) => item.vehicleTypeId === payload.vehicleTypeId && item.status === "AVAILABLE") ?? slots[0];
  slot.status = "OCCUPIED";
  const session: ParkingSession = {
    id: crypto.randomUUID(),
    ticketCode: `QR-${dayjs().format("YYMMDD-HHmmss")}`,
    plateNumber: payload.plateNumber,
    vehicleTypeId: payload.vehicleTypeId,
    slotId: slot.id,
    entryGate: payload.entryGate,
    checkInAt: dayjs().toISOString(),
    fee: 0,
    status: "ACTIVE"
  };
  sessions.unshift(session);
  return session;
}

export async function checkOut(query: string): Promise<ParkingSession | undefined> {
  await wait();
  const session = sessions.find((item) => item.ticketCode === query || item.plateNumber === query);
  if (!session) return undefined;
  const hours = Math.max(1, dayjs().diff(dayjs(session.checkInAt), "hour", true));
  session.checkOutAt = dayjs().toISOString();
  session.fee = await calculateFee(session.vehicleTypeId, hours, {});
  session.status = "COMPLETED";
  return session;
}

export async function optimizeParking(input: { currentVehicles: number; emptySlots: number; vehicleTypeId: string }): Promise<AiOptimizationResult> {
  await wait();
  const floor = floors.find((item) => item.supportedVehicleTypes.includes(input.vehicleTypeId)) ?? floors[0];
  const slot = slots.find((item) => item.floorId === floor.id && item.status === "AVAILABLE") ?? slots[0];
  const occupancyForecast = Math.min(98, Math.round((input.currentVehicles / Math.max(1, input.currentVehicles + input.emptySlots)) * 100 + 8));
  return {
    floorSuggestion: `${floor.name} - ${floor.zone}`,
    slotSuggestion: slot.code,
    occupancyForecast,
    peakHourForecast: occupancyForecast > 85 ? "17:30 - 19:00" : "07:30 - 09:00",
    confidence: 88
  };
}

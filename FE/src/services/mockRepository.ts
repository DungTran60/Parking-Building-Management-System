import dayjs from "dayjs";
import { buildings, feedbackTickets, floors, mockLoginAccounts, payments, pricingPolicies, reservations, sessions, slots, users, vehicleTypes } from "@/api/mockData";
import type { AiOptimizationResult, FeedbackTicket, ParkingSession, PaymentMethod, PaymentRecord, PricingPolicy, Reservation, User } from "@/types/domain";

const database = {
  buildings,
  vehicleTypes,
  floors,
  slots,
  pricingPolicies,
  sessions,
  reservations,
  payments,
  feedbackTickets,
  users
};

export type ResourceName = keyof typeof database;

const wait = () => new Promise((resolve) => window.setTimeout(resolve, 180));

export type LoginResult =
  | { success: true; user: User }
  | { success: false; reason: "INVALID_CREDENTIALS" | "INACTIVE_ACCOUNT" };

export async function authenticateMockUser(identifier: string, password: string): Promise<LoginResult> {
  await wait();
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const user = users.find(
    (item) =>
      item.username.toLowerCase() === normalizedIdentifier ||
      item.email.toLowerCase() === normalizedIdentifier
  );
  const account = user
    ? mockLoginAccounts.find((item) => item.userId === user.id && item.password === password)
    : undefined;

  if (!user || !account) return { success: false, reason: "INVALID_CREDENTIALS" };
  if (user.status !== "ACTIVE") return { success: false, reason: "INACTIVE_ACCOUNT" };
  return { success: true, user };
}

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

export async function getAvailableSlots(vehicleTypeId?: string) {
  await wait();
  return slots.filter((item) => item.status === "AVAILABLE" && (!vehicleTypeId || item.vehicleTypeId === vehicleTypeId));
}

export async function createUserParkingTicket(payload: { plateNumber: string; vehicleTypeId: string; zone: string }) {
  const session = await checkIn({ plateNumber: payload.plateNumber, vehicleTypeId: payload.vehicleTypeId, entryGate: "User kiosk" });
  return { ...session, zone: payload.zone };
}

export async function getUserReservations() {
  await wait();
  return reservations.slice(0, 5);
}

export async function createUserReservation(payload: Omit<Reservation, "id" | "status">) {
  await wait();
  const reservation: Reservation = { ...payload, id: crypto.randomUUID(), status: "PENDING" };
  reservations.unshift(reservation);
  const slot = slots.find((item) => item.id === payload.slotId);
  if (slot) slot.status = "RESERVED";
  return reservation;
}

export async function cancelUserReservation(id: string) {
  await wait();
  const reservation = reservations.find((item) => item.id === id);
  if (!reservation) return undefined;
  reservation.status = "CANCELLED";
  const slot = slots.find((item) => item.id === reservation.slotId);
  if (slot?.status === "RESERVED") slot.status = "AVAILABLE";
  return reservation;
}

export async function getCurrentUserSession() {
  await wait();
  return sessions.find((item) => item.status === "ACTIVE") ?? sessions[0];
}

export async function payCurrentSession(method: PaymentMethod) {
  await wait();
  const session = sessions.find((item) => item.status === "ACTIVE") ?? sessions[0];
  const hours = Math.max(1, dayjs().diff(dayjs(session.checkInAt), "hour", true));
  session.fee = await calculateFee(session.vehicleTypeId, hours, {});
  session.status = "COMPLETED";
  session.checkOutAt = dayjs().toISOString();
  const payment: PaymentRecord = {
    id: crypto.randomUUID(),
    sessionId: session.id,
    amount: session.fee,
    method,
    status: "PAID",
    paidAt: dayjs().toISOString()
  };
  payments.unshift(payment);
  return payment;
}

export async function getUserPayments() {
  await wait();
  return [...payments];
}

export async function submitUserFeedback(payload: Omit<FeedbackTicket, "id" | "createdAt" | "status">) {
  await wait();
  const ticket: FeedbackTicket = {
    ...payload,
    id: crypto.randomUUID(),
    createdAt: dayjs().toISOString(),
    status: "OPEN"
  };
  feedbackTickets.unshift(ticket);
  return ticket;
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
// export async function getCurrentUserSession(): Promise<ParkingSession | null> {
//   try {
//     const response = await httpClient.get<ParkingSession>("/sessions/active");
//     return response.data;
//   } catch (error) {
//     return null;
//   }
// }

// export async function getUserPayments(): Promise<PaymentRecord[]> {
//   try {
//     const response = await httpClient.get<PaymentRecord[]>("/payments");
//     return response.data;
//   } catch (error) {
//     return [];
//   }
// }

// export async function payCurrentSession(method: PaymentMethod): Promise<void> {
//   const session = await getCurrentUserSession();
//   if (!session) return;
//   await httpClient.post("/payments", {
//     sessionId: session.id,
//     method
//   });
// }
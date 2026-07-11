import { buildings, feedbackTickets, floors, mockLoginAccounts, payments, pricingPolicies, reservations, sessions, slots, users, vehicleTypes } from "@/api/mockData";
import type { AiOptimizationResult, User } from "@/types/domain";

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

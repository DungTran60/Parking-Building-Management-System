import { buildingApi } from "@/api/buildingApi";
import { floorApi } from "@/api/floorApi";
import { slotApi } from "@/api/slotApi";
import { vehicleTypeApi } from "@/api/vehicleTypeApi";
import { pricingApi } from "@/api/pricingApi";
import { sessionApi } from "@/api/sessionApi";
import { reservationApi } from "@/api/reservationApi";
import { paymentApi } from "@/api/paymentApi";
import { userApi } from "@/api/userApi";

export type ResourceName = "buildings" | "vehicleTypes" | "floors" | "slots" | "pricingPolicies" | "sessions" | "reservations" | "payments" | "users";

export const resourceService = {
  list: async <T>(name: ResourceName): Promise<T[]> => {
    switch (name) {
      case "buildings": {
        const building = await buildingApi.get();
        return [building] as unknown as T[];
      }
      case "vehicleTypes": return (await vehicleTypeApi.getAll()) as unknown as T[];
      case "floors": return (await floorApi.getAll()) as unknown as T[];
      case "slots": return (await slotApi.getAll()) as unknown as T[];
      case "pricingPolicies": return (await pricingApi.getAll()) as unknown as T[];
      case "sessions": {
        const result = await sessionApi.list();
        return result.content as unknown as T[];
      }
      case "reservations": return (await reservationApi.getAll()) as unknown as T[];
      case "payments": return (await paymentApi.getAll()) as unknown as T[];
      case "users": return (await userApi.getAll()) as unknown as T[];
    }
  },
  create: async <T extends { id: string }>(name: ResourceName, payload: Omit<T, "id">): Promise<T> => {
    switch (name) {
      case "vehicleTypes": return (await vehicleTypeApi.create(payload as any)) as unknown as T;
      case "floors": return (await floorApi.create(payload as any)) as unknown as T;
      case "slots": return (await slotApi.create(payload as any)) as unknown as T;
      case "pricingPolicies": return (await pricingApi.create(payload as any)) as unknown as T;
      case "sessions": return (await sessionApi.checkIn(payload as any)) as unknown as T;
      case "payments": return (await paymentApi.create(payload as any)) as unknown as T;
      case "users": return (await userApi.create(payload as any)) as unknown as T;
      default: throw new Error(`create not supported for resource: ${name}`);
    }
  },
  update: async <T extends { id: string }>(name: ResourceName, id: string, payload: Partial<T>): Promise<T> => {
    switch (name) {
      case "buildings": return (await buildingApi.update(payload as any)) as unknown as T;
      case "vehicleTypes": return (await vehicleTypeApi.update(id, payload as any)) as unknown as T;
      case "floors": return (await floorApi.update(id, payload as any)) as unknown as T;
      case "slots": return (await slotApi.update(id, payload as any)) as unknown as T;
      case "pricingPolicies": return (await pricingApi.update(id, payload as any)) as unknown as T;
      case "users": return (await userApi.update(id, payload as any)) as unknown as T;
      default: throw new Error(`update not supported for resource: ${name}`);
    }
  },
  remove: async (name: ResourceName, id: string): Promise<void> => {
    switch (name) {
      case "vehicleTypes": await vehicleTypeApi.delete(id); return;
      case "floors": await floorApi.delete(id); return;
      case "slots": await slotApi.delete(id); return;
      case "pricingPolicies": await pricingApi.delete(id); return;
      case "users": await userApi.delete(id); return;
      default: throw new Error(`delete not supported for resource: ${name}`);
    }
  }
};

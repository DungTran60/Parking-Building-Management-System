import { httpClient } from "./httpClient";
import type { Vehicle } from "@/types/domain";

export type VehiclePayload = Pick<Vehicle, "plateNumber" | "vehicleTypeId" | "color">;

type VehicleResponse = Omit<Vehicle, "id"> & { id: string | number; vehicleTypeId: string | number; ownerUserId?: string | number };

const normalizeVehicle = (item: VehicleResponse): Vehicle => ({
  ...item,
  id: String(item.id),
  vehicleTypeId: String(item.vehicleTypeId),
  ownerUserId: item.ownerUserId == null ? undefined : String(item.ownerUserId)
});

export const vehicleApi = {
  getAll: async (): Promise<Vehicle[]> => {
    const response = await httpClient.get<VehicleResponse[]>("/vehicles");
    return response.data.map(normalizeVehicle);
  },

  getMine: async (): Promise<Vehicle[]> => {
    const response = await httpClient.get<VehicleResponse[]>("/vehicles/me");
    return response.data.map(normalizeVehicle);
  },

  getById: async (id: string): Promise<Vehicle> => {
    const response = await httpClient.get<VehicleResponse>(`/vehicles/${id}`);
    return normalizeVehicle(response.data);
  },

  create: async (payload: VehiclePayload): Promise<Vehicle> => {
    const response = await httpClient.post<VehicleResponse>("/vehicles", payload);
    return normalizeVehicle(response.data);
  },

  update: async (id: string, payload: Partial<VehiclePayload>): Promise<Vehicle> => {
    const response = await httpClient.put<VehicleResponse>(`/vehicles/${id}`, payload);
    return normalizeVehicle(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`/vehicles/${id}`);
  }
};

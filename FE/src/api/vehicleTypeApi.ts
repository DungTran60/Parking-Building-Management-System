import { httpClient } from "./httpClient";
import type { VehicleType } from "@/types/domain";

export type VehicleTypePayload = Pick<VehicleType, "code" | "name" | "description" | "status">;

type VehicleTypeResponse = Omit<VehicleType, "id"> & { id: string | number };

const normalizeVehicleType = (item: VehicleTypeResponse): VehicleType => ({
  ...item,
  id: String(item.id)
});

export const vehicleTypeApi = {
  getAll: async (): Promise<VehicleType[]> => {
    const response = await httpClient.get<VehicleTypeResponse[]>("/vehicle-types");
    return response.data.map(normalizeVehicleType);
  },

  create: async (payload: VehicleTypePayload): Promise<VehicleType> => {
    const response = await httpClient.post<VehicleTypeResponse>("/vehicle-types", payload);
    return normalizeVehicleType(response.data);
  },

  update: async (id: string, payload: Partial<VehicleTypePayload>): Promise<VehicleType> => {
    const response = await httpClient.put<VehicleTypeResponse>(`/vehicle-types/${id}`, payload);
    return normalizeVehicleType(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`/vehicle-types/${id}`);
  }
};

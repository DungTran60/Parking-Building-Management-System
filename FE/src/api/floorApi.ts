import { httpClient } from "./httpClient";
import type { Floor } from "@/types/domain";

/** Shape returned by BE FloorResponseDto */
interface FloorResponse {
  id: number | string;
  buildingId: number | string;
  name: string;
  zone: string;
  slotCount: number;
  supportedVehicleTypeIds: (number | string)[];
}

/** Shape sent to BE FloorRequestDto */
export interface FloorPayload {
  buildingId: number | string;
  name: string;
  zone?: string;
  slotCount: number;
  supportedVehicleTypeIds: (number | string)[];
}

export interface FloorStats {
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  reservedSlots: number;
  maintenanceSlots: number;
  blockedSlots: number;
  occupancyRate: number;
}

const normalize = (item: FloorResponse): Floor => ({
  id: String(item.id),
  buildingId: String(item.buildingId),
  name: item.name,
  zone: item.zone ?? "",
  slotCount: item.slotCount,
  supportedVehicleTypes: (item.supportedVehicleTypeIds ?? []).map(String)
});

export const floorApi = {
  getAll: async (): Promise<Floor[]> => {
    const response = await httpClient.get<FloorResponse[]>("/floors");
    return response.data.map(normalize);
  },
  getByBuilding: async (buildingId: string): Promise<Floor[]> => {
    const response = await httpClient.get<FloorResponse[]>("/floors", {
      params: { buildingId }
    });
    return response.data.map(normalize);
  },

  getStats: async (id: string): Promise<FloorStats> =>
    (await httpClient.get<FloorStats>(`/floors/${id}/stats`)).data,

  create: async (payload: FloorPayload): Promise<Floor> => {
    const response = await httpClient.post<FloorResponse>("/floors", payload);
    return normalize(response.data);
  },

  update: async (id: string, payload: FloorPayload): Promise<Floor> => {
    const response = await httpClient.put<FloorResponse>(`/floors/${id}`, payload);
    return normalize(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`/floors/${id}`);
  }
};

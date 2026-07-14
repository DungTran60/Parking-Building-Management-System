import { httpClient } from "./httpClient";
import type { SlotStatus } from "@/types/domain";

export interface SlotResponse {
  id: number | string;
  code: string;
  floorId: number | string;
  vehicleTypeId: string;
  status: SlotStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface SaveSlotRequest {
  code: string;
  floorId: number | string;
  vehicleTypeId: string;
  status: SlotStatus;
}

export const slotApi = {
  getAll: async (): Promise<SlotResponse[]> => {
    const response = await httpClient.get<SlotResponse[]>("/slots");
    return response.data;
  },

  getAvailable: async (vehicleTypeId?: string): Promise<SlotResponse[]> => {
    const response = await httpClient.get<SlotResponse[]>("/slots/available", {
      params: vehicleTypeId ? { vehicleTypeId } : undefined
    });
    return response.data;
  },

  create: async (payload: SaveSlotRequest): Promise<SlotResponse> => {
    const response = await httpClient.post<SlotResponse>("/slots", payload);
    return response.data;
  },

  update: async (slotId: number | string, payload: SaveSlotRequest): Promise<SlotResponse> => {
    const response = await httpClient.put<SlotResponse>(`/slots/${slotId}`, payload);
    return response.data;
  },

  updateStatus: async (slotId: number | string, status: SlotStatus): Promise<SlotResponse> =>
    (await httpClient.patch<SlotResponse>(`/slots/${slotId}/status`, { status })).data,

  delete: async (slotId: number | string): Promise<void> => {
    await httpClient.delete(`/slots/${slotId}`);
  }
};

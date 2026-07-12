import { httpClient } from "./httpClient";

export interface PublicStats {
  totalBuildings: number;
  totalSlots: number;
  availableSlots: number;
  totalVehicleTypes: number;
}

export const publicApi = {
  getStats: async (): Promise<PublicStats> => {
    const response = await httpClient.get<PublicStats>("/public/stats");
    return response.data;
  }
};

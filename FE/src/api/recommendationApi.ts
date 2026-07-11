import { httpClient } from "./httpClient";

export interface SlotRecommendation {
  vehicleTypeId: number;
  vehicleTypeName: string;
  recommendedSlotId: number | null;
  recommendedSlotCode: string | null;
  floorId: number | null;
  floorName: string | null;
  score: number;
  strategy: string;
  available: boolean;
  message: string;
}

export const recommendationApi = {
  recommend: async (vehicleTypeId: string | number): Promise<SlotRecommendation> => {
    const response = await httpClient.get<SlotRecommendation>("/slots/recommendation", {
      params: { vehicleTypeId }
    });
    return response.data;
  }
};

import { httpClient } from "./httpClient";
import type { AiOptimizationResult } from "@/types/domain";

export const aiApi = {
  optimize: async (input: {
    currentVehicles: number;
    emptySlots: number;
    vehicleTypeId: string;
  }): Promise<AiOptimizationResult> => {
    const response = await httpClient.post<AiOptimizationResult>("/ai/optimize", input);
    return response.data;
  }
};

import { httpClient } from "@/api/httpClient";

export type PaymentMode = "CASH" | "CASHLESS" | "HYBRID";

export interface Building {
  id?: number;
  buildingName: string;
  address: string;
  totalFloors: number;
  hotline?: string;
  email?: string;
  openingTime?: string;
  closingTime?: string;
  description?: string;
  parkingRules?: string;
  paymentMode?: PaymentMode;
  autoBlockOverdueSlots?: boolean;
  avatarUrl?: string;
  createdAt?: string;
}

export type BuildingPayload = Pick<Building, "buildingName" | "address" | "hotline" | "email" | "openingTime" | "closingTime" | "description" | "parkingRules" | "paymentMode" | "autoBlockOverdueSlots" | "avatarUrl">;

export const buildingApi = {
  get: async (): Promise<Building> => {
    const response = await httpClient.get<Building>("/building");
    return response.data;
  },

  update: async (building: BuildingPayload): Promise<Building> => {
    const response = await httpClient.put<Building>("/building", building);
    return response.data;
  }
};

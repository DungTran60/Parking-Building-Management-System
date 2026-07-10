import { httpClient } from "@/api/httpClient";

export type PaymentMode = "CASH" | "CASHLESS" | "HYBRID";

export interface SystemSettingsResponse {
  systemName: string;
  openingTime: string;
  closingTime: string;
  paymentMode: PaymentMode;
  autoBlockOverdueSlots: boolean;
  defaultHourlyRate: number | null;
  updatedAt: string;
}

export type UpdateSystemSettingsRequest = Omit<SystemSettingsResponse, "updatedAt">;

export const settingApi = {
  get: async (): Promise<SystemSettingsResponse> => {
    const response = await httpClient.get<SystemSettingsResponse>("/settings");
    return response.data;
  },

  update: async (payload: UpdateSystemSettingsRequest): Promise<SystemSettingsResponse> => {
    const response = await httpClient.put<SystemSettingsResponse>("/settings", payload);
    return response.data;
  }
};

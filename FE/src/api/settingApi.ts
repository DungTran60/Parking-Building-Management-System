import { httpClient } from "@/api/httpClient";

export interface SystemSettingsResponse {
  systemName: string;
  passwordPolicy?: string;
  sessionTimeout?: number;
  logoUrl?: string;
  version?: string;
  themeColor?: string;
  timezone?: string;
  dateFormat?: string;
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

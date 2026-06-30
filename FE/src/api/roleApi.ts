import { httpClient } from "./httpClient";

export interface RoleResponse {
  id: number | string;
  name: string;
  description: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
}

export const roleApi = {
  getAll: async (): Promise<RoleResponse[]> => {
    const response = await httpClient.get<RoleResponse[]>("/roles");
    return response.data;
  },

  create: async (payload: CreateRoleRequest): Promise<RoleResponse> => {
    const response = await httpClient.post<RoleResponse>("/roles", payload);
    return response.data;
  }
};

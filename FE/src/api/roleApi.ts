import { httpClient } from "./httpClient";

export interface RoleResponse {
  id: number;
  name: string;
  permissions: string[];
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface PermissionResponse {
  id: number;
  name: string;
}

export const roleApi = {
  getAll: async (): Promise<RoleResponse[]> => {
    const response = await httpClient.get<RoleResponse[]>("/roles");
    return response.data;
  },

  getById: async (id: number): Promise<RoleResponse> => {
    const response = await httpClient.get<RoleResponse>(`/roles/${id}`);
    return response.data;
  },

  create: async (payload: CreateRoleRequest): Promise<RoleResponse> => {
    const response = await httpClient.post<RoleResponse>("/roles", payload);
    return response.data;
  },

  update: async (id: number, payload: CreateRoleRequest): Promise<RoleResponse> => {
    const response = await httpClient.put<RoleResponse>(`/roles/${id}`, payload);
    return response.data;
  },

  updatePermissions: async (id: number, permissionIds: number[]): Promise<RoleResponse> => {
    const response = await httpClient.put<RoleResponse>(`/roles/${id}/permissions`, permissionIds);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await httpClient.delete(`/roles/${id}`);
  },

  getAllPermissions: async (): Promise<PermissionResponse[]> => {
    const response = await httpClient.get<PermissionResponse[]>("/permissions");
    return response.data;
  }
};

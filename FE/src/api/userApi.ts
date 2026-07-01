import { httpClient } from "./httpClient";

export interface UserResponse {
  id: number | string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  roleId?: number;
  role?: string;
  status?: string;
  createdAt?: string;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  roleId: number;
}

export type UpdateUserRequest = Partial<Omit<CreateUserRequest, "username" | "password">> & {
  password?: string;
};

export interface UpdateProfileRequest {
  fullName: string;
  email: string;
  phoneNumber: string;
}

export const userApi = {
  getAll: async (): Promise<UserResponse[]> => {
    const response = await httpClient.get<UserResponse[]>("/users");
    return response.data;
  },

  create: async (payload: CreateUserRequest): Promise<UserResponse> => {
    const response = await httpClient.post<UserResponse>("/users", payload);
    return response.data;
  },

  update: async (userId: number | string, payload: UpdateUserRequest): Promise<UserResponse> => {
    const response = await httpClient.put<UserResponse>(`/users/${userId}`, payload);
    return response.data;
  },

  delete: async (userId: number | string): Promise<void> => {
    await httpClient.delete(`/users/${userId}`);
  },

  getProfile: async (): Promise<UserResponse> => {
    const response = await httpClient.get<UserResponse>("/users/profile");
    return response.data;
  },

  updateProfile: async (payload: UpdateProfileRequest): Promise<UserResponse> => {
    const response = await httpClient.put<UserResponse>("/users/profile", payload);
    return response.data;
  }
};

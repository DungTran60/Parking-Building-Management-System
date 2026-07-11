import { httpClient } from "./httpClient";

export interface UserResponse {
  id: number | string;
  username: string;
  email: string;
  phoneNumber: string;
  roleName: "ADMIN" | "MANAGER" | "STAFF" | "DRIVER";
  status: "ACTIVE" | "INACTIVE";
}

export interface CreateUserRequest {
  username: string;
  password: string;
  email: string;
  phoneNumber: string;
  roleName: UserResponse["roleName"];
  status: UserResponse["status"];
}

export type UpdateUserRequest = Partial<Pick<CreateUserRequest, "username" | "email" | "phoneNumber" | "roleName">>;

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  phoneNumber?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const userApi = {
  getAll: async (): Promise<UserResponse[]> => {
    const response = await httpClient.get<UserResponse[]>("/users");
    return response.data;
  },

  getActiveStaff: async (): Promise<UserResponse[]> => {
    const response = await httpClient.get<UserResponse[]>("/users/staff");
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

  updateStatus: async (userId: number | string, status: UserResponse["status"]): Promise<void> => {
    await httpClient.patch(`/users/${userId}/status`, { status });
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

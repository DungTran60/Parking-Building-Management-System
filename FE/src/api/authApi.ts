import { httpClient } from "@/api/httpClient";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  phoneNumber: string;
}

export interface RegisterResponse {
  id: number | string;
  username: string;
  roleName?: string;
}

export const authApi = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const response = await httpClient.post<LoginResponse>("/auth/login", payload);
    return response.data;
  },

  register: async (payload: RegisterRequest): Promise<RegisterResponse> => {
    const response = await httpClient.post<RegisterResponse>("/auth/register", payload);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await httpClient.post("/auth/logout");
  }
};

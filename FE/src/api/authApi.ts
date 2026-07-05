import { httpClient } from "./httpClient";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  tokenType?: string;
  userId?: number | string;
  username?: string;
  role?: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  fullName: string;
  email: string;
  phoneNumber: string;
}

export const authApi = {
  login: async (payload: LoginRequest): Promise<LoginResponse> => {
    const response = await httpClient.post<LoginResponse>("/auth/login", payload);
    return response.data;
  },

  register: async (payload: RegisterRequest): Promise<void> => {
    await httpClient.post("/auth/register", payload);
  }
};

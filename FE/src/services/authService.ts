import axios from "axios";
import { authApi, type RegisterRequest, type RegisterResponse } from "@/api/authApi";
import { authenticateMockUser } from "@/services/mockRepository";
import type { Role } from "@/types/rbac";

interface AuthenticatedUser {
  username: string;
  role: Role;
}

export interface LoginResult {
  token: string;
  user: AuthenticatedUser;
}

export const loginUser = async (username: string, password: string): Promise<LoginResult> => {
  const result = await authenticateMockUser(username, password);

  if (!result.success) {
    if (result.reason === "INACTIVE_ACCOUNT") {
      throw new Error("Tài khoản đã bị vô hiệu hóa.");
    }
    throw new Error("Tên đăng nhập hoặc mật khẩu không chính xác.");
  }

  return {
    token: `mock-token-${result.user.id}`,
    user: { username: result.user.username, role: result.user.role }
  };
};

export const registerUser = async (payload: RegisterRequest): Promise<RegisterResponse> => {
  try {
    return await authApi.register({
      ...payload,
      username: payload.username.trim(),
      fullName: payload.fullName.trim(),
      email: payload.email.trim(),
      phoneNumber: payload.phoneNumber.trim()
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      }
      if (error.response.status === 409) {
        throw new Error("Tên đăng nhập hoặc email đã được sử dụng.");
      }
      if (error.response.status === 400) {
        throw new Error("Thông tin đăng ký không hợp lệ. Vui lòng kiểm tra lại.");
      }
      throw new Error("Đăng ký thất bại. Vui lòng thử lại.");
    }
    throw error;
  }
};

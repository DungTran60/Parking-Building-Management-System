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
  // TODO(API): Sau khi test mock hoàn tất, xóa khối mock bên dưới và mở lại khối API này.
  // BE POST /api/auth/login trả role: ADMIN | MANAGER | STAFF | DRIVER,
  // vì vậy cần map sang role FE trước khi lưu phiên đăng nhập.
  /*
  try {
    const response = await authApi.login({ username: username.trim(), password });
    const roleMap: Record<string, Role> = {
      ADMIN: "SYSTEM_ADMIN",
      MANAGER: "PARKING_MANAGER",
      STAFF: "PARKING_STAFF",
      DRIVER: "PARKING_USER"
    };
    const role = roleMap[response.role.replace(/^ROLE_/, "").toUpperCase()];
    if (!role) throw new Error("Vai trò tài khoản không được hỗ trợ.");
    return {
      token: response.token,
      user: { username: response.username, role }
    };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) throw new Error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      if (error.response.status === 401) throw new Error("Tên đăng nhập hoặc mật khẩu không chính xác.");
      if (error.response.status === 403) throw new Error("Tài khoản đã bị vô hiệu hóa.");
      throw new Error("Đăng nhập thất bại. Vui lòng thử lại.");
    }
    throw error;
  }
  */

  // MOCK ONLY: xóa khối này khi mở lại phần gọi API phía trên.
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
      email: payload.email.trim(),
      phoneNumber: payload.phoneNumber.trim()
    });
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (!error.response) {
        throw new Error("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
      }
      const serverMessage = typeof error.response.data === "object" && error.response.data !== null && "error" in error.response.data
        ? String(error.response.data.error)
        : "";
      if (error.response.status === 409 || /already exists/i.test(serverMessage)) {
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

import { create } from "zustand";
import type { User } from "@/types/domain";
import type { Role } from "@/types/rbac";

interface AuthState {
  role: Role;
  userName: string;
  isAuthenticated: boolean;
  setRole: (role: Role) => void;
  login: (user: User, remember: boolean) => void;
  logout: () => void;
}

const AUTH_STORAGE_KEY = "parking-bms-auth";

const getStoredUser = (): Pick<AuthState, "role" | "userName" | "isAuthenticated"> | null => {
  if (typeof window === "undefined") return null;

  const rawValue = localStorage.getItem(AUTH_STORAGE_KEY) ?? sessionStorage.getItem(AUTH_STORAGE_KEY);
  if (!rawValue) return null;

  try {
    return JSON.parse(rawValue);
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

const storedUser = getStoredUser();

export const useAuthStore = create<AuthState>((set) => ({
  role: storedUser?.role ?? "SYSTEM_ADMIN",
  userName: storedUser?.userName ?? "",
  isAuthenticated: storedUser?.isAuthenticated ?? false,
  setRole: (role) => set({ role }),
  login: (user, remember) => {
    const authData = {
      role: user.role,
      userName: user.username,
      isAuthenticated: true
    };
    const selectedStorage = remember ? localStorage : sessionStorage;
    const otherStorage = remember ? sessionStorage : localStorage;

    otherStorage.removeItem(AUTH_STORAGE_KEY);
    selectedStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    set(authData);
  },
  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    set({ role: "SYSTEM_ADMIN", userName: "", isAuthenticated: false });
  }
}));

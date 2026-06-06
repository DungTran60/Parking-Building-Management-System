import { create } from "zustand";
import type { Role } from "@/types/rbac";

interface AuthState {
  role: Role;
  userName: string;
  setRole: (role: Role) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: "SYSTEM_ADMIN",
  userName: "admin.parking",
  setRole: (role) => set({ role })
}));

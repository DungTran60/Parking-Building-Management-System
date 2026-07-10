import { Badge } from "@/components/common/Badge";
import { userApi, type UserResponse } from "@/api/userApi";
import { ROLE_LABELS } from "@/constants/rbac";
import { EntityManagement } from "@/modules/shared/EntityManagement";
import { useAuthStore } from "@/stores/authStore";
import type { ResourceApi } from "@/hooks/useResources";
import type { Role } from "@/types/rbac";

type ManagedUser = {
  id: string;
  username: string;
  password?: string;
  email: string;
  phoneNumber: string;
  role: Role;
  status: "ACTIVE" | "INACTIVE";
};

const backendRole: Record<Role, UserResponse["roleName"]> = {
  SYSTEM_ADMIN: "ADMIN",
  PARKING_MANAGER: "MANAGER",
  PARKING_STAFF: "STAFF",
  PARKING_USER: "DRIVER"
};

const frontendRole: Record<UserResponse["roleName"], Role> = {
  ADMIN: "SYSTEM_ADMIN",
  MANAGER: "PARKING_MANAGER",
  STAFF: "PARKING_STAFF",
  DRIVER: "PARKING_USER"
};

const toManagedUser = (user: UserResponse): ManagedUser => ({
  id: String(user.id),
  username: user.username,
  email: user.email,
  phoneNumber: user.phoneNumber,
  role: frontendRole[user.roleName],
  status: user.status
});

const api: ResourceApi<ManagedUser> = {
  getAll: async () => (await userApi.getAll()).map(toManagedUser),
  create: async (payload) => toManagedUser(await userApi.create({
    username: payload.username.trim(),
    password: payload.password ?? "",
    email: payload.email.trim(),
    phoneNumber: payload.phoneNumber.trim(),
    roleName: backendRole[payload.role],
    status: payload.status
  })),
  update: async (id, payload) => {
    const updated = await userApi.update(id, {
      username: payload.username?.trim(),
      email: payload.email?.trim(),
      phoneNumber: payload.phoneNumber?.trim(),
      roleName: payload.role ? backendRole[payload.role] : undefined
    });
    if (payload.status) await userApi.updateStatus(id, payload.status);
    return { ...toManagedUser(updated), status: payload.status ?? updated.status };
  },
  delete: (id) => userApi.delete(id)
};

export function UsersPage() {
  const currentUserName = useAuthStore((state) => state.userName);
  return (
    <EntityManagement<ManagedUser>
      title="Quản lý tài khoản"
      description="Quản lý thông tin tài khoản, email, số điện thoại, vai trò và trạng thái."
      resource="users"
      api={api}
      fields={[
        { key: "username", label: "Tên đăng nhập", minLength: 3, placeholder: "Ví dụ: manager.hcm" },
        { key: "password", label: "Mật khẩu", inputType: "password", minLength: 8, createOnly: true, placeholder: "Tối thiểu 8 ký tự" },
        { key: "email", label: "Email", inputType: "email", placeholder: "Ví dụ: manager@parking.vn" },
        { key: "phoneNumber", label: "Số điện thoại", inputType: "tel", placeholder: "Ví dụ: 0901 234 567" },
        {
          key: "role",
          label: "Vai trò",
          type: "select",
          options: (Object.entries(ROLE_LABELS) as [Role, string][])
            .map(([value, label]) => ({ value, label })),
          disabled: (editing) => !!editing && editing.username === currentUserName,
          render: (value) => ROLE_LABELS[value as Role]
        },
        {
          key: "status",
          label: "Khóa/Mở khóa",
          type: "select",
          options: [
            { label: "Đang hoạt động", value: "ACTIVE" },
            { label: "Đã khóa", value: "INACTIVE" }
          ],
          render: (value) => <Badge value={String(value)} />
        }
      ]}
    />
  );
}

import { Badge } from "@/components/common/Badge";
import { ROLE_LABELS } from "@/constants/rbac";
import { EntityManagement } from "@/modules/shared/EntityManagement";
import type { User } from "@/types/domain";

export function UsersPage() {
  return (
    <EntityManagement<User>
      title="Quản lý User"
      description="CRUD tài khoản người dùng, email, phone, role và trạng thái."
      resource="users"
      fields={[
        { key: "username", label: "Username" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "role", label: "Role", type: "select", options: Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label })) },
        { key: "status", label: "Trạng thái", type: "select", options: ["ACTIVE", "INACTIVE"].map((item) => ({ label: item, value: item })), render: (value) => <Badge value={String(value)} /> }
      ]}
    />
  );
}

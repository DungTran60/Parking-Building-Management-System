import { Badge } from "@/components/common/Badge";
import { ROLE_LABELS } from "@/constants/rbac";
import { EntityManagement } from "@/modules/shared/EntityManagement";
import type { User } from "@/types/domain";
import type { Role } from "@/types/rbac";

export function UsersPage() {
  return (
    <EntityManagement<User>
      title="Quản lý tài khoản"
      description="Quản lý thông tin tài khoản, email, số điện thoại, vai trò và trạng thái."
      resource="users"
      fields={[
        { key: "username", label: "Tên đăng nhập", placeholder: "Ví dụ: manager.hcm" },
        { key: "email", label: "Email", placeholder: "Ví dụ: manager@parking.vn" },
        { key: "phone", label: "Số điện thoại", placeholder: "Ví dụ: 0901 234 567" },
        {
          key: "role",
          label: "Vai trò",
          type: "select",
          options: Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label })),
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

import { EntityManagement } from "@/modules/shared/EntityManagement";
import type { VehicleType } from "@/types/domain";

export function VehicleTypesPage() {
  return (
    <EntityManagement<VehicleType>
      title="Quản lý loại xe"
      description="Thêm, sửa, xóa các loại phương tiện. Hệ thống sẽ ngăn xóa nếu loại xe đang được sử dụng."
      resource="vehicleTypes"
      fields={[
        {
          key: "code",
          label: "Mã loại xe",
          required: true,
        },
        {
          key: "name",
          label: "Tên loại xe",
          required: true,
        },
        {
          key: "description",
          label: "Mô tả",
        },
        {
          key: "status",
          label: "Trạng thái",
          type: "select",
          options: [
            { value: "ACTIVE", label: "Hoạt động" },
            { value: "INACTIVE", label: "Ngừng hoạt động" },
          ],
          required: true,
          render: (value) => (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                value === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  value === "ACTIVE" ? "bg-green-500" : "bg-gray-400"
                }`}
              />
              {value === "ACTIVE" ? "Hoạt động" : "Ngừng hoạt động"}
            </span>
          ),
        },
        {
          key: "createdAt",
          label: "Ngày tạo",
          readOnly: true,
          render: (value) =>
            value
              ? new Date(String(value)).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "—",
        },
      ]}
    />
  );
}

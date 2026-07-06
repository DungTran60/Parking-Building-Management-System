import { vehicleTypeApi } from "@/api/vehicleTypeApi";
import { EntityManagement } from "@/modules/shared/EntityManagement";
import type { VehicleType } from "@/types/domain";

export function VehicleTypesPage() {
  return (
    <EntityManagement<VehicleType>
      title="Quản lý loại xe"
      description="Quản lý mã, tên, mô tả và trạng thái của các loại xe."
      resource="vehicleTypes"
      api={vehicleTypeApi}
      fields={[
        { key: "code", label: "Mã loại xe", placeholder: "Ví dụ: CAR" },
        { key: "name", label: "Tên loại xe", placeholder: "Ví dụ: Ô tô" },
        { key: "description", label: "Mô tả", placeholder: "Ví dụ: Xe ô tô chở khách", required: false },
        {
          key: "status",
          label: "Trạng thái",
          type: "select",
          options: [
            { label: "Hoạt động", value: "ACTIVE" },
            { label: "Ngừng hoạt động", value: "INACTIVE" }
          ]
        }
      ]}
    />
  );
}

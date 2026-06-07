import { EntityManagement } from "@/modules/shared/EntityManagement";
import type { VehicleType } from "@/types/domain";

export function VehicleTypesPage() {
  return (
    <EntityManagement<VehicleType>
      title="Quản lý loại xe"
      description="Định nghĩa xe máy, ô tô, xe điện, xe tải, xe khách và màu hiển thị."
      resource="vehicleTypes"
      fields={[
        { key: "name", label: "Tên loại xe" },
        { key: "size", label: "Kích thước" },
        { key: "capacityUnit", label: "Đơn vị sức chứa", type: "number" },
        { key: "color", label: "Màu", type: "color", render: (value) => <span className="inline-flex items-center gap-2"><span className="h-4 w-4 rounded" style={{ background: String(value) }} />{String(value)}</span> }
      ]}
    />
  );
}

import { useQuery } from "@tanstack/react-query";
import { vehicleApi } from "@/api/vehicleApi";
import { vehicleTypeApi } from "@/api/vehicleTypeApi";
import { EntityManagement } from "@/modules/shared/EntityManagement";
import type { Vehicle } from "@/types/domain";

export function VehiclesPage() {
  const { data: vehicleTypes = [] } = useQuery({
    queryKey: ["vehicleTypes"],
    queryFn: () => vehicleTypeApi.getAll()
  });

  return (
    <EntityManagement<Vehicle>
      title="Quản lý phương tiện"
      description="Quản lý biển số, loại xe và chủ sở hữu của các phương tiện đã đăng ký."
      resource="vehicles"
      api={vehicleApi}
      fields={[
        { key: "plateNumber", label: "Biển số", placeholder: "Ví dụ: 51G-12345" },
        {
          key: "vehicleTypeId",
          label: "Loại xe",
          type: "select",
          options: vehicleTypes.map((vt) => ({ label: vt.name, value: vt.id })),
          render: (value, _row) => vehicleTypes.find((vt) => vt.id === value)?.name || String(value)
        },
        { key: "color", label: "Màu xe", placeholder: "Ví dụ: Trắng", required: false }
      ]}
    />
  );
}

import { EntityManagement } from "@/modules/shared/EntityManagement";
import { floors, vehicleTypes } from "@/api/mockData";
import type { Floor } from "@/types/domain";

export function FloorsPage() {
  return (
    <div className="grid gap-6">
      <EntityManagement<Floor>
        title="Quản lý tầng"
        description="Quản lý tầng, khu vực, loại xe hỗ trợ và số lượng slot."
        resource="floors"
        fields={[
          { key: "buildingId", label: "Tòa nhà" },
          { key: "name", label: "Tầng" },
          { key: "zone", label: "Khu vực" },
          { key: "supportedVehicleTypes", label: "Loại xe hỗ trợ", render: (value) => (value as string[]).map((id) => vehicleTypes.find((item) => item.id === id)?.name ?? id).join(", ") },
          { key: "slotCount", label: "Số slot", type: "number" }
        ]}
      />
      <section className="grid gap-3 rounded-lg border border-border bg-white p-5">
        <h2 className="font-semibold">Sơ đồ tầng</h2>
        <div className="grid gap-3 md:grid-cols-4">
          {floors.map((floor) => (
            <div key={floor.id} className="rounded-md border border-border bg-slate-50 p-4">
              <p className="text-lg font-semibold">{floor.name}</p>
              <p className="text-sm text-slate-500">{floor.zone}</p>
              <div className="mt-3 h-2 rounded bg-primary" style={{ width: `${Math.min(100, floor.slotCount / 2)}%` }} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

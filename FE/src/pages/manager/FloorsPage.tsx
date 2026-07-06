import { useMemo, useState, type FormEvent } from "react";
import { Building2, CarFront, Layers3, MapPin, Pencil, Plus, SquareParking } from "lucide-react";
import { buildings, floors as mockFloors, slots, vehicleTypes } from "@/api/mockData";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Modal } from "@/components/common/Modal";
import { Field, Input } from "@/components/forms/FormField";
import { PageHeader } from "@/components/layout/PageHeader";
import type { Floor } from "@/types/domain";

export function FloorsPage() {
  const [floorRows, setFloorRows] = useState<Floor[]>(() => mockFloors.map((floor) => ({ ...floor, supportedVehicleTypes: [...floor.supportedVehicleTypes] })));
  const [selectedBuildingId, setSelectedBuildingId] = useState(buildings[0]?.id ?? "");
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(mockFloors.find((floor) => floor.buildingId === buildings[0]?.id)?.id ?? null);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const buildingFloors = floorRows.filter((floor) => floor.buildingId === selectedBuildingId);
  const selectedFloor = buildingFloors.find((floor) => floor.id === selectedFloorId) ?? buildingFloors[0] ?? null;
  const selectedBuilding = buildings.find((building) => building.id === selectedBuildingId);
  const floorStats = useMemo(() => {
    if (!selectedFloor) return { total: 0, occupied: 0, occupancy: 0 };
    const floorSlots = slots.filter((slot) => slot.floorId === selectedFloor.id);
    const occupiedSamples = floorSlots.filter((slot) => slot.status !== "AVAILABLE").length;
    const occupancy = floorSlots.length ? Math.round((occupiedSamples / floorSlots.length) * 100) : 0;
    return { total: selectedFloor.slotCount, occupied: Math.round((selectedFloor.slotCount * occupancy) / 100), occupancy };
  }, [selectedFloor]);

  const selectBuilding = (buildingId: string) => {
    const firstFloor = floorRows.find((floor) => floor.buildingId === buildingId);
    setSelectedBuildingId(buildingId);
    setSelectedFloorId(firstFloor?.id ?? null);
  };

  const openCreate = () => {
    setEditingFloor(null);
    setFormOpen(true);
  };

  const submitFloor = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextFloor: Floor = {
      id: editingFloor?.id ?? crypto.randomUUID(),
      buildingId: selectedBuildingId,
      name: String(form.get("name")).trim(),
      zone: String(form.get("zone")).trim(),
      supportedVehicleTypes: form.getAll("vehicleTypes").map(String),
      slotCount: Number(form.get("slotCount"))
    };
    setFloorRows((current) => editingFloor ? current.map((floor) => floor.id === editingFloor.id ? nextFloor : floor) : [...current, nextFloor]);
    setSelectedFloorId(nextFloor.id);
    setFormOpen(false);
    setEditingFloor(null);
  };

  return (
    <>
      <PageHeader title="Phân tầng" description="Chọn tòa nhà để quản lý danh sách tầng, khu vực, sức chứa và loại xe hỗ trợ." />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(240px,30%)_minmax(0,70%)]">
        <Card className="lg:sticky lg:top-20">
          <CardHeader title="Tòa nhà" />
          <CardContent className="grid gap-2">
            {buildings.map((building) => {
              const count = floorRows.filter((floor) => floor.buildingId === building.id).length;
              const active = building.id === selectedBuildingId;
              return <button key={building.id} type="button" onClick={() => selectBuilding(building.id)} className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${active ? "border-primary bg-blue-50 ring-1 ring-primary/20" : "border-border hover:bg-slate-50"}`}>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}><Building2 size={18} /></span>
                <span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-800">{building.name}</span><span className="text-xs text-slate-500">{count} tầng · {building.capacity} chỗ</span></span>
              </button>;
            })}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          <Card>
            <CardHeader title={selectedBuilding?.name ?? "Danh sách tầng"} action={<Button onClick={openCreate}><Plus size={17} /> Tạo tầng mới</Button>} />
            <CardContent>
              {buildingFloors.length ? <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {buildingFloors.map((floor) => {
                  const active = selectedFloor?.id === floor.id;
                  return <button key={floor.id} type="button" onClick={() => setSelectedFloorId(floor.id)} className={`rounded-lg border p-4 text-left transition ${active ? "border-primary bg-blue-50 ring-1 ring-primary/20" : "border-border hover:border-slate-300 hover:bg-slate-50"}`}>
                    <div className="flex items-start justify-between gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-primary shadow-sm"><Layers3 size={20} /></span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{floor.slotCount} slot</span></div>
                    <p className="mt-3 text-lg font-semibold text-slate-900">{floor.name}</p><p className="mt-1 truncate text-sm text-slate-500">{floor.zone}</p>
                  </button>;
                })}
              </div> : <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center"><Layers3 className="mx-auto text-slate-300" size={36} /><p className="mt-2 text-sm font-medium text-slate-600">Tòa nhà chưa có tầng</p><button onClick={openCreate} className="mt-2 text-sm font-medium text-primary">Tạo tầng đầu tiên</button></div>}
            </CardContent>
          </Card>

          {selectedFloor && <Card>
            <CardHeader title={`Chi tiết ${selectedFloor.name}`} action={<Button variant="secondary" onClick={() => { setEditingFloor(selectedFloor); setFormOpen(true); }}><Pencil size={16} /> Chỉnh sửa</Button>} />
            <CardContent className="grid gap-5">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Stat icon={<MapPin size={18} />} label="Khu vực" value={selectedFloor.zone} />
                <Stat icon={<SquareParking size={18} />} label="Tổng số slot" value={String(floorStats.total)} />
                <Stat icon={<Layers3 size={18} />} label="Đang sử dụng" value={String(floorStats.occupied)} />
                <Stat icon={<CarFront size={18} />} label="Tỷ lệ lấp đầy" value={`${floorStats.occupancy}%`} />
              </div>
              <div><p className="mb-2 text-sm font-medium text-slate-700">Loại xe hỗ trợ</p><div className="flex flex-wrap gap-2">{selectedFloor.supportedVehicleTypes.map((id) => <span key={id} className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">{vehicleTypes.find((type) => type.id === id)?.name ?? id}</span>)}</div></div>
              <div><div className="mb-2 flex justify-between text-xs text-slate-500"><span>Công suất hiện tại</span><span>{floorStats.occupancy}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${floorStats.occupancy}%` }} /></div></div>
            </CardContent>
          </Card>}
        </div>
      </div>

      <Modal open={formOpen} title={editingFloor ? `Cập nhật ${editingFloor.name}` : "Tạo tầng mới"} onClose={() => { setFormOpen(false); setEditingFloor(null); }}>
        <form key={editingFloor?.id ?? "new"} className="grid gap-4 sm:grid-cols-2" onSubmit={submitFloor}>
          <Field label="Tên tầng"><Input name="name" defaultValue={editingFloor?.name ?? ""} placeholder="Ví dụ: B1" required /></Field>
          <Field label="Khu vực"><Input name="zone" defaultValue={editingFloor?.zone ?? ""} placeholder="Ví dụ: Khu xe máy A" required /></Field>
          <Field label="Số lượng slot"><Input name="slotCount" type="number" min={1} defaultValue={editingFloor?.slotCount ?? 1} placeholder="Ví dụ: 100" required /></Field>
          <fieldset className="sm:col-span-2"><legend className="mb-2 text-sm font-medium text-slate-700">Loại xe hỗ trợ</legend><div className="grid gap-2 sm:grid-cols-3">{vehicleTypes.map((type) => <label key={type.id} className="flex items-center gap-2 rounded-md border border-border p-3 text-sm"><input name="vehicleTypes" type="checkbox" value={type.id} defaultChecked={editingFloor?.supportedVehicleTypes.includes(type.id)} />{type.name}</label>)}</div></fieldset>
          <div className="flex justify-end gap-3 sm:col-span-2"><Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>Hủy</Button><Button type="submit">{editingFloor ? "Lưu thay đổi" : "Tạo tầng"}</Button></div>
        </form>
      </Modal>
    </>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="rounded-lg bg-slate-50 p-4"><span className="text-primary">{icon}</span><p className="mt-3 text-xs text-slate-500">{label}</p><p className="mt-1 truncate font-semibold text-slate-900">{value}</p></div>;
}

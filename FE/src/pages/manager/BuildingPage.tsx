import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Building2, Calendar, Layers, MapPin, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { buildingApi, type Building as ApiBuilding } from "@/api/buildingApi";
import { Badge } from "@/components/common/Badge";
import { EntityManagement } from "@/modules/shared/EntityManagement";
import type { Building } from "@/types/domain";

function GenericBuildingsPage() {
  return (
    <EntityManagement<Building>
      title="Quản lý tòa nhà"
      description="CRUD tòa nhà, địa chỉ, số tầng, sức chứa và trạng thái vận hành."
      resource="buildings"
      fields={[
        { key: "name", label: "Tên tòa nhà" },
        { key: "address", label: "Địa chỉ" },
        { key: "floors", label: "Số tầng", type: "number" },
        { key: "capacity", label: "Sức chứa", type: "number" },
        { key: "status", label: "Trạng thái", type: "select", options: [{ label: "ACTIVE", value: "ACTIVE" }, { label: "INACTIVE", value: "INACTIVE" }], render: (value) => <Badge value={String(value)} /> }
      ]}
    />
  );
}

void GenericBuildingsPage;

type Payload = Omit<ApiBuilding, "id" | "createdAt">;

export function BuildingsPage() {
  const [buildings, setBuildings] = useState<ApiBuilding[]>([]);
  const [editing, setEditing] = useState<ApiBuilding | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try { setBuildings(await buildingApi.getAll()); setError(""); }
    catch { setError("Không thể tải danh sách tòa nhà."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const submit = async (data: Payload) => {
    setSaving(true);
    try {
      if (editing?.id !== undefined) await buildingApi.update(editing.id, data);
      else await buildingApi.create(data);
      setShowForm(false);
      setEditing(null);
      await load();
    } catch { setError("Không thể lưu tòa nhà."); }
    finally { setSaving(false); }
  };

  const remove = async (id: number) => {
    if (!window.confirm("Bạn có chắc muốn xóa tòa nhà này?")) return;
    try { await buildingApi.delete(id); setBuildings((items) => items.filter((item) => item.id !== id)); }
    catch { setError("Không thể xóa tòa nhà."); }
  };

  return <>
    <div className="mb-6 flex items-center justify-between gap-4">
      <div><h1 className="text-2xl font-bold text-slate-900">Quản lý tòa nhà</h1><p className="mt-1 text-sm text-slate-500">Thêm, cập nhật và quản lý danh sách tòa nhà.</p></div>
      <button onClick={() => { setEditing(null); setShowForm(true); }} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"><Plus className="h-4 w-4" />Thêm tòa nhà</button>
    </div>
    {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
    <BuildingTable buildings={buildings} isLoading={loading} onEdit={(item) => { setEditing(item); setShowForm(true); }} onDelete={remove} />
    {showForm && <BuildingForm building={editing} isSubmitting={saving} onClose={() => setShowForm(false)} onSubmit={submit} />}
  </>;
}

function BuildingForm({ building, onSubmit, onClose, isSubmitting }: { building: ApiBuilding | null; onSubmit: (data: Payload) => void; onClose: () => void; isSubmitting: boolean }) {
  const [name, setName] = useState(building?.buildingName ?? "");
  const [address, setAddress] = useState(building?.address ?? "");
  const [floors, setFloors] = useState(building?.totalFloors ?? 1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2 || name.trim().length > 150) next.name = "Tên tòa nhà phải từ 2 đến 150 ký tự";
    if (address.trim().length < 5 || address.trim().length > 255) next.address = "Địa chỉ phải từ 5 đến 255 ký tự";
    if (!Number.isInteger(floors) || floors < 1) next.floors = "Số tầng phải là số nguyên lớn hơn 0";
    setErrors(next);
    if (!Object.keys(next).length) onSubmit({ buildingName: name.trim(), address: address.trim(), totalFloors: floors });
  };

  const fieldClass = (invalid: boolean) => `w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 ${invalid ? "border-red-300 focus:ring-red-100" : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"}`;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b px-6 py-4"><h2 className="flex items-center gap-2 font-bold"><Building2 className="h-5 w-5 text-blue-500" />{building ? "Cập nhật tòa nhà" : "Thêm tòa nhà mới"}</h2><button onClick={onClose} disabled={isSubmitting}><X className="h-5 w-5" /></button></div>
      <form onSubmit={submit} className="space-y-4 p-6">
        <label className="block text-sm font-medium">Tên tòa nhà<input value={name} onChange={(e) => setName(e.target.value)} className={fieldClass(!!errors.name)} placeholder="Ví dụ: Tòa nhà A" />{errors.name && <small className="text-red-500">{errors.name}</small>}</label>
        <label className="block text-sm font-medium">Địa chỉ<input value={address} onChange={(e) => setAddress(e.target.value)} className={fieldClass(!!errors.address)} placeholder="Ví dụ: 123 Cầu Giấy, Hà Nội" />{errors.address && <small className="text-red-500">{errors.address}</small>}</label>
        <label className="block text-sm font-medium">Tổng số tầng<input type="number" min="1" value={floors} onChange={(e) => setFloors(Number(e.target.value))} className={fieldClass(!!errors.floors)} />{errors.floors && <small className="text-red-500">{errors.floors}</small>}</label>
        <div className="flex justify-end gap-3 border-t pt-5"><button type="button" onClick={onClose} disabled={isSubmitting} className="rounded-lg border px-4 py-2">Hủy</button><button disabled={isSubmitting} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white">{isSubmitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="h-4 w-4" />}Lưu lại</button></div>
      </form>
    </div>
  </div>;
}

function BuildingTable({ buildings, onEdit, onDelete, isLoading }: { buildings: ApiBuilding[]; onEdit: (item: ApiBuilding) => void; onDelete: (id: number) => void; isLoading: boolean }) {
  if (isLoading) return <div className="flex h-48 items-center justify-center"><span className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /><span className="ml-3">Đang tải danh sách...</span></div>;
  if (!buildings.length) return <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed"><Building2 className="h-10 w-10 text-slate-400" /><p>Không có tòa nhà nào</p></div>;
  return <div className="overflow-x-auto rounded-xl border bg-white"><table className="w-full text-left text-sm"><thead className="border-b bg-slate-50"><tr><th className="p-4">ID</th><th className="p-4">Tên tòa nhà</th><th className="p-4">Địa chỉ</th><th className="p-4">Số tầng</th><th className="p-4">Ngày tạo</th><th className="p-4 text-right">Thao tác</th></tr></thead><tbody className="divide-y">{buildings.map((item) => <tr key={item.id} className="hover:bg-slate-50"><td className="p-4">#{item.id}</td><td className="p-4"><span className="flex items-center gap-2"><Building2 className="h-4 w-4 text-blue-500" />{item.buildingName}</span></td><td className="p-4"><span className="flex items-center gap-2"><MapPin className="h-4 w-4" />{item.address}</span></td><td className="p-4"><span className="flex items-center gap-2"><Layers className="h-4 w-4 text-emerald-500" />{item.totalFloors} tầng</span></td><td className="p-4"><span className="flex items-center gap-2"><Calendar className="h-4 w-4" />{item.createdAt ? new Date(item.createdAt).toLocaleString("vi-VN") : "---"}</span></td><td className="p-4"><span className="flex justify-end gap-2"><button onClick={() => onEdit(item)} title="Chỉnh sửa"><Pencil className="h-4 w-4" /></button><button onClick={() => item.id !== undefined && onDelete(item.id)} title="Xóa"><Trash2 className="h-4 w-4 text-red-500" /></button></span></td></tr>)}</tbody></table></div>;
}

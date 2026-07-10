import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CarFront, History, LayoutGrid, Lock, Pencil, Plus, Search, Trash2, Unlock, Wrench } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Field, Input, Select } from "@/components/forms/FormField";
import { Modal } from "@/components/common/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { floorApi } from "@/api/floorApi";
import { slotApi } from "@/api/slotApi";
import { vehicleTypeApi } from "@/api/vehicleTypeApi";
import { hasPermission } from "@/constants/rbac";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/utils/cn";
import { dateTime } from "@/utils/format";
import { getApiErrorMessage } from "@/utils/apiError";
import type { ParkingSlot, SlotStatus } from "@/types/domain";

const statusMeta: Record<SlotStatus, { label: string; card: string; dot: string }> = {
  AVAILABLE: { label: "Còn trống", card: "border-emerald-200 bg-emerald-50/60", dot: "bg-emerald-500" },
  OCCUPIED: { label: "Đang sử dụng", card: "border-red-200 bg-red-50/60", dot: "bg-red-500" },
  RESERVED: { label: "Đã đặt trước", card: "border-blue-200 bg-blue-50/60", dot: "bg-blue-500" },
  MAINTENANCE: { label: "Bảo trì", card: "border-amber-200 bg-amber-50/60", dot: "bg-amber-500" },
  BLOCKED: { label: "Tạm khóa", card: "border-slate-300 bg-slate-100", dot: "bg-slate-500" }
};

const statuses = Object.keys(statusMeta) as SlotStatus[];

export function SlotsPage() {
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.role);
  const canManage = hasPermission(role, "slots:manage");
  const canUpdateStatus = hasPermission(role, "slots:manage") || hasPermission(role, "slots:updateStatus");
  const { data: slotRows = [], isLoading, isError, error, refetch } = useQuery({ queryKey: ["slots"], queryFn: slotApi.getAll });
  const { data: floors = [] } = useQuery({ queryKey: ["floors"], queryFn: floorApi.getAll });
  const { data: vehicleTypes = [] } = useQuery({ queryKey: ["vehicleTypes"], queryFn: () => vehicleTypeApi.getAll() });
  const data: ParkingSlot[] = slotRows.map((slot) => ({
    id: String(slot.id), code: slot.code, floorId: String(slot.floorId), vehicleTypeId: String(slot.vehicleTypeId),
    status: slot.status, updatedAt: slot.updatedAt ?? new Date(0).toISOString()
  }));
  const [status, setStatus] = useState<SlotStatus | "ALL">("ALL");
  const [floorId, setFloorId] = useState("ALL");
  const [vehicleTypeId, setVehicleTypeId] = useState("ALL");
  const [query, setQuery] = useState("");
  const [history, setHistory] = useState<ParkingSlot | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ParkingSlot | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const invalidateSlots = () => queryClient.invalidateQueries({ queryKey: ["slots"] });
  const saveMutation = useMutation({
    mutationFn: ({ id, payload }: { id?: string; payload: Parameters<typeof slotApi.create>[0] }) => id ? slotApi.update(id, payload) : slotApi.create(payload),
    onSuccess: () => { void invalidateSlots(); setFormOpen(false); setEditingSlot(null); },
    onError: (requestError) => setFormError(getApiErrorMessage(requestError, "Không thể lưu slot. Vui lòng thử lại."))
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: SlotStatus }) => slotApi.updateStatus(id, nextStatus),
    onSuccess: () => void invalidateSlots(),
    onError: (requestError) => setFormError(getApiErrorMessage(requestError, "Không thể cập nhật trạng thái slot."))
  });
  const deleteMutation = useMutation({
    mutationFn: (id: string) => slotApi.delete(id),
    onSuccess: () => void invalidateSlots(),
    onError: (requestError) => setFormError(getApiErrorMessage(requestError, "Không thể xóa slot."))
  });
  const isSaving = saveMutation.isPending;

  const rows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return data.filter((slot) =>
      (status === "ALL" || slot.status === status) &&
      (floorId === "ALL" || slot.floorId === floorId) &&
      (vehicleTypeId === "ALL" || slot.vehicleTypeId === vehicleTypeId) &&
      (!normalizedQuery || slot.code.toLowerCase().includes(normalizedQuery))
    );
  }, [data, floorId, query, status, vehicleTypeId]);

  const counts = useMemo(() => Object.fromEntries(
    statuses.map((item) => [item, data.filter((slot) => slot.status === item).length])
  ) as Record<SlotStatus, number>, [data]);

  const editableStatuses: SlotStatus[] = !editingSlot
    ? ["AVAILABLE"]
    : (editingSlot.status === "OCCUPIED" || editingSlot.status === "RESERVED")
      ? [editingSlot.status]
      : ["AVAILABLE", "MAINTENANCE", "BLOCKED"];

  const toggleBlockedStatus = (slot: ParkingSlot) => {
    const unlocking = slot.status === "BLOCKED";
    const message = unlocking
      ? "Bạn có chắc muốn mở khóa slot " + slot.code + "?"
      : "Bạn có chắc muốn tạm khóa slot " + slot.code + "?";
    if (!window.confirm(message)) return;

    const nextStatus: SlotStatus = unlocking ? "AVAILABLE" : "BLOCKED";
    statusMutation.mutate({ id: slot.id, nextStatus });
  };

  const toggleMaintenanceStatus = (slot: ParkingSlot) => {
    const leaving = slot.status === "MAINTENANCE";
    const message = leaving
      ? "Kết thúc bảo trì và mở lại slot " + slot.code + "?"
      : "Chuyển slot " + slot.code + " sang trạng thái bảo trì?";
    if (!window.confirm(message)) return;

    const nextStatus: SlotStatus = leaving ? "AVAILABLE" : "MAINTENANCE";
    statusMutation.mutate({ id: slot.id, nextStatus });
  };

  const removeSlot = (slot: ParkingSlot) => {
    if (slot.status === "OCCUPIED" || slot.status === "RESERVED") return;
    if (!window.confirm("Bạn có chắc muốn xóa slot " + slot.code + "? Hành động này không thể hoàn tác.")) return;
    deleteMutation.mutate(slot.id);
  };

  const openCreate = () => {
    setEditingSlot(null);
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (slot: ParkingSlot) => {
    setEditingSlot(slot);
    setFormError(null);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (isSaving) return;
    setFormOpen(false);
    setEditingSlot(null);
    setFormError(null);
  };

  const submitSlot = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    const form = new FormData(event.currentTarget);
    const code = String(form.get("code") ?? "").trim().toUpperCase();
    const selectedFloorId = String(form.get("floorId") ?? "");
    const vehicleTypeId = String(form.get("vehicleTypeId") ?? "");
    const nextStatus = String(form.get("status") ?? "AVAILABLE") as SlotStatus;

    if (!code) {
      setFormError("Mã slot không được để trống.");
      return;
    }
    if (data.some((slot) => slot.id !== editingSlot?.id && slot.code.trim().toUpperCase() === code)) {
      setFormError(`Mã slot ${code} đã tồn tại.`);
      return;
    }
    if (!floors.some((floor) => floor.id === selectedFloorId) || !vehicleTypes.some((type) => type.id === vehicleTypeId)) {
      setFormError("Tầng hoặc loại xe không hợp lệ.");
      return;
    }

    saveMutation.mutate({ id: editingSlot?.id, payload: { code, floorId: selectedFloorId, vehicleTypeId, status: nextStatus } });
  };

  if (isLoading) return <><PageHeader title="Quản lý slot đỗ xe" description="Đang tải dữ liệu slot." /><Card><CardContent className="py-12 text-center text-sm text-slate-500">Đang tải...</CardContent></Card></>;
  if (isError) return <><PageHeader title="Quản lý slot đỗ xe" description="Theo dõi trạng thái vị trí đỗ." /><Card><CardContent className="grid justify-items-center gap-3 py-12"><p className="text-sm text-red-600">{getApiErrorMessage(error, "Không thể tải danh sách slot.")}</p><Button variant="secondary" onClick={() => void refetch()}>Thử lại</Button></CardContent></Card></>;

  return (
    <>
      <PageHeader
        title="Quản lý slot đỗ xe"
        description="Theo dõi nhanh tình trạng và kiểm soát khả năng sử dụng của từng vị trí đỗ."
        action={canManage ? <Button onClick={openCreate}><Plus size={17} /> Tạo slot</Button> : undefined}
      />
      {formError && !formOpen && (
        <div role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{formError}</div>
      )}

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {statuses.map((item) => {
          const meta = statusMeta[item];
          const active = status === item;
          return (
            <button key={item} type="button" onClick={() => setStatus(active ? "ALL" : item)} className={cn("rounded-lg border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md", active && "border-primary ring-2 ring-blue-100")}>
              <div className="flex items-center justify-between gap-2">
                <span className={cn("h-2.5 w-2.5 rounded-full", meta.dot)} />
                <span className="text-2xl font-semibold text-slate-900">{counts[item]}</span>
              </div>
              <p className="mt-2 text-sm font-medium text-slate-600">{meta.label}</p>
            </button>
          );
        })}
      </div>

      <Card className="mb-6">
        <CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo mã slot..." className="w-full pl-9" />
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:flex">
            <Select value={floorId} onChange={(event) => setFloorId(event.target.value)} aria-label="Lọc theo tầng">
              <option value="ALL">Tất cả tầng</option>
              {floors.map((floor) => <option key={floor.id} value={floor.id}>{floor.name} - {floor.zone}</option>)}
            </Select>
            <Select value={vehicleTypeId} onChange={(event) => setVehicleTypeId(event.target.value)} aria-label="Lọc theo loại xe">
              <option value="ALL">Tất cả loại xe</option>
              {vehicleTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
            </Select>
            <Select value={status} onChange={(event) => setStatus(event.target.value as SlotStatus | "ALL")} aria-label="Lọc theo trạng thái">
              <option value="ALL">Tất cả trạng thái</option>
              {statuses.map((item) => <option key={item} value={item}>{statusMeta[item].label}</option>)}
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader title={"Sơ đồ slot (" + rows.length + ")"} action={<div className="hidden flex-wrap gap-3 md:flex">{statuses.map((item) => <span key={item} className="inline-flex items-center gap-1.5 text-xs text-slate-500"><span className={cn("h-2 w-2 rounded-full", statusMeta[item].dot)} />{statusMeta[item].label}</span>)}</div>} />
        <CardContent>
          {rows.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
              {rows.map((slot) => {
                const floor = floors.find((item) => item.id === slot.floorId);
                const vehicleType = vehicleTypes.find((item) => item.id === slot.vehicleTypeId);
                const meta = statusMeta[slot.status];
                const canToggle = canUpdateStatus && (slot.status === "AVAILABLE" || slot.status === "BLOCKED");
                const canMaintain = canUpdateStatus && (slot.status === "AVAILABLE" || slot.status === "MAINTENANCE");
                const canDelete = canManage && slot.status !== "OCCUPIED" && slot.status !== "RESERVED";
                return (
                  <article key={slot.id} className={cn("rounded-lg border-2 p-4 transition hover:shadow-md", meta.card)}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-900">{slot.code}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{floor?.name} · {floor?.zone}</p>
                      </div>
                      <span className={cn("mt-1 h-2.5 w-2.5 shrink-0 rounded-full", meta.dot)} title={meta.label} />
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm text-slate-600"><CarFront size={15} />{vehicleType?.name ?? "Chưa xác định"}</div>
                    <p className="mt-2 text-xs font-medium text-slate-500">{meta.label}</p>
                    <div className="mt-4 flex gap-2 border-t border-black/5 pt-3">
                      <Button variant="secondary" className="h-9 flex-1 px-2" disabled={!canManage} onClick={() => openEdit(slot)} title={canManage ? "Chỉnh sửa slot" : "Bạn không có quyền chỉnh sửa slot"} aria-label="Chỉnh sửa slot">
                        <Pencil size={15} />
                      </Button>
                      <Button variant="secondary" className="h-9 flex-1 px-2" disabled={!canToggle} onClick={() => toggleBlockedStatus(slot)} title={canToggle ? (slot.status === "BLOCKED" ? "Mở khóa slot" : "Tạm khóa slot") : (canUpdateStatus ? "Không thể khóa slot ở trạng thái hiện tại" : "Bạn không có quyền cập nhật trạng thái slot")} aria-label={slot.status === "BLOCKED" ? "Mở khóa slot" : "Tạm khóa slot"}>
                        {slot.status === "BLOCKED" ? <Unlock size={15} /> : <Lock size={15} />}
                      </Button>
                      <Button variant="secondary" className="h-9 flex-1 px-2" disabled={!canMaintain} onClick={() => toggleMaintenanceStatus(slot)} title={canMaintain ? (slot.status === "MAINTENANCE" ? "Kết thúc bảo trì" : "Chuyển sang bảo trì") : (canUpdateStatus ? "Không thể bảo trì slot ở trạng thái hiện tại" : "Bạn không có quyền cập nhật trạng thái slot")} aria-label={slot.status === "MAINTENANCE" ? "Kết thúc bảo trì" : "Chuyển sang bảo trì"}>
                        <Wrench size={15} />
                      </Button>
                      <Button variant="secondary" className="h-9 flex-1 px-2" onClick={() => setHistory(slot)} title="Xem chi tiết và lịch sử" aria-label="Xem chi tiết và lịch sử">
                        <History size={15} />
                      </Button>
                      <Button variant="secondary" className="h-9 flex-1 px-2 text-red-600" disabled={!canDelete} onClick={() => removeSlot(slot)} title={canManage ? (canDelete ? "Xóa slot" : "Không thể xóa slot đang sử dụng/đặt trước") : "Bạn không có quyền xóa slot"} aria-label="Xóa slot">
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="py-14 text-center">
              <LayoutGrid className="mx-auto text-slate-300" size={42} />
              <p className="mt-3 text-sm font-medium text-slate-700">Không tìm thấy slot phù hợp</p>
              <button type="button" onClick={() => { setStatus("ALL"); setFloorId("ALL"); setVehicleTypeId("ALL"); setQuery(""); }} className="mt-2 text-sm font-medium text-primary">Xóa bộ lọc</button>
            </div>
          )}
        </CardContent>
      </Card>

      <Modal open={formOpen} title={editingSlot ? `Chỉnh sửa slot ${editingSlot.code}` : "Tạo slot mới"} onClose={closeForm}>
        <form key={editingSlot?.id ?? "create-slot"} className="grid gap-4 sm:grid-cols-2" onSubmit={submitSlot}>
          <Field label="Mã slot">
            <Input name="code" defaultValue={editingSlot?.code ?? ""} placeholder="Ví dụ: B1-001" maxLength={50} required disabled={isSaving} />
          </Field>
          <Field label="Trạng thái">
            <Select name="status" defaultValue={editingSlot?.status ?? "AVAILABLE"} required disabled={isSaving}>
              {editableStatuses.map((item) => <option key={item} value={item}>{statusMeta[item].label}</option>)}
            </Select>
          </Field>
          <Field label="Tầng">
            <Select name="floorId" defaultValue={editingSlot?.floorId ?? floors[0]?.id ?? ""} required disabled={isSaving}>
              {floors.map((floor) => <option key={floor.id} value={floor.id}>{floor.name} - {floor.zone}</option>)}
            </Select>
          </Field>
          <Field label="Loại xe">
            <Select name="vehicleTypeId" defaultValue={editingSlot?.vehicleTypeId ?? vehicleTypes[0]?.id ?? ""} required disabled={isSaving}>
              {vehicleTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
            </Select>
          </Field>
          {formError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 sm:col-span-2">{formError}</div>}
          <div className="flex justify-end gap-3 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={closeForm} disabled={isSaving}>Hủy</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? "Đang lưu..." : editingSlot ? "Lưu thay đổi" : "Tạo slot"}</Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(history)} title="Chi tiết slot" onClose={() => setHistory(null)}>
        {history && (
          <div className="grid gap-4 text-sm">
            <div className="grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">
              <Detail label="Mã slot" value={history.code} />
              <Detail label="Trạng thái" value={statusMeta[history.status].label} />
              <Detail label="Tầng" value={floors.find((floor) => floor.id === history.floorId)?.name ?? history.floorId} />
              <Detail label="Loại xe" value={vehicleTypes.find((type) => type.id === history.vehicleTypeId)?.name ?? history.vehicleTypeId} />
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="font-medium text-slate-800">Lịch sử gần nhất</p>
              <div className="mt-3 flex items-center gap-3"><span className={cn("h-2.5 w-2.5 rounded-full", statusMeta[history.status].dot)} /><span className="text-slate-600">Cập nhật trạng thái thành {statusMeta[history.status].label}</span><span className="ml-auto text-xs text-slate-400">{dateTime(history.updatedAt)}</span></div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold text-slate-800">{value}</p></div>;
}

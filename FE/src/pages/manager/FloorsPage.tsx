import { useCallback, useMemo, useState, type FormEvent } from "react";
import { Building2, CarFront, Layers3, MapPin, Pencil, Plus, SquareParking } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { floorApi } from "@/api/floorApi";
import { vehicleTypeApi } from "@/api/vehicleTypeApi";
import { buildingApi } from "@/api/buildingApi";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Modal } from "@/components/common/Modal";
import { Field, Input } from "@/components/forms/FormField";
import { PageHeader } from "@/components/layout/PageHeader";
import { getApiErrorMessage } from "@/utils/apiError";
import type { Floor } from "@/types/domain";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ApiBuildingItem {
  id?: number | string;
  buildingName?: string;
  name?: string;
  address?: string;
}

function normalizeBuildingId(raw: ApiBuildingItem): string {
  return String(raw.id ?? "");
}

function normalizeBuildingName(raw: ApiBuildingItem): string {
  return (raw.buildingName ?? raw.name ?? "").toString();
}

// ─── Component ───────────────────────────────────────────────────────────────

export function FloorsPage() {
  const queryClient = useQueryClient();

  // ── Remote data ──────────────────────────────────────────────────────────
  const {
    data: buildings = [],
    isLoading: buildingsLoading,
    isError: buildingsError
  } = useQuery({
    queryKey: ["buildings"],
    queryFn: () => buildingApi.getAll()
  });

  const { data: vehicleTypes = [] } = useQuery({
    queryKey: ["vehicleTypes"],
    queryFn: () => vehicleTypeApi.getAll()
  });

  // ── Selected building ────────────────────────────────────────────────────
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("");

  const activeBuildingId = useMemo(() => {
    if (selectedBuildingId) return selectedBuildingId;
    if (buildings.length > 0) return normalizeBuildingId(buildings[0] as ApiBuildingItem);
    return "";
  }, [selectedBuildingId, buildings]);

  // ── Floors for selected building ─────────────────────────────────────────
  const {
    data: floors = [],
    isLoading: floorsLoading,
    isError: floorsError,
    refetch: refetchFloors
  } = useQuery({
    queryKey: ["floors", activeBuildingId],
    queryFn: () => floorApi.getByBuilding(activeBuildingId),
    enabled: Boolean(activeBuildingId)
  });

  // ── Selected floor ───────────────────────────────────────────────────────
  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);

  const selectedFloor = useMemo<Floor | null>(() => {
    if (!floors.length) return null;
    return floors.find((f) => f.id === selectedFloorId) ?? floors[0];
  }, [floors, selectedFloorId]);

  const { data: selectedFloorStats } = useQuery({
    queryKey: ["floor-stats", selectedFloor?.id],
    queryFn: () => floorApi.getStats(selectedFloor!.id),
    enabled: Boolean(selectedFloor?.id)
  });

  // ── Form state ───────────────────────────────────────────────────────────
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const invalidateFloors = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ["floors", activeBuildingId] }),
    [queryClient, activeBuildingId]
  );

  // ── Mutations ────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: floorApi.create,
    onSuccess: (created) => {
      void invalidateFloors();
      setSelectedFloorId(created.id);
      closeForm();
    },
    onError: (err) => setSubmitError(getApiErrorMessage(err, "Không thể tạo tầng. Vui lòng thử lại."))
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof floorApi.update>[1] }) =>
      floorApi.update(id, payload),
    onSuccess: () => {
      void invalidateFloors();
      closeForm();
    },
    onError: (err) => setSubmitError(getApiErrorMessage(err, "Không thể cập nhật tầng. Vui lòng thử lại."))
  });

  const deleteMutation = useMutation({
    mutationFn: floorApi.delete,
    onSuccess: () => {
      void invalidateFloors();
      setSelectedFloorId(null);
      setDeleteError(null);
    },
    onError: (err) => setDeleteError(getApiErrorMessage(err, "Không thể xóa tầng. Vui lòng thử lại."))
  });

  // ── Helpers ──────────────────────────────────────────────────────────────
  const closeForm = useCallback(() => {
    setFormOpen(false);
    setEditingFloor(null);
    setSubmitError(null);
  }, []);

  const openCreate = useCallback(() => {
    setEditingFloor(null);
    setSubmitError(null);
    setFormOpen(true);
  }, []);

  const selectBuilding = useCallback((id: string) => {
    setSelectedBuildingId(id);
    setSelectedFloorId(null);
    setDeleteError(null);
  }, []);

  const submitFloor = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setSubmitError(null);
      const form = new FormData(event.currentTarget);
      const checkedVehicleTypeIds = form.getAll("vehicleTypes").map(String);
      if (!checkedVehicleTypeIds.length) {
        setSubmitError("Vui lòng chọn ít nhất một loại xe hỗ trợ.");
        return;
      }
      const payload = {
        buildingId: activeBuildingId,
        name: String(form.get("name")).trim(),
        zone: String(form.get("zone")).trim(),
        slotCount: Number(form.get("slotCount")),
        supportedVehicleTypeIds: checkedVehicleTypeIds
      };
      if (editingFloor) {
        updateMutation.mutate({ id: editingFloor.id, payload });
      } else {
        createMutation.mutate(payload);
      }
    },
    [activeBuildingId, editingFloor, createMutation, updateMutation]
  );

  const handleDelete = useCallback(
    (floor: Floor) => {
      setDeleteError(null);
      const confirmed = window.confirm(
        `Bạn có chắc chắn muốn xóa tầng "${floor.name}"? Tầng không thể xóa nếu còn slot phụ thuộc.`
      );
      if (confirmed) deleteMutation.mutate(floor.id);
    },
    [deleteMutation]
  );

  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ── Stats ────────────────────────────────────────────────────────────────
  const floorStats = useMemo(() => {
    if (!selectedFloor) return { total: 0, occupancy: 0 };
    return {
      total: selectedFloorStats?.totalSlots ?? selectedFloor.slotCount,
      occupancy: Math.round(selectedFloorStats?.occupancyRate ?? 0)
    };
  }, [selectedFloor, selectedFloorStats]);

  // ── Render ───────────────────────────────────────────────────────────────
  if (buildingsLoading) {
    return (
      <>
        <PageHeader title="Phân tầng" description="Chọn tòa nhà để quản lý danh sách tầng." />
        <Card><CardContent className="py-12 text-center text-sm text-slate-500">Đang tải dữ liệu...</CardContent></Card>
      </>
    );
  }

  if (buildingsError) {
    return (
      <>
        <PageHeader title="Phân tầng" description="Chọn tòa nhà để quản lý danh sách tầng." />
        <Card>
          <CardContent className="grid justify-items-center gap-3 py-12 text-center">
            <p className="text-sm text-red-600">Không thể tải danh sách tòa nhà. Vui lòng thử lại.</p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Phân tầng" description="Chọn tòa nhà để quản lý danh sách tầng, khu vực, sức chứa và loại xe hỗ trợ." />
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(240px,30%)_minmax(0,70%)]">
        {/* Building list */}
        <Card className="lg:sticky lg:top-20">
          <CardHeader title="Tòa nhà" />
          <CardContent className="grid gap-2">
            {buildings.map((building) => {
              const bld = building as ApiBuildingItem;
              const bldId = normalizeBuildingId(bld);
              const active = bldId === activeBuildingId;
              return (
                <button
                  key={bldId}
                  type="button"
                  onClick={() => selectBuilding(bldId)}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition ${active ? "border-primary bg-blue-50 ring-1 ring-primary/20" : "border-border hover:bg-slate-50"}`}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${active ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}>
                    <Building2 size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-slate-800">{normalizeBuildingName(bld)}</span>
                    <span className="text-xs text-slate-500">{bld.address ?? ""}</span>
                  </span>
                </button>
              );
            })}
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {/* Floor list */}
          <Card>
            <CardHeader
              title={activeBuildingId ? (normalizeBuildingName((buildings.find((b) => normalizeBuildingId(b as ApiBuildingItem) === activeBuildingId) ?? {}) as ApiBuildingItem) || "Danh sách tầng") : "Danh sách tầng"}
              action={<Button onClick={openCreate}><Plus size={17} /> Tạo tầng mới</Button>}
            />
            <CardContent>
              {deleteError && (
                <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                  {deleteError}
                </div>
              )}
              {floorsLoading ? (
                <p className="py-8 text-center text-sm text-slate-500">Đang tải tầng...</p>
              ) : floorsError ? (
                <div className="grid justify-items-center gap-3 py-8 text-center">
                  <p className="text-sm text-red-600">Không thể tải danh sách tầng.</p>
                  <Button variant="secondary" onClick={() => void refetchFloors()}>Thử lại</Button>
                </div>
              ) : floors.length ? (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {floors.map((floor) => {
                    const active = selectedFloor?.id === floor.id;
                    return (
                      <button
                        key={floor.id}
                        type="button"
                        onClick={() => setSelectedFloorId(floor.id)}
                        className={`rounded-lg border p-4 text-left transition ${active ? "border-primary bg-blue-50 ring-1 ring-primary/20" : "border-border hover:border-slate-300 hover:bg-slate-50"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-primary shadow-sm"><Layers3 size={20} /></span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{floor.slotCount} slot</span>
                        </div>
                        <p className="mt-3 text-lg font-semibold text-slate-900">{floor.name}</p>
                        <p className="mt-1 truncate text-sm text-slate-500">{floor.zone}</p>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 py-12 text-center">
                  <Layers3 className="mx-auto text-slate-300" size={36} />
                  <p className="mt-2 text-sm font-medium text-slate-600">Tòa nhà chưa có tầng</p>
                  <button onClick={openCreate} className="mt-2 text-sm font-medium text-primary">Tạo tầng đầu tiên</button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Floor detail */}
          {selectedFloor && (
            <Card>
              <CardHeader
                title={`Chi tiết ${selectedFloor.name}`}
                action={
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => { setEditingFloor(selectedFloor); setSubmitError(null); setFormOpen(true); }}
                    >
                      <Pencil size={16} /> Chỉnh sửa
                    </Button>
                    <Button
                      variant="secondary"
                      className="text-red-600"
                      onClick={() => handleDelete(selectedFloor)}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
                    </Button>
                  </div>
                }
              />
              <CardContent className="grid gap-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <Stat icon={<MapPin size={18} />} label="Khu vực" value={selectedFloor.zone || "—"} />
                  <Stat icon={<SquareParking size={18} />} label="Tổng số slot" value={String(floorStats.total)} />
                  <Stat icon={<Layers3 size={18} />} label="Loại xe hỗ trợ" value={String(selectedFloor.supportedVehicleTypes.length)} />
                  <Stat icon={<CarFront size={18} />} label="Tỷ lệ lấp đầy" value={`${floorStats.occupancy}%`} />
                </div>
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-700">Loại xe hỗ trợ</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedFloor.supportedVehicleTypes.map((vtId) => {
                      const vt = vehicleTypes.find((v) => v.id === vtId);
                      return (
                        <span key={vtId} className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
                          {vt ? vt.name : vtId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create / Edit modal */}
      <Modal
        open={formOpen}
        title={editingFloor ? `Cập nhật ${editingFloor.name}` : "Tạo tầng mới"}
        onClose={closeForm}
      >
        <form key={editingFloor?.id ?? "new"} className="grid gap-4 sm:grid-cols-2" onSubmit={submitFloor}>
          <Field label="Tên tầng">
            <Input name="name" defaultValue={editingFloor?.name ?? ""} placeholder="Ví dụ: B1" required maxLength={50} />
          </Field>
          <Field label="Khu vực">
            <Input name="zone" defaultValue={editingFloor?.zone ?? ""} placeholder="Ví dụ: Khu xe máy A" maxLength={100} />
          </Field>
          <Field label="Số lượng slot">
            <Input name="slotCount" type="number" min={1} defaultValue={String(editingFloor?.slotCount ?? 1)} placeholder="Ví dụ: 100" required />
          </Field>
          <fieldset className="sm:col-span-2">
            <legend className="mb-2 text-sm font-medium text-slate-700">Loại xe hỗ trợ</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {vehicleTypes.map((vt) => (
                <label key={vt.id} className="flex items-center gap-2 rounded-md border border-border p-3 text-sm cursor-pointer">
                  <input
                    name="vehicleTypes"
                    type="checkbox"
                    value={vt.id}
                    defaultChecked={editingFloor?.supportedVehicleTypes.includes(vt.id)}
                  />
                  {vt.name}
                </label>
              ))}
            </div>
          </fieldset>
          {submitError && (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 sm:col-span-2">
              {submitError}
            </div>
          )}
          <div className="flex justify-end gap-3 sm:col-span-2">
            <Button type="button" variant="secondary" onClick={closeForm} disabled={isSaving}>Hủy</Button>
            <Button type="submit" disabled={isSaving}>{isSaving ? "Đang lưu..." : editingFloor ? "Lưu thay đổi" : "Tạo tầng"}</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <span className="text-primary">{icon}</span>
      <p className="mt-3 text-xs text-slate-500">{label}</p>
      <p className="mt-1 truncate font-semibold text-slate-900">{value}</p>
    </div>
  );
}

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { CalendarClock, Eye, Plus, XCircle } from "lucide-react";
import dayjs from "dayjs";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Drawer } from "@/components/common/Drawer";
import { Modal } from "@/components/common/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Field, Input, Select } from "@/components/forms/FormField";
import { DataTable } from "@/components/tables/DataTable";
import { useResources, useResourceMutations } from "@/hooks/useResources";
import { vehicleTypes, slots } from "@/api/mockData";
import type { Reservation } from "@/types/domain";
import { dateTime } from "@/utils/format";
import type { ColumnDef } from "@tanstack/react-table";

const STATUS_OPTIONS = ["ALL", "PENDING", "CONFIRMED", "CANCELLED"] as const;
type FilterStatus = (typeof STATUS_OPTIONS)[number];

export function ReservationsPage() {
  const { data: reservations = [], isLoading } = useResources<Reservation>("reservations");
  const mutations = useResourceMutations<Reservation>("reservations");

  const [modalOpen, setModalOpen] = useState(false);
  const [detail, setDetail] = useState<Reservation | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Reservation | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("ALL");
  const [selectedVehicleTypeId, setSelectedVehicleTypeId] = useState(vehicleTypes[0].id);
  const [timeError, setTimeError] = useState<string | null>(null);

  /* ── Derived data ── */
  const availableSlots = useMemo(
    () => slots.filter((s) => s.vehicleTypeId === selectedVehicleTypeId && s.status === "AVAILABLE"),
    [selectedVehicleTypeId]
  );

  const filtered = useMemo(
    () => (filterStatus === "ALL" ? reservations : reservations.filter((r) => r.status === filterStatus)),
    [reservations, filterStatus]
  );

  /* ── Columns ── */
  const columns = useMemo<ColumnDef<Reservation>[]>(
    () => [
      {
        accessorKey: "plateNumber",
        header: "Biển số",
        cell: ({ row }) => <span className="font-mono font-semibold text-slate-800">{row.original.plateNumber}</span>
      },
      {
        accessorKey: "vehicleTypeId",
        header: "Loại xe",
        cell: ({ row }) => vehicleTypes.find((v) => v.id === row.original.vehicleTypeId)?.name ?? row.original.vehicleTypeId
      },
      {
        accessorKey: "slotId",
        header: "Slot",
        cell: ({ row }) => {
          const slot = slots.find((s) => s.id === row.original.slotId);
          return slot ? <span className="font-mono text-blue-700">{slot.code}</span> : row.original.slotId;
        }
      },
      {
        accessorKey: "startAt",
        header: "Bắt đầu",
        cell: ({ row }) => dateTime(row.original.startAt)
      },
      {
        accessorKey: "endAt",
        header: "Kết thúc",
        cell: ({ row }) => dateTime(row.original.endAt)
      },
      {
        accessorKey: "status",
        header: "Trạng thái",
        cell: ({ row }) => <Badge value={row.original.status} />
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const res = row.original;
          const cancellable = res.status === "PENDING" || res.status === "CONFIRMED";
          return (
            <div className="flex justify-end gap-2">
              <Button variant="ghost" className="h-9 w-9 px-0" onClick={() => setDetail(res)} aria-label="Chi tiết">
                <Eye size={16} />
              </Button>
              <Button
                variant="ghost"
                className={`h-9 w-9 px-0 ${cancellable ? "text-red-500 hover:bg-red-50" : "text-slate-300 cursor-not-allowed"}`}
                onClick={() => cancellable && setCancelTarget(res)}
                disabled={!cancellable}
                title={cancellable ? "Hủy đặt chỗ" : "Không thể hủy"}
                aria-label="Hủy đặt chỗ"
              >
                <XCircle size={16} />
              </Button>
            </div>
          );
        }
      }
    ],
    [setDetail, setCancelTarget]
  );

  /* ── Handlers ── */
  const handleCreate = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const startAt = dayjs(String(form.get("startAt")));
    const endAt = dayjs(String(form.get("endAt")));

    // Validate time range
    if (!endAt.isAfter(startAt)) {
      setTimeError("Thời gian kết thúc phải sau thời gian bắt đầu.");
      return;
    }
    setTimeError(null);

    const payload: Omit<Reservation, "id"> = {
      plateNumber: String(form.get("plateNumber")),
      vehicleTypeId: selectedVehicleTypeId,   // use state directly (avoids FormData sync issue)
      slotId: String(form.get("slotId")),
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      status: "PENDING"
    };
    mutations.create.mutate(payload);
    setModalOpen(false);
    setTimeError(null);
  };

  const handleConfirmCancel = () => {
    if (!cancelTarget) return;
    mutations.update.mutate({ id: cancelTarget.id, payload: { status: "CANCELLED" } });
    setCancelTarget(null);
  };

  const handleCloseCreate = () => {
    setModalOpen(false);
    setTimeError(null);
  };

  const defaultStart = dayjs().add(1, "hour").format("YYYY-MM-DDTHH:mm");
  const defaultEnd = dayjs().add(3, "hour").format("YYYY-MM-DDTHH:mm");

  return (
    <>
      <PageHeader
        title="Danh sách đặt chỗ"
        description="Quản lý các lượt đặt chỗ trước theo loại phương tiện và khoảng thời gian."
        action={
          <Button onClick={() => setModalOpen(true)}>
            <Plus size={17} />
            Đặt chỗ mới
          </Button>
        }
      />

      {/* Status filter tabs */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filterStatus === s
                ? "bg-blue-600 text-white shadow"
                : "bg-white border border-border text-slate-600 hover:bg-slate-50"
            }`}
          >
            {s === "ALL" ? "Tất cả" : s}
            {s !== "ALL" && (
              <span className="ml-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-xs">
                {reservations.filter((r) => r.status === s).length}
              </span>
            )}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader title={isLoading ? "Đang tải..." : `${filtered.length} đặt chỗ`} />
        <CardContent>
          <DataTable data={filtered} columns={columns} />
        </CardContent>
      </Card>

      {/* ── Create reservation modal ── */}
      <Modal open={modalOpen} title="Đặt chỗ mới" onClose={handleCloseCreate}>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleCreate}>
          <Field label="Biển số xe">
            <Input name="plateNumber" placeholder="VD: 51G-12345" required />
          </Field>

          <Field label="Loại xe">
            {/* Controlled select – vehicleTypeId read from state on submit */}
            <Select
              name="vehicleTypeId"
              value={selectedVehicleTypeId}
              onChange={(e) => setSelectedVehicleTypeId(e.target.value)}
            >
              {vehicleTypes.map((v) => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </Select>
          </Field>

          <Field label="Slot (theo loại xe đã chọn)">
            {/* key={selectedVehicleTypeId} forces re-mount → resets selection when vehicle type changes */}
            <Select name="slotId" key={selectedVehicleTypeId} required>
              {availableSlots.length === 0 ? (
                <option disabled value="">Không có slot khả dụng</option>
              ) : (
                availableSlots.map((s) => (
                  <option key={s.id} value={s.id}>{s.code}</option>
                ))
              )}
            </Select>
          </Field>

          <Field label="Số slot khả dụng">
            <div className={`flex h-10 items-center rounded-md border px-3 text-sm ${
              availableSlots.length > 0
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}>
              {availableSlots.length > 0
                ? `✓ ${availableSlots.length} slot khả dụng`
                : "✗ Không có slot khả dụng – chọn loại xe khác"}
            </div>
          </Field>

          <Field label="Thời gian bắt đầu">
            <Input name="startAt" type="datetime-local" defaultValue={defaultStart} required />
          </Field>

          <Field label="Thời gian kết thúc">
            <Input name="endAt" type="datetime-local" defaultValue={defaultEnd} required />
          </Field>

          {/* Time range validation error */}
          {timeError && (
            <div className="sm:col-span-2 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
              ⚠ {timeError}
            </div>
          )}

          <div className="flex justify-end gap-3 sm:col-span-2 pt-2 border-t border-border">
            <Button type="button" variant="secondary" onClick={handleCloseCreate}>
              Hủy
            </Button>
            <Button type="submit" disabled={availableSlots.length === 0}>
              <CalendarClock size={16} />
              Xác nhận đặt chỗ
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Cancel confirmation modal ── */}
      <Modal open={Boolean(cancelTarget)} title="Xác nhận hủy đặt chỗ" onClose={() => setCancelTarget(null)}>
        <div className="grid gap-5">
          <div className="rounded-lg bg-red-50 border border-red-200 p-4">
            <p className="text-sm font-medium text-red-800 mb-3">Bạn có chắc muốn hủy đặt chỗ này?</p>
            {cancelTarget && (
              <dl className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Biển số:</dt>
                  <dd className="font-mono font-semibold">{cancelTarget.plateNumber}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Loại xe:</dt>
                  <dd>{vehicleTypes.find((v) => v.id === cancelTarget.vehicleTypeId)?.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Bắt đầu:</dt>
                  <dd>{dateTime(cancelTarget.startAt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Kết thúc:</dt>
                  <dd>{dateTime(cancelTarget.endAt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Trạng thái:</dt>
                  <dd><Badge value={cancelTarget.status} /></dd>
                </div>
              </dl>
            )}
          </div>
          <p className="text-xs text-slate-500">Hành động này không thể hoàn tác. Đặt chỗ sẽ bị đánh dấu CANCELLED.</p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setCancelTarget(null)}>
              Quay lại
            </Button>
            <Button variant="danger" onClick={handleConfirmCancel}>
              <XCircle size={16} />
              Xác nhận hủy
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Detail drawer ── */}
      <Drawer open={Boolean(detail)} title="Chi tiết đặt chỗ" onClose={() => setDetail(null)}>
        {detail && (
          <div className="grid gap-3">
            {/* Status badge at top */}
            <div className="flex items-center justify-between rounded-lg bg-slate-50 p-4 border border-border">
              <span className="text-sm font-medium text-slate-600">Trạng thái hiện tại</span>
              <Badge value={detail.status} />
            </div>

            <dl className="grid gap-3">
              {[
                { label: "Mã đặt chỗ", value: detail.id },
                { label: "Biển số xe", value: detail.plateNumber },
                { label: "Loại xe", value: vehicleTypes.find((v) => v.id === detail.vehicleTypeId)?.name ?? detail.vehicleTypeId },
                { label: "Slot", value: slots.find((s) => s.id === detail.slotId)?.code ?? detail.slotId },
                { label: "Thời gian bắt đầu", value: dateTime(detail.startAt) },
                { label: "Thời gian kết thúc", value: dateTime(detail.endAt) },
                {
                  label: "Thời lượng",
                  value: (() => {
                    const hours = dayjs(detail.endAt).diff(dayjs(detail.startAt), "minute");
                    return `${Math.floor(hours / 60)}h ${hours % 60}p`;
                  })()
                }
              ].map(({ label, value }) => (
                <div key={label} className="rounded-md bg-slate-50 p-3 border border-border">
                  <dt className="text-xs font-medium uppercase text-slate-500">{label}</dt>
                  <dd className="mt-1 text-sm font-medium text-slate-900">{value}</dd>
                </div>
              ))}
            </dl>

            {(detail.status === "PENDING" || detail.status === "CONFIRMED") && (
              <Button
                variant="danger"
                className="w-full mt-2"
                onClick={() => {
                  setCancelTarget(detail);
                  setDetail(null);
                }}
              >
                <XCircle size={16} />
                Hủy đặt chỗ này
              </Button>
            )}
          </div>
        )}
      </Drawer>
    </>
  );
}


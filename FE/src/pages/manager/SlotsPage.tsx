import { useMemo, useState } from "react";
import { History, Lock, Unlock, Pencil, Trash2, Plus } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { Modal } from "@/components/common/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Field, Input, Select } from "@/components/forms/FormField";
import { floors, vehicleTypes } from "@/api/mockData";
import { useResourceMutations, useResources } from "@/hooks/useResources";
import { cn } from "@/utils/cn";
import { dateTime } from "@/utils/format";
import type { ParkingSlot, SlotStatus } from "@/types/domain";

const statusColors: Record<SlotStatus, string> = {
  AVAILABLE: "border-emerald-300 bg-emerald-50",
  OCCUPIED: "border-red-300 bg-red-50",
  RESERVED: "border-blue-300 bg-blue-50",
  MAINTENANCE: "border-amber-300 bg-amber-50",
  BLOCKED: "border-slate-300 bg-slate-100"
};

export function SlotsPage() {
  const { data = [] } = useResources<ParkingSlot>("slots");
  const { update, create, remove } = useResourceMutations<ParkingSlot>("slots");
  const [status, setStatus] = useState<SlotStatus | "ALL">("ALL");
  const [history, setHistory] = useState<ParkingSlot | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ParkingSlot | null>(null);

  const rows = useMemo(() => (status === "ALL" ? data : data.filter((slot) => slot.status === status)), [data, status]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const code = String(formData.get("code"));
    const floorId = String(formData.get("floorId"));
    const vehicleTypeId = String(formData.get("vehicleTypeId"));
    const statusVal = String(formData.get("status")) as SlotStatus;

    const payload: Omit<ParkingSlot, "id"> = {
      code,
      floorId,
      vehicleTypeId,
      status: statusVal,
      updatedAt: new Date().toISOString()
    };

    if (editingSlot) {
      update.mutate({ id: editingSlot.id, payload });
    } else {
      create.mutate(payload);
    }
    setModalOpen(false);
    setEditingSlot(null);
  };

  return (
    <>
      <PageHeader
        title="Quản lý slot đỗ xe"
        description="Theo dõi slot còn trống, đang sử dụng, đặt trước, bảo trì và tạm khóa."
        action={
          <div className="flex gap-2">
            <Select value={status} onChange={(event) => setStatus(event.target.value as SlotStatus | "ALL")}>
              <option value="ALL">Tất cả trạng thái</option>
              {Object.keys(statusColors).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
            <Button
              onClick={() => {
                setEditingSlot(null);
                setModalOpen(true);
              }}
            >
              <Plus size={16} />
              Thêm Slot
            </Button>
          </div>
        }
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
        {rows.map((slot) => {
          const floor = floors.find((item) => item.id === slot.floorId);
          const vehicleType = vehicleTypes.find((item) => item.id === slot.vehicleTypeId);
          return (
            <Card key={slot.id} className={cn("border-2", statusColors[slot.status])}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{slot.code}</p>
                    <p className="text-xs text-slate-500">
                      {floor?.name} - {floor?.zone}
                    </p>
                  </div>
                  <Badge value={slot.status} />
                </div>
                <p className="mt-3 text-sm text-slate-600">{vehicleType?.name}</p>
                <div className="mt-4 flex gap-1.5 flex-wrap">
                  <Button
                    variant="secondary"
                    className="h-9 flex-1 min-w-[32px] px-1.5"
                    onClick={() =>
                      update.mutate({
                        id: slot.id,
                        payload: { status: slot.status === "BLOCKED" ? "AVAILABLE" : "BLOCKED" }
                      })
                    }
                    title="Khóa/Mở khóa nhanh"
                  >
                    {slot.status === "BLOCKED" ? <Unlock size={14} /> : <Lock size={14} />}
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-9 flex-1 min-w-[32px] px-1.5"
                    onClick={() => {
                      setEditingSlot(slot);
                      setModalOpen(true);
                    }}
                    title="Chỉnh sửa chi tiết"
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-9 flex-1 min-w-[32px] px-1.5 text-red-600"
                    onClick={() => {
                      if (confirm("Bạn có chắc chắn muốn xóa slot đỗ xe này?")) {
                        remove.mutate(slot.id);
                      }
                    }}
                    title="Xóa slot"
                  >
                    <Trash2 size={14} />
                  </Button>
                  <Button
                    variant="secondary"
                    className="h-9 flex-1 min-w-[32px] px-1.5"
                    onClick={() => setHistory(slot)}
                    title="Xem lịch sử"
                  >
                    <History size={14} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        title={editingSlot ? "Cập nhật slot đỗ xe" : "Tạo mới slot đỗ xe"}
        onClose={() => {
          setModalOpen(false);
          setEditingSlot(null);
        }}
      >
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <Field label="Mã Slot">
            <Input name="code" defaultValue={editingSlot?.code ?? ""} required placeholder="VD: B1-099" />
          </Field>
          <Field label="Tầng / Khu vực">
            <Select name="floorId" defaultValue={editingSlot?.floorId ?? floors[0]?.id}>
              {floors.map((floor) => (
                <option key={floor.id} value={floor.id}>
                  {floor.name} - {floor.zone}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Loại phương tiện hỗ trợ">
            <Select name="vehicleTypeId" defaultValue={editingSlot?.vehicleTypeId ?? vehicleTypes[0]?.id}>
              {vehicleTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} ({type.size})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Trạng thái">
            <Select name="status" defaultValue={editingSlot?.status ?? "AVAILABLE"}>
              {Object.keys(statusColors).map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </Select>
          </Field>
          <div className="mt-4 flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setModalOpen(false);
                setEditingSlot(null);
              }}
            >
              Hủy
            </Button>
            <Button type="submit">Lưu</Button>
          </div>
        </form>
      </Modal>

      <Modal open={Boolean(history)} title="Lịch sử slot" onClose={() => setHistory(null)}>
        {history && (
          <div className="grid gap-3 text-sm">
            <p>
              <strong>Slot:</strong> {history.code}
            </p>
            <p>
              <strong>Trạng thái hiện tại:</strong> {history.status}
            </p>
            <p>
              <strong>Cập nhật gần nhất:</strong> {dateTime(history.updatedAt)}
            </p>
            <p className="rounded-md bg-slate-50 p-3 text-slate-600">
              Audit trail sẵn sàng nối backend: tạo slot, cập nhật trạng thái, khóa, mở khóa, bảo trì.
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}

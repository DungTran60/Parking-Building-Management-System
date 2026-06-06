import { useMemo, useState } from "react";
import { History, Lock, Unlock } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { Modal } from "@/components/common/Modal";
import { PageHeader } from "@/components/common/PageHeader";
import { Select } from "@/components/forms/FormField";
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
  const { update } = useResourceMutations<ParkingSlot>("slots");
  const [status, setStatus] = useState<SlotStatus | "ALL">("ALL");
  const [history, setHistory] = useState<ParkingSlot | null>(null);
  const rows = useMemo(() => (status === "ALL" ? data : data.filter((slot) => slot.status === status)), [data, status]);

  return (
    <>
      <PageHeader title="Quản lý slot đỗ xe" description="Theo dõi slot còn trống, đang sử dụng, đặt trước, bảo trì và tạm khóa." action={<Select value={status} onChange={(event) => setStatus(event.target.value as SlotStatus | "ALL")}><option value="ALL">Tất cả</option>{Object.keys(statusColors).map((item) => <option key={item} value={item}>{item}</option>)}</Select>} />
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
                    <p className="text-xs text-slate-500">{floor?.name} - {floor?.zone}</p>
                  </div>
                  <Badge value={slot.status} />
                </div>
                <p className="mt-3 text-sm text-slate-600">{vehicleType?.name}</p>
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" className="h-9 flex-1 px-2" onClick={() => update.mutate({ id: slot.id, payload: { status: slot.status === "BLOCKED" ? "AVAILABLE" : "BLOCKED" } })}>
                    {slot.status === "BLOCKED" ? <Unlock size={15} /> : <Lock size={15} />}
                  </Button>
                  <Button variant="secondary" className="h-9 flex-1 px-2" onClick={() => setHistory(slot)}>
                    <History size={15} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      <Modal open={Boolean(history)} title="Lịch sử slot" onClose={() => setHistory(null)}>
        {history && (
          <div className="grid gap-3 text-sm">
            <p><strong>Slot:</strong> {history.code}</p>
            <p><strong>Trạng thái hiện tại:</strong> {history.status}</p>
            <p><strong>Cập nhật gần nhất:</strong> {dateTime(history.updatedAt)}</p>
            <p className="rounded-md bg-slate-50 p-3 text-slate-600">Audit trail sẵn sàng nối backend: tạo slot, cập nhật trạng thái, khóa, mở khóa, bảo trì.</p>
          </div>
        )}
      </Modal>
    </>
  );
}

import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { CalendarCheck } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Field, Input, Select } from "@/components/forms/FormField";
import { floors, slots, vehicleTypes } from "@/api/mockData";
import { cancelUserReservation, createUserReservation, getUserReservations } from "@/services/mockRepository";
import { dateTime } from "@/utils/format";
import type { Reservation } from "@/types/domain";

export function ReservationsPage() {
  const [vehicleTypeId, setVehicleTypeId] = useState("motorbike");
  const [plateNumber, setPlateNumber] = useState("");
  const [startAt, setStartAt] = useState(dayjs().add(1, "hour").format("YYYY-MM-DDTHH:mm"));
  const [endAt, setEndAt] = useState(dayjs().add(3, "hour").format("YYYY-MM-DDTHH:mm"));
  const [slotId, setSlotId] = useState("");
  const [rows, setRows] = useState<Reservation[]>([]);

  const availableSlots = useMemo(() => slots.filter((slot) => slot.vehicleTypeId === vehicleTypeId && slot.status === "AVAILABLE"), [vehicleTypeId]);
  const selectedSlotId = slotId || availableSlots[0]?.id || "";

  const load = async () => setRows(await getUserReservations());

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (!plateNumber.trim() || !selectedSlotId) return;
    await createUserReservation({
      plateNumber: plateNumber.trim().toUpperCase(),
      vehicleTypeId,
      slotId: selectedSlotId,
      startAt: dayjs(startAt).toISOString(),
      endAt: dayjs(endAt).toISOString()
    });
    setPlateNumber("");
    await load();
  };

  const cancel = async (id: string) => {
    await cancelUserReservation(id);
    await load();
  };

  return (
    <>
      <PageHeader title="Đặt chỗ trước" description="Chọn phương tiện, thời gian gửi và slot còn trống. Người dùng chỉ có thể tạo hoặc hủy đặt chỗ của mình." />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader title="Thông tin đặt chỗ" />
          <CardContent className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Loại phương tiện">
                <Select value={vehicleTypeId} onChange={(event) => setVehicleTypeId(event.target.value)}>
                  {vehicleTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
                </Select>
              </Field>
              <Field label="Biển số">
                <Input value={plateNumber} onChange={(event) => setPlateNumber(event.target.value)} placeholder="VD: 30F-888.99" className="font-mono uppercase" />
              </Field>
              <Field label="Thời gian vào">
                <Input type="datetime-local" value={startAt} onChange={(event) => setStartAt(event.target.value)} />
              </Field>
              <Field label="Thời gian ra dự kiến">
                <Input type="datetime-local" value={endAt} onChange={(event) => setEndAt(event.target.value)} />
              </Field>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Slot còn trống</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
                {availableSlots.slice(0, 12).map((slot) => {
                  const floor = floors.find((item) => item.id === slot.floorId);
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSlotId(slot.id)}
                      className={`rounded-md border p-3 text-xs font-semibold ${selectedSlotId === slot.id ? "border-blue-300 bg-blue-50 text-blue-700" : "border-border text-slate-700 hover:border-blue-300"}`}
                      title={floor ? `${floor.name} - ${floor.zone}` : slot.code}
                    >
                      {slot.code}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button className="h-12" onClick={submit} disabled={!plateNumber.trim() || !selectedSlotId}>
              <CalendarCheck size={20} />
              Xác nhận đặt chỗ
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 content-start">
          <Card>
            <CardHeader title="Đặt chỗ gần nhất" />
            <CardContent className="grid gap-3">
              {rows.length === 0 && <p className="text-sm text-slate-500">Chưa có đặt chỗ mới.</p>}
              {rows.map((reservation) => (
                <div key={reservation.id} className="rounded-md bg-slate-50 p-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono font-semibold">{reservation.plateNumber}</span>
                    <Badge value={reservation.status} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Slot {slots.find((slot) => slot.id === reservation.slotId)?.code ?? reservation.slotId}</p>
                  <p className="mt-1 text-xs text-slate-500">{dateTime(reservation.startAt)} - {dateTime(reservation.endAt)}</p>
                  {reservation.status !== "CANCELLED" && (
                    <Button variant="secondary" className="mt-3 h-8 w-full" onClick={() => cancel(reservation.id)}>Hủy đặt chỗ</Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
            <h3 className="font-semibold text-amber-800">Lưu ý</h3>
            <p className="mt-2 text-sm text-amber-700">Chỗ đặt được giữ trong 15 phút kể từ giờ vào dự kiến. Quá thời gian này hệ thống có thể giải phóng slot.</p>
          </div>
        </div>
      </div>
    </>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { CalendarCheck } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Field, Input, Select } from "@/components/forms/FormField";
import { floorApi } from "@/api/floorApi";
import { slotApi } from "@/api/slotApi";
import { vehicleTypeApi } from "@/api/vehicleTypeApi";
import { reservationApi } from "@/api/reservationApi";
import { getApiErrorMessage } from "@/utils/apiError";
import { dateTime } from "@/utils/format";

export function ReservationsPage() {
  const queryClient = useQueryClient();
  const [vehicleTypeId, setVehicleTypeId] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [startAt, setStartAt] = useState(dayjs().add(1, "hour").format("YYYY-MM-DDTHH:mm"));
  const [endAt, setEndAt] = useState(dayjs().add(3, "hour").format("YYYY-MM-DDTHH:mm"));
  const [slotId, setSlotId] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  const { data: floors = [] } = useQuery({ queryKey: ["floors"], queryFn: floorApi.getAll });
  const { data: slotRows = [] } = useQuery({ queryKey: ["slots"], queryFn: slotApi.getAll });
  const { data: vehicleTypes = [] } = useQuery({ queryKey: ["vehicleTypes"], queryFn: () => vehicleTypeApi.getAll() });
  const { data: rows = [] } = useQuery({ queryKey: ["reservations"], queryFn: () => reservationApi.getAll() });

  useEffect(() => {
    if (vehicleTypes.length > 0 && !vehicleTypes.some((type) => String(type.id) === String(vehicleTypeId))) {
      setVehicleTypeId(String(vehicleTypes[0].id));
    }
  }, [vehicleTypes, vehicleTypeId]);

  const createMutation = useMutation({
    mutationFn: reservationApi.create,
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["reservations"] }); 
      queryClient.invalidateQueries({ queryKey: ["slots"] }); 
      setPlateNumber(""); 
      setFormError(null); 
    },
    onError: (error) => {
      setFormError(getApiErrorMessage(error, "Không thể tạo đặt chỗ. Vui lòng kiểm tra lại."));
    }
  });

  const cancelMutation = useMutation({
    mutationFn: reservationApi.cancel,
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["reservations"] }); 
      queryClient.invalidateQueries({ queryKey: ["slots"] }); 
    },
    onError: (error) => {
      alert(getApiErrorMessage(error, "Không thể hủy đặt chỗ."));
    }
  });

  const availableSlots = useMemo(() => slotRows.filter((slot) => String(slot.vehicleTypeId) === String(vehicleTypeId) && (slot.status === "AVAILABLE" || slot.status === "RESERVED")), [slotRows, vehicleTypeId]);
  const selectedSlotId = slotId || (availableSlots.length > 0 ? String(availableSlots[0].id) : "");

  const submit = () => {
    setFormError(null);
    if (!plateNumber.trim()) {
      setFormError("Vui lòng nhập biển số xe.");
      return;
    }
    if (!/^[A-Za-z0-9-]+$/.test(plateNumber.trim())) {
      setFormError("Biển số chỉ gồm chữ, số và dấu gạch ngang.");
      return;
    }
    if (dayjs(startAt).isBefore(dayjs())) {
      setFormError("Thời gian vào không được ở trong quá khứ.");
      return;
    }
    if (!dayjs(endAt).isAfter(dayjs(startAt))) {
      setFormError("Thời gian ra dự kiến phải sau thời gian vào.");
      return;
    }
    if (!selectedSlotId) {
      setFormError("Vui lòng chọn slot.");
      return;
    }

    createMutation.mutate({
      plateNumber: plateNumber.trim().toUpperCase(),
      vehicleTypeId,
      slotId: selectedSlotId,
      startAt: dayjs(startAt).toISOString(),
      endAt: dayjs(endAt).toISOString()
    });
  };

  const cancel = (id: string | number) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đặt chỗ này?")) {
      cancelMutation.mutate(id);
    }
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
                <Select value={vehicleTypeId} onChange={(event) => setVehicleTypeId(event.target.value)} disabled={createMutation.isPending}>
                  {vehicleTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
                </Select>
              </Field>
              <Field label="Biển số">
                <Input value={plateNumber} onChange={(event) => setPlateNumber(event.target.value)} placeholder="VD: 30F-888.99" className="font-mono uppercase" disabled={createMutation.isPending} />
              </Field>
              <Field label="Thời gian vào">
                <Input type="datetime-local" value={startAt} onChange={(event) => setStartAt(event.target.value)} disabled={createMutation.isPending} />
              </Field>
              <Field label="Thời gian ra dự kiến">
                <Input type="datetime-local" value={endAt} onChange={(event) => setEndAt(event.target.value)} disabled={createMutation.isPending} />
              </Field>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Slot còn trống</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
                {availableSlots.length === 0 && <p className="col-span-full text-sm text-slate-500">Không có slot trống cho loại phương tiện này.</p>}
                {availableSlots.slice(0, 12).map((slot) => {
                  const floor = floors.find((item) => String(item.id) === String(slot.floorId));
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSlotId(String(slot.id))}
                      className={`rounded-md border p-3 text-xs font-semibold ${selectedSlotId === String(slot.id) ? "border-blue-300 bg-blue-50 text-blue-700" : "border-border text-slate-700 hover:border-blue-300"}`}
                      title={floor ? `${floor.name} - ${floor.zone}` : slot.code}
                    >
                      {slot.code}
                    </button>
                  );
                })}
              </div>
            </div>

            {formError && (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}

            <Button className="h-12" onClick={submit} disabled={!plateNumber.trim() || !selectedSlotId || createMutation.isPending}>
              <CalendarCheck size={20} />
              {createMutation.isPending ? "Đang xử lý..." : "Xác nhận đặt chỗ"}
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
                  <p className="mt-1 text-xs text-slate-500">Slot {slotRows.find((slot) => String(slot.id) === String(reservation.slotId))?.code ?? reservation.slotId}</p>
                  <p className="mt-1 text-xs text-slate-500">{dateTime(reservation.startAt)} - {dateTime(reservation.endAt)}</p>
                  {["PENDING", "CONFIRMED"].includes(reservation.status) && (
                    <Button variant="secondary" className="mt-3 h-8 w-full" disabled={cancelMutation.isPending} onClick={() => cancel(reservation.id)}>Hủy đặt chỗ</Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-5">
            <h3 className="font-semibold text-amber-800">Lưu ý</h3>
            <p className="mt-2 text-sm text-amber-700">Chỗ đặt được giữ trong 30 phút kể từ giờ vào dự kiến. Quá thời gian này hệ thống có thể giải phóng slot.</p>
          </div>
        </div>
      </div>
    </>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { CalendarCheck, CheckCircle } from "lucide-react";
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: floors = [] } = useQuery({ queryKey: ["floors"], queryFn: floorApi.getAll });
  const { data: slotRows = [] } = useQuery({ queryKey: ["slots"], queryFn: slotApi.getAll });
  const { data: vehicleTypes = [] } = useQuery({ queryKey: ["vehicleTypes"], queryFn: () => vehicleTypeApi.getAll() });
  const { data: rows = [] } = useQuery({ queryKey: ["reservations"], queryFn: () => reservationApi.getAll() });

  useEffect(() => {
    if (vehicleTypes.length > 0 && !vehicleTypes.some((type) => String(type.id) === String(vehicleTypeId))) {
      setVehicleTypeId(String(vehicleTypes[0].id));
    }
  }, [vehicleTypes, vehicleTypeId]);

  // Reset slot khi đổi loại xe
  useEffect(() => {
    setSlotId("");
  }, [vehicleTypeId]);

  const createMutation = useMutation({
    mutationFn: reservationApi.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
      setPlateNumber("");
      setSlotId("");
      setFormError(null);
      const slotCode = data.slotCode ?? data.slotId;
      setSuccessMessage(`Đặt chỗ thành công! Slot ${slotCode} đã được giữ cho bạn.`);
      setTimeout(() => setSuccessMessage(null), 6000);
    },
    onError: (error) => {
      setFormError(getApiErrorMessage(error, "Không thể tạo đặt chỗ. Vui lòng kiểm tra lại."));
      setSuccessMessage(null);
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

  const availableSlots = useMemo(
    () => slotRows.filter((slot) => String(slot.vehicleTypeId) === String(vehicleTypeId) && slot.status === "AVAILABLE"),
    [slotRows, vehicleTypeId]
  );
  const selectedSlotId = slotId || (availableSlots.length > 0 ? String(availableSlots[0].id) : "");

  const submit = () => {
    setFormError(null);
    setSuccessMessage(null);
    if (!plateNumber.trim()) {
      setFormError("Vui lòng nhập biển số xe.");
      return;
    }
    const start = dayjs(startAt);
    const end = dayjs(endAt);
    if (start.isBefore(dayjs())) {
      setFormError("Thời gian vào không được ở trong quá khứ.");
      return;
    }
    if (!end.isAfter(start)) {
      setFormError("Thời gian ra dự kiến phải sau thời gian vào.");
      return;
    }
    if (!selectedSlotId) {
      setFormError("Vui lòng chọn slot. Nếu không có slot trống, hãy chọn loại phương tiện khác.");
      return;
    }

    createMutation.mutate({
      plateNumber: plateNumber.trim().toUpperCase(),
      vehicleTypeId,
      slotId: selectedSlotId,
      startAt: start.toISOString(),
      endAt: end.toISOString()
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
              <p className="mb-2 text-sm font-medium text-slate-700">
                Slot còn trống
                {availableSlots.length > 0 && (
                  <span className="ml-2 text-xs font-normal text-slate-400">({availableSlots.length} slot)</span>
                )}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-6">
                {availableSlots.length === 0 && (
                  <p className="col-span-full rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                    Không có slot trống cho loại phương tiện này.
                  </p>
                )}
                {availableSlots.slice(0, 12).map((slot) => {
                  const floor = floors.find((item) => String(item.id) === String(slot.floorId));
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSlotId(String(slot.id))}
                      className={`rounded-md border p-3 text-xs font-semibold transition-colors ${selectedSlotId === String(slot.id) ? "border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-300" : "border-border text-slate-700 hover:border-blue-300 hover:bg-blue-50"}`}
                      title={floor ? `Tầng ${floor.name} – Khu ${floor.zone}` : slot.code}
                    >
                      {slot.code}
                    </button>
                  );
                })}
              </div>
            </div>

            {successMessage && (
              <div role="status" className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                <CheckCircle size={16} className="shrink-0" />
                {successMessage}
              </div>
            )}

            {formError && (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {formError}
              </div>
            )}

            <Button className="h-12" onClick={submit} disabled={availableSlots.length === 0 || createMutation.isPending}>
              <CalendarCheck size={20} />
              {createMutation.isPending ? "Đang xử lý..." : "Xác nhận đặt chỗ"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 content-start">
          <Card>
            <CardHeader title="Đặt chỗ gần nhất" />
            <CardContent className="grid gap-3">
              {rows.length === 0 && <p className="text-sm text-slate-500">Chưa có đặt chỗ nào.</p>}
              {rows.map((reservation) => {
                const slotCode = reservation.slotCode
                  ?? slotRows.find((slot) => String(slot.id) === String(reservation.slotId))?.code
                  ?? `Slot #${reservation.slotId}`;
                return (
                  <div key={reservation.id} className="rounded-md border border-slate-100 bg-slate-50 p-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-mono font-semibold">{reservation.plateNumber}</span>
                      <Badge value={reservation.status} />
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Slot {slotCode}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{dateTime(reservation.startAt)} – {dateTime(reservation.endAt)}</p>
                    {["PENDING", "CONFIRMED"].includes(reservation.status) && (
                      <Button variant="secondary" className="mt-3 h-8 w-full text-xs" disabled={cancelMutation.isPending} onClick={() => cancel(reservation.id)}>
                        Hủy đặt chỗ
                      </Button>
                    )}
                  </div>
                );
              })}
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

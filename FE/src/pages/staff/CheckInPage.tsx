import { useCallback, useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarCheck, QrCode, RefreshCw, Wand2 } from "lucide-react";
import QRCode from "qrcode";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { reservationApi } from "@/api/reservationApi";
import { sessionApi } from "@/api/sessionApi";
import { slotApi, type SlotResponse } from "@/api/slotApi";
import { vehicleTypeApi } from "@/api/vehicleTypeApi";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Field, Input, Select } from "@/components/forms/FormField";
import { PageHeader } from "@/components/layout/PageHeader";
import type { ParkingSession, Reservation, VehicleType } from "@/types/domain";
import { getApiErrorMessage } from "@/utils/apiError";
import { dateTime, number } from "@/utils/format";

const schema = z.object({
  plateNumber: z.string()
    .trim()
    .min(1, "Vui lòng nhập biển số")
    .min(5, "Biển số tối thiểu 5 ký tự")
    .max(20, "Biển số tối đa 20 ký tự")
    .regex(/^[A-Za-z0-9-]+$/, "Biển số chỉ gồm chữ, số và dấu gạch ngang")
    .transform((value) => value.toUpperCase()),
  vehicleTypeId: z.string().min(1, "Vui lòng chọn loại xe"),
  entryGate: z.string()
    .trim()
    .min(1, "Vui lòng nhập cổng vào")
    .max(50, "Cổng vào tối đa 50 ký tự")
});

type FormValues = z.infer<typeof schema>;

export function CheckInPage() {
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [suggestedSlot, setSuggestedSlot] = useState<SlotResponse | null>(null);
  const [availableCount, setAvailableCount] = useState<number | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingSuggestion, setLoadingSuggestion] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [result, setResult] = useState<ParkingSession | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [confirmedReservations, setConfirmedReservations] = useState<Reservation[]>([]);
  const [useReservation, setUseReservation] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      plateNumber: "",
      vehicleTypeId: "",
      entryGate: "Gate 1"
    }
  });

  const vehicleTypeId = form.watch("vehicleTypeId");
  const plateNumber = form.watch("plateNumber");

  const loadVehicleTypes = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const data = await vehicleTypeApi.getAll("ACTIVE");
      setVehicleTypes(data);
      if (data.length > 0 && !form.getValues("vehicleTypeId")) {
        form.setValue("vehicleTypeId", data[0].id, { shouldValidate: true });
      }
    } catch (error: unknown) {
      setLoadError(getApiErrorMessage(error, "Không thể tải loại xe. Vui lòng thử lại."));
      setVehicleTypes([]);
    } finally {
      setLoading(false);
    }
  }, [form]);

  const loadSuggestions = useCallback(async (nextVehicleTypeId: string) => {
    if (!nextVehicleTypeId) {
      setSuggestedSlot(null);
      setAvailableCount(null);
      return;
    }

    setLoadingSuggestion(true);
    try {
      const slots = await slotApi.getAvailable(nextVehicleTypeId);
      setSuggestedSlot(slots[0] ?? null);
      setAvailableCount(slots.length);
    } catch {
      setSuggestedSlot(null);
      setAvailableCount(null);
    } finally {
      setLoadingSuggestion(false);
    }
  }, []);

  const loadConfirmedReservations = useCallback(async () => {
    try {
      const data = await reservationApi.getAllForStaff("CONFIRMED");
      setConfirmedReservations(data);
    } catch {
      setConfirmedReservations([]);
    }
  }, []);

  const matchingReservation = useMemo(() => {
    const normalized = plateNumber.trim().toUpperCase();
    if (normalized.length < 5) return null;
    return confirmedReservations.find((r) => r.plateNumber.toUpperCase() === normalized) ?? null;
  }, [confirmedReservations, plateNumber]);

  useEffect(() => {
    setUseReservation(!!matchingReservation);
  }, [matchingReservation]);

  useEffect(() => {
    void loadVehicleTypes();
    void loadConfirmedReservations();
  }, [loadVehicleTypes, loadConfirmedReservations]);

  useEffect(() => {
    void loadSuggestions(vehicleTypeId);
  }, [loadSuggestions, vehicleTypeId]);

  useEffect(() => {
    if (!result?.ticketCode) {
      setQrCodeUrl("");
      return;
    }

    let active = true;

    void QRCode.toDataURL(result.ticketCode, {
      margin: 1,
      width: 320
    }).then((url) => {
      if (active) {
        setQrCodeUrl(url);
      }
    }).catch(() => {
      if (active) {
        setQrCodeUrl("");
      }
    });

    return () => {
      active = false;
    };
  }, [result?.ticketCode]);

  const checkDuplicatePlate = async (plateNumber: string): Promise<boolean> => {
    try {
      const sessions = await sessionApi.findByPlate(plateNumber);
      if (sessions.length > 0) {
        setSubmitError(`Biển số ${plateNumber} đã có lượt gửi xe đang hoạt động. Vui lòng kiểm tra lại.`);
        return false;
      }
    } catch {
      // 404 từ /search/by-plate = không có session active = không trùng. Các lỗi khác cũng bỏ qua, BE validate lại.
    }
    return true;
  };

  const submit = async (values: FormValues) => {
    setSubmitError("");
    setResult(null);

    const plateOk = await checkDuplicatePlate(values.plateNumber);
    if (!plateOk) return;

    try {
      const reservationId = useReservation && matchingReservation ? Number(matchingReservation.id) : undefined;
      const session = await sessionApi.checkIn({
        ...values,
        entryGate: values.entryGate.trim(),
        reservationId
      });
      setResult(session);
      await Promise.all([
        loadSuggestions(values.vehicleTypeId),
        loadConfirmedReservations()
      ]);
    } catch (error: unknown) {
      setSubmitError(getApiErrorMessage(error, "Không thể tạo lượt gửi xe."));
    }
  };

  const refreshData = async () => {
    form.reset({ plateNumber: "", vehicleTypeId: "", entryGate: "Gate 1" });
    setResult(null);
    setSubmitError("");
    await Promise.all([
      loadVehicleTypes(),
      loadSuggestions(form.getValues("vehicleTypeId")),
      loadConfirmedReservations()
    ]);
  };

  return (
    <>
      <PageHeader
        title="Kiểm tra xe vào"
        description=""
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader title="Thông tin xe vào bãi" />
          <CardContent>
            <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
              {loadError && (
                <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {loadError}
                </div>
              )}

              <Field label="Biển số" error={form.formState.errors.plateNumber?.message}>
                <Input
                  {...form.register("plateNumber")}
                  placeholder="VD: 51G-12345"
                  disabled={loading || vehicleTypes.length === 0}
                />
              </Field>

              <Field label="Loại xe" error={form.formState.errors.vehicleTypeId?.message}>
                <Select {...form.register("vehicleTypeId")} disabled={loading || vehicleTypes.length === 0}>
                  {vehicleTypes.length === 0
                    ? <option value="">Không có loại xe khả dụng</option>
                    : vehicleTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
                </Select>
              </Field>

              <Field label="Cổng vào" error={form.formState.errors.entryGate?.message}>
                <Input
                  {...form.register("entryGate")}
                  placeholder="Ví dụ: Cổng 1"
                  disabled={loading || vehicleTypes.length === 0}
                />
              </Field>

              {matchingReservation && (
                <label className="flex cursor-pointer items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-emerald-600"
                    checked={useReservation}
                    onChange={(e) => setUseReservation(e.target.checked)}
                  />
                  <span className="grid gap-1">
                    <span className="flex items-center gap-2 font-semibold">
                      <CalendarCheck size={16} />
                      Phát hiện đặt chỗ
                    </span>
                    <span>
                      Slot {matchingReservation.slotCode ?? `#${matchingReservation.slotId}`} · {dateTime(matchingReservation.startAt)} → {dateTime(matchingReservation.endAt)}
                    </span>
                    <span className="text-emerald-700">
                      {useReservation ? "Sẽ check-in vào chỗ đã đặt." : "Bỏ chọn để check-in như lượt gửi thường"}
                    </span>
                  </span>
                </label>
              )}

              <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
                <div className="flex items-center gap-2 font-semibold">
                  <Wand2 size={17} />
                  Gợi ý tự động
                </div>

                {loadingSuggestion ? (
                  <p className="mt-2">Đang kiểm tra chỗ trống...</p>
                ) : availableCount === 0 ? (
                  <p className="mt-2">Hiện không còn chỗ trống phù hợp cho loại xe này.</p>
                ) : suggestedSlot ? (
                  <>
                    <p className="mt-2">Còn {number(availableCount ?? 0)} chỗ trống phù hợp trên hệ thống.</p>
                    <p>Chỗ trống khả dụng gần nhất: {suggestedSlot.code}</p>
                  </>
                ) : (
                  <p className="mt-2">BE sẽ tự cấp slot phù hợp khi check-in nếu còn chỗ trống.</p>
                )}
              </div>

              {submitError && (
                <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
                  {submitError}
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <Button disabled={loading || form.formState.isSubmitting || vehicleTypes.length === 0}>
                  {form.formState.isSubmitting ? "Đang tạo lượt gửi..." : "Tạo lượt gửi xe"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => void refreshData()}
                  disabled={loading || form.formState.isSubmitting}
                >
                  <RefreshCw size={16} />
                  Làm mới dữ liệu
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Vé gửi xe" />
          <CardContent className="grid gap-4">
            {result ? (
              <>
                <div className="mx-auto grid aspect-square w-full max-w-[220px] place-items-center rounded-lg border border-border bg-slate-50">
                  {qrCodeUrl
                    ? <img src={qrCodeUrl} alt={`QR ${result.ticketCode}`} className="h-full w-full rounded-lg object-contain p-4" />
                    : <QrCode size={150} className="text-slate-900" />}
                </div>

                <div className="text-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Mã vé</p>
                  <p className="text-2xl font-bold tracking-tight text-slate-950">{result.ticketCode}</p>
                  <p className="mt-0.5 text-lg font-semibold text-slate-700">{result.plateNumber}</p>
                </div>

                <dl className="grid gap-2 border-t border-border pt-4 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-slate-500">Vị trí</dt>
                    <dd className="font-medium text-slate-900">{result.slotCode ?? (result.slotId ? `Slot ${result.slotId}` : "BE chưa trả mã slot")}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt className="text-slate-500">Cổng vào</dt>
                    <dd className="font-medium text-slate-900">{result.entryGate || "Đang cập nhật"}</dd>
                  </div>
                  {result.checkInAt && (
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-slate-500">Thời gian vào</dt>
                      <dd className="font-medium text-slate-900">{dateTime(result.checkInAt)}</dd>
                    </div>
                  )}
                  {result.floorName && (
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-slate-500">Tầng</dt>
                      <dd className="font-medium text-slate-900">{result.floorName}</dd>
                    </div>
                  )}
                </dl>
              </>
            ) : (
              <p className="text-sm text-slate-500">Thông tin vé sẽ hiển thị tại đây.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

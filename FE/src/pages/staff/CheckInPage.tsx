import { useCallback, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { QrCode, RefreshCw, Wand2 } from "lucide-react";
import QRCode from "qrcode";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { sessionApi } from "@/api/sessionApi";
import { slotApi, type SlotResponse } from "@/api/slotApi";
import { vehicleTypeApi } from "@/api/vehicleTypeApi";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Field, Input, Select } from "@/components/forms/FormField";
import { PageHeader } from "@/components/layout/PageHeader";
import type { ParkingSession, VehicleType } from "@/types/domain";
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
    .max(50, "Cổng vào tối đa 50 ký tự"),
  slotId: z.string().optional(),
  reservationId: z.string().optional()
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

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      plateNumber: "",
      vehicleTypeId: "",
      entryGate: "Gate 1",
      slotId: "",
      reservationId: ""
    }
  });

  const vehicleTypeId = form.watch("vehicleTypeId");

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

  useEffect(() => {
    void loadVehicleTypes();
  }, [loadVehicleTypes]);

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

  const submit = async (values: FormValues) => {
    setSubmitError("");
    setResult(null);
    try {
      const session = await sessionApi.checkIn({
        ...values,
        entryGate: values.entryGate.trim(),
        slotId: values.slotId?.trim() ? Number(values.slotId) : undefined,
        reservationId: values.reservationId?.trim() ? Number(values.reservationId) : undefined
      });
      setResult(session);
      await loadSuggestions(values.vehicleTypeId);
    } catch (error: unknown) {
      setSubmitError(getApiErrorMessage(error, "Không thể tạo lượt gửi xe."));
    }
  };

  const refreshData = async () => {
    await Promise.all([
      loadVehicleTypes(),
      loadSuggestions(form.getValues("vehicleTypeId"))
    ]);
  };

  return (
    <>
      <PageHeader
        title="Parking Check-In"
        description="Kiểm tra điều kiện xe vào bãi, đồng bộ slot khả dụng từ hệ thống và tạo parking session."
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

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Slot ID tùy chọn (không bắt buộc)">
                  <Input
                    type="number"
                    {...form.register("slotId")}
                    placeholder="Để trống nếu hệ thống tự cấp slot"
                    disabled={loading || vehicleTypes.length === 0}
                  />
                </Field>

                <Field label="Reservation ID tùy chọn (không bắt buộc)">
                  <Input
                    type="number"
                    {...form.register("reservationId")}
                    placeholder="Dùng khi xe có reservation hợp lệ"
                    disabled={loading || vehicleTypes.length === 0}
                  />
                </Field>
              </div>

              {/* <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
                <div className="flex items-center gap-2 font-semibold">
                  <Wand2 size={17} />
                  Gợi ý tự động
                </div>

                {loadingSuggestion ? (
                  <p className="mt-2">Đang kiểm tra slot khả dụng...</p>
                ) : availableCount === 0 ? (
                  <p className="mt-2">Hiện không còn slot `AVAILABLE` phù hợp cho loại xe này.</p>
                ) : suggestedSlot ? (
                  <>
                    <p className="mt-2">Còn {number(availableCount ?? 0)} slot phù hợp trên hệ thống.</p>
                    <p>Slot khả dụng gần nhất: {suggestedSlot.code}</p>
                  </>
                ) : (
                  <p className="mt-2">BE sẽ tự cấp slot phù hợp khi check-in nếu còn chỗ trống.</p>
                )}
              </div> */}

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
                <div className="grid aspect-square place-items-center rounded-lg border border-border bg-slate-50">
                  {qrCodeUrl
                    ? <img src={qrCodeUrl} alt={`QR ${result.ticketCode}`} className="h-full w-full rounded-lg object-contain p-4" />
                    : <QrCode size={150} className="text-slate-900" />}
                </div>

                <div className="text-sm">
                  <p className="font-semibold">{result.ticketCode}</p>
                  <p className="text-slate-500">{result.plateNumber}</p>
                  <p className="text-slate-500">
                    Vị trí: {result.slotCode ?? (result.slotId ? `Slot ${result.slotId}` : "BE chưa trả mã slot")}
                  </p>
                  <p className="text-slate-500">Cổng vào: {result.entryGate || "Đang cập nhật"}</p>
                  {result.checkInAt && <p className="text-slate-500">Thời gian vào: {dateTime(result.checkInAt)}</p>}
                  {result.floorName && <p className="text-slate-500">Tầng: {result.floorName}</p>}
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-500">Mã vé QR sẽ xuất hiện sau khi tạo parking session.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

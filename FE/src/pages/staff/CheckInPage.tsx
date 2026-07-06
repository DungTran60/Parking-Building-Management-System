import { useState } from "react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { QrCode, Wand2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Field, Input, Select } from "@/components/forms/FormField";
import { sessionApi } from "@/api/sessionApi";
import { vehicleTypes, floors, slots } from "@/api/mockData";
import type { ParkingSession } from "@/types/domain";

const schema = z.object({
  plateNumber: z.string().min(5, "Biển số tối thiểu 5 ký tự"),
  vehicleTypeId: z.string().min(1),
  entryGate: z.string().min(1, "Vui lòng nhập cổng vào")
});

type FormValues = z.infer<typeof schema>;

export function CheckInPage() {
  const [result, setResult] = useState<ParkingSession | null>(null);
  const [submitError, setSubmitError] = useState("");
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { vehicleTypeId: "motorbike", entryGate: "Gate 1" } });
  const vehicleTypeId = form.watch("vehicleTypeId");
  const suggestedSlot = slots.find((slot) => slot.vehicleTypeId === vehicleTypeId && slot.status === "AVAILABLE");
  const floor = floors.find((item) => item.id === suggestedSlot?.floorId);

  const submit = async (values: FormValues) => {
    setSubmitError("");
    setResult(null);
    try {
      const session = await sessionApi.checkIn({
        ...values,
        plateNumber: values.plateNumber.trim().toUpperCase(),
        entryGate: values.entryGate.trim()
      });
      setResult(session);
    } catch (error) {
      if (axios.isAxiosError<{ message?: string; error?: string }>(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          setSubmitError("Phiên đăng nhập không hợp lệ hoặc bạn không có quyền check-in.");
          return;
        }
        setSubmitError(error.response?.data?.message ?? error.response?.data?.error ?? "Không thể tạo lượt gửi xe.");
        return;
      }
      setSubmitError("Đã xảy ra lỗi không xác định. Vui lòng thử lại.");
    }
  };

  return (
    <>
      <PageHeader title="Parking Check-In" description="Kiểm tra điều kiện xe vào bãi, gợi ý tầng/slot và tạo parking session." />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card>
          <CardHeader title="Thông tin xe vào bãi" />
          <CardContent>
            <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
              <Field label="Biển số" error={form.formState.errors.plateNumber?.message}><Input {...form.register("plateNumber")} placeholder="VD: 51G-12345" /></Field>
              <Field label="Loại xe"><Select {...form.register("vehicleTypeId")}>{vehicleTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}</Select></Field>
              <Field label="Cổng vào" error={form.formState.errors.entryGate?.message}><Input {...form.register("entryGate")} placeholder="Ví dụ: Cổng 1" /></Field>
              <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800">
                <div className="flex items-center gap-2 font-semibold"><Wand2 size={17} /> Gợi ý tự động</div>
                <p className="mt-2">Tầng: {floor ? `${floor.name} - ${floor.zone}` : "Chưa có"}</p>
                <p>Slot: {suggestedSlot?.code ?? "Không còn slot phù hợp"}</p>
              </div>
              {submitError && <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{submitError}</div>}
              <Button disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? "Đang tạo lượt gửi..." : "Tạo lượt gửi xe"}</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Vé gửi xe" />
          <CardContent className="grid gap-4">
            {result ? (
              <>
                <div className="grid aspect-square place-items-center rounded-lg border border-border bg-slate-50">
                  <QrCode size={150} className="text-slate-900" />
                </div>
                <div className="text-sm">
                  <p className="font-semibold">{result.ticketCode}</p>
                  <p className="text-slate-500">{result.plateNumber} - Slot {result.slotId}</p>
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

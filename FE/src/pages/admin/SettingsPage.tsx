import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CheckCircle2, Clock3, CreditCard, RotateCcw, Save, Settings2 } from "lucide-react";
import { settingApi, type SystemSettingsResponse, type UpdateSystemSettingsRequest } from "@/api/settingApi";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Field, Input, Select } from "@/components/forms/FormField";

const FALLBACK_SETTINGS: UpdateSystemSettingsRequest = {
  systemName: "Parking Building Management",
  openingTime: "06:00",
  closingTime: "23:00",
  paymentMode: "HYBRID",
  autoBlockOverdueSlots: true
};

export function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: savedSettings, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["system-settings"],
    queryFn: settingApi.get
  });
  const [form, setForm] = useState<UpdateSystemSettingsRequest | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (savedSettings) {
      setForm({
        systemName: savedSettings.systemName,
        openingTime: savedSettings.openingTime,
        closingTime: savedSettings.closingTime,
        paymentMode: savedSettings.paymentMode,
        autoBlockOverdueSlots: savedSettings.autoBlockOverdueSlots
      });
    } else if (isError) {
      setForm({ ...FALLBACK_SETTINGS });
    }
  }, [isError, savedSettings]);

  const updateMutation = useMutation({
    mutationFn: settingApi.update,
    onSuccess: (settings) => {
      queryClient.setQueryData<SystemSettingsResponse>(["system-settings"], settings);
      setSubmitted(true);
    }
  });

  const errors = useMemo(() => ({
    systemName: form?.systemName.trim() ? "" : "Tên hệ thống không được để trống.",
    openingTime: form?.openingTime ? "" : "Vui lòng chọn giờ mở cửa.",
    closingTime: !form?.closingTime
      ? "Vui lòng chọn giờ đóng cửa."
      : form.closingTime === form.openingTime
        ? "Giờ đóng cửa phải khác giờ mở cửa."
        : ""
  }), [form]);
  const isValid = !Object.values(errors).some(Boolean);
  const savedForm = savedSettings ? {
    systemName: savedSettings.systemName,
    openingTime: savedSettings.openingTime,
    closingTime: savedSettings.closingTime,
    paymentMode: savedSettings.paymentMode,
    autoBlockOverdueSlots: savedSettings.autoBlockOverdueSlots
  } : null;
  const isDirty = Boolean(form && savedForm && JSON.stringify(form) !== JSON.stringify(savedForm));
  const isReadOnly = !savedSettings;

  const update = <K extends keyof UpdateSystemSettingsRequest>(field: K, value: UpdateSystemSettingsRequest[K]) => {
    setSubmitted(false);
    setForm((current) => current ? { ...current, [field]: value } : current);
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form || !isValid) {
      setSubmitted(true);
      return;
    }
    setSubmitted(false);
    updateMutation.mutate({ ...form, systemName: form.systemName.trim() });
  };

  const reset = () => {
    setForm(savedForm);
    setSubmitted(false);
  };

  const apiError = updateMutation.error ?? (isError ? error : null);
  const errorMessage = axios.isAxiosError(apiError)
    ? String(apiError.response?.data?.message ?? apiError.response?.data?.error ?? "Không thể kết nối đến máy chủ.")
    : "Không thể tải hoặc lưu cấu hình. Vui lòng thử lại.";

  if (isLoading || !form) {
    return <><PageHeader title="Cài đặt hệ thống" description="Thiết lập thông tin, thời gian hoạt động và phương thức thanh toán của bãi đỗ xe." /><Card><CardContent className="py-12 text-center text-sm text-slate-500">Đang tải cấu hình...</CardContent></Card></>;
  }

  return (
    <>
      <PageHeader title="Cài đặt hệ thống" description="Thiết lập thông tin, thời gian hoạt động và phương thức thanh toán của bãi đỗ xe." />
      {apiError && (
        <div role="alert" className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{errorMessage}</span>
          {isError && <Button type="button" variant="secondary" className="h-8" onClick={() => refetch()}>Thử lại</Button>}
        </div>
      )}
      {/* {isReadOnly && (
        <div role="status" className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Đang hiển thị cấu hình mặc định để tham khảo. Các trường được khóa cho đến khi tải được cấu hình từ máy chủ.
        </div>
      )} */}
      {submitted && isValid && !isDirty && (
        <div role="status" className="mb-5 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 size={19} /> Cấu hình hệ thống đã được lưu thành công.
        </div>
      )}
      <form className="grid gap-6" onSubmit={submit} noValidate>
        <Card>
          <CardHeader title="Thông tin chung" />
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Field label="Tên hệ thống" error={submitted ? errors.systemName : undefined}>
                <Input value={form.systemName} onChange={(event) => update("systemName", event.target.value)} maxLength={100} aria-invalid={submitted && !!errors.systemName} disabled={isReadOnly} />
              </Field>
              <p className="mt-1.5 text-xs text-slate-500">Tên này được hiển thị trên tiêu đề và các thông báo của hệ thống.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Thời gian hoạt động" action={<Clock3 size={19} className="text-slate-400" />} />
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Giờ mở cửa" error={submitted ? errors.openingTime : undefined}><Input type="time" value={form.openingTime} onChange={(event) => update("openingTime", event.target.value)} disabled={isReadOnly} /></Field>
            <Field label="Giờ đóng cửa" error={submitted ? errors.closingTime : undefined}><Input type="time" value={form.closingTime} onChange={(event) => update("closingTime", event.target.value)} disabled={isReadOnly} /></Field>
            <p className="text-xs text-slate-500 md:col-span-2">Giờ đóng cửa nhỏ hơn giờ mở cửa được hiểu là lịch hoạt động qua đêm.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Thanh toán và vận hành" action={<CreditCard size={19} className="text-slate-400" />} />
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Phương thức thanh toán">
              <Select value={form.paymentMode} onChange={(event) => update("paymentMode", event.target.value as UpdateSystemSettingsRequest["paymentMode"])} disabled={isReadOnly}><option value="CASH">Tiền mặt</option><option value="CASHLESS">Không tiền mặt</option><option value="HYBRID">Kết hợp</option></Select>
            </Field>
            <Field label="Tự động khóa slot quá hạn">
              <Select value={form.autoBlockOverdueSlots ? "true" : "false"} onChange={(event) => update("autoBlockOverdueSlots", event.target.value === "true")} disabled={isReadOnly}><option value="true">Bật</option><option value="false">Tắt</option></Select>
            </Field>
            {/* <div className="flex gap-3 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800 md:col-span-2">
              <Settings2 size={19} className="mt-0.5 shrink-0" />
              <p>Khi bật, hệ thống sẽ tự động chuyển slot giữ chỗ quá hạn sang trạng thái bị khóa để nhân viên kiểm tra.</p>
            </div> */}
          </CardContent>
        </Card>

        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-white/95 px-5 py-4 shadow-[0_-4px_12px_rgba(15,23,42,0.05)] backdrop-blur">
          <p className="text-sm text-slate-500">{isReadOnly ? "Chưa đồng bộ với máy chủ." : isDirty ? "Bạn có thay đổi chưa lưu." : `Cập nhật lần cuối: ${new Date(savedSettings.updatedAt).toLocaleString("vi-VN")}`}</p>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={reset} disabled={isReadOnly || !isDirty || updateMutation.isPending}><RotateCcw size={16} /> Hoàn tác</Button>
            <Button type="submit" disabled={isReadOnly || !isDirty || updateMutation.isPending}><Save size={17} /> {updateMutation.isPending ? "Đang lưu..." : "Lưu cấu hình"}</Button>
          </div>
        </div>
      </form>
    </>
  );
}

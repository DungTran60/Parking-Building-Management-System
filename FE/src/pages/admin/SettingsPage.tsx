import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CheckCircle2, RotateCcw, Save, Palette } from "lucide-react";
import { settingApi, type SystemSettingsResponse, type UpdateSystemSettingsRequest } from "@/api/settingApi";
import { dateConfig, formatInTz } from "@/utils/dateConfig";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Field, Input, Select } from "@/components/forms/FormField";

const FALLBACK_SETTINGS: UpdateSystemSettingsRequest = {
  systemName: "Parking Building Management",
  passwordPolicy: "medium",
  sessionTimeout: 30,
  logoUrl: "",
  version: "1.0.0",
  themeColor: "#blue",
  timezone: "Asia/Ho_Chi_Minh",
  dateFormat: "DD/MM/YYYY"
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
        passwordPolicy: savedSettings.passwordPolicy,
        sessionTimeout: savedSettings.sessionTimeout,
        logoUrl: savedSettings.logoUrl,
        version: savedSettings.version,
        themeColor: savedSettings.themeColor,
        timezone: savedSettings.timezone,
        dateFormat: savedSettings.dateFormat
      });
    } else if (isError) {
      setForm({ ...FALLBACK_SETTINGS });
    }
  }, [isError, savedSettings]);

  const updateMutation = useMutation({
    mutationFn: settingApi.update,
    onSuccess: (settings) => {
      queryClient.setQueryData<SystemSettingsResponse>(["system-settings"], settings);
      dateConfig.set(settings.timezone ?? "Asia/Ho_Chi_Minh", settings.dateFormat ?? "DD/MM/YYYY");
      setSubmitted(true);
    }
  });

  const isValidTimezone = (tz: string) => {
    if (!tz.trim()) return false;
    try { Intl.DateTimeFormat(undefined, { timeZone: tz }); return true; }
    catch { return false; }
  };

  const errors = useMemo(() => ({
    systemName: form?.systemName.trim() ? "" : "Tên hệ thống không được để trống.",
    timezone: form?.timezone && isValidTimezone(form.timezone) ? "" : "Múi giờ không hợp lệ."
  }), [form]);
  const isValid = !Object.values(errors).some(Boolean);
  const savedForm = savedSettings ? {
    systemName: savedSettings.systemName,
    passwordPolicy: savedSettings.passwordPolicy,
    sessionTimeout: savedSettings.sessionTimeout,
    logoUrl: savedSettings.logoUrl,
    version: savedSettings.version,
    themeColor: savedSettings.themeColor,
    timezone: savedSettings.timezone,
    dateFormat: savedSettings.dateFormat
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
          <CardHeader title="Hệ thống & Hiển thị" action={<Palette size={19} className="text-slate-400" />} />
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Múi giờ" error={submitted ? errors.timezone : undefined}>
              <Input value={form.timezone ?? "Asia/Ho_Chi_Minh"} onChange={(event) => update("timezone", event.target.value)} disabled={isReadOnly} aria-invalid={submitted && !!errors.timezone} />
            </Field>
            <Field label="Định dạng ngày">
              <Input value={form.dateFormat ?? "DD/MM/YYYY"} onChange={(event) => update("dateFormat", event.target.value)} disabled={isReadOnly} />
            </Field>
            <Field label="Logo URL">
              <Input value={form.logoUrl ?? ""} onChange={(event) => update("logoUrl", event.target.value)} placeholder="https://example.com/logo.png" disabled={isReadOnly} />
            </Field>
            <Field label="Theme Color">
              <Input type="color" value={form.themeColor ?? "#3b82f6"} onChange={(event) => update("themeColor", event.target.value)} disabled={isReadOnly} className="h-10 p-1" />
            </Field>
            <Field label="Phiên bản hệ thống">
              <Input value={form.version ?? "1.0.0"} onChange={(event) => update("version", event.target.value)} disabled={isReadOnly} />
            </Field>
          </CardContent>
        </Card>

        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-white/95 px-5 py-4 shadow-[0_-4px_12px_rgba(15,23,42,0.05)] backdrop-blur">
          <p className="text-sm text-slate-500">{isReadOnly ? "Chưa đồng bộ với máy chủ." : isDirty ? "Bạn có thay đổi chưa lưu." : `Cập nhật lần cuối: ${formatInTz(savedSettings.updatedAt, dateConfig.timezone, dateConfig.dateTimeFormat)}`}</p>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={reset} disabled={isReadOnly || !isDirty || updateMutation.isPending}><RotateCcw size={16} /> Hoàn tác</Button>
            <Button type="submit" disabled={isReadOnly || !isDirty || updateMutation.isPending}><Save size={17} /> {updateMutation.isPending ? "Đang lưu..." : "Lưu cấu hình"}</Button>
          </div>
        </div>
      </form>
    </>
  );
}

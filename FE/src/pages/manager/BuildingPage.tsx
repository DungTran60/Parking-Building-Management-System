import React, { FormEvent, useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Building2, Save, FileText, FileWarning, RotateCcw, CheckCircle2, Clock3, CreditCard } from "lucide-react";
import { buildingApi, type BuildingPayload, type Building } from "@/api/buildingApi";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Field, Input, Select } from "@/components/forms/FormField";

const FALLBACK_BUILDING: BuildingPayload = {
  buildingName: "",
  address: "",
  hotline: "",
  email: "",
  openingTime: "06:00",
  closingTime: "23:00",
  paymentMode: "HYBRID",
  autoBlockOverdueSlots: true,
  description: "",
  parkingRules: "",
  avatarUrl: ""
};

export const BuildingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: savedBuilding, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["system-building"],
    queryFn: buildingApi.get
  });
  const [form, setForm] = useState<BuildingPayload | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (savedBuilding) {
      setForm({
        buildingName: savedBuilding.buildingName,
        address: savedBuilding.address,
        hotline: savedBuilding.hotline || "",
        email: savedBuilding.email || "",
        openingTime: savedBuilding.openingTime || "06:00",
        closingTime: savedBuilding.closingTime || "23:00",
        paymentMode: savedBuilding.paymentMode || "HYBRID",
        autoBlockOverdueSlots: savedBuilding.autoBlockOverdueSlots ?? true,
        description: savedBuilding.description || "",
        parkingRules: savedBuilding.parkingRules || "",
        avatarUrl: savedBuilding.avatarUrl || ""
      });
    } else if (isError) {
      setForm({ ...FALLBACK_BUILDING });
    }
  }, [isError, savedBuilding]);

  const updateMutation = useMutation({
    mutationFn: buildingApi.update,
    onSuccess: (building) => {
      queryClient.setQueryData<Building>(["system-building"], building);
      setSubmitted(true);
    }
  });

  const trimmedEmail = form?.email?.trim() ?? "";
  const errors = {
    buildingName: !form?.buildingName.trim()
      ? "Tên tòa nhà không được để trống."
      : form.buildingName.trim().length < 2
        ? "Tên tòa nhà phải có ít nhất 2 ký tự."
        : "",
    address: !form?.address.trim()
      ? "Địa chỉ không được để trống."
      : form.address.trim().length < 5
        ? "Địa chỉ phải có ít nhất 5 ký tự."
        : "",
    email: trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)
      ? "Email không đúng định dạng."
      : "",
    openingTime: form?.openingTime ? "" : "Vui lòng chọn giờ mở cửa.",
    closingTime: !form?.closingTime
      ? "Vui lòng chọn giờ đóng cửa."
      : form.closingTime === form.openingTime
        ? "Giờ đóng cửa phải khác giờ mở cửa."
        : ""
  };
  const isValid = !Object.values(errors).some(Boolean);
  const savedForm = savedBuilding ? {
    buildingName: savedBuilding.buildingName,
    address: savedBuilding.address,
    hotline: savedBuilding.hotline || "",
    email: savedBuilding.email || "",
    openingTime: savedBuilding.openingTime || "06:00",
    closingTime: savedBuilding.closingTime || "23:00",
    paymentMode: savedBuilding.paymentMode || "HYBRID",
    autoBlockOverdueSlots: savedBuilding.autoBlockOverdueSlots ?? true,
    description: savedBuilding.description || "",
    parkingRules: savedBuilding.parkingRules || "",
    avatarUrl: savedBuilding.avatarUrl || ""
  } : null;
  const isDirty = Boolean(form && savedForm && JSON.stringify(form) !== JSON.stringify(savedForm));
  const isReadOnly = !savedBuilding;

  const update = <K extends keyof BuildingPayload>(field: K, value: BuildingPayload[K]) => {
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
    updateMutation.mutate({ ...form, buildingName: form.buildingName.trim(), address: form.address.trim(), email: form.email?.trim() || undefined });
  };

  const reset = () => {
    setForm(savedForm);
    setSubmitted(false);
  };

  const apiError = updateMutation.error ?? (isError ? error : null);
  const errorMessage = axios.isAxiosError(apiError)
    ? String(apiError.response?.data?.message ?? apiError.response?.data?.error ?? "Không thể kết nối đến máy chủ.")
    : "Không thể tải hoặc lưu cấu hình tòa nhà. Vui lòng thử lại.";

  if (isLoading || !form) {
    return <><PageHeader title="Thông tin tòa nhà" description="Quản lý thông tin chi tiết, quy định và hình ảnh của tòa nhà." /><Card><CardContent className="py-12 text-center text-sm text-slate-500">Đang tải cấu hình...</CardContent></Card></>;
  }

  return (
    <>
      <PageHeader title="Thông tin tòa nhà" description="Quản lý thông tin chi tiết, quy định và hình ảnh của tòa nhà." />
      {apiError && (
        <div role="alert" className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{errorMessage}</span>
          {isError && <Button type="button" variant="secondary" className="h-8" onClick={() => refetch()}>Thử lại</Button>}
        </div>
      )}
      {submitted && isValid && !isDirty && (
        <div role="status" className="mb-5 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 size={19} /> Cấu hình tòa nhà đã được lưu thành công.
        </div>
      )}
      <form className="grid gap-6" onSubmit={submit} noValidate>
        <Card>
          <CardHeader title="Thông tin cơ bản" action={<Building2 size={19} className="text-slate-400" />} />
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Field label="Tên tòa nhà" error={submitted ? errors.buildingName : undefined}>
                <Input value={form.buildingName} onChange={(event) => update("buildingName", event.target.value)} maxLength={150} aria-invalid={submitted && !!errors.buildingName} disabled={isReadOnly} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Địa chỉ" error={submitted ? errors.address : undefined}>
                <Input value={form.address} onChange={(event) => update("address", event.target.value)} maxLength={255} aria-invalid={submitted && !!errors.address} disabled={isReadOnly} />
              </Field>
            </div>
            <Field label="Hotline">
              <Input type="tel" value={form.hotline} onChange={(event) => update("hotline", event.target.value)} placeholder="090123..." disabled={isReadOnly} />
            </Field>
            <Field label="Email" error={submitted ? errors.email : undefined}>
              <Input type="email" value={form.email} onChange={(event) => update("email", event.target.value)} placeholder="abc@email.com" aria-invalid={submitted && !!errors.email} disabled={isReadOnly} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Ảnh đại diện (URL)">
                <Input type="text" value={form.avatarUrl} onChange={(event) => update("avatarUrl", event.target.value)} placeholder="https://..." disabled={isReadOnly} />
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Thời gian hoạt động" action={<Clock3 size={19} className="text-slate-400" />} />
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Giờ mở cửa" error={submitted ? errors.openingTime : undefined}><Input type="time" value={form.openingTime || "06:00"} onChange={(event) => update("openingTime", event.target.value)} disabled={isReadOnly} /></Field>
            <Field label="Giờ đóng cửa" error={submitted ? errors.closingTime : undefined}><Input type="time" value={form.closingTime || "23:00"} onChange={(event) => update("closingTime", event.target.value)} disabled={isReadOnly} /></Field>
            <p className="text-xs text-slate-500 md:col-span-2">Giờ đóng cửa nhỏ hơn giờ mở cửa được hiểu là lịch hoạt động qua đêm.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Thanh toán và vận hành" action={<CreditCard size={19} className="text-slate-400" />} />
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Field label="Phương thức thanh toán">
              <Select value={form.paymentMode} onChange={(event) => update("paymentMode", event.target.value as BuildingPayload["paymentMode"])} disabled={isReadOnly}><option value="CASH">Tiền mặt</option><option value="CASHLESS">Không tiền mặt</option><option value="HYBRID">Kết hợp</option></Select>
            </Field>
            <Field label="Tự động khóa slot quá hạn">
              <Select value={form.autoBlockOverdueSlots ? "true" : "false"} onChange={(event) => update("autoBlockOverdueSlots", event.target.value === "true")} disabled={isReadOnly}><option value="true">Bật</option><option value="false">Tắt</option></Select>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Chi tiết & Quy định" action={<FileText size={19} className="text-slate-400" />} />
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
                <FileText className="h-4 w-4 text-slate-400" />
                Mô tả tòa nhà
              </label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Nhập mô tả..."
                rows={4}
                disabled={isReadOnly}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center gap-1">
                <FileWarning className="h-4 w-4 text-slate-400" />
                Quy định gửi xe
              </label>
              <textarea
                value={form.parkingRules}
                onChange={(e) => update("parkingRules", e.target.value)}
                placeholder="Nhập quy định..."
                rows={4}
                disabled={isReadOnly}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </CardContent>
        </Card>

        <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-border bg-white/95 px-5 py-4 shadow-[0_-4px_12px_rgba(15,23,42,0.05)] backdrop-blur">
          <p className="text-sm text-slate-500">{isReadOnly ? "Chưa đồng bộ với máy chủ." : isDirty ? "Bạn có thay đổi chưa lưu." : (savedBuilding?.createdAt ? `Tạo lúc: ${new Date(savedBuilding.createdAt).toLocaleString("vi-VN")}` : "")}</p>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={reset} disabled={isReadOnly || !isDirty || updateMutation.isPending}><RotateCcw size={16} /> Hoàn tác</Button>
            <Button type="submit" disabled={isReadOnly || !isDirty || updateMutation.isPending}><Save size={17} /> {updateMutation.isPending ? "Đang lưu..." : "Cập nhật"}</Button>
          </div>
        </div>
      </form>
    </>
  );
};

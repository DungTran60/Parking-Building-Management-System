import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Calculator, Clock3, Pencil, Plus, Power, ReceiptText, RefreshCw, ShieldAlert, Tags, Trash2 } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Field, Input, Select } from "@/components/forms/FormField";
import { Modal } from "@/components/common/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { pricingApi, type FinalFeeResult, type Pricing, type PricingTimeUnit } from "@/api/pricingApi";
import { vehicleTypeApi } from "@/api/vehicleTypeApi";
import type { VehicleType } from "@/types/domain";
import { getApiErrorMessage } from "@/utils/apiError";
import { currency } from "@/utils/format";

type Tab = "pricing" | "simulation";

const timeUnitLabel: Record<PricingTimeUnit, string> = {
  HOURLY: "Theo giờ",
  DAILY: "Theo ngày",
  MONTHLY: "Theo tháng"
};

const timeUnitShortLabel: Record<PricingTimeUnit, string> = {
  HOURLY: "giờ",
  DAILY: "ngày",
  MONTHLY: "tháng"
};

export function PricingPage() {
  const [tab, setTab] = useState<Tab>("pricing");
  const [policies, setPolicies] = useState<Pricing[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Pricing | null>(null);
  const [result, setResult] = useState<FinalFeeResult | null>(null);
  const [simulationError, setSimulationError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [pricingData, vehicleTypeData] = await Promise.all([
        pricingApi.getAll(),
        vehicleTypeApi.getAll()
      ]);
      setPolicies(pricingData);
      setVehicleTypes(vehicleTypeData.filter((item) => item.status === "ACTIVE"));
    } catch (error: unknown) {
      setLoadError(getApiErrorMessage(error, "Không thể tải bảng giá. Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openCreate = () => {
    setEditing(null);
    setSaveError("");
    setFormOpen(true);
  };

  const openEdit = (policy: Pricing) => {
    setEditing(policy);
    setSaveError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditing(null);
    setSaveError("");
  };

  const savePolicy = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setSaving(true);
    setSaveError("");
    try {
      const payload = {
        vehicleTypeId: String(form.get("vehicleTypeId")),
        timeUnit: String(form.get("timeUnit")) as PricingTimeUnit,
        price: Number(form.get("price")),
        overnightFee: Number(form.get("overnightFee")),
        lostTicketFee: Number(form.get("lostTicketFee")),
        description: String(form.get("description") ?? "").trim() || undefined,
        active: form.get("active") === "on"
      };
      const saved = editing
        ? await pricingApi.update(editing.id, payload)
        : await pricingApi.create(payload);
      setPolicies((current) => editing
        ? current.map((policy) => policy.id === saved.id ? saved : policy)
        : [saved, ...current]);
      setFormOpen(false);
      setEditing(null);
    } catch (error: unknown) {
      setSaveError(getApiErrorMessage(error, "Không thể lưu bảng giá. Vui lòng thử lại."));
    } finally {
      setSaving(false);
    }
  };

  const togglePolicy = async (policy: Pricing) => {
    setSaveError("");
    setTogglingId(policy.id);
    try {
      const updated = await pricingApi.toggle(policy.id);
      setPolicies((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (error: unknown) {
      setSaveError(getApiErrorMessage(error, "Không thể thay đổi trạng thái bảng giá."));
    } finally {
      setTogglingId(null);
    }
  };

  const deletePolicy = async (policy: Pricing) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa bảng giá của ${policy.vehicleTypeName}?`)) return;
    setSaveError("");
    setDeletingId(policy.id);
    try {
      await pricingApi.delete(policy.id);
      setPolicies((current) => current.filter((item) => item.id !== policy.id));
    } catch (error: unknown) {
      setSaveError(getApiErrorMessage(error, "Không thể xóa bảng giá."));
    } finally {
      setDeletingId(null);
    }
  };

  const simulateFee = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSimulationError("");
    const form = new FormData(event.currentTarget);
    const checkIn = String(form.get("checkIn"));
    const checkOut = String(form.get("checkOut"));

    if (!checkIn || !checkOut || new Date(checkOut) <= new Date(checkIn)) {
      setResult(null);
      setSimulationError("Thời gian ra phải sau thời gian vào.");
      return;
    }

    try {
      setSimulating(true);
      setResult(await pricingApi.calculateFinalFee({
        checkIn,
        checkOut,
        vehicleType: String(form.get("vehicleType")),
        lostTicket: form.get("lostTicket") === "on"
      }));
    } catch (error: unknown) {
      setResult(null);
      setSimulationError(getApiErrorMessage(error, "Không thể tính phí. Vui lòng thử lại."));
    } finally {
      setSimulating(false);
    }
  };

  const availableVehicleTypes = vehicleTypes.filter((vt) => !policies.some((p) => p.vehicleTypeId === vt.id));
  const createDisabledReason = vehicleTypes.length === 0
    ? "Chưa có loại xe — hãy tạo loại xe ở mục Loại xe trước"
    : availableVehicleTypes.length === 0
      ? "Tất cả loại xe đều đã có bảng giá"
      : null;
  const formVehicleTypes = editing
    ? vehicleTypes.filter((vt) => vt.id === editing.vehicleTypeId)
    : availableVehicleTypes;

  return (
    <>
      <PageHeader
        title="Bảng giá & tính phí"
        description="Quản lý chính sách giá và mô phỏng chi phí gửi xe trong một quy trình thống nhất."
        action={<Button onClick={openCreate} disabled={!!createDisabledReason} title={createDisabledReason ?? undefined}><Plus size={17} /> Tạo bảng giá</Button>}
      />

      <div className="mb-6 inline-flex rounded-lg border border-border bg-white p-1 shadow-sm">
        <button type="button" onClick={() => setTab("pricing")} className={tab === "pricing" ? "rounded-md bg-primary px-4 py-2 text-sm font-medium text-white" : "rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"}>
          <Tags className="mr-2 inline" size={16} />Bảng giá
        </button>
        <button type="button" onClick={() => setTab("simulation")} className={tab === "simulation" ? "rounded-md bg-primary px-4 py-2 text-sm font-medium text-white" : "rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"}>
          <Calculator className="mr-2 inline" size={16} />Mô phỏng tính phí
        </button>
      </div>

      {tab === "pricing" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {loading && <p className="text-sm text-slate-500 lg:col-span-2">Đang tải bảng giá...</p>}
          {!loading && loadError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 lg:col-span-2"><p>{loadError}</p><Button variant="secondary" className="mt-3" onClick={() => void loadData()}><RefreshCw size={16} /> Thử lại</Button></div>}
          {!loading && !loadError && saveError && !formOpen && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 lg:col-span-2">{saveError}</div>}
          {!loading && !loadError && policies.length === 0 && <div className="rounded-lg border border-dashed border-slate-300 py-14 text-center lg:col-span-2"><Tags className="mx-auto text-slate-300" size={40} /><p className="mt-3 text-sm font-medium text-slate-700">Chưa có bảng giá</p><Button className="mt-4" onClick={openCreate} disabled={!!createDisabledReason} title={createDisabledReason ?? undefined}><Plus size={16} /> Tạo bảng giá đầu tiên</Button></div>}
          {!loading && !loadError && policies.map((policy) => {
            return (
              <Card key={policy.id}>
                <CardHeader title={`${policy.vehicleTypeName} · ${timeUnitLabel[policy.timeUnit]}`} action={<div className="flex flex-wrap gap-2"><Button variant="ghost" className="h-9 px-3" disabled={togglingId === policy.id} onClick={() => void togglePolicy(policy)} title={policy.active ? "Ngừng áp dụng" : "Kích hoạt"}><Power size={16} /> {policy.active ? "Đang áp dụng" : "Đã tắt"}</Button><Button variant="ghost" className="h-9 px-3" onClick={() => openEdit(policy)}><Pencil size={16} /> Chỉnh sửa</Button><Button variant="ghost" className="h-9 px-3 text-red-600" disabled={deletingId === policy.id} onClick={() => void deletePolicy(policy)}><Trash2 size={16} /> {deletingId === policy.id ? "Đang xóa" : "Xóa"}</Button></div>} />
                <CardContent className="grid gap-5 sm:grid-cols-2">
                  <PriceGroup title="Phí cơ bản" icon={<Clock3 size={17} />} items={[
                    [`Đơn giá/${timeUnitShortLabel[policy.timeUnit]}`, policy.price]
                  ]} />
                  <PriceGroup title="Phụ phí" icon={<ShieldAlert size={17} />} items={[
                    ["Qua đêm", policy.overnightFee],
                    ["Mất vé", policy.lostTicketFee]
                  ]} />
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
          <Card>
            <CardHeader title="Thông tin lượt gửi xe" />
            <CardContent>
              <form className="grid gap-4 sm:grid-cols-2" onSubmit={simulateFee}>
                <Field label="Loại xe">
                  <Select name="vehicleType">{policies.filter((policy) => policy.active && policy.timeUnit === "HOURLY").map((policy) => <option key={policy.id} value={policy.vehicleTypeId}>{policy.vehicleTypeName}</option>)}</Select>
                </Field>
                <div className="hidden sm:block" />
                <Field label="Thời gian vào"><Input name="checkIn" type="datetime-local" required /></Field>
                <Field label="Thời gian ra"><Input name="checkOut" type="datetime-local" required /></Field>
                <fieldset className="sm:col-span-2">
                  <legend className="mb-2 text-sm font-medium text-slate-700">Phụ phí phát sinh</legend>
                  <div className="grid gap-2 sm:grid-cols-3">
                    <ExtraOption name="lostTicket" label="Mất vé" />
                  </div>
                </fieldset>
                {simulationError && <p className="rounded-md bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">{simulationError}</p>}
                <div className="flex justify-end sm:col-span-2"><Button type="submit" disabled={simulating || policies.every((policy) => !policy.active || policy.timeUnit !== "HOURLY")}><Calculator size={17} /> {simulating ? "Đang tính..." : "Tính phí"}</Button></div>
              </form>
            </CardContent>
          </Card>

          <Card className="xl:sticky xl:top-20">
            <CardHeader title="Kết quả tính phí" />
            <CardContent>
              {result ? <div className="grid gap-4">
                <ResultRow label="Phí cơ bản" value={currency(result.basePrice)} />
                <ResultRow label="Phí qua đêm" value={currency(result.overnightFee)} />
                <ResultRow label="Phí mất vé" value={currency(result.lostTicketFee)} />
                <div className="border-t border-border pt-4"><div className="flex items-center justify-between"><span className="font-semibold text-slate-800">Tổng cộng</span><span className="text-xl font-bold text-primary">{currency(result.total)}</span></div></div>
              </div> : <div className="py-10 text-center"><ReceiptText className="mx-auto text-slate-300" size={40} /><p className="mt-3 text-sm text-slate-500">Nhập thông tin để xem chi tiết chi phí.</p></div>}
            </CardContent>
          </Card>
        </div>
      )}

      <Modal open={formOpen} title={editing ? "Cập nhật bảng giá" : "Tạo bảng giá"} onClose={closeForm}>
        <form key={editing?.id ?? "create-pricing"} className="grid gap-4 sm:grid-cols-2" onSubmit={savePolicy}>
          <Field label="Loại xe"><Select name="vehicleTypeId" defaultValue={editing ? editing.vehicleTypeId : (formVehicleTypes[0]?.id ?? "")} required disabled={saving || !!editing}>{formVehicleTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}</Select></Field>
          <Field label="Đơn vị tính"><input type="hidden" name="timeUnit" value="HOURLY" /><Select value="HOURLY" disabled><option value="HOURLY">{timeUnitLabel.HOURLY}</option></Select></Field>
          <PriceInput name="price" label="Đơn giá" value={editing?.price ?? 1} min={1} disabled={saving} />
          <PriceInput name="overnightFee" label="Qua đêm" value={editing?.overnightFee ?? 0} disabled={saving} />
          <PriceInput name="lostTicketFee" label="Mất vé" value={editing?.lostTicketFee ?? 0} disabled={saving} />
          <Field label="Mô tả"><Input name="description" defaultValue={editing?.description ?? ""} maxLength={255} disabled={saving} /></Field>
          <label className="flex items-center gap-2 text-sm text-slate-700 sm:col-span-2"><input name="active" type="checkbox" defaultChecked={editing?.active ?? true} disabled={saving} /> Áp dụng bảng giá này</label>
          {saveError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 sm:col-span-2">{saveError}</div>}
          <div className="flex justify-end gap-3 sm:col-span-2"><Button type="button" variant="secondary" onClick={closeForm} disabled={saving}>Hủy</Button><Button type="submit" disabled={saving || formVehicleTypes.length === 0}>{saving ? "Đang lưu..." : editing ? "Lưu thay đổi" : "Tạo bảng giá"}</Button></div>
        </form>
      </Modal>
    </>
  );
}

function PriceGroup({ title, icon, items }: { title: string; icon: React.ReactNode; items: [string, number][] }) {
  return <section><h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-800"><span className="text-primary">{icon}</span>{title}</h3><dl className="grid gap-2">{items.map(([label, value]) => <div key={label} className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2"><dt className="text-sm text-slate-500">{label}</dt><dd className="text-sm font-semibold text-slate-800">{currency(value)}</dd></div>)}</dl></section>;
}

function PriceInput({ name, label, value, min = 0, disabled = false }: { name: string; label: string; value: number; min?: number; disabled?: boolean }) {
  return <Field label={label}><Input name={name} type="number" min={min} step="0.01" defaultValue={value} required disabled={disabled} /></Field>;
}

function ExtraOption({ name, label }: { name: string; label: string }) {
  return <label className="flex items-center gap-2 rounded-md border border-border p-3 text-sm text-slate-700 hover:bg-slate-50"><input name={name} type="checkbox" className="h-4 w-4 rounded border-slate-300 text-primary" />{label}</label>;
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-3"><span className="text-sm text-slate-500">{label}</span><span className="font-semibold text-slate-800">{value}</span></div>;
}

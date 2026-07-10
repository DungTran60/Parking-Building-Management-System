import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BatteryCharging, CalendarClock, Car, Check, Clock, MessageCircle, Phone, RefreshCw, Truck } from "lucide-react";
import { floorApi } from "@/api/floorApi";
import { pricingApi, Pricing } from "@/api/pricingApi";
import { buildingApi, Building, PaymentMode } from "@/api/buildingApi";
import { slotApi } from "@/api/slotApi";
import { vehicleTypeApi } from "@/api/vehicleTypeApi";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { currency, dateTime, number } from "@/utils/format";
import { getApiErrorMessage } from "@/utils/apiError";

const vehicleIcons: Record<string, typeof Car> = {
  MOTORBIKE: Car,
  CAR: Car,
  EV: BatteryCharging,
  TRUCK: Truck,
  COACH: Truck
};

const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  CASH: "Tiền mặt",
  CASHLESS: "Không tiền mặt",
  HYBRID: "Kết hợp"
};

const TIME_UNIT_LABELS: Record<Pricing["timeUnit"], string> = {
  HOURLY: "Theo giờ",
  DAILY: "Theo ngày",
  MONTHLY: "Theo tháng"
};

const TIME_UNIT_ORDER: Record<Pricing["timeUnit"], number> = {
  HOURLY: 0,
  DAILY: 1,
  MONTHLY: 2
};

export function ParkingInfoPage() {
  const [showFullPricing, setShowFullPricing] = useState(false);

  const settingsQuery = useQuery({
    queryKey: ["parking-info", "settings"],
    queryFn: buildingApi.get
  });
  const floorsQuery = useQuery({
    queryKey: ["parking-info", "floors"],
    queryFn: floorApi.getAll
  });
  const slotsQuery = useQuery({
    queryKey: ["parking-info", "slots"],
    queryFn: slotApi.getAll
  });
  const vehicleTypesQuery = useQuery({
    queryKey: ["parking-info", "vehicle-types"],
    queryFn: () => vehicleTypeApi.getAll("ACTIVE")
  });
  const pricingQuery = useQuery({
    queryKey: ["parking-info", "pricing"],
    queryFn: pricingApi.getAll
  });

  const queries = [settingsQuery, floorsQuery, slotsQuery, vehicleTypesQuery, pricingQuery];
  const isLoading = queries.some((query) => query.isLoading);
  const firstError = queries.find((query) => query.isError)?.error;

  const retryAll = () => {
    void Promise.all(queries.map((query) => query.refetch()));
  };

  const settings = settingsQuery.data;
  const floors = floorsQuery.data ?? [];
  const slots = slotsQuery.data ?? [];
  const vehicleTypes = vehicleTypesQuery.data ?? [];
  const pricingRows = useMemo(() => {
    const activeRows = (pricingQuery.data ?? []).filter((item) => item.active);
    const source = activeRows.length ? activeRows : (pricingQuery.data ?? []);
    return [...source].sort((left, right) => {
      const nameCompare = left.vehicleTypeName.localeCompare(right.vehicleTypeName, "vi");
      if (nameCompare !== 0) return nameCompare;
      const unitCompare = TIME_UNIT_ORDER[left.timeUnit] - TIME_UNIT_ORDER[right.timeUnit];
      if (unitCompare !== 0) return unitCompare;
      return left.price - right.price;
    });
  }, [pricingQuery.data]);

  const availableSlots = useMemo(() => slots.filter((item) => item.status === "AVAILABLE"), [slots]);
  const availableByVehicle = useMemo(() => vehicleTypes.map((type) => ({
    ...type,
    available: availableSlots.filter((slot) => slot.vehicleTypeId === type.id).length
  })), [availableSlots, vehicleTypes]);
  const floorStats = useMemo(() => floors.map((floor) => {
    const floorSlots = slots.filter((slot) => slot.floorId === floor.id);
    const available = floorSlots.filter((slot) => slot.status === "AVAILABLE").length;
    const occupied = floorSlots.length - available;
    const capacity = Math.max(1, floor.slotCount);
    const usedPercent = Math.min(100, Math.round((occupied / capacity) * 100));
    return { floor, floorSlots, available, occupied, capacity, usedPercent };
  }), [floors, slots]);
  const lastUpdatedAt = useMemo(() => {
    const timestamps = [
      settings?.createdAt,
      ...slots.map((slot) => slot.updatedAt),
      ...pricingRows.map((pricing) => pricing.updatedAt)
    ].filter(Boolean) as string[];
    if (timestamps.length === 0) return new Date().toISOString();
    return timestamps.reduce((latest, current) => (current > latest ? current : latest), timestamps[0]);
  }, [pricingRows, settings?.createdAt, slots]);

  if (firstError) {
    return <>
      <PageHeader title="Thông tin bãi xe" description="Theo dõi thời gian hoạt động, bảng giá, quy định và số slot trống theo khu vực." />
      <Card>
        <CardContent className="grid justify-items-center gap-3 py-12">
          <p className="text-sm text-red-600">{getApiErrorMessage(firstError, "Không thể tải thông tin bãi xe.")}</p>
          <button type="button" onClick={retryAll} className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700 hover:bg-slate-50">
            Thử lại
          </button>
        </CardContent>
      </Card>
    </>;
  }

  if (isLoading || !settings) {
    return <>
      <PageHeader title="Thông tin bãi xe" description="Theo dõi thời gian hoạt động, bảng giá, quy định và số slot trống theo khu vực." />
      <Card><CardContent className="py-12 text-center text-sm text-slate-500">Đang tải dữ liệu bãi xe...</CardContent></Card>
    </>;
  }

  const operatingHours = `${settings.openingTime ?? "06:00"} - ${settings.closingTime ?? "23:00"}`;
  const paymentModeLabel = PAYMENT_MODE_LABELS[settings.paymentMode ?? "HYBRID"];
  const autoBlockLabel = (settings.autoBlockOverdueSlots ?? true) ? "Bật" : "Tắt";

  return (
    <>
      <PageHeader title="Thông tin bãi xe" description="Theo dõi thời gian hoạt động, bảng giá, quy định và số slot trống theo khu vực." />

      <Card className="mb-6 overflow-hidden border-blue-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold">{settings.buildingName}</p>
            <p className="mt-1 text-sm text-blue-100">Giữ chỗ trước để tiết kiệm thời gian; nhân viên sẽ tạo lượt gửi khi bạn đến.</p>
          </div>
          <Link to="/app/reservations" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-blue-700 transition hover:bg-blue-50">
            <CalendarClock size={17} /> Đặt chỗ ngay
          </Link>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Tổng vị trí trống" value={`${number(availableSlots.length)} slot`} note="Trên toàn bộ khu vực" />
        <Metric title="Dành cho xe máy" value={`${number(availableByVehicle.find((item) => item.code === "MOTORBIKE")?.available ?? 0)} slot`} note="Có thể sử dụng ngay" />
        <Metric title="Dành cho ô tô" value={`${number(availableByVehicle.find((item) => item.code === "CAR")?.available ?? 0)} slot`} note="Tại tầng B2 và L1" />
        <Metric title="Giờ hoạt động" value={operatingHours} note={`${paymentModeLabel} · Tự động khóa slot: ${autoBlockLabel}`} />
      </div>

      <Card className="mt-6">
        <CardHeader title="Cấu hình hệ thống" />
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoCard label="Tên hệ thống" value={settings.buildingName} />
          <InfoCard label="Giờ mở cửa" value={settings.openingTime ?? "06:00"} />
          <InfoCard label="Giờ đóng cửa" value={settings.closingTime ?? "23:00"} />
          <InfoCard label="Phương thức thanh toán" value={paymentModeLabel} />
          <InfoCard label="Tự động khóa slot quá hạn" value={autoBlockLabel} />
          <InfoCard label="Cập nhật cuối" value={dateTime(lastUpdatedAt)} />
        </CardContent>
      </Card>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-slate-400">
        <RefreshCw size={13} /> Cập nhật lúc {dateTime(lastUpdatedAt)}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <Card>
            <CardHeader title="Tình trạng khu vực" />
            <CardContent className="grid gap-4">
              {floorStats.map(({ floor, available, capacity, usedPercent }) => {
                const progressColor = usedPercent >= 85 ? "bg-red-500" : usedPercent >= 70 ? "bg-amber-500" : "bg-emerald-500";
                return (
                  <div key={floor.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{floor.name} - {floor.zone}</span>
                      <span className={usedPercent >= 85 ? "font-semibold text-red-600" : "font-semibold text-emerald-600"}>{number(available)}/{number(capacity)} trống</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full transition-all ${progressColor}`} style={{ width: `${usedPercent}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader
              title="Bảng giá áp dụng"
              action={<button type="button" onClick={() => setShowFullPricing((current) => !current)} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-blue-700">{showFullPricing ? "Thu gọn" : "Xem chi tiết"}<ArrowRight size={15} /></button>}
            />
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-3 text-left font-medium">Loại xe</th>
                    <th className="p-3 text-left font-medium">Đơn vị</th>
                    <th className="p-3 text-left font-medium">Mức giá</th>
                    <th className="p-3 text-left font-medium">Phí qua đêm</th>
                    <th className="p-3 text-left font-medium">Phí mất vé</th>
                    {showFullPricing && <><th className="p-3 text-left font-medium">Mô tả</th><th className="p-3 text-left font-medium">Cập nhật lúc</th></>}
                  </tr>
                </thead>
                <tbody>
                  {pricingRows.map((pricing) => (
                    <tr key={pricing.id} className="border-t border-border">
                      <td className="p-3">{pricing.vehicleTypeName}</td>
                      <td className="p-3">{TIME_UNIT_LABELS[pricing.timeUnit]}</td>
                      <td className="p-3">{currency(pricing.price)}</td>
                      <td className="p-3">{currency(pricing.overnightFee)}</td>
                      <td className="p-3">{currency(pricing.lostTicketFee)}</td>
                      {showFullPricing && <><td className="p-3 text-slate-600">{pricing.description ?? "—"}</td><td className="p-3 text-slate-500">{dateTime(pricing.updatedAt)}</td></>}
                    </tr>
                  ))}
                  {pricingRows.length === 0 && (
                    <tr>
                      <td className="p-3 text-sm text-slate-500" colSpan={showFullPricing ? 7 : 5}>Chưa có bảng giá nào đang áp dụng.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 content-start">
          <Card>
            <CardHeader title="Loại xe được phục vụ" />
            <CardContent className="grid grid-cols-2 gap-3">
              {availableByVehicle.map((type) => {
                const Icon = vehicleIcons[type.code] ?? Car;
                return (
                  <div key={type.id} className="rounded-md bg-slate-50 p-3 text-sm">
                    <div className="flex items-center gap-2"><Icon size={16} /><span>{type.name}</span></div>
                    <p className={type.available ? "mt-2 text-xs font-semibold text-emerald-600" : "mt-2 text-xs font-semibold text-red-500"}>{number(type.available)} slot còn trống</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Quy định gửi xe" />
            <CardContent>
              <ul className="grid gap-3 text-sm text-slate-600">
                {[
                  "Giữ thẻ xe hoặc mã QR trong suốt thời gian gửi.",
                  "Không để tài sản giá trị cao trong xe.",
                  "Xe gửi qua đêm tính phí theo chính sách hiện hành.",
                  `Tự động khóa slot quá hạn: ${autoBlockLabel === "Bật" ? "Hệ thống sẽ hỗ trợ khóa khi hết hạn" : "Nhân viên xử lý thủ công theo quy trình"}.`
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-emerald-600" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Cần hỗ trợ?" />
            <CardContent className="grid gap-3">
              <div className="flex items-start gap-3"><Clock className="mt-1 text-amber-600" size={22} /><div><p className="font-semibold text-slate-900">Hỗ trợ tại quầy 24/7</p><p className="mt-1 text-sm text-slate-500">Mất thẻ, sai phí hoặc không tìm được xe.</p></div></div>
              <a href="tel:19001234" className="flex items-center gap-2 rounded-md bg-slate-50 p-3 text-sm font-medium text-slate-700 hover:bg-slate-100"><Phone size={16} className="text-primary" /> Hotline: 1900 1234</a>
              <Link to="/app/feedback" className="flex items-center gap-2 rounded-md bg-slate-50 p-3 text-sm font-medium text-slate-700 hover:bg-slate-100"><MessageCircle size={16} className="text-primary" /> Gửi yêu cầu hỗ trợ</Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function Metric({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <Card>
      <CardContent>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        <p className="mt-2 text-xs text-slate-500">{note}</p>
      </CardContent>
    </Card>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

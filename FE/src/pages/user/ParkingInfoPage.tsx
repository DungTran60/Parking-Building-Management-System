import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BatteryCharging, CalendarClock, Car, Check, Clock, MessageCircle, Phone, QrCode, RefreshCw, Truck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { floors, pricingPolicies, slots, vehicleTypes } from "@/api/mockData";
import { currency, dateTime, number } from "@/utils/format";

const vehicleIcons = {
  motorbike: Car,
  car: Car,
  ev: BatteryCharging,
  truck: Truck,
  coach: Truck
};

export function ParkingInfoPage() {
  const [showFullPricing, setShowFullPricing] = useState(false);
  const availableSlots = slots.filter((item) => item.status === "AVAILABLE");
  const availableByVehicle = vehicleTypes.map((type) => ({
    ...type,
    available: availableSlots.filter((slot) => slot.vehicleTypeId === type.id).length
  }));
  const lastUpdatedAt = slots.reduce((latest, slot) => slot.updatedAt > latest ? slot.updatedAt : latest, slots[0]?.updatedAt ?? new Date().toISOString());

  return (
    <>
      <PageHeader title="Thông tin bãi xe" description="Theo dõi thời gian hoạt động, bảng giá, quy định và số slot trống theo khu vực." />

      <Card className="mb-6 overflow-hidden border-blue-200 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div><p className="text-lg font-semibold">Bạn muốn gửi xe?</p><p className="mt-1 text-sm text-blue-100">Tạo lượt gửi ngay hoặc giữ chỗ trước để tiết kiệm thời gian.</p></div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to="/app/parking-entry" className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-white px-4 text-sm font-medium text-blue-700 transition hover:bg-blue-50"><QrCode size={17} /> Gửi xe ngay</Link>
            <Link to="/app/reservations" className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-blue-300 bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-500"><CalendarClock size={17} /> Đặt chỗ</Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Tổng vị trí trống" value={`${number(availableSlots.length)} slot`} note="Trên toàn bộ khu vực" />
        <Metric title="Dành cho xe máy" value={`${number(availableByVehicle.find((item) => item.id === "motorbike")?.available ?? 0)} slot`} note="Có thể sử dụng ngay" />
        <Metric title="Dành cho ô tô" value={`${number(availableByVehicle.find((item) => item.id === "car")?.available ?? 0)} slot`} note="Tại tầng B2 và L1" />
        <Metric title="Giờ hoạt động" value="06:00-23:00" note="Hỗ trợ 24/7 tại quầy trực" />
      </div>

      <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-slate-400"><RefreshCw size={13} /> Cập nhật lúc {dateTime(lastUpdatedAt)}</div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <Card>
            <CardHeader title="Tình trạng khu vực" />
            <CardContent className="grid gap-4">
              {floors.map((floor) => {
                const floorSlots = slots.filter((slot) => slot.floorId === floor.id);
                const empty = floorSlots.filter((slot) => slot.status === "AVAILABLE").length;
                const usedPercent = Math.round(((floorSlots.length - empty) / Math.max(1, floorSlots.length)) * 100);
                const progressColor = usedPercent >= 85 ? "bg-red-500" : usedPercent >= 70 ? "bg-amber-500" : "bg-emerald-500";
                return (
                  <div key={floor.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{floor.name} - {floor.zone}</span>
                      <span className={usedPercent >= 85 ? "font-semibold text-red-600" : "font-semibold text-emerald-600"}>{empty}/{floorSlots.length} trống</span>
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
            <CardHeader title="Bảng giá tham khảo" action={<button type="button" onClick={() => setShowFullPricing((current) => !current)} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-blue-700">{showFullPricing ? "Thu gọn" : "Xem chi tiết"}<ArrowRight size={15} /></button>} />
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-3 text-left font-medium">Loại xe</th>
                    <th className="p-3 text-left font-medium">Giờ đầu</th>
                    <th className="p-3 text-left font-medium">Giờ tiếp theo</th>
                    <th className="p-3 text-left font-medium">Qua đêm</th>
                    {showFullPricing && <><th className="p-3 text-left font-medium">Theo ngày</th><th className="p-3 text-left font-medium">Mất vé</th></>}
                  </tr>
                </thead>
                <tbody>
                  {pricingPolicies.map((policy) => (
                    <tr key={policy.id} className="border-t border-border">
                      <td className="p-3">{vehicleTypes.find((item) => item.id === policy.vehicleTypeId)?.name}</td>
                      <td className="p-3">{currency(policy.firstHour)}</td>
                      <td className="p-3">{currency(policy.nextHour)}</td>
                      <td className="p-3">{currency(policy.overnightFee)}</td>
                      {showFullPricing && <><td className="p-3">{currency(policy.dayPrice)}</td><td className="p-3">{currency(policy.lostTicketFee)}</td></>}
                    </tr>
                  ))}
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
                const Icon = vehicleIcons[type.id as keyof typeof vehicleIcons] ?? Car;
                return (
                  <div key={type.id} className="rounded-md bg-slate-50 p-3 text-sm">
                    <div className="flex items-center gap-2"><Icon size={16} /><span>{type.name}</span></div>
                    <p className={type.available ? "mt-2 text-xs font-semibold text-emerald-600" : "mt-2 text-xs font-semibold text-red-500"}>{type.available} slot còn trống</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Quy định gửi xe" />
            <CardContent>
              <ul className="grid gap-3 text-sm text-slate-600">
                {["Giữ thẻ xe hoặc mã QR trong suốt thời gian gửi.", "Không để tài sản giá trị cao trong xe.", "Xe gửi qua đêm tính phí theo chính sách hiện hành.", "Mất thẻ cần xác minh giấy tờ trước khi lấy xe."].map((item) => (
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

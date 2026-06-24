import { BatteryCharging, Car, Check, Clock, Truck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { floors, pricingPolicies, slots, vehicleTypes } from "@/api/mockData";
import { currency, number } from "@/utils/format";

const vehicleIcons = {
  motorbike: Car,
  car: Car,
  ev: BatteryCharging,
  truck: Truck,
  coach: Truck
};

export function ParkingInfoPage() {
  const availableSlots = slots.filter((item) => item.status === "AVAILABLE");
  const availableByVehicle = vehicleTypes.map((type) => ({
    ...type,
    available: availableSlots.filter((slot) => slot.vehicleTypeId === type.id).length
  }));

  return (
    <>
      <PageHeader title="Thông tin bãi xe" description="Theo dõi thời gian hoạt động, bảng giá, quy định và số slot trống theo khu vực." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="Đang trống" value={number(availableSlots.length)} note="Cập nhật theo dữ liệu mock hiện tại" />
        <Metric title="Xe máy" value={number(availableByVehicle.find((item) => item.id === "motorbike")?.available ?? 0)} note="Slot phù hợp còn trống" />
        <Metric title="Ô tô" value={number(availableByVehicle.find((item) => item.id === "car")?.available ?? 0)} note="Tầng B2, L1" />
        <Metric title="Giờ hoạt động" value="06:00-23:00" note="Hỗ trợ 24/7 tại quầy trực" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <Card>
            <CardHeader title="Tình trạng khu vực" />
            <CardContent className="grid gap-4">
              {floors.map((floor) => {
                const floorSlots = slots.filter((slot) => slot.floorId === floor.id);
                const empty = floorSlots.filter((slot) => slot.status === "AVAILABLE").length;
                const usedPercent = Math.round(((floorSlots.length - empty) / Math.max(1, floorSlots.length)) * 100);
                return (
                  <div key={floor.id}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">{floor.name} - {floor.zone}</span>
                      <span className="font-semibold text-emerald-600">{empty}/{floorSlots.length} trống</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-blue-500" style={{ width: `${usedPercent}%` }} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Bảng giá tham khảo" />
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="p-3 text-left font-medium">Loại xe</th>
                    <th className="p-3 text-left font-medium">Giờ đầu</th>
                    <th className="p-3 text-left font-medium">Giờ tiếp theo</th>
                    <th className="p-3 text-left font-medium">Qua đêm</th>
                  </tr>
                </thead>
                <tbody>
                  {pricingPolicies.map((policy) => (
                    <tr key={policy.id} className="border-t border-border">
                      <td className="p-3">{vehicleTypes.find((item) => item.id === policy.vehicleTypeId)?.name}</td>
                      <td className="p-3">{currency(policy.firstHour)}</td>
                      <td className="p-3">{currency(policy.nextHour)}</td>
                      <td className="p-3">{currency(policy.overnightFee)}</td>
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
                  <div key={type.id} className="flex items-center gap-2 rounded-md bg-slate-50 p-3 text-sm">
                    <Icon size={16} />
                    <span>{type.name}</span>
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
            <CardContent className="flex items-start gap-3">
              <Clock className="mt-1 text-amber-600" size={22} />
              <div>
                <p className="font-semibold text-slate-900">Hỗ trợ tại quầy</p>
                <p className="mt-1 text-sm text-slate-500">Liên hệ nhân viên khi mất thẻ, sai phí hoặc không tìm được xe.</p>
              </div>
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

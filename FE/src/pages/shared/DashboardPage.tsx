import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CarFront, CircleParking, CirclePercent, WalletCards, BadgeInfo, TriangleAlert } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { reportApi } from "@/api/reportApi";
import { slotApi } from "@/api/slotApi";
import { sessionApi } from "@/api/sessionApi";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { ChartCard } from "@/components/charts/ChartCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { currency, number } from "@/utils/format";

export function DashboardPage() {
  const role = useAuthStore((state) => state.role);
  const isStaff = role === "PARKING_STAFF";
  const today = dayjs().format("YYYY-MM-DD");
  const weekStart = dayjs().subtract(6, "day").format("YYYY-MM-DD");
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard", role, today],
    queryFn: async () => {
      if (isStaff) {
        const [slots, activeSessions] = await Promise.all([
          slotApi.getAll(),
          sessionApi.list({ status: "ACTIVE", page: 0, size: 1 })
        ]);
        const counts = slots.reduce(
          (acc, slot) => {
            acc.totalSlots += 1;
            acc[slot.status] += 1;
            return acc;
          },
          {
            totalSlots: 0,
            AVAILABLE: 0,
            OCCUPIED: 0,
            RESERVED: 0,
            MAINTENANCE: 0,
            BLOCKED: 0
          }
        );

        return {
          mode: "staff" as const,
          slotCounts: counts,
          activeSessions: activeSessions.totalElements
        };
      }

      const [occupancy, todayRevenue, weeklyRevenue, traffic] = await Promise.all([
        reportApi.occupancy(),
        reportApi.revenue(today, today),
        reportApi.revenue(weekStart, today),
        reportApi.traffic(today, today)
      ]);
      return { mode: "manager" as const, occupancy, todayRevenue, weeklyRevenue, traffic };
    }
  });

  if (isLoading) return <><PageHeader title="Tổng quan hôm nay" description={isStaff ? "Các chỉ số vận hành mà Staff có thể theo dõi trong ca làm việc." : "Đang tải các chỉ số vận hành từ hệ thống."} /><Card><CardContent className="py-12 text-center text-sm text-slate-500">Đang tải dữ liệu...</CardContent></Card></>;
  if (isError || !data) return <><PageHeader title="Tổng quan hôm nay" description={isStaff ? "Các chỉ số vận hành mà Staff có thể theo dõi trong ca làm việc." : "Những chỉ số vận hành quan trọng cần nắm trong vài giây."} /><Card><CardContent className="grid justify-items-center gap-3 py-12 text-center"><p className="text-sm text-red-600">Không thể tải dữ liệu dashboard. Vui lòng kiểm tra kết nối hoặc đăng nhập lại.</p><Button variant="secondary" onClick={() => void refetch()}>Thử lại</Button></CardContent></Card></>;

  if (data.mode === "staff") {
    const occupiedRate = data.slotCounts.totalSlots === 0 ? 0 : Math.round((data.slotCounts.OCCUPIED / data.slotCounts.totalSlots) * 100);
    return (
      <>
        <PageHeader title="Tổng quan hôm nay" description="Các chỉ số vận hành mà Staff có thể theo dõi trong ca làm việc." />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Kpi title="Xe đang gửi" value={number(data.activeSessions)} note="Số phiên ACTIVE hiện tại" icon={<CarFront size={20} />} tone="blue" />
          <Kpi title="Slot còn trống" value={number(data.slotCounts.AVAILABLE)} note={`${number(data.slotCounts.totalSlots)} slot toàn hệ thống`} icon={<CircleParking size={20} />} tone="emerald" />
          <Kpi title="Slot đang dùng" value={number(data.slotCounts.OCCUPIED)} note="Số slot đang có xe" icon={<WalletCards size={20} />} tone="violet" />
          <Kpi title="Tỷ lệ lấp đầy" value={`${occupiedRate}%`} note={occupiedRate >= 80 ? "Sắp đạt công suất cao" : "Công suất ổn định"} icon={<CirclePercent size={20} />} tone="amber" />
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Status label="Đã đặt" value={data.slotCounts.RESERVED} />
          <Status label="Bảo trì" value={data.slotCounts.MAINTENANCE} />
          <Status label="Tạm khóa" value={data.slotCounts.BLOCKED} />
          <Status label="Tổng slot" value={data.slotCounts.totalSlots} />
        </div>
        <Card className="mt-6">
          <CardContent className="grid gap-3 py-6">
            <div className="flex items-start gap-3">
              <BadgeInfo className="mt-0.5 text-blue-500" size={18} />
              <div>
                <p className="font-medium text-slate-900">Staff dashboard</p>
                <p className="text-sm text-slate-500">Chỉ hiển thị dữ liệu vận hành mà Staff được phép xem; các báo cáo doanh thu và lưu lượng vẫn dành cho Manager.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <TriangleAlert className="mt-0.5 text-amber-500" size={18} />
              <p className="text-sm text-slate-500">Không có nút thao tác quản trị hay báo cáo trên màn này.</p>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  const hourlyTraffic = data.traffic.trafficByHour.map((item) => ({ time: `${String(item.hour).padStart(2, "0")}:00`, count: item.checkIns }));
  const weeklyRevenue = data.weeklyRevenue.revenueByDate.map((item) => ({ day: dayjs(item.date).format("DD/MM"), revenue: item.amount }));
  const occupancyRate = Math.round(data.occupancy.occupancyRate);
  return (
    <>
      <PageHeader title="Tổng quan hôm nay" description="Những chỉ số vận hành quan trọng cần nắm trong vài giây." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi title="Xe đang gửi" value={number(data.occupancy.occupiedSlots)} note="Theo trạng thái slot OCCUPIED" icon={<CarFront size={20} />} tone="blue" />
        <Kpi title="Slot còn trống" value={number(data.occupancy.availableSlots)} note={`${number(data.occupancy.totalSlots)} slot toàn hệ thống`} icon={<CircleParking size={20} />} tone="emerald" />
        <Kpi title="Doanh thu hôm nay" value={currency(data.todayRevenue.totalRevenue)} note={`${number(data.traffic.totalCheckIns)} vào · ${number(data.traffic.totalCheckOuts)} ra`} icon={<WalletCards size={20} />} tone="violet" />
        <Kpi title="Tỷ lệ lấp đầy" value={`${occupancyRate}%`} note={occupancyRate >= 80 ? "Sắp đạt công suất cao" : "Công suất ổn định"} icon={<CirclePercent size={20} />} tone="amber" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ChartCard title="Lượt xe vào theo giờ hôm nay">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={hourlyTraffic}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="time" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="count" name="Lượt xe vào" fill="#2563eb" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Trạng thái slot hiện tại">
          <div className="grid h-full content-center grid-cols-2 gap-4 text-sm"><Status label="Đang sử dụng" value={data.occupancy.occupiedSlots} /><Status label="Đã đặt" value={data.occupancy.reservedSlots} /><Status label="Bảo trì" value={data.occupancy.maintenanceSlots} /><Status label="Tạm khóa" value={data.occupancy.blockedSlots} /></div>
        </ChartCard>
        <div className="xl:col-span-2"><ChartCard title="Doanh thu 7 ngày gần nhất"><ResponsiveContainer width="100%" height="100%"><LineChart data={weeklyRevenue}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis tickFormatter={(value) => `${number(Number(value) / 1_000_000)}tr`} /><Tooltip formatter={(value) => [currency(Number(value)), "Doanh thu"]} /><Line type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4 }} /></LineChart></ResponsiveContainer></ChartCard></div>
      </div>
    </>
  );
}

function Status({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg bg-slate-50 p-4"><p className="text-slate-500">{label}</p><p className="mt-1 text-2xl font-semibold text-slate-900">{number(value)}</p></div>;
}

function Kpi({ title, value, note, icon, tone }: { title: string; value: string; note: string; icon: React.ReactNode; tone: "blue" | "emerald" | "violet" | "amber" }) {
  const tones = { blue: "bg-blue-50 text-blue-600", emerald: "bg-emerald-50 text-emerald-600", violet: "bg-violet-50 text-violet-600", amber: "bg-amber-50 text-amber-600" };
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between"><p className="text-sm text-slate-500">{title}</p><span className={`rounded-lg p-2 ${tones[tone]}`}>{icon}</span></div>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
        <p className="mt-1 text-xs text-slate-500">{note}</p>
      </CardContent>
    </Card>
  );
}

import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CarFront, CircleParking, CirclePercent, WalletCards, TriangleAlert, ClipboardList, Siren, LogIn, LogOut } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { incidentApi } from "@/api/incidentApi";
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
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["dashboard", role],
    refetchInterval: 60_000,
    queryFn: async () => {
      if (isStaff) {
        const [slots, activeSessions, openIncidents, myIncidents] = await Promise.all([
          slotApi.getAll(),
          sessionApi.list({ status: "ACTIVE", page: 0, size: 1 }),
          incidentApi.getAll({ status: "OPEN" }),
          incidentApi.getAll({ status: "IN_PROGRESS", assignee: "me" })
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
          activeSessions: activeSessions.totalElements,
          openIncidents: openIncidents.length,
          myIncidents: myIncidents.length
        };
      }

      const today = dayjs().format("YYYY-MM-DD");
      const weekStart = dayjs().subtract(6, "day").format("YYYY-MM-DD");
      const [occupancy, todayRevenue, weeklyRevenue, traffic, openIncidents, resolvedIncidents] = await Promise.all([
        reportApi.occupancy(),
        reportApi.revenue(today, today),
        reportApi.revenue(weekStart, today),
        reportApi.traffic(today, today),
        incidentApi.getAll({ status: "OPEN" }),
        incidentApi.getAll({ status: "RESOLVED" })
      ]);
      return {
        mode: "manager" as const,
        occupancy,
        todayRevenue,
        weeklyRevenue,
        traffic,
        openIncidents: openIncidents.length,
        resolvedIncidents: resolvedIncidents.length
      };
    }
  });

  if (isLoading) return <><PageHeader title={isStaff ? "Tổng quan ca làm việc" : "Tổng quan hôm nay"} description={isStaff ? "Các chỉ số vận hành mà Staff có thể theo dõi trong ca làm việc." : "Đang tải các chỉ số vận hành từ hệ thống."} /><Card><CardContent className="py-12 text-center text-sm text-slate-500">Đang tải dữ liệu...</CardContent></Card></>;
  if (isError || !data) return <><PageHeader title={isStaff ? "Tổng quan ca làm việc" : "Tổng quan hôm nay"} description={isStaff ? "Các chỉ số vận hành mà Staff có thể theo dõi trong ca làm việc." : "Những chỉ số vận hành quan trọng cần nắm trong vài giây."} /><Card><CardContent className="grid justify-items-center gap-3 py-12 text-center"><p className="text-sm text-red-600">Không thể tải dữ liệu dashboard. Vui lòng kiểm tra kết nối hoặc đăng nhập lại.</p><Button variant="secondary" onClick={() => void refetch()}>Thử lại</Button></CardContent></Card></>;

  if (data.mode === "staff") {
    const actionItems = data.openIncidents + data.myIncidents;
    const available = data.slotCounts.AVAILABLE;
    const total = data.slotCounts.totalSlots;
    const lowThreshold = total === 0 ? 0 : Math.ceil(total * 0.1);
    const slotTone: "rose" | "amber" | "emerald" = available === 0 ? "rose" : available <= lowThreshold ? "amber" : "emerald";
    const slotNote = available === 0 ? "Hết slot trống" : available <= lowThreshold ? "Sắp hết — cần lưu ý" : `${number(total)} slot toàn hệ thống`;
    const actionTone: "rose" | "emerald" = actionItems > 0 ? "rose" : "emerald";
    const actionNote = actionItems === 0 ? "Không có việc ưu tiên" : `${number(data.openIncidents)} chờ nhận · ${number(data.myIncidents)} đang xử lý`;
    return (
      <>
        <PageHeader title="Tổng quan ca làm việc" description="" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Kpi title="Việc cần xử lý" value={number(actionItems)} note={actionNote} icon={<ClipboardList size={24} />} tone={actionTone} />
          <Kpi title="Xe đang gửi" value={number(data.activeSessions)} note="Phiên đang ACTIVE" icon={<CarFront size={24} />} tone="blue" />
          <Kpi title="Slot còn trống" value={number(available)} note={slotNote} icon={<CircleParking size={24} />} tone={slotTone} />
          <Kpi title="Sự cố đang mở" value={number(data.openIncidents)} note={data.openIncidents > 0 ? "Cần nhận xử lý" : "Không có sự cố"} icon={<Siren size={24} />} tone="amber" />
        </div>
        <Card className="mt-6">
          <CardContent className="py-6">
            <p className="font-medium text-slate-900">Truy cập nhanh</p>
            {/* <p className="text-sm text-slate-500">Các thao tác vận hành chính trong ca của bạn.</p> */}
            <div className="mt-4 flex flex-wrap gap-3">
              <Button onClick={() => navigate("/app/check-in")}><LogIn size={16} /> Xe vào</Button>
              <Button variant="secondary" onClick={() => navigate("/app/check-out")}><LogOut size={16} /> Xe ra</Button>
              <Button variant="secondary" onClick={() => navigate("/app/incidents")}><Siren size={16} /> Xử lý sự cố{data.openIncidents > 0 ? ` (${number(data.openIncidents)})` : ""}</Button>
            </div>
            {actionItems > 0 && (
              <div className="mt-4 flex items-start gap-3 rounded-lg bg-rose-50 p-3">
                <TriangleAlert className="mt-0.5 shrink-0 text-rose-600" size={18} />
                <p className="text-sm text-rose-700">
                  {data.openIncidents > 0 && `Có ${number(data.openIncidents)} sự cố đang mở chờ xử lý. `}
                  {data.myIncidents > 0 && `Bạn đang xử lý ${number(data.myIncidents)} sự cố.`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        {/* <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Status label="Đang dùng" value={data.slotCounts.OCCUPIED} />
          <Status label="Đã đặt" value={data.slotCounts.RESERVED} />
          <Status label="Bảo trì" value={data.slotCounts.MAINTENANCE} />
          <Status label="Tạm khóa" value={data.slotCounts.BLOCKED} />
        </div> */}
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
        <Kpi title="Xe đang gửi" value={number(data.occupancy.occupiedSlots)} note="Theo trạng thái slot OCCUPIED" icon={<CarFront size={24} />} tone="blue" />
        <Kpi title="Slot còn trống" value={number(data.occupancy.availableSlots)} note={`${number(data.occupancy.totalSlots)} slot toàn hệ thống`} icon={<CircleParking size={24} />} tone="emerald" />
        <Kpi title="Doanh thu hôm nay" value={currency(data.todayRevenue.totalRevenue)} note={`${number(data.traffic.totalCheckIns)} vào · ${number(data.traffic.totalCheckOuts)} ra`} icon={<WalletCards size={24} />} tone="violet" />
        <Kpi title="Tỷ lệ lấp đầy" value={`${occupancyRate}%`} note={occupancyRate >= 80 ? "Sắp đạt công suất cao" : "Công suất ổn định"} icon={<CirclePercent size={24} />} tone="amber" />
      </div>
      {(data.openIncidents > 0 || data.resolvedIncidents > 0) && (
        <Card className="mt-6">
          <CardContent className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <TriangleAlert className="mt-0.5 shrink-0 text-amber-500" size={24} />
              <div>
                <p className="font-medium text-slate-900">Sự cố cần bạn xử lý</p>
                <p className="text-sm text-slate-500">
                  {[
                    data.openIncidents > 0 && `${number(data.openIncidents)} đang mở chờ phân công`,
                    data.resolvedIncidents > 0 && `${number(data.resolvedIncidents)} đã giải quyết chờ xác nhận đóng`
                  ].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
            <Button variant="secondary" onClick={() => navigate("/app/incidents")}>Xem sự cố</Button>
          </CardContent>
        </Card>
      )}
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

function Kpi({ title, value, note, icon, tone }: { title: string; value: string; note: string; icon: React.ReactNode; tone: "blue" | "emerald" | "violet" | "amber" | "rose" }) {
  const tones = { blue: "bg-blue-50 text-blue-600", emerald: "bg-emerald-50 text-emerald-600", violet: "bg-violet-50 text-violet-600", amber: "bg-amber-50 text-amber-600", rose: "bg-rose-50 text-rose-600" };
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between"><p className="text-base font-medium text-slate-600">{title}</p><span className={`rounded-xl p-2.5 ${tones[tone]}`}>{icon}</span></div>
        <p className="mt-3 text-4xl font-bold tracking-tight text-slate-950">{value}</p>
        <p className="mt-1.5 text-sm text-slate-500">{note}</p>
      </CardContent>
    </Card>
  );
}

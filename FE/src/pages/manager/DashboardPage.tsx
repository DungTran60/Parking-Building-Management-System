import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CarFront, CircleParking, CirclePercent, WalletCards } from "lucide-react";
import { Card, CardContent } from "@/components/common/Card";
import { ChartCard } from "@/components/charts/ChartCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { hourly, sessions, slots } from "@/api/mockData";
import { currency, number } from "@/utils/format";

const weeklyRevenue = [
  { day: "T2", revenue: 9.8 }, { day: "T3", revenue: 11.2 }, { day: "T4", revenue: 10.5 },
  { day: "T5", revenue: 12.1 }, { day: "T6", revenue: 14.6 }, { day: "T7", revenue: 16.3 },
  { day: "Hôm nay", revenue: 12.85 }
];

export function DashboardPage() {
  const active = sessions.filter((item) => item.status === "ACTIVE").length;
  const available = slots.filter((item) => item.status === "AVAILABLE").length;
  const occupancy = Math.round(((slots.length - available) / slots.length) * 100);
  return (
    <>
      <PageHeader title="Tổng quan hôm nay" description="Những chỉ số vận hành quan trọng cần nắm trong vài giây." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Kpi title="Xe đang gửi" value={number(active)} note="Đang ở trong bãi" icon={<CarFront size={20} />} tone="blue" />
        <Kpi title="Slot còn trống" value={number(available)} note={`${slots.length} slot toàn hệ thống`} icon={<CircleParking size={20} />} tone="emerald" />
        <Kpi title="Doanh thu hôm nay" value={currency(12850000)} note="+8,4% so với hôm qua" icon={<WalletCards size={20} />} tone="violet" />
        <Kpi title="Tỷ lệ lấp đầy" value={`${occupancy}%`} note={occupancy >= 80 ? "Sắp đạt công suất cao" : "Công suất ổn định"} icon={<CirclePercent size={20} />} tone="amber" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ChartCard title="Xe vào / ra hôm nay">
          <ResponsiveContainer width="100%" height="100%"><AreaChart data={hourly}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="time" /><YAxis /><Tooltip /><Area dataKey="in" stroke="#2563eb" fill="#dbeafe" /><Area dataKey="out" stroke="#16a34a" fill="#dcfce7" /></AreaChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Khung giờ hôm nay">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={hourly}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="time" /><YAxis /><Tooltip /><Bar dataKey="in" name="Lượt xe vào" fill="#f59e0b" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer>
        </ChartCard>
        <div className="xl:col-span-2"><ChartCard title="Doanh thu 7 ngày gần nhất"><ResponsiveContainer width="100%" height="100%"><LineChart data={weeklyRevenue}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="day" /><YAxis unit="tr" /><Tooltip formatter={(value) => [`${value} triệu`, "Doanh thu"]} /><Line type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={3} dot={{ r: 4 }} /></LineChart></ResponsiveContainer></ChartCard></div>
      </div>
    </>
  );
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

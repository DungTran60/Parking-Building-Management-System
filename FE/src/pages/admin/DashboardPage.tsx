import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { ChartCard } from "@/components/charts/ChartCard";
import { PageHeader } from "@/components/common/PageHeader";
import { sessions, slots } from "@/api/mockData";
import { currency, number } from "@/utils/format";

const hourly = [
  { time: "07:00", in: 42, out: 12 },
  { time: "09:00", in: 86, out: 24 },
  { time: "11:00", in: 52, out: 38 },
  { time: "13:00", in: 45, out: 41 },
  { time: "17:00", in: 96, out: 78 },
  { time: "19:00", in: 34, out: 88 }
];
const vehiclePie = [{ name: "Xe máy", value: 48 }, { name: "Ô tô", value: 31 }, { name: "Xe điện", value: 12 }, { name: "Khác", value: 9 }];
const colors = ["#2563eb", "#16a34a", "#0891b2", "#f59e0b"];

export function DashboardPage() {
  const active = sessions.filter((item) => item.status === "ACTIVE").length;
  const available = slots.filter((item) => item.status === "AVAILABLE").length;
  const occupancy = Math.round(((slots.length - available) / slots.length) * 100);
  return (
    <>
      <PageHeader title="Dashboard KPI" description="Tổng quan xe đang gửi, slot trống, doanh thu và tỷ lệ lấp đầy." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Kpi title="Xe đang gửi" value={number(active)} />
        <Kpi title="Slot còn trống" value={number(available)} />
        <Kpi title="Doanh thu hôm nay" value={currency(12850000)} />
        <Kpi title="Doanh thu tháng" value={currency(384200000)} />
        <Kpi title="Tỷ lệ lấp đầy" value={`${occupancy}%`} />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <ChartCard title="Lượt xe vào/ra theo giờ">
          <ResponsiveContainer width="100%" height="100%"><AreaChart data={hourly}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="time" /><YAxis /><Tooltip /><Area dataKey="in" stroke="#2563eb" fill="#dbeafe" /><Area dataKey="out" stroke="#16a34a" fill="#dcfce7" /></AreaChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Loại xe phổ biến">
          <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={vehiclePie} dataKey="value" nameKey="name" outerRadius={105} label>{vehiclePie.map((_, index) => <Cell key={index} fill={colors[index]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Doanh thu theo ngày">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={hourly}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="time" /><YAxis /><Tooltip /><Bar dataKey="in" fill="#2563eb" /></BarChart></ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-slate-500">{title}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
      </CardContent>
    </Card>
  );
}

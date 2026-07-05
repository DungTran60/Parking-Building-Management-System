import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent } from "@/components/common/Card";
import { ChartCard } from "@/components/charts/ChartCard";
import { PageHeader } from "@/components/layout/PageHeader";

const revenue = [{ d: "T2", v: 24 }, { d: "T3", v: 31 }, { d: "T4", v: 28 }, { d: "T5", v: 44 }, { d: "T6", v: 61 }, { d: "T7", v: 70 }, { d: "CN", v: 55 }];
const peak = [{ h: "07", v: 42 }, { h: "08", v: 88 }, { h: "09", v: 73 }, { h: "17", v: 94 }, { h: "18", v: 112 }, { h: "19", v: 76 }];

export function ReportsPage() {
  return (
    <>
      <PageHeader title="Báo cáo" description="Báo cáo lượt xe vào ra, doanh thu, loại xe phổ biến và khung giờ cao điểm." />
      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Doanh thu tuần">
          <ResponsiveContainer width="100%" height="100%"><LineChart data={revenue}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="d" /><YAxis /><Tooltip /><Line dataKey="v" stroke="#2563eb" strokeWidth={3} /></LineChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Khung giờ cao điểm">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={peak}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="h" /><YAxis /><Tooltip /><Bar dataKey="v" fill="#16a34a" /></BarChart></ResponsiveContainer>
        </ChartCard>
      </div>
      <Card className="mt-6"><CardContent className="grid gap-3 md:grid-cols-4">{["Lượt xe vào ra", "Doanh thu", "Loại xe phổ biến", "Giờ cao điểm"].map((item) => <div key={item} className="rounded-md bg-slate-50 p-4 font-medium">{item}</div>)}</CardContent></Card>
    </>
  );
}

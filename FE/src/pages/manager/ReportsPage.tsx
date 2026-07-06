import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, FileText, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { ChartCard } from "@/components/charts/ChartCard";
import { DateRangePicker, type DateRangeValue } from "@/components/forms/DateRangePicker";
import { PageHeader } from "@/components/layout/PageHeader";
import { colors, vehiclePie } from "@/api/mockData";
import { currency } from "@/utils/format";

const revenue = [{ d: "T1", v: 268 }, { d: "T2", v: 284 }, { d: "T3", v: 301 }, { d: "T4", v: 296 }, { d: "T5", v: 324 }, { d: "T6", v: 352 }];
const peak = [{ h: "07", v: 42 }, { h: "08", v: 88 }, { h: "09", v: 73 }, { h: "17", v: 94 }, { h: "18", v: 112 }, { h: "19", v: 76 }];
const vehicleRevenue = [{ name: "Xe máy", value: 142 }, { name: "Ô tô", value: 118 }, { name: "Xe điện", value: 61 }, { name: "Xe tải", value: 31 }];
const ranges = [{ value: "today", label: "Hôm nay" }, { value: "week", label: "Tuần này" }, { value: "month", label: "Tháng này" }, { value: "custom", label: "Khoảng ngày" }];

export function ReportsPage() {
  const [range, setRange] = useState("month");
  const [dateRange, setDateRange] = useState<DateRangeValue>({ from: "2026-07-01", to: "2026-07-05" });
  const exportCsv = () => {
    const csv = ["Loại xe,Doanh thu (triệu VND)", ...vehicleRevenue.map((item) => `${item.name},${item.value}`)].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    link.download = "bao-cao-bai-do-xe.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <>
      <PageHeader title="Báo cáo & phân tích" description="Phân tích doanh thu, cơ cấu phương tiện, công suất và xu hướng theo thời gian." action={<div className="flex gap-2"><Button variant="secondary" onClick={exportCsv}><Download size={16} /> Xuất Excel</Button><Button variant="secondary" onClick={() => window.print()}><FileText size={16} /> Xuất PDF</Button></div>} />
      <Card className="mb-6"><CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2">{ranges.map((item) => <button key={item.value} onClick={() => setRange(item.value)} className={`rounded-md px-3 py-2 text-sm font-medium ${range === item.value ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>{item.label}</button>)}</div>{range === "custom" && <DateRangePicker value={dateRange} onChange={setDateRange} />}</CardContent></Card>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Insight label="Doanh thu hôm qua" value={currency(11720000)} note="So với trung bình ngày" positive />
        <Insight label="Doanh thu tháng trước" value={currency(324000000)} note="Giảm 3,2% so với tháng trước đó" />
        <Insight label="Tỷ trọng xe máy" value="48%" note="Lớn nhất trong các loại xe" positive />
        <Insight label="Giờ đông nhất" value="18:00" note="112 lượt xe vào" positive />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Báo cáo doanh thu theo tháng">
          <ResponsiveContainer width="100%" height="100%"><LineChart data={revenue}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="d" /><YAxis /><Tooltip /><Line dataKey="v" stroke="#2563eb" strokeWidth={3} /></LineChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Doanh thu theo loại xe">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={vehicleRevenue} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" unit="tr" /><YAxis type="category" dataKey="name" width={70} /><Tooltip formatter={(value) => [`${value} triệu`, "Doanh thu"]} /><Bar dataKey="value" fill="#2563eb" radius={[0, 5, 5, 0]} /></BarChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Cơ cấu phương tiện">
          <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={vehiclePie} dataKey="value" nameKey="name" outerRadius={105} label>{vehiclePie.map((_, index) => <Cell key={index} fill={colors[index]} />)}</Pie><Tooltip formatter={(value) => [`${value}%`, "Tỷ trọng"]} /></PieChart></ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Báo cáo khung giờ cao điểm">
          <ResponsiveContainer width="100%" height="100%"><BarChart data={peak}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="h" /><YAxis /><Tooltip /><Bar dataKey="v" fill="#16a34a" /></BarChart></ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );
}

function Insight({ label, value, note, positive = false }: { label: string; value: string; note: string; positive?: boolean }) {
  return <Card><CardContent><div className="flex items-start justify-between gap-3"><div><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-xl font-semibold text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{note}</p></div><span className={`rounded-lg p-2 ${positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>{positive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}</span></div></CardContent></Card>;
}

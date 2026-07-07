import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, FileText } from "lucide-react";
import { reportApi } from "@/api/reportApi";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { ChartCard } from "@/components/charts/ChartCard";
import { DateRangePicker, type DateRangeValue } from "@/components/forms/DateRangePicker";
import { PageHeader } from "@/components/layout/PageHeader";
import { currency, number } from "@/utils/format";

type Range = "today" | "week" | "month" | "custom";
const ranges: { value: Range; label: string }[] = [
  { value: "today", label: "Hôm nay" }, { value: "week", label: "7 ngày" },
  { value: "month", label: "Tháng này" }, { value: "custom", label: "Khoảng ngày" }
];

export function ReportsPage() {
  const today = dayjs().format("YYYY-MM-DD");
  const [range, setRange] = useState<Range>("month");
  const [dateRange, setDateRange] = useState<DateRangeValue>({ from: dayjs().startOf("month").format("YYYY-MM-DD"), to: today });
  const dates = useMemo(() => {
    if (range === "today") return { from: today, to: today };
    if (range === "week") return { from: dayjs().subtract(6, "day").format("YYYY-MM-DD"), to: today };
    if (range === "month") return { from: dayjs().startOf("month").format("YYYY-MM-DD"), to: today };
    return dateRange;
  }, [dateRange, range, today]);
  const validRange = Boolean(dates.from && dates.to && dates.from <= dates.to);
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["reports", dates.from, dates.to], enabled: validRange,
    queryFn: async () => {
      const [revenue, traffic, occupancy] = await Promise.all([reportApi.revenue(dates.from, dates.to), reportApi.traffic(dates.from, dates.to), reportApi.occupancy()]);
      return { revenue, traffic, occupancy };
    }
  });
  const exportCsv = () => {
    if (!data) return;
    const csv = ["Ngày,Doanh thu", ...data.revenue.revenueByDate.map((item) => `${item.date},${item.amount}`)].join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
    link.download = `bao-cao-${dates.from}-${dates.to}.csv`; link.click(); URL.revokeObjectURL(link.href);
  };
  const peak = data?.traffic.trafficByHour.reduce((best, item) => item.checkIns > best.checkIns ? item : best, { hour: 0, checkIns: 0, checkOuts: 0 });
  return <>
    <PageHeader title="Báo cáo & phân tích" description="Doanh thu, lượt xe và công suất theo dữ liệu hệ thống." action={<div className="flex gap-2"><Button variant="secondary" onClick={exportCsv} disabled={!data}><Download size={16} /> Xuất CSV</Button><Button variant="secondary" onClick={() => window.print()} disabled={!data}><FileText size={16} /> Xuất PDF</Button></div>} />
    <Card className="mb-6"><CardContent className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex flex-wrap gap-2">{ranges.map((item) => <button type="button" key={item.value} onClick={() => setRange(item.value)} className={`rounded-md px-3 py-2 text-sm font-medium ${range === item.value ? "bg-primary text-white" : "bg-slate-100 text-slate-600"}`}>{item.label}</button>)}</div>{range === "custom" && <DateRangePicker value={dateRange} onChange={setDateRange} />}</CardContent></Card>
    {!validRange && <div role="alert" className="mb-6 rounded-md bg-red-50 p-3 text-sm text-red-700">Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.</div>}
    {isLoading && <Card><CardContent className="py-12 text-center text-sm text-slate-500">Đang tải báo cáo...</CardContent></Card>}
    {isError && <Card><CardContent className="grid justify-items-center gap-3 py-12"><p className="text-sm text-red-600">{error instanceof Error ? error.message : "Không thể tải báo cáo."}</p><Button variant="secondary" onClick={() => void refetch()}>Thử lại</Button></CardContent></Card>}
    {data && !isLoading && <><div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Metric label="Tổng doanh thu" value={currency(data.revenue.totalRevenue)} /><Metric label="Lượt xe vào" value={number(data.traffic.totalCheckIns)} /><Metric label="Lượt xe ra" value={number(data.traffic.totalCheckOuts)} /><Metric label="Tỷ lệ lấp đầy" value={`${data.occupancy.occupancyRate.toFixed(1)}%`} /></div><div className="grid gap-6 xl:grid-cols-2">
      <ChartCard title="Doanh thu theo ngày"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.revenue.revenueByDate}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis /><Tooltip formatter={(v) => currency(Number(v))} /><Line dataKey="amount" stroke="#2563eb" strokeWidth={3} /></LineChart></ResponsiveContainer></ChartCard>
      <ChartCard title="Doanh thu theo loại xe"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.revenue.revenueByVehicleType}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="vehicleTypeName" /><YAxis /><Tooltip formatter={(v) => currency(Number(v))} /><Bar dataKey="amount" fill="#7c3aed" /></BarChart></ResponsiveContainer></ChartCard>
      <ChartCard title={`Lượt xe theo giờ · cao điểm ${String(peak?.hour ?? 0).padStart(2, "0")}:00`}><ResponsiveContainer width="100%" height="100%"><BarChart data={data.traffic.trafficByHour}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="hour" /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="checkIns" name="Xe vào" fill="#2563eb" /><Bar dataKey="checkOuts" name="Xe ra" fill="#16a34a" /></BarChart></ResponsiveContainer></ChartCard>
      <ChartCard title="Công suất theo tầng"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.occupancy.occupancyByFloor}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="floorName" /><YAxis domain={[0, 100]} /><Tooltip /><Bar dataKey="rate" name="Lấp đầy (%)" fill="#f59e0b" /></BarChart></ResponsiveContainer></ChartCard>
    </div></>}
  </>;
}

function Metric({ label, value }: { label: string; value: string }) { return <Card><CardContent><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-xl font-semibold text-slate-950">{value}</p></CardContent></Card>; }

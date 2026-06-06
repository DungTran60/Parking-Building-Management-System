import { cn } from "@/utils/cn";

const statusClass: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  INACTIVE: "bg-slate-100 text-slate-600 ring-slate-200",
  AVAILABLE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  OCCUPIED: "bg-red-50 text-red-700 ring-red-200",
  RESERVED: "bg-blue-50 text-blue-700 ring-blue-200",
  MAINTENANCE: "bg-amber-50 text-amber-700 ring-amber-200",
  BLOCKED: "bg-slate-200 text-slate-700 ring-slate-300",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  UNPAID: "bg-orange-50 text-orange-700 ring-orange-200",
  LOST_TICKET: "bg-purple-50 text-purple-700 ring-purple-200",
  EXPIRED: "bg-red-50 text-red-700 ring-red-200",
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-slate-100 text-slate-600 ring-slate-200"
};

export function Badge({ value }: { value: string }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1", statusClass[value] ?? "bg-slate-100 text-slate-700")}>{value}</span>;
}

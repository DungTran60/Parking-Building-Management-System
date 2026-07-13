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
  PENDING_PAYMENT: "bg-orange-50 text-orange-700 ring-orange-200",
  DISPUTED: "bg-red-100 text-red-800 ring-red-300",
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  CONFIRMED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-slate-100 text-slate-600 ring-slate-200",
  CHECKED_IN: "bg-blue-50 text-blue-700 ring-blue-200",
  OPEN: "bg-amber-50 text-amber-700 ring-amber-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 ring-blue-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CLOSED: "bg-slate-100 text-slate-600 ring-slate-200",
  PAID: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  FAILED: "bg-red-50 text-red-700 ring-red-200"
};

const statusLabel: Record<string, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Đã khóa",
  AVAILABLE: "Còn trống",
  OCCUPIED: "Đã chiếm chỗ",
  RESERVED: "Đã đặt chỗ",
  MAINTENANCE: "Bảo trì",
  BLOCKED: "Đã chặn",
  COMPLETED: "Hoàn thành",
  UNPAID: "Chưa thanh toán",
  LOST_TICKET: "Mất vé",
  EXPIRED: "Đã hết hạn",
  PENDING_PAYMENT: "Chờ thanh toán",
  DISPUTED: "Đang tranh chấp",
  PENDING: "Chờ xử lý",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  CHECKED_IN: "Đã vào bãi",
  OPEN: "Đang mở",
  IN_PROGRESS: "Đang xử lý",
  RESOLVED: "Đã giải quyết",
  CLOSED: "Đã đóng",
  PAID: "Đã thanh toán",
  FAILED: "Thất bại"
};

export function Badge({ value }: { value: string }) {
  const label = statusLabel[value] ?? value;
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1", statusClass[value] ?? "bg-slate-100 text-slate-700")}>{label}</span>;
}

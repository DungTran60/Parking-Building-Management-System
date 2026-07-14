import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { RefreshCw, Search } from "lucide-react";
import { sessionApi } from "@/api/sessionApi";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Field, Input, Select } from "@/components/forms/FormField";
import { DateRangePicker } from "@/components/forms/DateRangePicker";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import type { ParkingSession, SessionStatus } from "@/types/domain";
import { getApiErrorMessage } from "@/utils/apiError";
import { currency, dateTime } from "@/utils/format";

type SessionStatusFilter = SessionStatus | "ALL";

const SESSION_STATUS_OPTIONS: { value: SessionStatusFilter; label: string }[] = [
  { value: "ALL", label: "Tất cả trạng thái" },
  { value: "ACTIVE", label: "Đang gửi xe" },
  { value: "COMPLETED", label: "Đã hoàn tất" },
  { value: "UNPAID", label: "Chưa thanh toán" },
  { value: "LOST_TICKET", label: "Mất vé" },
  { value: "EXPIRED", label: "Hết hạn" },
  { value: "PENDING_PAYMENT", label: "Chờ thanh toán" },
  { value: "DISPUTED", label: "Đang tranh chấp" }
];

const columns: ColumnDef<ParkingSession>[] = [
  { accessorKey: "ticketCode", header: "Mã vé" },
  { accessorKey: "plateNumber", header: "Biển số" },
  {
    id: "slot",
    header: "Vị trí",
    cell: ({ row }) => row.original.slotCode ?? `Slot ${row.original.slotId}`
  },
  { accessorKey: "entryGate", header: "Cổng vào" },
  {
    accessorKey: "checkInAt",
    header: "Giờ vào",
    cell: ({ row }) => dateTime(row.original.checkInAt)
  },
  {
    accessorKey: "checkOutAt",
    header: "Giờ ra",
    cell: ({ row }) => row.original.checkOutAt ? dateTime(row.original.checkOutAt) : "—"
  },
  {
    accessorKey: "fee",
    header: "Phí",
    cell: ({ row }) => currency(row.original.fee)
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => <Badge value={row.original.status} />
  }
];

export function SessionsPage() {
  const [sessions, setSessions] = useState<ParkingSession[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<SessionStatusFilter>("ACTIVE");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const invalidRange = Boolean(from && to && new Date(to) < new Date(from));

  const loadSessions = useCallback(async () => {
    if (invalidRange) return;
    setLoading(true);
    setError("");
    try {
      const result = await sessionApi.list({
        query,
        status,
        page,
        from: from ? `${from}T00:00:00` : undefined,
        to: to ? `${to}T23:59:59` : undefined,
        size: 50,
        sort: "checkInAt,desc"
      });
      setSessions(result.content);
      setTotalPages(result.totalPages);
      setTotalElements(result.totalElements);
    } catch (requestError: unknown) {
      setSessions([]);
      setError(getApiErrorMessage(requestError, "Không thể tải danh sách lượt gửi xe. Vui lòng thử lại."));
    } finally {
      setLoading(false);
    }
  }, [query, status, page, from, to, invalidRange]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSessions();
    }, 250);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadSessions]);

  const activeCount = useMemo(
    () => sessions.filter((session) => session.status === "ACTIVE").length,
    [sessions]
  );

  return (
    <>
      <PageHeader
        title="Quản lý lượt gửi xe"
        description=""
      />

      <Card>
        <CardHeader title="Danh sách lượt gửi xe" />

        <CardContent className="grid gap-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto_auto] lg:items-end">
            <Field label="Tìm theo biển số / mã vé / vị trí">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-2.5 text-slate-400" size={17} />
                <Input
                  value={query}
                  onChange={(event) => { setQuery(event.target.value); setPage(0); }}
                  placeholder="VD: 51G-12345 hoặc QR-..."
                  className="pl-9"
                />
              </div>
            </Field>

            <div className="grid gap-1.5">
              <span className="text-sm font-medium text-slate-700">Khoảng ngày</span>
              <DateRangePicker
                value={{ from, to }}
                onChange={(next) => { setFrom(next.from); setTo(next.to); setPage(0); }}
              />
            </div>

            <Field label="Trạng thái">
              <Select value={status} onChange={(event) => { setStatus(event.target.value as SessionStatusFilter); setPage(0); }}>
                {SESSION_STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </Select>
            </Field>

            <Button variant="secondary" onClick={() => void loadSessions()} disabled={loading || invalidRange}>
              <RefreshCw size={16} />
              Làm mới
            </Button>
          </div>

          {invalidRange && (
            <p className="text-xs text-red-600">"Đến ngày" phải sau "Từ ngày".</p>
          )}

          <div className="grid gap-3 md:grid-cols-2">
            <SessionMetric label="Tổng kết quả" value={String(totalElements)} />
            <SessionMetric label="Đang active" value={String(activeCount)} />
          </div>

          {error && (
            <div role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <p className="text-sm text-slate-500">Đang tải danh sách session...</p>
          ) : sessions.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 py-10 text-center text-sm text-slate-500">
              Không tìm thấy parking session phù hợp với điều kiện hiện tại.
            </div>
          ) : (
            <>
              <DataTable
                data={sessions}
                columns={columns}
                showSearch={false}
              />
              {totalPages > 1 && (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-slate-500">Trang {page + 1} / {totalPages}</p>
                  <div className="flex gap-2">
                    <Button variant="secondary" disabled={page === 0 || loading} onClick={() => setPage((current) => Math.max(0, current - 1))}>Trang trước</Button>
                    <Button variant="secondary" disabled={page >= totalPages - 1 || loading} onClick={() => setPage((current) => current + 1)}>Trang sau</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

    </>
  );
}

function SessionMetric({ label, value, tone = "default" }: { label: string; value: string; tone?: "default" | "success" | "warning" }) {
  const toneClass = {
    default: "bg-slate-50 text-slate-900",
    success: "bg-emerald-50 text-emerald-800",
    warning: "bg-amber-50 text-amber-800"
  }[tone];

  return (
    <div className={`rounded-md p-3 ${toneClass}`}>
      <p className="text-sm font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}

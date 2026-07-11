import { useQuery } from "@tanstack/react-query";
import { auditApi, type AuditLog, type AuditLogQuery } from "@/api/auditApi";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { DataTable } from "@/components/tables/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getApiErrorMessage } from "@/utils/apiError";
import { dateTime } from "@/utils/format";

const RESOURCE_LABELS: Record<string, string> = {
  SESSION: "Phiên gửi xe",
  USER: "Người dùng",
  BUILDING: "Tòa nhà",
  FLOOR: "Tầng",
  SLOT: "Vị trí đỗ",
  VEHICLE: "Phương tiện",
  VEHICLE_TYPE: "Loại xe",
  PRICING: "Bảng giá",
  RESERVATION: "Đặt chỗ",
  PAYMENT: "Thanh toán",
  INCIDENT: "Sự cố",
  FEEDBACK: "Phản hồi",
  SETTINGS: "Cài đặt",
  ROLE: "Phân quyền"
};

const PAGE_SIZE = 20;

export function AuditLogsPage() {
  const [query, setQuery] = useState<AuditLogQuery>({ page: 0, size: PAGE_SIZE });

  const { data: result, error, isError, isLoading, refetch } = useQuery({
    queryKey: ["audit-logs", query],
    queryFn: () => auditApi.getAll(query)
  });

  const logs = result?.data ?? [];
  const total = result?.total ?? 0;
  const page = result?.page ?? 0;
  const totalPages = result?.totalPages ?? 0;

  const resourceOptions = useMemo(() => {
    const resources = new Set(logs.map((log) => log.resource));
    return Array.from(resources).sort();
  }, [logs]);

  const columns = useMemo<ColumnDef<AuditLog>[]>(() => [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "action", header: "Hành động", cell: ({ row }) => <Badge value={row.original.action} /> },
    {
      accessorKey: "resource",
      header: "Resource",
      cell: ({ row }) => RESOURCE_LABELS[row.original.resource] || row.original.resource
    },
    { accessorKey: "resourceId", header: "Resource ID" },
    { accessorKey: "actorUsername", header: "Người thực hiện" },
    {
      accessorKey: "createdAt",
      header: "Thời gian",
      cell: ({ row }) => dateTime(row.original.createdAt)
    }
  ], []);

  const setResourceFilter = (resource: string) => {
    setQuery((prev) => ({ ...prev, resource: resource || undefined, page: 0 }));
  };

  const goToPage = (newPage: number) => {
    setQuery((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <>
      <PageHeader title="Nhật ký hệ thống" description="Xem lịch sử thao tác trên hệ thống." />
      <Card>
        <CardHeader
          title={isLoading ? "Đang tải..." : `${total} bản ghi`}
          action={
            <select
              value={query.resource ?? ""}
              onChange={(e) => setResourceFilter(e.target.value)}
              className="h-9 rounded-md border border-border bg-white px-3 text-sm outline-none focus:border-primary"
            >
              <option value="">Tất cả</option>
              {resourceOptions.map((r) => (
                <option key={r} value={r}>{RESOURCE_LABELS[r] || r}</option>
              ))}
            </select>
          }
        />
        <CardContent>
          {isError ? (
            <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p>{getApiErrorMessage(error, "Không thể tải nhật ký.")}</p>
              <button onClick={() => refetch()} className="mt-2 font-semibold underline">Thử lại</button>
            </div>
          ) : (
            <div className="grid gap-4">
              <DataTable data={logs} columns={columns} />
              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <p className="text-sm text-slate-500">
                    Trang {page + 1}/{totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="secondary" className="h-9" disabled={page <= 0} onClick={() => goToPage(page - 1)}>
                      <ChevronLeft size={16} /> Trước
                    </Button>
                    <Button variant="secondary" className="h-9" disabled={page >= totalPages - 1} onClick={() => goToPage(page + 1)}>
                      Sau <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable } from "@/components/tables/DataTable";
import { ExceptionModal } from "@/modules/sessions/ExceptionModals";
import { useResources } from "@/hooks/useResources";
import { currency, dateTime } from "@/utils/format";
import type { ExceptionType, ParkingSession } from "@/types/domain";

const columns: ColumnDef<ParkingSession>[] = [
  { accessorKey: "ticketCode", header: "Mã vé" },
  { accessorKey: "plateNumber", header: "Biển số" },
  { accessorKey: "entryGate", header: "Cổng vào" },
  { accessorKey: "checkInAt", header: "Giờ vào", cell: ({ row }) => dateTime(row.original.checkInAt) },
  { accessorKey: "fee", header: "Phí", cell: ({ row }) => currency(row.original.fee) },
  { accessorKey: "status", header: "Trạng thái", cell: ({ row }) => <Badge value={row.original.status} /> }
];

export function SessionsPage() {
  const { data = [] } = useResources<ParkingSession>("sessions");
  const [exception, setException] = useState<ExceptionType | null>(null);
  return (
    <>
      <PageHeader title="Quản lý Parking Session" description="Theo dõi lượt gửi xe ACTIVE, COMPLETED, UNPAID, LOST_TICKET và EXPIRED." />
      <Card>
        <CardHeader title="Danh sách session" action={<Button variant="secondary" onClick={() => setException("LOST_TICKET")}><AlertTriangle size={17} /> Xử lý ngoại lệ</Button>} />
        <CardContent><DataTable data={data} columns={columns} /></CardContent>
      </Card>
      <div className="mt-6 grid gap-3 md:grid-cols-5">
        {(["LOST_TICKET", "WRONG_PLATE", "WRONG_ZONE", "OVERTIME", "UNPAID"] as ExceptionType[]).map((type) => (
          <Button key={type} variant="secondary" onClick={() => setException(type)}>{type}</Button>
        ))}
      </div>
      <ExceptionModal type={exception} onClose={() => setException(null)} />
    </>
  );
}

import { useMemo } from "react";
import type { ReactNode } from "react";
import dayjs from "dayjs";
import { useQuery } from "@tanstack/react-query";
import { Map, Navigation, Car, AlertCircle } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { floorApi } from "@/api/floorApi";
import { slotApi } from "@/api/slotApi";
import { vehicleTypeApi } from "@/api/vehicleTypeApi";
import { sessionApi } from "@/api/sessionApi";
import { feeApi } from "@/api/feeApi";
import { currency, dateTime } from "@/utils/format";
import type { ParkingSession } from "@/types/domain";

export function CurrentSessionPage() {
  const { data: floors = [] } = useQuery({ queryKey: ["floors"], queryFn: floorApi.getAll });
  const { data: slotRows = [] } = useQuery({ queryKey: ["slots"], queryFn: slotApi.getAll });
  const { data: vehicleTypes = [] } = useQuery({ queryKey: ["vehicleTypes"], queryFn: () => vehicleTypeApi.getAll() });
  const { data: sessionList, isLoading } = useQuery({ 
    queryKey: ["current-session"], 
    queryFn: () => sessionApi.list({ status: "ACTIVE" }) 
  });

  const session = sessionList?.content?.[0] || null;
  const { data: feePreview } = useQuery({
    queryKey: ["current-session-fee", session?.id],
    enabled: Boolean(session),
    queryFn: () => feeApi.preview(session?.ticketCode || session?.plateNumber || "")
  });

  if (isLoading) {
    return <PageHeader title="Lượt gửi xe hiện tại" description="Đang tải thông tin lượt gửi xe." />;
  }

  if (!session) {
    return (
      <>
        <PageHeader title="Lượt gửi xe hiện tại" description="Theo dõi giờ vào, vị trí gửi và phí tạm tính." />
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Car size={32} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">Không có lượt gửi xe nào đang hoạt động</h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Bạn hiện không có xe nào đang được gửi trong bãi. Thông tin lượt gửi sẽ tự động xuất hiện tại đây sau khi bạn check-in thành công.
            </p>
          </CardContent>
        </Card>
      </>
    );
  }

  const slot = slotRows.find((item) => String(item.id) === String(session.slotId));
  const floor = floors.find((item) => String(item.id) === String(slot?.floorId));
  const vehicle = vehicleTypes.find((item) => String(item.id) === String(session.vehicleTypeId));
  const hours = feePreview?.hours ?? Math.max(1, dayjs().diff(dayjs(session.checkInAt), "hour", true));
  const estimatedFee = feePreview?.totalFee ?? session.fee ?? 0;

  return (
    <>
      <PageHeader title="Lượt gửi xe hiện tại" description="Theo dõi giờ vào, vị trí gửi và phí tạm tính." />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardContent>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Mã lượt gửi</p>
                <h2 className="mt-1 font-mono text-xl font-semibold text-slate-950">{session.ticketCode || "N/A"}</h2>
              </div>
              <Badge value={session.status} />
            </div>

            <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Info label="Biển số" value={session.plateNumber} mono />
              <Info label="Loại xe" value={vehicle?.name ?? session.vehicleTypeId} />
              <Info label="Giờ vào" value={dateTime(session.checkInAt)} />
              <Info label="Khu vực" value={floor ? `${floor.name} - ${floor.zone}` : "Đang cập nhật"} />
              <Info label="Slot" value={slot?.code ?? session.slotId} />
              <Info label="Thời gian" value={`${hours.toFixed(1)} giờ`} />
            </div>

            <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-slate-700">Phí tạm tính</span>
                <span className="text-2xl font-semibold text-blue-700">{currency(estimatedFee)}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">Phí cuối cùng được xác nhận khi xe ra bãi.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader title="Hướng dẫn tìm xe" />
          <CardContent className="grid gap-4 text-sm">
            <Guide icon={<Map size={16} />} title={floor ? `Đi đến ${floor.name}` : "Đi đến khu vực gửi xe"} description={floor?.zone ?? "Theo biển chỉ dẫn trong bãi"} />
            <Guide icon={<Navigation size={16} />} title={`Slot ${slot?.code ?? session.slotId}`} description="Kiểm tra đúng biển số trước khi lấy xe." />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className={`mt-1 text-sm font-semibold text-slate-900 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function Guide({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-blue-50 text-blue-700">{icon}</div>
      <div>
        <p className="font-medium text-slate-800">{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import dayjs from "dayjs";
import { Map, Navigation } from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { floors, slots, vehicleTypes } from "@/api/mockData";
import { getCurrentUserSession } from "@/services/mockRepository";
import { currency, dateTime } from "@/utils/format";
import type { ParkingSession } from "@/types/domain";

export function CurrentSessionPage() {
  const [session, setSession] = useState<ParkingSession | null>(null);

  useEffect(() => {
    getCurrentUserSession().then(setSession);
  }, []);

  if (!session) {
    return <PageHeader title="Lượt gửi xe hiện tại" description="Đang tải thông tin lượt gửi xe." />;
  }

  const slot = slots.find((item) => item.id === session.slotId);
  const floor = floors.find((item) => item.id === slot?.floorId);
  const vehicle = vehicleTypes.find((item) => item.id === session.vehicleTypeId);
  const hours = Math.max(1, dayjs().diff(dayjs(session.checkInAt), "hour", true));
  const estimatedFee = session.fee || Math.ceil(hours) * 3000 + 5000;

  return (
    <>
      <PageHeader title="Lượt gửi xe hiện tại" description="Theo dõi giờ vào, vị trí gửi và phí tạm tính." />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <CardContent>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Mã lượt gửi</p>
                <h2 className="mt-1 font-mono text-xl font-semibold text-slate-950">{session.ticketCode}</h2>
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

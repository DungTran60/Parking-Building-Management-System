import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import { useQuery } from "@tanstack/react-query";
import {
  Map, Navigation, Car, AlertCircle,
  Search, Clock, QrCode, RefreshCw
} from "lucide-react";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/forms/FormField";
import { floorApi } from "@/api/floorApi";
import { slotApi } from "@/api/slotApi";
import { vehicleTypeApi } from "@/api/vehicleTypeApi";
import { sessionApi } from "@/api/sessionApi";
import { getApiErrorMessage } from "@/utils/apiError";
import { currency, dateTime } from "@/utils/format";
import type { ParkingSession } from "@/types/domain";

dayjs.extend(duration);

/* ─────────────────────────────────────────────────────────────
   Page component
───────────────────────────────────────────────────────────── */
export function CurrentSessionPage() {
  const [searchInput, setSearchInput] = useState("");
  const [plateSearch, setPlateSearch] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);

  // Cập nhật thời gian thực mỗi 30 giây để đồng hồ đếm thời gian gửi xe cập nhật
  const [now, setNow] = useState(dayjs());
  useEffect(() => {
    const t = setInterval(() => setNow(dayjs()), 30_000);
    return () => clearInterval(t);
  }, []);

  // Dữ liệu phụ trợ
  const { data: floors = [] } = useQuery({ queryKey: ["floors"], queryFn: floorApi.getAll });
  const { data: slotRows = [] } = useQuery({ queryKey: ["slots"], queryFn: slotApi.getAll });
  const { data: vehicleTypes = [] } = useQuery({
    queryKey: ["vehicleTypes"],
    queryFn: () => vehicleTypeApi.getAll()
  });

  // Session gắn với tài khoản (qua reservation)
  const {
    data: mySessions = [],
    isLoading: myLoading,
    isError: myError,
    refetch: refetchMy
  } = useQuery({
    queryKey: ["my-sessions-active"],
    queryFn: () => sessionApi.getMySessions("ACTIVE"),
    refetchInterval: 60_000
  });

  // Session tìm theo biển số (walk-in)
  const {
    data: plateSessions = [],
    isLoading: plateLoading,
    isError: plateError,
    error: plateRawError,
    refetch: refetchPlate
  } = useQuery({
    queryKey: ["sessions-by-plate", plateSearch],
    queryFn: () => sessionApi.findByPlate(plateSearch),
    enabled: Boolean(plateSearch),
    retry: false
  });

  // Hiển thị lỗi tìm theo biển số
  useEffect(() => {
    if (plateError && plateSearch) {
      setSearchError(
        getApiErrorMessage(plateRawError, `Không tìm thấy xe với biển số "${plateSearch}".`)
      );
    }
  }, [plateError, plateRawError, plateSearch]);

  // Gộp 2 danh sách, loại trùng theo id
  const allSessions: ParkingSession[] = [
    ...mySessions,
    ...plateSessions.filter((ps) => !mySessions.some((ms) => ms.id === ps.id))
  ];

  const isLoading = myLoading || (plateLoading && Boolean(plateSearch));

  const handleSearch = () => {
    const plate = searchInput.trim().toUpperCase();
    if (!plate) { setSearchError("Vui lòng nhập biển số xe."); return; }
    setSearchError(null);
    setPlateSearch(plate);
  };

  const handleClear = () => {
    setPlateSearch("");
    setSearchInput("");
    setSearchError(null);
  };

  const handleRefresh = () => {
    refetchMy();
    if (plateSearch) refetchPlate();
  };

  return (
    <>
      <PageHeader
        title="Xe đang gửi"
        description="Theo dõi giờ vào, vị trí gửi và phí tạm tính."
      />

      {/* Thanh tra cứu biển số */}
      <Card className="mb-6">
        <CardContent className="pt-4">
          <p className="mb-2 text-sm font-medium text-slate-700">
            Tra cứu theo biển số
            <span className="ml-2 text-xs font-normal text-slate-400">
              (dành cho xe check-in tại quầy chưa liên kết tài khoản)
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="VD: 51G-12345"
              className="font-mono uppercase max-w-xs"
            />
            <Button onClick={handleSearch} disabled={isLoading}>
              <Search size={16} />
              Tìm xe
            </Button>
            {plateSearch && (
              <Button variant="secondary" onClick={handleClear}>
                Xóa
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={handleRefresh}
              disabled={isLoading}
              title="Làm mới"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </Button>
          </div>
          {searchError && (
            <p className="mt-2 text-sm text-red-600">{searchError}</p>
          )}
        </CardContent>
      </Card>

      {/* Loading */}
      {isLoading && (
        <Card>
          <CardContent className="flex items-center justify-center py-16 text-sm text-slate-500">
            <RefreshCw size={20} className="mr-2 animate-spin" />
            Đang tải thông tin lượt gửi xe...
          </CardContent>
        </Card>
      )}

      {/* Lỗi hệ thống */}
      {!isLoading && myError && (
        <Card className="mb-4">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center text-sm text-red-600">
            <AlertCircle size={28} className="mb-2" />
            Không thể tải thông tin. Vui lòng thử lại sau.
          </CardContent>
        </Card>
      )}

      {/* Trạng thái trống */}
      {!isLoading && !myError && allSessions.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Car size={32} />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">
              Không có lượt gửi xe nào đang hoạt động
            </h3>
            <p className="mt-2 max-w-sm text-sm text-slate-500">
              Bạn hiện không có xe nào đang được gửi trong bãi.
              Thông tin lượt gửi sẽ tự động xuất hiện sau khi check-in thành công.
              Nếu đã check-in tại quầy, hãy tra cứu theo biển số ở trên.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Danh sách session */}
      {!isLoading &&
        allSessions.map((session) => (
          <SessionCard
            key={session.id}
            session={session}
            floors={floors}
            slotRows={slotRows}
            vehicleTypes={vehicleTypes}
            now={now}
          />
        ))}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   SessionCard — hiển thị 1 session đang ACTIVE
───────────────────────────────────────────────────────────── */
function SessionCard({
  session,
  floors,
  slotRows,
  vehicleTypes,
  now,
}: {
  session: ParkingSession;
  floors: { id: string; name: string; zone: string }[];
  slotRows: { id: string | number; code: string; floorId: string | number }[];
  vehicleTypes: { id: string; name: string }[];
  now: dayjs.Dayjs;
}) {
  // Resolve thông tin liên quan
  const slot = slotRows.find((s) => String(s.id) === String(session.slotId));
  const floorId = slot?.floorId ?? session.floorId;
  const floor = floors.find((f) => String(f.id) === String(floorId));
  const vehicle = vehicleTypes.find((v) => String(v.id) === String(session.vehicleTypeId));

  // Thời gian gửi xe
  const checkIn = dayjs(session.checkInAt);
  const dur = dayjs.duration(now.diff(checkIn));
  const durationText =
    dur.asHours() >= 1
      ? `${Math.floor(dur.asHours())} giờ ${dur.minutes()} phút`
      : `${dur.minutes()} phút`;

  // Phí tạm tính — dùng /api/fee/preview với ticketCode hoặc plateNumber
  const feeQuery = session.ticketCode || session.plateNumber;
  const { data: feeData } = useQuery({
    queryKey: ["fee-preview", feeQuery, now.minute()], // refetch mỗi phút
    queryFn: () => sessionApi.previewFee(feeQuery),
    enabled: Boolean(feeQuery),
    staleTime: 25_000,
    retry: false,
  });

  const estimatedFee = feeData?.totalFee ?? session.fee ?? 0;
  const displayHours = feeData?.hours ?? Math.max(1, dur.asHours());

  const slotCode = session.slotCode ?? slot?.code ?? `#${session.slotId}`;
  const floorLabel = floor
    ? `Tầng ${floor.name}${floor.zone ? ` – ${floor.zone}` : ""}`
    : session.floorName ?? "Đang cập nhật";

  return (
    <div className="mb-6 grid gap-6 xl:grid-cols-[1fr_340px]">
      {/* Card chính */}
      <Card>
        <CardContent className="pt-5">
          {/* Header */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Mã lượt gửi
              </p>
              <h2 className="mt-1 font-mono text-xl font-semibold text-slate-950">
                {session.ticketCode || "N/A"}
              </h2>
            </div>
            <Badge value={session.status} />
          </div>

          {/* Thông tin chi tiết */}
          <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <InfoBox label="Biển số" value={session.plateNumber} mono />
            <InfoBox label="Loại xe" value={vehicle?.name ?? session.vehicleTypeId} />
            <InfoBox label="Giờ vào" value={dateTime(session.checkInAt)} />
            <InfoBox label="Khu vực" value={floorLabel} />
            <InfoBox label="Slot" value={slotCode} />
            <InfoBox
              label="Thời gian gửi"
              value={durationText}
              icon={<Clock size={12} />}
            />
          </div>

          {/* Phí tạm tính */}
          <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="font-medium text-slate-700">Phí tạm tính</span>
                <p className="mt-0.5 text-xs text-slate-500">
                  Cập nhật mỗi 30 giây · {displayHours.toFixed(1)} giờ
                </p>
              </div>
              <span className="text-2xl font-semibold text-blue-700">
                {currency(estimatedFee)}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Phí cuối cùng được xác nhận khi xe ra bãi.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Panel bên phải */}
      <div className="grid gap-4 content-start">
        {/* Hướng dẫn tìm xe */}
        <Card>
          <CardHeader title="Hướng dẫn tìm xe" />
          <CardContent className="grid gap-4 text-sm">
            <GuideItem
              icon={<Map size={16} />}
              title={floor ? `Đi đến tầng ${floor.name}` : "Đi đến khu vực gửi xe"}
              description={floor?.zone ?? "Theo biển chỉ dẫn trong bãi"}
            />
            <GuideItem
              icon={<Navigation size={16} />}
              title={`Tìm slot ${slotCode}`}
              description="Kiểm tra đúng biển số xe trước khi lấy."
            />
          </CardContent>
        </Card>

        {/* Mã vé */}
        <Card>
          <CardHeader title="Mã vé" />
          <CardContent>
            <div className="flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-slate-200 text-slate-500">
                <QrCode size={20} />
              </div>
              <div>
                <p className="font-mono text-sm font-semibold text-slate-900">
                  {session.ticketCode || "N/A"}
                </p>
                <p className="text-xs text-slate-500">Xuất trình khi ra bãi</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Helper components
───────────────────────────────────────────────────────────── */
function InfoBox({
  label,
  value,
  mono,
  icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p
        className={`mt-1 flex items-center gap-1 text-sm font-semibold text-slate-900 ${
          mono ? "font-mono" : ""
        }`}
      >
        {icon}
        {value}
      </p>
    </div>
  );
}

function GuideItem({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-3">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-blue-50 text-blue-700">
        {icon}
      </div>
      <div>
        <p className="font-medium text-slate-800">{title}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/forms/FormField";
import { paymentApi } from "@/api/paymentApi";
import { sessionApi } from "@/api/sessionApi";
import { currency, dateTime } from "@/utils/format";
import { getApiErrorMessage } from "@/utils/apiError";
import type { PaymentMethod, ParkingSession } from "@/types/domain";

const METHOD_LABEL: Record<PaymentMethod, string> = {
  QR_CODE: "Mã QR",
  BANK_CARD: "Thẻ ngân hàng",
  CASH: "Tiền mặt"
};

export function PaymentPage() {
  // Tra cứu theo biển số (walk-in)
  const [plateInput, setPlateInput] = useState("");
  const [plateSearch, setPlateSearch] = useState("");
  const [plateError, setPlateError] = useState<string | null>(null);

  /* ── Lấy session ACTIVE gắn tài khoản ── */
  const { data: mySessions = [], isLoading: myLoading } = useQuery({
    queryKey: ["payment-my-sessions"],
    queryFn: () => sessionApi.getMySessions("ACTIVE"),
    refetchInterval: 30_000
  });

  /* ── Tìm session theo biển số (walk-in) ── */
  const {
    data: plateSessions = [],
    isLoading: plateLoading,
    isError: plateQueryError,
    error: plateRawError
  } = useQuery({
    queryKey: ["payment-sessions-plate", plateSearch],
    queryFn: () => sessionApi.findByPlate(plateSearch),
    enabled: Boolean(plateSearch),
    retry: false
  });

  /* ── Gộp danh sách, ưu tiên session gắn tài khoản ── */
  const allSessions: ParkingSession[] = [
    ...mySessions,
    ...plateSessions.filter((ps) => !mySessions.some((ms) => ms.id === ps.id))
  ];

  // Chọn session đầu tiên để tra cứu
  const session = allSessions[0] ?? null;

  /* ── Phí tạm tính — dùng /api/fee/preview (chính xác, tính từ DB) ── */
  const feeQuery = session?.ticketCode || session?.plateNumber;
  const { data: feeData, isLoading: feeLoading } = useQuery({
    queryKey: ["payment-fee", feeQuery],
    queryFn: () => sessionApi.previewFee(feeQuery!),
    enabled: Boolean(feeQuery),
    refetchInterval: 60_000,
    retry: false
  });
  const totalFee = feeData?.totalFee ?? session?.fee ?? 0;

  /* ── Lịch sử thanh toán ── */
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: paymentApi.getAll
  });

  /* ── Xử lý tra cứu biển số ── */
  const handlePlateSearch = () => {
    const plate = plateInput.trim().toUpperCase();
    if (!plate) { setPlateError("Vui lòng nhập biển số."); return; }
    setPlateError(null);
    setPlateSearch(plate);
  };
  const handlePlateClear = () => { setPlateSearch(""); setPlateInput(""); setPlateError(null); };

  // Hiển thị lỗi tra cứu biển số
  const plateSearchErrorMsg =
    plateQueryError && plateSearch
      ? getApiErrorMessage(plateRawError, `Không tìm thấy xe với biển số "${plateSearch}".`)
      : plateError;

  const isLoading = myLoading || (plateLoading && Boolean(plateSearch));

  return (
    <>
      <PageHeader
        title="Tra cứu thông tin gửi xe"
        description=""
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">

        {/* ── Cột trái ── */}
        <div className="grid gap-4 content-start">

          {/* Tra cứu biển số walk-in */}
          <Card>
            <CardContent className="pt-4">
              <p className="mb-2 text-base font-medium text-slate-700">
                Tìm xe theo biển số
              </p>
              <div className="flex flex-wrap gap-2">
                <Input
                  value={plateInput}
                  onChange={(e) => setPlateInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePlateSearch()}
                  placeholder="VD: 51G-12345"
                  className="font-mono uppercase max-w-xs"
                />
                <Button onClick={handlePlateSearch} disabled={isLoading}>
                  <Search size={16} />
                  Tìm
                </Button>
                {plateSearch && (
                  <Button variant="secondary" onClick={handlePlateClear}>Xóa</Button>
                )}
              </div>
              {plateSearchErrorMsg && <p className="mt-2 text-base text-red-600">{plateSearchErrorMsg}</p>}
              {/* <div role="alert" className="mt-2 text-sm text-slate-500">
                Hãy nhập biển số để tra cứu trong trường hợp gửi vãng lai (không đăng nhập app).
              </div> */}
            </CardContent>
          </Card>

          {/* Chi tiết phí */}
          <Card>
            <CardHeader title="Chi tiết phí tạm tính" />
            <CardContent>
              {isLoading ? (
                <p className="py-6 text-center text-base text-slate-400">Đang tải...</p>
              ) : session ? (
                <>
                  <div className="mb-4 grid gap-2 text-base">
                    <FeeRow label="Mã vé" value={session.ticketCode || "N/A"} mono />
                    <FeeRow label="Biển số" value={session.plateNumber} mono />
                    {session.slotCode && <FeeRow label="Slot" value={session.slotCode} />}
                    <FeeRow label="Giờ vào" value={new Date(session.checkInAt).toLocaleString("vi-VN")} />
                    <FeeRow
                      label={`Thời gian gửi`}
                      value={feeData ? `${feeData.hours.toFixed(1)} giờ` : "Đang tính..."}
                    />
                  </div>
                  <div className="border-t border-border pt-3">
                    <div className="flex items-center justify-between rounded-md bg-blue-50 p-4">
                      <span className="font-medium text-slate-700">Phí tính đến hiện tại</span>
                      <span className="text-2xl font-semibold text-blue-700">
                        {feeLoading ? "..." : currency(totalFee)}
                      </span>
                    </div>
                    <div role="alert" className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                      Đây là phí tạm tính dựa trên thời gian gửi xe. Quý khách vui lòng thanh toán trực tiếp tại quầy cho nhân viên.
                    </div>
                  </div>
                </>
              ) : (
                <p className="py-8 text-center text-base text-slate-500">
                  Không có phiên gửi xe nào đang hoạt động.
                  {!plateSearch && " Hãy tra cứu theo biển số để xem chi tiết."}
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Cột phải: Lịch sử ── */}
        <Card className="h-fit">
          <CardHeader title="Lịch sử giao dịch" />
          <CardContent className="grid gap-3">
            {paymentsLoading && <p className="text-base text-slate-400">Đang tải...</p>}
            {!paymentsLoading && payments.length === 0 && (
              <p className="text-base text-slate-500">Không có giao dịch nào.</p>
            )}
            {payments.map((payment) => (
              <div key={payment.id} className="rounded-md border border-slate-100 bg-slate-50 p-3 text-base">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-base font-semibold text-slate-800 truncate max-w-[140px]">
                    {payment.sessionId}
                  </span>
                  <span className="shrink-0 text-base font-medium text-emerald-600">Đã trả</span>
                </div>
                {payment.plateNumber && (
                  <p className="mt-0.5 font-mono text-base text-slate-500">{payment.plateNumber}</p>
                )}
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-base text-slate-500">{dateTime(payment.paidAt)}</span>
                  <span className="font-semibold text-slate-800">{currency(payment.amount)}</span>
                </div>
                <p className="mt-0.5 text-base text-slate-400">{METHOD_LABEL[payment.method] ?? payment.method}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

/* ─── Helper ─── */
function FeeRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 text-slate-600">
      <span className="text-slate-500">{label}</span>
      <span className={`font-medium text-slate-900 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

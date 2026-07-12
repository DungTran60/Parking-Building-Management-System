import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Search, CheckCircle } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/forms/FormField";
import { paymentApi } from "@/api/paymentApi";
import { sessionApi } from "@/api/sessionApi";
import { currency, dateTime } from "@/utils/format";
import { getApiErrorMessage } from "@/utils/apiError";
import type { PaymentMethod, ParkingSession } from "@/types/domain";

/* ─── Phương thức thanh toán ─── */
const METHODS: { label: string; value: PaymentMethod }[] = [
  { label: "Mã QR", value: "QR_CODE" },
  { label: "Thẻ ngân hàng", value: "BANK_CARD" },
  { label: "Tiền mặt", value: "CASH" }
];

const METHOD_LABEL: Record<PaymentMethod, string> = {
  QR_CODE: "Mã QR",
  BANK_CARD: "Thẻ ngân hàng",
  CASH: "Tiền mặt"
};

/* ─────────────────────────────────────────────────────────────
   Page
───────────────────────────────────────────────────────────── */
export function PaymentPage() {
  const queryClient = useQueryClient();
  const [method, setMethod] = useState<PaymentMethod>("QR_CODE");
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

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

  // Chọn session đầu tiên để thanh toán
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

  /* ── Mutation thanh toán ── */
  const submitMutation = useMutation({
    mutationFn: (payMethod: PaymentMethod) => {
      if (!session) throw new Error("Không tìm thấy lượt gửi xe.");
      return paymentApi.create({ sessionId: String(session.id), method: payMethod });
    },
    onSuccess: () => {
      setSuccess(true);
      setFormError(null);
      setPlateSearch("");
      setPlateInput("");
      queryClient.invalidateQueries({ queryKey: ["payment-my-sessions"] });
      queryClient.invalidateQueries({ queryKey: ["payment-sessions-plate"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["my-sessions-active"] });
      queryClient.invalidateQueries({ queryKey: ["slots"] });
    },
    onError: (error) => {
      setFormError(getApiErrorMessage(error, "Không thể thanh toán. Vui lòng thử lại."));
      setSuccess(false);
    }
  });

  const submit = () => {
    if (!session) { setFormError("Không tìm thấy lượt gửi xe."); return; }
    setFormError(null);
    setSuccess(false);
    submitMutation.mutate(method);
  };

  const isLoading = myLoading || (plateLoading && Boolean(plateSearch));

  return (
    <>
      <PageHeader
        title="Thanh toán phí gửi xe"
        description="Thanh toán phí gửi xe và dịch vụ bổ sung nếu có."
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">

        {/* ── Cột trái ── */}
        <div className="grid gap-4 content-start">

          {/* Tra cứu biển số walk-in */}
          <Card>
            <CardContent className="pt-4">
              <p className="mb-2 text-sm font-medium text-slate-700">
                Tìm xe theo biển số
                <span className="ml-2 text-xs font-normal text-slate-400">
                  (xe check-in tại quầy chưa liên kết tài khoản)
                </span>
              </p>
              <div className="flex flex-wrap gap-2">
                <Input
                  value={plateInput}
                  onChange={(e) => setPlateInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePlateSearch()}
                  placeholder="VD: 51G-12345"
                  className="font-mono uppercase max-w-xs"
                  disabled={submitMutation.isPending}
                />
                <Button onClick={handlePlateSearch} disabled={isLoading || submitMutation.isPending}>
                  <Search size={16} />
                  Tìm
                </Button>
                {plateSearch && (
                  <Button variant="secondary" onClick={handlePlateClear}>Xóa</Button>
                )}
              </div>
              {plateSearchErrorMsg && <p className="mt-2 text-sm text-red-600">{plateSearchErrorMsg}</p>}</CardContent>
          </Card>

          {/* Chi tiết phí */}
          <Card>
            <CardHeader title="Chi tiết phí" />
            <CardContent>
              {isLoading ? (
                <p className="py-6 text-center text-sm text-slate-400">Đang tải...</p>
              ) : session ? (
                <>
                  <div className="mb-4 grid gap-2 text-sm">
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
                      <span className="font-medium text-slate-700">Tổng thanh toán</span>
                      <span className="text-2xl font-semibold text-blue-700">
                        {feeLoading ? "..." : currency(totalFee)}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      Phí tính đến thời điểm hiện tại. Sẽ được xác nhận khi thanh toán.
                    </p>
                  </div>
                </>
              ) : (
                <p className="py-8 text-center text-sm text-slate-500">
                  Không có phiên gửi xe nào đang hoạt động.
                  {!plateSearch && " Hãy tra cứu theo biển số nếu xe đã check-in tại quầy."}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Phương thức thanh toán */}
          <Card>
            <CardHeader title="Phương thức thanh toán" />
            <CardContent>
              <div className="mb-4 grid gap-3 md:grid-cols-3">
                {METHODS.map((item) => (
                  <label
                    key={item.value}
                    className={`cursor-pointer rounded-md border p-4 text-sm transition-colors ${
                      method === item.value
                        ? "border-blue-400 bg-blue-50 font-medium text-blue-800"
                        : "border-border text-slate-600 hover:bg-slate-50"
                    } ${!session || submitMutation.isPending ? "pointer-events-none opacity-50" : ""}`}
                  >
                    <input
                      type="radio"
                      name="payMethod"
                      value={item.value}
                      checked={method === item.value}
                      onChange={() => setMethod(item.value)}
                      className="mr-2 accent-blue-600"
                      disabled={!session || submitMutation.isPending}
                    />
                    {item.label}
                  </label>
                ))}
              </div>

              {formError && (
                <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {formError}
                </div>
              )}

              {success && (
                <div role="status" className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3 text-sm text-emerald-700">
                  <CheckCircle size={18} className="shrink-0" />
                  <div>
                    <p className="font-semibold">Thanh toán thành công!</p>
                    <p className="text-xs text-emerald-600">Vui lòng đưa xe ra cổng trong 15 phút.</p>
                  </div>
                </div>
              )}

              <Button
                className="h-12 w-full"
                onClick={submit}
                disabled={!session || submitMutation.isPending}
              >
                <BadgeCheck size={20} />
                {submitMutation.isPending ? "Đang xử lý..." : "Thanh toán ngay"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* ── Cột phải: Lịch sử ── */}
        <Card className="h-fit">
          <CardHeader title="Lịch sử gần đây" />
          <CardContent className="grid gap-3">
            {paymentsLoading && <p className="text-sm text-slate-400">Đang tải...</p>}
            {!paymentsLoading && payments.length === 0 && (
              <p className="text-sm text-slate-500">Không có giao dịch nào.</p>
            )}
            {payments.map((payment) => (
              <div key={payment.id} className="rounded-md border border-slate-100 bg-slate-50 p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-800 truncate max-w-[140px]">
                    {payment.sessionId}
                  </span>
                  <span className="shrink-0 text-xs font-medium text-emerald-600">Đã trả</span>
                </div>
                {payment.plateNumber && (
                  <p className="mt-0.5 font-mono text-xs text-slate-500">{payment.plateNumber}</p>
                )}
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500">{dateTime(payment.paidAt)}</span>
                  <span className="font-semibold text-slate-800">{currency(payment.amount)}</span>
                </div>
                <p className="mt-0.5 text-xs text-slate-400">{METHOD_LABEL[payment.method] ?? payment.method}</p>
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

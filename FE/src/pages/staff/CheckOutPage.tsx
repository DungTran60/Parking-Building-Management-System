import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { AlertTriangle, ReceiptText, Search } from "lucide-react";
import { paymentApi } from "@/api/paymentApi";
import { sessionApi } from "@/api/sessionApi";
import { pricingApi } from "@/api/pricingApi";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Modal } from "@/components/common/Modal";
import { PageHeader } from "@/components/layout/PageHeader";
import { Field, Input, Select } from "@/components/forms/FormField";
import type { ExceptionType, ParkingSession, PaymentMethod, PaymentRecord } from "@/types/domain";
import { getApiErrorMessage } from "@/utils/apiError";
import { currency, dateTime } from "@/utils/format";

const PAYMENT_METHODS: { label: string; value: PaymentMethod }[] = [
  { label: "QR Code", value: "QR_CODE" },
  { label: "Thẻ ngân hàng", value: "BANK_CARD" },
  { label: "Tiền mặt", value: "CASH" }
];

const EXCEPTION_TYPES: { label: string; value: ExceptionType }[] = [
  { label: "Mất vé / mã gửi xe", value: "LOST_TICKET" },
  { label: "Sai biển số xe", value: "WRONG_PLATE" },
  { label: "Gửi sai khu vực", value: "WRONG_ZONE" },
  { label: "Quá giờ gửi", value: "OVERTIME" },
  { label: "Chưa thanh toán", value: "UNPAID" }
];

export function CheckOutPage() {
  const [session, setSession] = useState<ParkingSession | null>(null);
  const [payment, setPayment] = useState<PaymentRecord | null>(null);
  const [previewFee, setPreviewFee] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [searchError, setSearchError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isPaying, setIsPaying] = useState(false);

  const [showException, setShowException] = useState(false);
  const [exceptionType, setExceptionType] = useState<ExceptionType>("WRONG_PLATE");
  const [exceptionReason, setExceptionReason] = useState("");
  const [exceptionFee, setExceptionFee] = useState("");
  const [exceptionError, setExceptionError] = useState("");
  const [processingException, setProcessingException] = useState(false);

  const durationHours = useMemo(() => {
    if (!session) return "0.0";
    const endAt = session.checkOutAt ?? new Date().toISOString();
    return Math.max(1, dayjs(endAt).diff(dayjs(session.checkInAt), "hour", true)).toFixed(1);
  }, [session]);

  const displayFee = payment?.amount ?? previewFee ?? session?.fee ?? 0;
  const displayStatus = payment ? "COMPLETED" : session?.status ?? "ACTIVE";

  const loadFeePreview = async (active: ParkingSession) => {
    try {
      const result = await pricingApi.calculateOvernightFee({
        checkIn: dayjs(active.checkInAt).format("YYYY-MM-DDTHH:mm:ss"),
        checkOut: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
        vehicleType: active.vehicleTypeId
      });
      setPreviewFee(result.total);
    } catch {
      setPreviewFee(null);
    }
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get("query")).trim();
    if (!query) return;

    setIsSearching(true);
    setSearchError("");
    setPaymentError("");
    setSession(null);
    setPayment(null);
    setPreviewFee(null);

    try {
      const isTicketCode = /^QR-/i.test(query);
      let found: ParkingSession | null = null;

      if (isTicketCode) {
        const result = await sessionApi.list({
          query,
          status: "ACTIVE",
          page: 0,
          size: 1,
          sort: "checkInAt,desc"
        });
        found = result.content[0] ?? null;
      } else {
        const sessions = await sessionApi.findByPlate(query).catch((err) => {
          if (axios.isAxiosError(err) && err.response?.status === 404) return [] as ParkingSession[];
          throw err;
        });
        found = sessions[0] ?? null;
      }

      if (!found) {
        setSearchError("Không tìm thấy lượt gửi xe đang hoạt động phù hợp.");
        return;
      }

      setSession(found);
      void loadFeePreview(found);
    } catch (error) {
      if (axios.isAxiosError<{ message?: string; error?: string }>(error)) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          setSearchError("Phiên đăng nhập không hợp lệ hoặc bạn không có quyền checkout.");
        } else {
          setSearchError(error.response?.data?.message ?? error.response?.data?.error ?? "Không thể tra cứu phiên gửi xe.");
        }
      } else {
        setSearchError("Đã xảy ra lỗi không xác định. Vui lòng thử lại.");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const confirmPayment = async () => {
    if (!session) return;
    setIsPaying(true);
    setPaymentError("");

    try {
      // Payment service tự tính phí, set checkOutAt, đóng session (COMPLETED) và giải phóng slot.
      const record = await paymentApi.create({
        sessionId: session.id,
        method: paymentMethod
      });
      setPayment(record);
      setSession((prev) => prev ? {
        ...prev,
        status: "COMPLETED",
        checkOutAt: record.paidAt.toString(),
        fee: Number(record.amount)
      } : prev);
    } catch (error) {
      if (axios.isAxiosError<{ message?: string; error?: string }>(error)) {
        setPaymentError(error.response?.data?.message ?? error.response?.data?.error ?? "Không thể xác nhận thanh toán.");
      } else {
        setPaymentError("Đã xảy ra lỗi không xác định khi thanh toán.");
      }
    } finally {
      setIsPaying(false);
    }
  };

  const paymentMethodLabel = (method: string) => PAYMENT_METHODS.find((item) => item.value === method)?.label ?? method;

  const openException = () => {
    setExceptionType("WRONG_PLATE");
    setExceptionReason("");
    setExceptionFee("");
    setExceptionError("");
    setShowException(true);
  };

  const handleExceptionSubmit = async () => {
    if (!session) return;
    setProcessingException(true);
    setExceptionError("");
    try {
      const extra = exceptionFee ? Number(exceptionFee) : 0;
      await sessionApi.handleException(session.id, {
        type: exceptionType,
        reason: exceptionReason.trim() || undefined,
        extraFee: extra || undefined
      });
      if (extra > 0) {
        setPreviewFee((prev) => (prev ?? 0) + extra);
      }
      setShowException(false);
    } catch (error: unknown) {
      setExceptionError(getApiErrorMessage(error, "Không thể xử lý ngoại lệ."));
    } finally {
      setProcessingException(false);
    }
  };

  return (
    <>
      <PageHeader title="Kiểm tra xe ra" description="" />
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader title="Tìm lượt gửi xe" />
          <CardContent>
            <form className="grid gap-4" onSubmit={submit}>
              <Field label="Biển số / mã vé">
                <Input name="query" placeholder="QR-... hoặc 51G-..." required />
              </Field>
              <Button disabled={isSearching}>
                <Search size={17} /> {isSearching ? "Đang kiểm tra..." : "Tra cứu"}
              </Button>
              {searchError && <p role="alert" className="text-sm text-red-600">{searchError}</p>}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Thông tin thanh toán" />
          <CardContent>
            {session ? (
              <div className="grid gap-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <Info label="Biển số" value={session.plateNumber} />
                  <Info label="Mã vé" value={session.ticketCode} />
                  <Info label="Giờ vào" value={dateTime(session.checkInAt)} />
                  <Info label="Giờ ra" value={session.checkOutAt ? dateTime(session.checkOutAt) : "Chưa thanh toán"} />
                  <Info label="Số giờ gửi" value={`${durationHours} giờ`} />
                  <Info label="Phí cần thanh toán" value={currency(displayFee)} strong />
                  <Info label="Trạng thái" value={<Badge value={displayStatus} />} />
                  <Info label="Slot" value={session.slotCode ?? `Slot ${session.slotId}`} />
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                  <Field label="Phương thức thanh toán">
                    <Select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)} disabled={!!payment}>
                      {PAYMENT_METHODS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => void confirmPayment()} disabled={isPaying || !!payment}>
                      <ReceiptText size={17} /> {isPaying ? "Đang xác nhận..." : "Xác nhận thanh toán"}
                    </Button>
                    {!payment && (
                      <Button variant="secondary" onClick={openException}>
                        <AlertTriangle size={17} /> Xử lý ngoại lệ
                      </Button>
                    )}
                  </div>
                </div>

                {paymentError && <p role="alert" className="text-sm text-red-600">{paymentError}</p>}

                {payment && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                    <p className="font-semibold">Thanh toán thành công</p>
                    <p className="mt-1">Mã giao dịch: {payment.id}</p>
                    <p>Phương thức: {paymentMethodLabel(payment.method)}</p>
                    <p>Số tiền: {currency(payment.amount)}</p>
                    <p>Trạng thái phiên gửi xe: Hoàn thành</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Thông tin thanh toán sẽ hiển thị tại đây.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        open={showException}
        title="Xử lý ngoại lệ"
        onClose={() => setShowException(false)}
      >
        <div className="grid gap-4">
          {session && (
            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-600">
              Phiên gửi xe: <span className="font-mono font-medium">{session.ticketCode}</span> · {session.plateNumber}
            </div>
          )}
          <Field label="Loại ngoại lệ">
            <Select value={exceptionType} onChange={(event) => setExceptionType(event.target.value as ExceptionType)} disabled={processingException}>
              {EXCEPTION_TYPES.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Lý do khác">
            <textarea
              value={exceptionReason}
              onChange={(event) => setExceptionReason(event.target.value)}
              rows={3}
              maxLength={1000}
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-blue-100"
              placeholder="Mô tả lý do..."
            />
          </Field>
          <Field label="Phụ phí cộng thêm (VNĐ)">
            <Input
              type="number"
              value={exceptionFee}
              onChange={(event) => setExceptionFee(event.target.value)}
              placeholder="0 nếu không cộng thêm phí"
              disabled={processingException}
            />
          </Field>
          {exceptionError && <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{exceptionError}</div>}
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowException(false)} disabled={processingException}>Hủy</Button>
            <Button onClick={() => void handleExceptionSubmit()} disabled={processingException || (!!exceptionFee && Number.isNaN(Number(exceptionFee)))}>
              {processingException ? "Đang xử lý..." : "Áp dụng ngoại lệ"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function Info({ label, value, strong }: { label: string; value: ReactNode; strong?: boolean }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className={strong ? "mt-1 text-xl font-semibold text-primary" : "mt-1 text-sm text-slate-900"}>{value}</p>
    </div>
  );
}

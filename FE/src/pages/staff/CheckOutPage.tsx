import { useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { Printer, ReceiptText, Search } from "lucide-react";
import { paymentApi } from "@/api/paymentApi";
import { sessionApi } from "@/api/sessionApi";
import { pricingApi } from "@/api/pricingApi";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Field, Input, Select } from "@/components/forms/FormField";
import type { ParkingSession, PaymentMethod, PaymentRecord } from "@/types/domain";
import { currency, dateTime } from "@/utils/format";

const PAYMENT_METHODS: { label: string; value: PaymentMethod }[] = [
  { label: "QR Code", value: "QR_CODE" },
  { label: "Thẻ ngân hàng", value: "BANK_CARD" },
  { label: "Tiền mặt", value: "CASH" }
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
      const result = await sessionApi.list({
        query,
        status: "ACTIVE",
        page: 0,
        size: 1,
        sort: "checkInAt,desc"
      });

      const found = result.content[0] ?? null;
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
      // Gọi check-out trước để tính phí và cập nhật thời gian ra
      await sessionApi.checkOut(session.ticketCode || session.plateNumber);

      // Sau đó tạo payment (BE sẽ đóng session và giải phóng slot)
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

  const printInvoice = () => window.print();

  return (
    <>
      <PageHeader title="Parking Check-Out" description="Tìm theo biển số hoặc mã vé, xác nhận thanh toán và in hóa đơn." />
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
                  <Info label="Trạng thái" value={displayStatus} />
                  <Info label="Slot" value={session.slotCode ?? `Slot ${session.slotId}`} />
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                  <Field label="Phương thức thanh toán">
                    <Select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
                      {PAYMENT_METHODS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => void confirmPayment()} disabled={isPaying}>
                      <ReceiptText size={17} /> {isPaying ? "Đang xác nhận..." : "Xác nhận thanh toán"}
                    </Button>
                    <Button variant="secondary" onClick={printInvoice}>
                      <Printer size={17} /> In hóa đơn
                    </Button>
                  </div>
                </div>

                {paymentError && <p role="alert" className="text-sm text-red-600">{paymentError}</p>}

                {payment && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                    <p className="font-semibold">Thanh toán thành công</p>
                    <p className="mt-1">Mã giao dịch: {payment.id}</p>
                    <p>Phương thức: {payment.method}</p>
                    <p>Số tiền: {currency(payment.amount)}</p>
                    <p>Trạng thái session: COMPLETED</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Kết quả checkout sẽ hiển thị tại đây.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Info({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className={strong ? "mt-1 text-xl font-semibold text-primary" : "mt-1 text-sm text-slate-900"}>{value}</p>
    </div>
  );
}

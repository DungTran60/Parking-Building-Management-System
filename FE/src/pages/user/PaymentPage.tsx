import { useEffect, useState } from "react";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { getCurrentUserSession, getUserPayments, payCurrentSession } from "@/api/payentApi";
import { currency, dateTime } from "@/utils/format";
import type { ParkingSession, PaymentMethod, PaymentRecord } from "@/types/domain";

const methods: { label: string; value: PaymentMethod }[] = [
  { label: "QR Code", value: "QR_CODE" },
  { label: "Thẻ ngân hàng", value: "BANK_CARD" },
  { label: "Tiền mặt", value: "CASH" }
];

export function PaymentPage() {
  const [session, setSession] = useState<ParkingSession | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [method, setMethod] = useState<PaymentMethod>("QR_CODE");
  const [success, setSuccess] = useState(false);

  const load = async () => {
    setSession(await getCurrentUserSession());
    setPayments(await getUserPayments());
  };

  useEffect(() => {
    load();
  }, []);

  const total = session?.fee || 18000;
  const submit = async () => {
    await payCurrentSession(method);
    setSuccess(true);
    await load();
  };

  return (
    <>
      <PageHeader title="Thanh toán phí gửi xe" description="Thanh toán phí gửi xe và dịch vụ bổ sung nếu có." />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          <Card>
            <CardHeader title="Chi tiết phí" />
            <CardContent>
              <div className="mb-4 grid gap-2 border-b border-border pb-4 text-sm">
                <Line label="Giờ đầu" value={currency(5000)} />
                <Line label="4 giờ tiếp theo x 3,000đ" value={currency(12000)} />
                <Line label="20 phút lẻ" value={currency(1000)} />
                <Line label="Sạc xe điện / rửa xe" value={currency(0)} />
              </div>
              <div className="flex items-center justify-between rounded-md bg-blue-50 p-4 font-semibold">
                <span>Tổng thanh toán</span>
                <span className="text-xl text-blue-700">{currency(total)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Phương thức thanh toán" />
            <CardContent>
              <div className="mb-4 grid gap-3 md:grid-cols-3">
                {methods.map((item) => (
                  <label key={item.value} className="cursor-pointer rounded-md border border-border p-4 text-sm has-[:checked]:border-blue-300 has-[:checked]:bg-blue-50">
                    <input type="radio" name="payMethod" value={item.value} checked={method === item.value} onChange={() => setMethod(item.value)} className="mr-2" />
                    {item.label}
                  </label>
                ))}
              </div>
              <Button className="h-12 w-full" onClick={submit}>
                <BadgeCheck size={20} />
                Thanh toán ngay
              </Button>
            </CardContent>
          </Card>

          {success && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-center">
              <p className="font-semibold text-emerald-700">Thanh toán thành công</p>
              <p className="mt-1 text-sm text-emerald-600">Vui lòng đưa xe ra cổng trong 15 phút.</p>
            </div>
          )}
        </div>

        <Card className="h-fit">
          <CardHeader title="Lịch sử gần đây" />
          <CardContent className="grid gap-3">
            {payments.map((payment) => (
              <div key={payment.id} className="rounded-md bg-slate-50 p-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono">{payment.sessionId}</span>
                  <span className="text-emerald-600">Đã trả</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{dateTime(payment.paidAt)} - {currency(payment.amount)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-3"><span className="text-slate-600">{label}</span><span>{value}</span></div>;
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { paymentApi } from "@/api/paymentApi";
import { sessionApi } from "@/api/sessionApi";
import { currency, dateTime } from "@/utils/format";
import { getApiErrorMessage } from "@/utils/apiError";
import type { PaymentMethod } from "@/types/domain";

const methods: { label: string; value: PaymentMethod }[] = [
  { label: "Mã QR", value: "QR_CODE" },
  { label: "Thẻ ngân hàng", value: "BANK_CARD" },
  { label: "Tiền mặt", value: "CASH" }
];

export function PaymentPage() {
  const queryClient = useQueryClient();
  const [method, setMethod] = useState<PaymentMethod>("QR_CODE");
  const [success, setSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: sessionList, isLoading: sessionLoading } = useQuery({ 
    queryKey: ["current-session"], 
    queryFn: () => sessionApi.list({ status: "ACTIVE" }) 
  });
  const { data: payments = [], isLoading: paymentsLoading } = useQuery({ 
    queryKey: ["payments"], 
    queryFn: paymentApi.getAll 
  });

  const session = sessionList?.content?.[0] || null;
  const total = session?.fee || 18000;

  const submitMutation = useMutation({
    mutationFn: (payMethod: PaymentMethod) => {
      if (!session) throw new Error("Không tìm thấy lượt gửi xe hiện tại.");
      return paymentApi.create({ sessionId: String(session.id), method: payMethod });
    },
    onSuccess: () => {
      setSuccess(true);
      setFormError(null);
      queryClient.invalidateQueries({ queryKey: ["current-session"] });
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
    onError: (error) => {
      setFormError(getApiErrorMessage(error, "Không thể thanh toán. Vui lòng thử lại."));
      setSuccess(false);
    }
  });

  const submit = () => {
    if (!session) {
      setFormError("Không tìm thấy lượt gửi xe hiện tại.");
      return;
    }
    setFormError(null);
    submitMutation.mutate(method);
  };

  if (sessionLoading || paymentsLoading) {
    return <PageHeader title="Thanh toán phí gửi xe" description="Đang tải dữ liệu..." />;
  }

  return (
    <>
      <PageHeader title="Thanh toán phí gửi xe" description="Thanh toán phí gửi xe và dịch vụ bổ sung nếu có." />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4 content-start">
          <Card>
            <CardHeader title="Chi tiết phí" />
            <CardContent>
              {session ? (
                <>
                  <div className="mb-4 grid gap-2 border-b border-border pb-4 text-sm">
                    <Line label="Giờ đầu" value={currency(5000)} />
                    <Line label="Thời gian tiếp theo" value={currency(total - 5000 > 0 ? total - 5000 : 0)} />
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-blue-50 p-4 font-semibold">
                    <span>Tổng thanh toán</span>
                    <span className="text-xl text-blue-700">{currency(total)}</span>
                  </div>
                </>
              ) : (
                <p className="py-6 text-center text-sm text-slate-500">Giỏ hàng thanh toán trống do không có phiên gửi xe.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Phương thức thanh toán" />
            <CardContent>
              <div className="mb-4 grid gap-3 md:grid-cols-3">
                {methods.map((item) => (
                  <label key={item.value} className={`cursor-pointer rounded-md border p-4 text-sm transition ${method === item.value ? 'border-blue-300 bg-blue-50 text-blue-800 font-medium' : 'border-border hover:bg-slate-50 opacity-60'} ${!session ? 'pointer-events-none opacity-50' : ''}`}>
                    <input type="radio" name="payMethod" value={item.value} checked={method === item.value} onChange={() => setMethod(item.value)} className="mr-2" disabled={!session || submitMutation.isPending} />
                    {item.label}
                  </label>
                ))}
              </div>
              
              {formError && (
                 <div role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                   {formError}
                 </div>
              )}

              <Button className="h-12 w-full" onClick={submit} disabled={!session || submitMutation.isPending}>
                <BadgeCheck size={20} />
                {submitMutation.isPending ? "Đang xử lý..." : "Thanh toán ngay"}
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
            {payments.length === 0 && <p className="text-sm text-slate-500">Không có giao dịch nào.</p>}
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
  return (
    <div className="flex items-center justify-between gap-3 text-slate-600">
      <span>{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

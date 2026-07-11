import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { CreditCard, Info, ReceiptText } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { feeApi } from "@/api/feeApi";
import { sessionApi } from "@/api/sessionApi";
import { paymentApi } from "@/api/paymentApi";
import { currency, dateTime } from "@/utils/format";
import { getApiErrorMessage } from "@/utils/apiError";

export function PaymentPage() {
  const [payError, setPayError] = useState<string | null>(null);
  const [paySuccess, setPaySuccess] = useState(false);

  const { data: sessionList, isLoading: sessionLoading } = useQuery({
    queryKey: ["current-session"],
    queryFn: () => sessionApi.list({ status: "ACTIVE" })
  });

  const session = sessionList?.content?.[0] || null;

  const { data: feePreview, isLoading: feeLoading } = useQuery({
    queryKey: ["current-session-fee", session?.id],
    enabled: Boolean(session),
    queryFn: () => feeApi.preview(session?.ticketCode || session?.plateNumber || "")
  });

  const payMutation = useMutation({
    mutationFn: async () => {
      if (!session) throw new Error("Không có lượt gửi xe nào.");
      await paymentApi.create({
        sessionId: session.id,
        method: "CASH"
      });
    },
    onSuccess: () => {
      setPaySuccess(true);
      setPayError(null);
    },
    onError: (error) => {
      setPayError(getApiErrorMessage(error, "Thanh toán thất bại. Vui lòng thử lại."));
    }
  });

  const total = feePreview?.totalFee ?? session?.fee ?? 0;

  if (sessionLoading) {
    return <PageHeader title="Phí gửi xe" description="Đang tải dữ liệu..." />;
  }

  return (
    <>
      <PageHeader title="Phí gửi xe" description="Xem phí tạm tính và thanh toán trực tuyến." />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4 content-start">
          <Card>
            <CardHeader title="Chi tiết phí" />
            <CardContent>
              {session ? (
                <>
                  <div className="mb-4 grid gap-2 border-b border-border pb-4 text-sm">
                    <Line label="Mã vé" value={session.ticketCode || "—"} />
                    <Line label="Biển số" value={session.plateNumber} />
                    <Line label="Giờ vào" value={dateTime(session.checkInAt)} />
                    <Line label="Số giờ gửi" value={feePreview ? `${feePreview.hours.toFixed(1)} giờ` : "—"} />
                    <Line label="Đơn giá/giờ" value={feePreview ? currency(feePreview.hourlyRate) : "—"} />
                  </div>
                  <div className="flex items-center justify-between rounded-md bg-blue-50 p-4 font-semibold">
                    <span>Tổng phí</span>
                    <span className="text-xl text-blue-700">{feeLoading ? "Đang tính..." : currency(total)}</span>
                  </div>
                </>
              ) : (
                <p className="py-6 text-center text-sm text-slate-500">Bạn hiện không có lượt gửi xe nào đang hoạt động.</p>
              )}
            </CardContent>
          </Card>

          {session && !paySuccess && (
            <Card>
              <CardHeader title="Thanh toán" />
              <CardContent className="grid gap-3">
                <p className="text-sm text-slate-600">Thanh toán phí gửi xe trực tuyến qua cổng thanh toán.</p>
                {payError && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{payError}</div>}
                <Button className="h-12" onClick={() => payMutation.mutate()} disabled={payMutation.isPending}>
                  <CreditCard size={20} />
                  {payMutation.isPending ? "Đang xử lý..." : `Thanh toán ${currency(total)}`}
                </Button>
              </CardContent>
            </Card>
          )}

          {paySuccess && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-center">
              <p className="font-semibold text-emerald-700">Thanh toán thành công!</p>
              <p className="mt-1 text-sm text-emerald-600">Cảm ơn bạn đã thanh toán. Vui lòng xuất trình mã vé tại cổng ra.</p>
            </div>
          )}

          {session && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              <Info size={20} className="mt-0.5 shrink-0" />
              <p>Phí trên là tạm tính đến hiện tại. Phí thực tế có thể thay đổi khi xe ra bãi.</p>
            </div>
          )}
        </div>

        {!paySuccess && (
          <Card className="h-fit">
            <CardHeader title="Hướng dẫn thanh toán" />
            <CardContent className="grid gap-3 text-sm text-slate-600">
              <div className="flex items-start gap-3">
                <ReceiptText size={18} className="mt-0.5 text-primary" />
                <p>Sau khi thanh toán, xuất trình mã vé/QR cho nhân viên tại cổng ra để đối chiếu.</p>
              </div>
              <p className="text-xs text-slate-500">Hỗ trợ tiền mặt, QR và thẻ ngân hàng theo cấu hình của bãi xe.</p>
            </CardContent>
          </Card>
        )}
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

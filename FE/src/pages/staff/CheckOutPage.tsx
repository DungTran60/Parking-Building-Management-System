import { useState } from "react";
import dayjs from "dayjs";
import { Printer, ReceiptText, Search } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Field, Input } from "@/components/forms/FormField";
import { checkOut } from "@/services/mockRepository";
import { currency, dateTime } from "@/utils/format";
import type { ParkingSession } from "@/types/domain";

export function CheckOutPage() {
  const [session, setSession] = useState<ParkingSession | undefined>();
  const [notFound, setNotFound] = useState(false);
  const hours = session ? Math.max(1, dayjs(session.checkOutAt).diff(dayjs(session.checkInAt), "hour", true)).toFixed(1) : "0";

  return (
    <>
      <PageHeader title="Parking Check-Out" description="Tìm theo biển số hoặc mã vé, tính phí tự động, thanh toán và in hóa đơn." />
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader title="Tìm lượt gửi xe" />
          <CardContent>
            <form
              className="grid gap-4"
              onSubmit={async (event) => {
                event.preventDefault();
                const query = String(new FormData(event.currentTarget).get("query"));
                const result = await checkOut(query);
                setSession(result);
                setNotFound(!result);
              }}
            >
              <Field label="Biển số / mã vé"><Input name="query" placeholder="QR-... hoặc 51G-..." required /></Field>
              <Button><Search size={17} /> Kiểm tra phí</Button>
              {notFound && <p className="text-sm text-red-600">Không tìm thấy lượt gửi xe phù hợp.</p>}
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
                  <Info label="Giờ ra" value={dateTime(session.checkOutAt ?? new Date().toISOString())} />
                  <Info label="Số giờ gửi" value={`${hours} giờ`} />
                  <Info label="Phí cần thanh toán" value={currency(session.fee)} strong />
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button><ReceiptText size={17} /> Xác nhận thanh toán</Button>
                  <Button variant="secondary"><Printer size={17} /> In hóa đơn</Button>
                </div>
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

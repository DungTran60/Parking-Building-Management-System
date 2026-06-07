import { Save } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { Field, Input, Select } from "@/components/forms/FormField";

export function SettingsPage() {
  return (
    <>
      <PageHeader title="System Settings" description="Cấu hình bãi xe, thời gian hoạt động và thanh toán." />
      <Card>
        <CardHeader title="Cấu hình hệ thống" />
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2">
            <Field label="Tên hệ thống"><Input defaultValue="Parking Building Management" /></Field>
            <Field label="Giờ mở cửa"><Input type="time" defaultValue="06:00" /></Field>
            <Field label="Giờ đóng cửa"><Input type="time" defaultValue="23:00" /></Field>
            <Field label="Phương thức thanh toán"><Select defaultValue="hybrid"><option value="cash">Tiền mặt</option><option value="cashless">Không tiền mặt</option><option value="hybrid">Kết hợp</option></Select></Field>
            <Field label="Tự động khóa slot quá hạn"><Select defaultValue="yes"><option value="yes">Bật</option><option value="no">Tắt</option></Select></Field>
            <div className="md:col-span-2"><Button type="button"><Save size={17} /> Lưu cấu hình</Button></div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

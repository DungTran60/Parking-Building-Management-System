import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { Field, Input, Select } from "@/components/forms/FormField";
import { EntityManagement } from "@/modules/shared/EntityManagement";
import { calculateFee } from "@/services/mockRepository";
import { currency } from "@/utils/format";
import { vehicleTypes } from "@/api/mockData";
import type { PricingPolicy } from "@/types/domain";

export function PricingPage() {
  const [fee, setFee] = useState<number | null>(null);
  return (
    <div className="grid gap-6">
      <EntityManagement<PricingPolicy>
        title="Bảng giá"
        description="Quản lý chính sách tính phí theo loại xe và các phụ phí ngoại lệ."
        resource="pricingPolicies"
        fields={[
          { key: "vehicleTypeId", label: "Loại xe", type: "select", options: vehicleTypes.map((item) => ({ label: item.name, value: item.id })) },
          { key: "firstHour", label: "Giờ đầu", type: "number" },
          { key: "nextHour", label: "Giờ tiếp theo", type: "number" },
          { key: "dayPrice", label: "Theo ngày", type: "number" },
          { key: "overnightFee", label: "Qua đêm", type: "number" },
          { key: "lostTicketFee", label: "Mất vé", type: "number" },
          { key: "wrongZoneFee", label: "Sai khu vực", type: "number" },
          { key: "overtimeFee", label: "Quá giờ", type: "number" }
        ]}
      />
      <Card>
        <CardHeader title="Mô phỏng tính phí" />
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-4"
            onSubmit={async (event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              setFee(await calculateFee(String(data.get("vehicleTypeId")), Number(data.get("hours")), { lostTicket: data.get("lostTicket") === "on", wrongZone: data.get("wrongZone") === "on", overtime: data.get("overtime") === "on" }));
            }}
          >
            <Field label="Loại xe">
              <Select name="vehicleTypeId">{vehicleTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}</Select>
            </Field>
            <Field label="Số giờ">
              <Input name="hours" type="number" defaultValue={3} min={1} />
            </Field>
            <label className="flex items-center gap-2 text-sm"><input name="lostTicket" type="checkbox" /> Mất vé</label>
            <label className="flex items-center gap-2 text-sm"><input name="wrongZone" type="checkbox" /> Sai khu vực</label>
            <label className="flex items-center gap-2 text-sm"><input name="overtime" type="checkbox" /> Quá giờ</label>
            <Button className="md:col-span-1"><Calculator size={17} /> Tính phí</Button>
            {fee !== null && <div className="rounded-md bg-blue-50 p-3 font-semibold text-blue-700 md:col-span-2">{currency(fee)}</div>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

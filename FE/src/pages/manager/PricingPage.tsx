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
import { httpClient } from "@/api/httpClient";

interface OvernightFeeResponse {
  basePrice: number;
  overnightFee: number;
  numberOfNights: number;
  total: number;
}

export function PricingPage() {
  const [fee, setFee] = useState<number | null>(null);
  const [calcResult, setCalcResult] = useState<OvernightFeeResponse | null>(null);
  const [calcError, setCalcError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
          { key: "overnightFee", label: "Overnight Fee (VND)", type: "number" },
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

      <Card>
        <CardHeader title="Parking Calculator" />
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-4 items-end"
            onSubmit={async (event) => {
              event.preventDefault();
              setCalcError(null);
              setCalcResult(null);
              setLoading(true);
              const data = new FormData(event.currentTarget);
              const checkIn = data.get("checkIn") as string;
              const checkOut = data.get("checkOut") as string;
              const vehicleType = data.get("vehicleType") as string;

              if (!checkIn || !checkOut || !vehicleType) {
                setCalcError("Vui lòng điền đầy đủ thông tin");
                setLoading(false);
                return;
              }

              try {
                const response = await httpClient.get<OvernightFeeResponse>("/pricing/calculate", {
                  params: { checkIn, checkOut, vehicleType }
                });
                setCalcResult(response.data);
              } catch (err: any) {
                const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || "Đã xảy ra lỗi khi tính phí";
                setCalcError(errMsg);
              } finally {
                setLoading(false);
              }
            }}
          >
            <Field label="Check In">
              <Input name="checkIn" type="datetime-local" required />
            </Field>
            <Field label="Check Out">
              <Input name="checkOut" type="datetime-local" required />
            </Field>
            <Field label="Vehicle Type">
              <Select name="vehicleType">
                {vehicleTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Button type="submit" disabled={loading} className="md:col-span-1">
              <Calculator size={17} /> Calculate
            </Button>
            {calcError && (
              <div className="rounded-md bg-red-50 p-3 font-semibold text-red-700 md:col-span-4">
                {calcError}
              </div>
            )}
            {calcResult && (
              <div className="rounded-md bg-blue-50 p-4 text-blue-800 md:col-span-4 grid gap-4 sm:grid-cols-4">
                <div>
                  <div className="text-xs uppercase text-blue-500 font-medium">Base Fee</div>
                  <div className="text-lg font-bold">{currency(calcResult.basePrice)}</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-blue-500 font-medium">Overnight Fee</div>
                  <div className="text-lg font-bold">{currency(calcResult.overnightFee)}</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-blue-500 font-medium">Number Of Nights</div>
                  <div className="text-lg font-bold">{calcResult.numberOfNights}</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-blue-500 font-medium">Total Fee</div>
                  <div className="text-lg font-bold text-blue-900">{currency(calcResult.total)}</div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

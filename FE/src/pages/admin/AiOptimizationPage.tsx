import { useState } from "react";
import { Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/common/PageHeader";
import { Field, Input, Select } from "@/components/forms/FormField";
import { vehicleTypes } from "@/api/mockData";
import { optimizeParking } from "@/services/mockRepository";
import type { AiOptimizationResult } from "@/types/domain";

export function AiOptimizationPage() {
  const [result, setResult] = useState<AiOptimizationResult | null>(null);
  return (
    <>
      <PageHeader title="AI Parking Optimization" description="Tối ưu phân bổ chỗ đỗ, dự đoán tỷ lệ lấp đầy và giờ cao điểm." />
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader title="Dữ liệu đầu vào" />
          <CardContent>
            <form className="grid gap-4" onSubmit={async (event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              setResult(await optimizeParking({ currentVehicles: Number(data.get("currentVehicles")), emptySlots: Number(data.get("emptySlots")), vehicleTypeId: String(data.get("vehicleTypeId")) }));
            }}>
              <Field label="Số lượng xe hiện tại"><Input name="currentVehicles" type="number" defaultValue={420} /></Field>
              <Field label="Số slot trống"><Input name="emptySlots" type="number" defaultValue={160} /></Field>
              <Field label="Loại xe"><Select name="vehicleTypeId">{vehicleTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}</Select></Field>
              <Button><Sparkles size={17} /> Tối ưu</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Đề xuất AI" />
          <CardContent>
            {result ? (
              <div className="grid gap-4 md:grid-cols-2">
                <AiTile label="Tầng phù hợp" value={result.floorSuggestion} />
                <AiTile label="Slot phù hợp" value={result.slotSuggestion} />
                <AiTile label="Dự đoán lấp đầy" value={`${result.occupancyForecast}%`} />
                <AiTile label="Giờ cao điểm" value={result.peakHourForecast} />
                <AiTile label="Độ tin cậy" value={`${result.confidence}%`} />
              </div>
            ) : (
              <div className="grid min-h-64 place-items-center text-center text-slate-500"><Bot size={48} /><p>Nhập dữ liệu vận hành để nhận đề xuất.</p></div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function AiTile({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-blue-50 p-4"><p className="text-sm text-blue-700">{label}</p><p className="mt-2 text-xl font-semibold text-blue-950">{value}</p></div>;
}

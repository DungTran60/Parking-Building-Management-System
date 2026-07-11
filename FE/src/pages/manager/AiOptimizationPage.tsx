import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bot, Sparkles } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Field, Input, Select } from "@/components/forms/FormField";
import { recommendationApi, type SlotRecommendation } from "@/api/recommendationApi";
import { vehicleTypeApi } from "@/api/vehicleTypeApi";

export function AiOptimizationPage() {
  const [result, setResult] = useState<SlotRecommendation | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: vehicleTypes = [] } = useQuery({
    queryKey: ["vehicleTypes"],
    queryFn: () => vehicleTypeApi.getAll()
  });

  return (
    <>
      <PageHeader title="AI Parking Optimization" description="Tối ưu phân bổ chỗ đỗ, dự đoán tỷ lệ lấp đầy và giờ cao điểm." />
      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <Card>
          <CardHeader title="Dữ liệu đầu vào" />
          <CardContent>
            <form className="grid gap-4" onSubmit={async (event) => {
              event.preventDefault();
              setLoading(true);
              try {
                const data = new FormData(event.currentTarget);
                const vehicleTypeId = String(data.get("vehicleTypeId"));
                const recommendation = await recommendationApi.recommend(vehicleTypeId);
                setResult(recommendation);
              } finally {
                setLoading(false);
              }
            }}>
              <Field label="Loại xe"><Select name="vehicleTypeId" required>
                {vehicleTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
              </Select></Field>
              <Button disabled={loading}><Sparkles size={17} /> {loading ? "Đang tối ưu..." : "Tối ưu"}</Button>
            </form>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="Đề xuất AI" />
          <CardContent>
            {result ? (
              <div className="grid gap-4 md:grid-cols-2">
                <AiTile label="Trạng thái" value={result.available ? "Có slot trống" : "Hết slot"} />
                {result.available ? (
                  <>
                    <AiTile label="Tầng đề xuất" value={result.floorName || "—"} />
                    <AiTile label="Slot đề xuất" value={result.recommendedSlotCode || "—"} />
                    <AiTile label="Loại xe" value={result.vehicleTypeName} />
                    <AiTile label="Điểm ưu tiên" value={String(result.score)} />
                    <AiTile label="Chiến lược" value={result.strategy} />
                  </>
                ) : (
                  <div className="md:col-span-2 rounded-md bg-amber-50 p-4 text-sm text-amber-800">
                    {result.message}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid min-h-64 place-items-center text-center text-slate-500"><Bot size={48} /><p>Chọn loại xe và nhấn "Tối ưu" để nhận đề xuất.</p></div>
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

import { useMemo, useState } from "react";
import { QrCode, Ticket } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card, CardContent, CardHeader } from "@/components/common/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { Field, Input, Select } from "@/components/forms/FormField";
import { floors, slots, vehicleTypes } from "@/api/mockData";
import { createUserParkingTicket } from "@/services/mockRepository";
import { dateTime } from "@/utils/format";
import type { ParkingSession } from "@/types/domain";

export function ParkingEntryPage() {
  const [vehicleTypeId, setVehicleTypeId] = useState("motorbike");
  const [plateNumber, setPlateNumber] = useState("");
  const [zone, setZone] = useState("");
  const [ticket, setTicket] = useState<(ParkingSession & { zone: string }) | null>(null);

  const availableZones = useMemo(() => {
    return floors
      .filter((floor) => floor.supportedVehicleTypes.includes(vehicleTypeId))
      .map((floor) => ({
        value: `${floor.name} - ${floor.zone}`,
        empty: slots.filter((slot) => slot.floorId === floor.id && slot.vehicleTypeId === vehicleTypeId && slot.status === "AVAILABLE").length
      }));
  }, [vehicleTypeId]);

  const selectedZone = zone || availableZones[0]?.value || "Khu vực phù hợp";

  const submit = async () => {
    if (!plateNumber.trim()) return;
    const result = await createUserParkingTicket({ plateNumber: plateNumber.trim().toUpperCase(), vehicleTypeId, zone: selectedZone });
    setTicket(result);
  };

  return (
    <>
      <PageHeader title="Gửi xe theo lượt" description="Nhập biển số, chọn loại phương tiện và nhận mã gửi xe khi vào bãi." />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="grid gap-4">
          <Card>
            <CardHeader title="1. Thông tin phương tiện" />
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Field label="Biển số xe">
                <Input value={plateNumber} onChange={(event) => setPlateNumber(event.target.value)} placeholder="VD: 29A-123.45" className="font-mono uppercase" />
              </Field>
              <Field label="Loại phương tiện">
                <Select value={vehicleTypeId} onChange={(event) => setVehicleTypeId(event.target.value)}>
                  {vehicleTypes.map((type) => <option key={type.id} value={type.id}>{type.name}</option>)}
                </Select>
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="2. Chọn khu vực gửi" />
            <CardContent className="grid gap-3 md:grid-cols-2">
              {availableZones.map((item) => (
                <label key={item.value} className="cursor-pointer rounded-md border border-border p-4 hover:border-blue-300 has-[:checked]:border-blue-300 has-[:checked]:bg-blue-50">
                  <input type="radio" name="entryZone" value={item.value} checked={selectedZone === item.value} onChange={() => setZone(item.value)} className="mr-2" />
                  <span className="font-medium text-slate-800">{item.value}</span>
                  <p className="mt-1 text-xs text-emerald-600">Còn {item.empty} slot</p>
                </label>
              ))}
            </CardContent>
          </Card>

          <Button className="h-12" onClick={submit} disabled={!plateNumber.trim()}>
            <QrCode size={20} />
            Nhận mã gửi xe
          </Button>
        </div>

        <Card className="h-fit xl:sticky xl:top-20">
          <CardHeader title="Mã gửi xe" />
          <CardContent>
            {ticket ? (
              <div className="grid gap-4">
                <div className="grid aspect-square place-items-center rounded-lg border border-blue-100 bg-blue-50">
                  <QrCode size={150} className="text-blue-700" />
                </div>
                <div className="rounded-md bg-slate-50 p-4 text-sm">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Mã lượt gửi</p>
                  <p className="mt-1 font-mono text-xl font-semibold text-slate-950">{ticket.ticketCode}</p>
                  <div className="mt-3 grid gap-2">
                    <Info label="Giờ vào" value={dateTime(ticket.checkInAt)} />
                    <Info label="Khu vực" value={ticket.zone} />
                    <Info label="Trạng thái" value="Đang hiệu lực" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid place-items-center rounded-md bg-slate-50 p-8 text-center">
                <Ticket className="text-slate-400" size={42} />
                <p className="mt-3 text-sm text-slate-500">Nhập thông tin để tạo mã gửi xe.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-3"><span className="text-slate-500">{label}</span><span className="text-right font-medium">{value}</span></div>;
}

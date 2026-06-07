import { EntityManagement } from "@/modules/shared/EntityManagement";
import { vehicleTypes } from "@/api/mockData";
import type { Reservation } from "@/types/domain";
import { dateTime } from "@/utils/format";
import { Badge } from "@/components/common/Badge";

export function ReservationsPage() {
  return (
    <EntityManagement<Reservation>
      title="Đặt chỗ trước"
      description="Đặt chỗ theo loại phương tiện, thời gian bắt đầu, kết thúc và slot khả dụng."
      resource="reservations"
      fields={[
        { key: "plateNumber", label: "Biển số" },
        { key: "vehicleTypeId", label: "Loại xe", type: "select", options: vehicleTypes.map((item) => ({ label: item.name, value: item.id })) },
        { key: "slotId", label: "Slot" },
        { key: "startAt", label: "Bắt đầu", render: (value) => dateTime(String(value)) },
        { key: "endAt", label: "Kết thúc", render: (value) => dateTime(String(value)) },
        { key: "status", label: "Trạng thái", type: "select", options: ["PENDING", "CONFIRMED", "CANCELLED"].map((item) => ({ label: item, value: item })), render: (value) => <Badge value={String(value)} /> }
      ]}
    />
  );
}

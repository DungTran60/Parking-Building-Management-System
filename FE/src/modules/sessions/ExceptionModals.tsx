import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { Field, Input } from "@/components/forms/FormField";
import type { ExceptionType } from "@/types/domain";

const titles: Record<ExceptionType, string> = {
  LOST_TICKET: "Xử lý mất vé",
  WRONG_PLATE: "Xử lý sai biển số",
  WRONG_ZONE: "Xử lý gửi sai khu vực",
  OVERTIME: "Xử lý xe quá giờ",
  UNPAID: "Xử lý xe chưa thanh toán"
};

export function ExceptionModal({ type, onClose }: { type: ExceptionType | null; onClose: () => void }) {
  return (
    <Modal open={Boolean(type)} title={type ? titles[type] : ""} onClose={onClose}>
      <form className="grid gap-4">
        <div className="flex items-center gap-3 rounded-md bg-amber-50 p-3 text-amber-800">
          <AlertTriangle size={20} />
          <span className="text-sm">Ghi nhận biên bản, phụ phí và người duyệt cho tình huống ngoại lệ.</span>
        </div>
        <Field label="Biển số / mã vé"><Input required /></Field>
        <Field label="Lý do xử lý"><Input required /></Field>
        <Field label="Phụ phí"><Input type="number" defaultValue={0} /></Field>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Hủy</Button>
          <Button type="button" onClick={onClose}>Xác nhận</Button>
        </div>
      </form>
    </Modal>
  );
}

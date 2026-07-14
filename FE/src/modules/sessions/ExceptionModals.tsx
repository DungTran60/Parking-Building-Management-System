import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AlertTriangle, Search } from "lucide-react";
import { sessionApi, type LostTicketFeePreview } from "@/api/sessionApi";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { Field, Input, Select } from "@/components/forms/FormField";
import type { ExceptionType, PaymentMethod } from "@/types/domain";
import { getApiErrorMessage } from "@/utils/apiError";
import { currency, dateTime } from "@/utils/format";

const titles: Record<ExceptionType, string> = {
  LOST_TICKET: "Xử lý mất vé",
  WRONG_PLATE: "Xử lý sai biển số",
  WRONG_ZONE: "Xử lý gửi sai khu vực",
  OVERTIME: "Xử lý xe quá giờ",
  UNPAID: "Xử lý xe chưa thanh toán"
};

const PAYMENT_METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Tiền mặt" },
  { value: "QR_CODE", label: "QR Code" },
  { value: "BANK_CARD", label: "Thẻ ngân hàng" }
];

export function ExceptionModal({
  type,
  onClose,
  onSuccess
}: {
  type: ExceptionType | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [plateNumber, setPlateNumber] = useState("");
  const [reason, setReason] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [preview, setPreview] = useState<LostTicketFeePreview | null>(null);
  const [previewError, setPreviewError] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isLostTicket = type === "LOST_TICKET";

  useEffect(() => {
    if (!type) {
      return;
    }

    setPlateNumber("");
    setReason("");
    setPaymentMethod("CASH");
    setPreview(null);
    setPreviewError("");
    setCheckoutError("");
    setSuccessMessage("");
  }, [type]);

  const helperText = useMemo(() => {
    if (isLostTicket) {
      return "Tra cứu biển số xe đang gửi để xem trước phí mất vé, sau đó xác nhận checkout theo đúng phương thức thanh toán.";
    }

    return "Luồng BE cho loại ngoại lệ này chưa được nối. Có thể dùng màn hình này để ghi nhận tạm thời trong lúc chờ backend hoàn thiện.";
  }, [isLostTicket]);

  const handlePreview = async () => {
    const normalizedPlate = plateNumber.trim().toUpperCase();
    if (!normalizedPlate) {
      setPreview(null);
      setPreviewError("Vui lòng nhập biển số để tra cứu.");
      return;
    }

    setLoadingPreview(true);
    setPreviewError("");
    setCheckoutError("");
    setSuccessMessage("");
    try {
      setPreview(await sessionApi.previewLostTicketFee(normalizedPlate));
      setPlateNumber(normalizedPlate);
    } catch (error: unknown) {
      setPreview(null);
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setPreviewError("Không tìm thấy session ACTIVE theo biển số này.");
      } else {
        setPreviewError(getApiErrorMessage(error, "Không thể xem trước phí mất vé."));
      }
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleCheckout = async () => {
    const normalizedPlate = plateNumber.trim().toUpperCase();
    if (!normalizedPlate) {
      setCheckoutError("Vui lòng nhập biển số.");
      return;
    }

    setSubmitting(true);
    setCheckoutError("");
    setSuccessMessage("");
    try {
      const result = await sessionApi.lostTicketCheckout({
        plateNumber: normalizedPlate,
        paymentMethod
      });
      setSuccessMessage(`Đã checkout mất vé thành công cho ${result.plateNumber}. Tổng phí: ${currency(result.fee)}.`);
      setPreview(null);
      onSuccess?.();
    } catch (error: unknown) {
      setCheckoutError(getApiErrorMessage(error, "Không thể xác nhận checkout mất vé."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={Boolean(type)} title={type ? titles[type] : ""} onClose={onClose}>
      <div className="grid gap-4">
        <div className="flex items-center gap-3 rounded-md bg-amber-50 p-3 text-amber-800">
          <AlertTriangle size={20} />
          <span className="text-sm">{helperText}</span>
        </div>

        {isLostTicket ? (
          <>
            <Field label="Biển số xe">
              <Input
                value={plateNumber}
                onChange={(event) => setPlateNumber(event.target.value.toUpperCase())}
                placeholder="Ví dụ: 51G-12345"
                className="font-mono uppercase"
                disabled={loadingPreview || submitting}
              />
            </Field>

            <div className="flex justify-end">
              <Button type="button" variant="secondary" onClick={() => void handlePreview()} disabled={loadingPreview || submitting}>
                <Search size={16} />
                {loadingPreview ? "Đang tra cứu..." : "Tra cứu phí"}
              </Button>
            </div>

            {previewError && <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{previewError}</div>}

            {preview && (
              <div className="grid gap-3 rounded-md border border-border bg-slate-50 p-4 text-sm">
                <div className="grid gap-3 md:grid-cols-2">
                  <PreviewRow label="Biển số" value={preview.plateNumber} mono />
                  <PreviewRow label="Loại xe" value={preview.vehicleType || "Đang cập nhật"} />
                  <PreviewRow label="Thời gian vào" value={preview.checkInAt ? dateTime(preview.checkInAt) : "Đang cập nhật"} />
                  <PreviewRow label="Session ID" value={preview.sessionId ?? "—"} />
                  <PreviewRow label="Phí gửi xe" value={currency(preview.parkingFee)} />
                  <PreviewRow label="Phụ phí mất vé" value={currency(preview.lostTicketFee)} />
                </div>
                <div className="flex items-center justify-between rounded-md bg-white px-3 py-2">
                  <span className="font-medium text-slate-700">Tổng thanh toán</span>
                  <span className="text-lg font-semibold text-primary">{currency(preview.total)}</span>
                </div>
              </div>
            )}

            <Field label="Phương thức thanh toán">
              <Select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)} disabled={!preview || submitting}>
                {PAYMENT_METHOD_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </Select>
            </Field>

            <Field label="Ghi chú xử lý nội bộ (tùy chọn)">
              <Input
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Ví dụ: Đã đối chiếu CCCD và giấy đăng ký xe"
                disabled={submitting}
              />
            </Field>

            {checkoutError && <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{checkoutError}</div>}
            {successMessage && <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{successMessage}</div>}

            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>Hủy</Button>
              <Button type="button" onClick={() => void handleCheckout()} disabled={!preview || submitting}>
                {submitting ? "Đang checkout..." : "Xác nhận checkout mất vé"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <Field label="Biển số / mã vé">
              <Input required placeholder="Ví dụ: 51G-12345 hoặc QR-..." disabled />
            </Field>
            <Field label="Lý do xử lý">
              <Input required placeholder="Nhập lý do xử lý" disabled />
            </Field>
            <Field label="Phụ phí">
              <Input type="number" defaultValue={0} disabled />
            </Field>
            <div className="rounded-md border border-dashed border-slate-300 p-3 text-sm text-slate-600">
              FE mới nối luồng thật cho `LOST_TICKET`. Các loại ngoại lệ còn lại cần API BE riêng trước khi bật thao tác xác nhận.
            </div>
            <div className="flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={onClose}>Đóng</Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

function PreviewRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="rounded-md bg-white p-3">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className={`mt-1 text-sm font-semibold text-slate-900 ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

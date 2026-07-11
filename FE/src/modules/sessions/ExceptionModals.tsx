import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AlertTriangle, Search } from "lucide-react";
import { sessionApi, type LostTicketFeePreview } from "@/api/sessionApi";
import { feeApi } from "@/api/feeApi";
import { Button } from "@/components/common/Button";
import { Modal } from "@/components/common/Modal";
import { Field, Input, Select } from "@/components/forms/FormField";
import type { ExceptionType, ParkingSession, PaymentMethod } from "@/types/domain";
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
  const [extraFee, setExtraFee] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [preview, setPreview] = useState<LostTicketFeePreview | null>(null);
  const [session, setSession] = useState<ParkingSession | null>(null);
  const [previewError, setPreviewError] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isLostTicket = type === "LOST_TICKET";

  useEffect(() => {
    if (!type) return;
    setPlateNumber("");
    setReason("");
    setExtraFee(0);
    setPaymentMethod("CASH");
    setPreview(null);
    setSession(null);
    setPreviewError("");
    setCheckoutError("");
    setSuccessMessage("");
  }, [type]);

  const helperText = useMemo(() => {
    if (isLostTicket) {
      return "Tra cứu biển số xe đang gửi để xem trước phí mất vé, sau đó xác nhận checkout theo đúng phương thức thanh toán.";
    }
    return "Tra cứu biển số xe, nhập lý do và phụ phí (nếu có), sau đó xác nhận xử lý ngoại lệ.";
  }, [isLostTicket]);

  const handleSearch = async () => {
    const normalizedPlate = plateNumber.trim().toUpperCase();
    if (!normalizedPlate) {
      setPreview(null);
      setSession(null);
      setPreviewError("Vui lòng nhập biển số để tra cứu.");
      return;
    }
    setLoadingPreview(true);
    setPreviewError("");
    setCheckoutError("");
    setSuccessMessage("");
    try {
      setPlateNumber(normalizedPlate);
      if (isLostTicket) {
        setPreview(await sessionApi.previewLostTicketFee(normalizedPlate));
      } else {
        const result = await sessionApi.list({ query: normalizedPlate, status: "ACTIVE" });
        const found = result.content[0] || null;
        if (!found) {
          setPreviewError("Không tìm thấy session ACTIVE theo biển số này.");
        } else {
          setSession(found);
          const fee = await feeApi.preview(normalizedPlate).catch(() => null);
          setExtraFee(fee ? Math.round(fee.totalFee * 0.3) : 0);
        }
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        setPreviewError("Không tìm thấy session ACTIVE theo biển số này.");
      } else {
        setPreviewError(getApiErrorMessage(error, "Không thể tra cứu thông tin."));
      }
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleConfirm = async () => {
    const normalizedPlate = plateNumber.trim().toUpperCase();
    if (!normalizedPlate) {
      setCheckoutError("Vui lòng nhập biển số.");
      return;
    }
    setSubmitting(true);
    setCheckoutError("");
    setSuccessMessage("");
    try {
      if (isLostTicket) {
        const result = await sessionApi.lostTicketCheckout({
          plateNumber: normalizedPlate,
          paymentMethod
        });
        setSuccessMessage(`Đã checkout mất vé thành công cho ${result.plateNumber}. Tổng phí: ${currency(result.fee)}.`);
        setPreview(null);
      } else if (session) {
        const result = await sessionApi.handleException(session.id, {
          type: type as ExceptionType,
          reason: reason.trim() || undefined,
          extraFee: extraFee > 0 ? extraFee : undefined
        });
        setSuccessMessage(`Đã xử lý ngoại lệ ${titles[type as ExceptionType]} cho ${result.plateNumber}.`);
        setSession(null);
      }
      onSuccess?.();
    } catch (error: unknown) {
      setCheckoutError(getApiErrorMessage(error, "Không thể xác nhận xử lý ngoại lệ."));
    } finally {
      setSubmitting(false);
    }
  };

  const searchResult = preview || session;

  return (
    <Modal open={Boolean(type)} title={type ? titles[type] : ""} onClose={onClose}>
      <div className="grid gap-4">
        <div className="flex items-center gap-3 rounded-md bg-amber-50 p-3 text-amber-800">
          <AlertTriangle size={20} />
          <span className="text-sm">{helperText}</span>
        </div>

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
          <Button type="button" variant="secondary" onClick={() => void handleSearch()} disabled={loadingPreview || submitting}>
            <Search size={16} />
            {loadingPreview ? "Đang tra cứu..." : "Tra cứu"}
          </Button>
        </div>

        {previewError && <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{previewError}</div>}

        {isLostTicket && preview && (
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

        {!isLostTicket && session && (
          <div className="grid gap-3 rounded-md border border-border bg-slate-50 p-4 text-sm">
            <div className="grid gap-3 md:grid-cols-2">
              <PreviewRow label="Mã vé" value={session.ticketCode || "—"} />
              <PreviewRow label="Biển số" value={session.plateNumber} mono />
              <PreviewRow label="Giờ vào" value={dateTime(session.checkInAt)} />
              <PreviewRow label="Cổng vào" value={session.entryGate} />
            </div>
          </div>
        )}

        {isLostTicket ? (
          <>
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
          </>
        ) : (
          <>
            <Field label="Lý do xử lý">
              <Input
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Nhập lý do xử lý ngoại lệ"
                disabled={!session || submitting}
              />
            </Field>

            <Field label="Phụ phí (VNĐ)">
              <Input
                type="number"
                value={extraFee}
                onChange={(event) => setExtraFee(Number(event.target.value))}
                disabled={!session || submitting}
              />
            </Field>
          </>
        )}

        {checkoutError && <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{checkoutError}</div>}
        {successMessage && <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{successMessage}</div>}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>Hủy</Button>
          <Button type="button" onClick={() => void handleConfirm()} disabled={!searchResult || submitting}>
            {submitting ? "Đang xử lý..." : isLostTicket ? "Xác nhận checkout mất vé" : "Xác nhận xử lý"}
          </Button>
        </div>
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

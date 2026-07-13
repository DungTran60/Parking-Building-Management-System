import axios from "axios";

type ApiErrorBody = Record<string, unknown> & {
  error?: unknown;
  message?: unknown;
  validationErrors?: Record<string, string>;
};

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return error instanceof Error && error.message ? error.message : fallback;
  }

  const body = error.response?.data;
  if (!body || typeof body !== "object") return fallback;

  // Ưu tiên validationErrors — hiển thị chi tiết từng field
  if (body.validationErrors && typeof body.validationErrors === "object") {
    const details = Object.entries(body.validationErrors)
      .map(([field, msg]) => `${fieldLabel(field)}: ${msg}`)
      .join("; ");
    if (details) return details;
  }

  if (typeof body.message === "string" && body.message.trim() && body.message !== "Input validation failed")
    return body.message;

  if (typeof body.error === "string" && body.error.trim()) return body.error;

  const validationMessages = Object.values(body).filter(
    (value): value is string => typeof value === "string" && value.trim().length > 0
  );
  return validationMessages.length ? validationMessages.join("; ") : fallback;
}

/** Chuyển tên field sang nhãn tiếng Việt dễ đọc */
function fieldLabel(field: string): string {
  const labels: Record<string, string> = {
    plateNumber: "Biển số",
    vehicleTypeId: "Loại phương tiện",
    slotId: "Slot",
    startAt: "Thời gian vào",
    endAt: "Thời gian ra",
  };
  return labels[field] ?? field;
}

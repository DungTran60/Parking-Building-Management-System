import axios from "axios";

type ApiErrorBody = Record<string, unknown> & {
  error?: unknown;
  message?: unknown;
};

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ApiErrorBody>(error)) {
    return error instanceof Error && error.message ? error.message : fallback;
  }

  const body = error.response?.data;
  if (!body || typeof body !== "object") return fallback;

  if (typeof body.error === "string" && body.error.trim()) return body.error;
  if (typeof body.message === "string" && body.message.trim()) return body.message;

  const validationMessages = Object.values(body).filter(
    (value): value is string => typeof value === "string" && value.trim().length > 0
  );
  return validationMessages.length ? validationMessages.join("; ") : fallback;
}

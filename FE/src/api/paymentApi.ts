import { httpClient } from "./httpClient";
import type { PaymentMethod, PaymentRecord } from "@/types/domain";

export interface CreatePaymentRequest {
  sessionId: string;
  method: PaymentMethod;
}

type PaymentResponse = {
  id?: string | number;
  sessionId?: string;
  plateNumber?: string;
  amount?: number | string;
  method?: string;
  paidAt?: string;
};

const normalizePayment = (p: PaymentResponse): PaymentRecord => ({
  id: String(p.id ?? ""),
  sessionId: String(p.sessionId ?? ""),
  plateNumber: p.plateNumber,
  amount: Number(p.amount ?? 0),
  method: (p.method as PaymentMethod) ?? "CASH",
  paidAt: p.paidAt ?? ""
});

export const paymentApi = {
  create: async (payload: CreatePaymentRequest): Promise<PaymentRecord> => {
    const response = await httpClient.post<PaymentResponse>("/payments", payload);
    return normalizePayment(response.data);
  },

  getAll: async (): Promise<PaymentRecord[]> => {
    const response = await httpClient.get<PaymentResponse[]>("/payments");
    return (Array.isArray(response.data) ? response.data : []).map(normalizePayment);
  }
};

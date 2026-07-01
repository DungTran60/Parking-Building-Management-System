import { httpClient } from "./httpClient";
import type { PaymentMethod, PaymentRecord } from "@/types/domain";

export interface CreatePaymentRequest {
  sessionId: string;
  method: PaymentMethod;
}

export const paymentApi = {
  create: async (payload: CreatePaymentRequest): Promise<PaymentRecord> => {
    const response = await httpClient.post<PaymentRecord>("/payments", payload);
    return response.data;
  },

  getAll: async (): Promise<PaymentRecord[]> => {
    const response = await httpClient.get<PaymentRecord[]>("/payments");
    return response.data;
  }
};

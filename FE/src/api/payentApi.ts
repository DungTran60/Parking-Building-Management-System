export { paymentApi } from "./paymentApi";
export type { CreatePaymentRequest } from "./paymentApi";

import { httpClient } from "./httpClient";
import { paymentApi } from "./paymentApi";
import type { ParkingSession, PaymentMethod, PaymentRecord } from "@/types/domain";

/** @deprecated Import paymentApi from ./paymentApi for new code. */
export async function getCurrentUserSession(): Promise<ParkingSession | null> {
  try {
    const response = await httpClient.get<ParkingSession>("/sessions/active");
    return response.data;
  } catch {
    return null;
  }
}

/** @deprecated Import paymentApi from ./paymentApi for new code. */
export async function getUserPayments(): Promise<PaymentRecord[]> {
  return paymentApi.getAll();
}

/** @deprecated Import paymentApi from ./paymentApi for new code. */
export async function payCurrentSession(method: PaymentMethod): Promise<void> {
  const session = await getCurrentUserSession();
  if (session) await paymentApi.create({ sessionId: session.id, method });
}

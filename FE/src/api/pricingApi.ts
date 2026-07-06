import { httpClient } from "./httpClient";

export interface Pricing {
  id: string;
  vehicleTypeId: string;
  vehicleTypeName: string;
  timeUnit: PricingTimeUnit;
  price: number;
  overnightFee: number;
  lostTicketFee: number;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PricingTimeUnit = "HOURLY" | "DAILY" | "MONTHLY";

export interface PricingPayload {
  vehicleTypeId: string;
  timeUnit: PricingTimeUnit;
  price: number;
  overnightFee: number;
  lostTicketFee: number;
  description?: string;
  active: boolean;
}

type PricingResponse = Omit<Pricing, "id"> & { id: string | number };

const normalizePricing = (pricing: PricingResponse): Pricing => ({
  ...pricing,
  id: String(pricing.id)
});

export interface FeeQuery {
  checkIn: string;
  checkOut: string;
  vehicleType: string;
}

export interface OvernightFeeResult {
  basePrice: number;
  overnightFee: number;
  numberOfNights: number;
  total: number;
}

export interface LostTicketFeeResult {
  vehicleType: string;
  lostTicketFee: number;
  total: number;
}

export interface FinalFeeResult {
  basePrice: number;
  overnightFee: number;
  lostTicketFee: number;
  total: number;
}

export const pricingApi = {
  getAll: async (): Promise<Pricing[]> => {
    const response = await httpClient.get<PricingResponse[]>("/pricing");
    return response.data.map(normalizePricing);
  },

  getById: async (id: string): Promise<Pricing> => {
    const response = await httpClient.get<PricingResponse>(`/pricing/${id}`);
    return normalizePricing(response.data);
  },

  create: async (payload: PricingPayload): Promise<Pricing> => {
    const response = await httpClient.post<PricingResponse>("/pricing", payload);
    return normalizePricing(response.data);
  },

  update: async (id: string, payload: PricingPayload): Promise<Pricing> => {
    const response = await httpClient.put<PricingResponse>(`/pricing/${id}`, payload);
    return normalizePricing(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await httpClient.delete(`/pricing/${id}`);
  },

  toggle: async (id: string): Promise<Pricing> => {
    const response = await httpClient.patch<PricingResponse>(`/pricing/${id}/toggle`);
    return normalizePricing(response.data);
  },

  calculateOvernightFee: async (params: FeeQuery): Promise<OvernightFeeResult> => {
    const response = await httpClient.get<OvernightFeeResult>("/pricing/calculate", { params });
    return response.data;
  },

  getLostTicketFee: async (vehicleType: string): Promise<LostTicketFeeResult> => {
    const response = await httpClient.get<LostTicketFeeResult>("/pricing/lost-ticket", {
      params: { vehicleType }
    });
    return response.data;
  },

  calculateFinalFee: async (params: FeeQuery & { lostTicket: boolean }): Promise<FinalFeeResult> => {
    const overnight = await pricingApi.calculateOvernightFee(params);
    const lostTicket = params.lostTicket
      ? await pricingApi.getLostTicketFee(params.vehicleType)
      : null;
    const overnightTotal = overnight.overnightFee * overnight.numberOfNights;
    const lostTicketFee = lostTicket?.lostTicketFee ?? 0;

    return {
      basePrice: overnight.basePrice,
      overnightFee: overnightTotal,
      lostTicketFee,
      total: overnight.total + lostTicketFee
    };
  }
};

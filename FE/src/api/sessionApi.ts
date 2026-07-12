import { httpClient } from "./httpClient";
import type { ParkingSession, PaymentMethod, SessionStatus } from "@/types/domain";

export interface CheckInRequest {
  plateNumber: string;
  vehicleTypeId: string;
  entryGate: string;
  slotId?: number;
  reservationId?: number;
}

export interface CheckOutResponse extends ParkingSession {
  duration?: number;
}

export interface SessionListParams {
  status?: SessionStatus | "ALL";
  query?: string;
  page?: number;
  size?: number;
  sort?: string;
  from?: string;
  to?: string;
}

export interface SessionListResult {
  content: ParkingSession[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface LostTicketFeePreview {
  vehicleType: string;
  plateNumber: string;
  sessionId?: string;
  checkInAt: string;
  parkingFee: number;
  lostTicketFee: number;
  total: number;
}

export interface LostTicketCheckoutRequest {
  plateNumber: string;
  paymentMethod?: PaymentMethod;
}

type SessionResponse = Partial<ParkingSession> & {
  id?: string | number;
  sessionId?: string | number;
  vehicleTypeId?: string | number;
  slotId?: string | number;
  slotCode?: string;
  floorId?: string | number;
  floorName?: string;
  reservationId?: string | number;
  checkInTime?: string;
  checkOutTime?: string;
  fee?: number | null;
  status?: SessionStatus | string;
};

const normalizeSession = (payload: SessionResponse): ParkingSession => ({
  id: String(payload.id ?? payload.sessionId ?? ""),
  ticketCode: String(payload.ticketCode ?? ""),
  plateNumber: String(payload.plateNumber ?? ""),
  vehicleTypeId: String(payload.vehicleTypeId ?? ""),
  slotId: String(payload.slotId ?? ""),
  slotCode: payload.slotCode,
  floorId: payload.floorId == null ? undefined : String(payload.floorId),
  floorName: payload.floorName,
  reservationId: payload.reservationId == null ? undefined : String(payload.reservationId),
  entryGate: String(payload.entryGate ?? ""),
  checkInAt: String(payload.checkInAt ?? payload.checkInTime ?? ""),
  checkOutAt: payload.checkOutAt ?? payload.checkOutTime,
  fee: typeof payload.fee === "number" ? payload.fee : 0,
  status: (payload.status as SessionStatus | undefined) ?? "ACTIVE"
});

const normalizeSessionList = (payload: unknown): SessionListResult => {
  if (Array.isArray(payload)) {
    const content = payload.map((item) => normalizeSession(item as SessionResponse));
    return {
      content,
      page: 0,
      size: content.length,
      totalElements: content.length,
      totalPages: 1,
    };
  }

  if (payload && typeof payload === "object") {
    const data = payload as {
      content?: unknown[];
      page?: number;
      size?: number;
      totalElements?: number;
      totalPages?: number;
    };
    const content = Array.isArray(data.content)
      ? data.content.map((item) => normalizeSession(item as SessionResponse))
      : [];

    return {
      content,
      page: typeof data.page === "number" ? data.page : 0,
      size: typeof data.size === "number" ? data.size : content.length,
      totalElements: typeof data.totalElements === "number" ? data.totalElements : content.length,
      totalPages: typeof data.totalPages === "number" ? data.totalPages : 1,
    };
  }

  return {
    content: [],
    page: 0,
    size: 0,
    totalElements: 0,
    totalPages: 0
  };
};

const normalizeLostTicketPreview = (payload: {
  vehicleType?: string;
  plateNumber?: string;
  sessionId?: string | number | null;
  checkInAt?: string;
  parkingFee?: number | string | null;
  lostTicketFee?: number | string | null;
  total?: number | string | null;
}): LostTicketFeePreview => ({
  vehicleType: String(payload.vehicleType ?? ""),
  plateNumber: String(payload.plateNumber ?? ""),
  sessionId: payload.sessionId == null ? undefined : String(payload.sessionId),
  checkInAt: String(payload.checkInAt ?? ""),
  parkingFee: Number(payload.parkingFee ?? 0),
  lostTicketFee: Number(payload.lostTicketFee ?? 0),
  total: Number(payload.total ?? 0)
});

export const sessionApi = {
  checkIn: async (payload: CheckInRequest): Promise<ParkingSession> => {
    const response = await httpClient.post<SessionResponse>("/sessions/checkin", payload);
    return normalizeSession(response.data);
  },

  checkOut: async (query: string): Promise<CheckOutResponse> => {
    const response = await httpClient.post<SessionResponse & { duration?: number }>("/sessions/checkout", undefined, {
      params: { query }
    });
    return {
      ...normalizeSession(response.data),
      duration: response.data.duration
    };
  },

  list: async (params?: SessionListParams): Promise<SessionListResult> => {
    const response = await httpClient.get<unknown>("/sessions", {
        params: {
          status: params?.status && params.status !== "ALL" ? params.status : undefined,
          query: params?.query?.trim() || undefined,
          page: params?.page,
          size: params?.size,
          sort: params?.sort,
          from: params?.from || undefined,
          to: params?.to || undefined
        }
    });
    return normalizeSessionList(response.data);
  },

  getMySessions: async (status?: SessionStatus): Promise<ParkingSession[]> => {
    const response = await httpClient.get<SessionResponse[]>("/sessions/my", {
      params: status ? { status } : undefined
    });
    return (Array.isArray(response.data) ? response.data : []).map(normalizeSession);
  },

  /**
   * Tìm session ACTIVE theo biển số — dành cho xe check-in walk-in (không qua reservation).
   * Gọi GET /api/sessions/by-plate?plateNumber=...
   */
  findByPlate: async (plateNumber: string): Promise<ParkingSession[]> => {
    const response = await httpClient.get<SessionResponse[]>("/sessions/by-plate", {
      params: { plateNumber: plateNumber.trim().toUpperCase() }
    });
    return (Array.isArray(response.data) ? response.data : []).map(normalizeSession);
  },

  /**
   * Tính phí tạm tính qua ticketCode hoặc plateNumber.
   * Gọi GET /api/fee/preview?query=... — chính xác nhất vì BE tính trực tiếp từ DB.
   */
  previewFee: async (query: string): Promise<{ totalFee: number; hours: number; hourlyRate: number }> => {
    const response = await httpClient.get<{
      totalFee?: number | string;
      hours?: number;
      hourlyRate?: number | string;
    }>("/fee/preview", { params: { query } });
    return {
      totalFee: Number(response.data.totalFee ?? 0),
      hours: Number(response.data.hours ?? 0),
      hourlyRate: Number(response.data.hourlyRate ?? 0)
    };
  },

  previewLostTicketFee: async (plateNumber: string): Promise<LostTicketFeePreview> => {
    const response = await httpClient.get<{
      vehicleType?: string;
      plateNumber?: string;
      sessionId?: string | number | null;
      checkInAt?: string;
      parkingFee?: number | string | null;
      lostTicketFee?: number | string | null;
      total?: number | string | null;
    }>("/sessions/lost-ticket-preview", {
      params: { plateNumber }
    });
    return normalizeLostTicketPreview(response.data);
  },

  lostTicketCheckout: async (payload: LostTicketCheckoutRequest): Promise<ParkingSession> => {
    const response = await httpClient.post<SessionResponse>("/sessions/lost-ticket-checkout", payload);
    return normalizeSession(response.data);
  }
};

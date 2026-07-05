import { httpClient } from "./httpClient";
import type { ParkingSession } from "@/types/domain";

export interface CheckInRequest {
  plateNumber: string;
  vehicleTypeId: string;
  entryGate: string;
}

export interface CheckOutResponse extends ParkingSession {
  duration?: number;
}

export const sessionApi = {
  checkIn: async (payload: CheckInRequest): Promise<ParkingSession> => {
    const response = await httpClient.post<ParkingSession>("/sessions/checkin", payload);
    return response.data;
  },

  checkOut: async (query: string): Promise<CheckOutResponse> => {
    const response = await httpClient.post<CheckOutResponse>("/sessions/checkout", undefined, {
      params: { query }
    });
    return response.data;
  }
};

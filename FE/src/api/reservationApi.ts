import { httpClient } from "./httpClient";
import type { Reservation, ReservationStatus } from "@/types/domain";

export const reservationApi = {
  getAll: async (status?: ReservationStatus): Promise<Reservation[]> => {
    const res = await httpClient.get<Reservation[]>("/reservations", { params: { status } });
    return res.data;
  },
  
  create: async (payload: {
    plateNumber: string;
    vehicleTypeId: string;
    slotId: string;
    startAt: string;
    endAt: string;
  }): Promise<Reservation> => {
    const res = await httpClient.post<Reservation>("/reservations", payload);
    return res.data;
  },

  cancel: async (id: string | number): Promise<Reservation> => {
    const res = await httpClient.patch<Reservation>(`/reservations/${id}/cancel`);
    return res.data;
  },

  confirm: async (id: string | number): Promise<Reservation> => {
    const res = await httpClient.patch<Reservation>(`/reservations/${id}/confirm`);
    return res.data;
  },

  getById: async (id: string | number): Promise<Reservation> => {
    const res = await httpClient.get<Reservation>(`/reservations/${id}`);
    return res.data;
  }
};

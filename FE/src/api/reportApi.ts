import { httpClient } from "@/api/httpClient";

export interface RevenueReport {
  totalRevenue: number;
  revenueByDate: { date: string; amount: number }[];
  revenueByMethod: { method: string; amount: number }[];
  revenueByVehicleType: { vehicleTypeId: number; vehicleTypeName: string; amount: number }[];
}

export interface OccupancyReport {
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  reservedSlots: number;
  maintenanceSlots: number;
  blockedSlots: number;
  occupancyRate: number;
  occupancyByFloor: { floorName: string; occupied: number; total: number; rate: number }[];
  occupancyByVehicleType: { vehicleTypeName: string; occupied: number; total: number; rate: number }[];
}

export interface TrafficReport {
  totalCheckIns: number;
  totalCheckOuts: number;
  trafficByDate: { date: string; checkIns: number; checkOuts: number }[];
  trafficByHour: { hour: number; checkIns: number; checkOuts: number }[];
  trafficByVehicleType: { vehicleTypeName: string; checkIns: number; checkOuts: number }[];
}

export interface TrafficEvent {
  sessionId: number;
  ticketCode: string;
  plateNumber: string;
  vehicleTypeName: string;
  slotCode: string;
  eventType: "CHECK_IN" | "CHECK_OUT";
  eventTime: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

const dateParams = (startDate?: string, endDate?: string) => ({
  params: startDate && endDate ? { startDate, endDate } : undefined
});

export const reportApi = {
  revenue: async (startDate?: string, endDate?: string): Promise<RevenueReport> =>
    (await httpClient.get<RevenueReport>("/reports/revenue", dateParams(startDate, endDate))).data,
  occupancy: async (): Promise<OccupancyReport> =>
    (await httpClient.get<OccupancyReport>("/reports/occupancy")).data,
  traffic: async (startDate?: string, endDate?: string): Promise<TrafficReport> =>
    (await httpClient.get<TrafficReport>("/reports/traffic", dateParams(startDate, endDate))).data,
  trafficEvents: async (
    startDate: string,
    endDate: string,
    eventType?: "CHECK_IN" | "CHECK_OUT",
    page = 0,
    size = 20
  ): Promise<Page<TrafficEvent>> =>
    (await httpClient.get<Page<TrafficEvent>>("/reports/traffic-events", {
      params: { startDate, endDate, page, size, ...(eventType ? { eventType } : {}) }
    })).data
};

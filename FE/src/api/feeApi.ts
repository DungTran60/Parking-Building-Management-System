import { httpClient } from "./httpClient";

export interface FeePreview {
  ticketCode: string;
  plateNumber: string;
  vehicleTypeId: number;
  vehicleTypeName: string;
  checkInAt: string;
  calculatedAt: string;
  hours: number;
  hourlyRate: number;
  totalFee: number;
  rateSource: string;
}

export const feeApi = {
  // Tính phí tạm tính cho lượt gửi xe đang ACTIVE (theo ticketCode hoặc plateNumber)
  preview: async (query: string): Promise<FeePreview> =>
    (await httpClient.get<FeePreview>("/fee/preview", { params: { query } })).data
};

import { httpClient } from "./httpClient";
import type { Incident, IncidentStatus, IncidentType } from "@/types/domain";

export interface CreateIncidentRequest {
  type: IncidentType;
  description: string;
  sessionId?: number;
  slotId?: number;
}

export interface ResolveIncidentRequest {
  resolution: string;
}

export const incidentApi = {
  /** Tạo sự cố mới */
  create: async (payload: CreateIncidentRequest): Promise<Incident> => {
    const response = await httpClient.post<Incident>("/incidents", payload);
    return response.data;
  },

  /** Lấy chi tiết sự cố */
  getById: async (id: number): Promise<Incident> => {
    const response = await httpClient.get<Incident>(`/incidents/${id}`);
    return response.data;
  },

  /** Lấy tất cả sự cố, tùy chọn lọc theo status hoặc type */
  getAll: async (params?: { status?: IncidentStatus; type?: IncidentType; assignee?: "me" }): Promise<Incident[]> => {
    const response = await httpClient.get<Incident[]>("/incidents", { params });
    return response.data;
  },

  /** Cập nhật thông tin sự cố */
  update: async (id: number, payload: CreateIncidentRequest): Promise<Incident> => {
    const response = await httpClient.put<Incident>(`/incidents/${id}`, payload);
    return response.data;
  },

  /** Bắt đầu xử lý: OPEN → IN_PROGRESS */
  startProcessing: async (id: number): Promise<Incident> => {
    const response = await httpClient.patch<Incident>(`/incidents/${id}/process`);
    return response.data;
  },

  /** Giải quyết sự cố: → RESOLVED */
  resolve: async (id: number, payload: ResolveIncidentRequest): Promise<Incident> => {
    const response = await httpClient.patch<Incident>(`/incidents/${id}/resolve`, payload);
    return response.data;
  },

  /** Đóng sự cố: RESOLVED → CLOSED */
  close: async (id: number): Promise<Incident> => {
    const response = await httpClient.patch<Incident>(`/incidents/${id}/close`);
    return response.data;
  },

  /** Xóa sự cố */
  delete: async (id: number): Promise<void> => {
    await httpClient.delete(`/incidents/${id}`);
  }
};

import { httpClient } from "./httpClient";
import type { FeedbackItem, FeedbackStatus } from "@/types/domain";

export interface CreateFeedbackRequest {
  parkingSessionId: number;
  paymentId?: number;
  rating: number;
  comment?: string;
}

export const feedbackApi = {
  /** Khách hàng tạo feedback */
  create: async (payload: CreateFeedbackRequest): Promise<FeedbackItem> => {
    const response = await httpClient.post<FeedbackItem>("/feedback", payload);
    return response.data;
  },

  /** Khách hàng xem feedback của mình */
  getMy: async (): Promise<FeedbackItem[]> => {
    const response = await httpClient.get<FeedbackItem[]>("/feedback/my");
    return response.data;
  },

  /** Lấy chi tiết theo ID */
  getById: async (id: number): Promise<FeedbackItem> => {
    const response = await httpClient.get<FeedbackItem>(`/feedback/${id}`);
    return response.data;
  },

  /** Admin lấy tất cả (có thể lọc theo status) */
  getAll: async (status?: FeedbackStatus): Promise<FeedbackItem[]> => {
    const response = await httpClient.get<FeedbackItem[]>("/feedback", {
      params: status ? { status } : {}
    });
    return response.data;
  },

  /** Admin duyệt feedback */
  approve: async (id: number): Promise<FeedbackItem> => {
    const response = await httpClient.patch<FeedbackItem>(`/feedback/${id}/approve`);
    return response.data;
  },

  /** Admin từ chối feedback */
  reject: async (id: number): Promise<FeedbackItem> => {
    const response = await httpClient.patch<FeedbackItem>(`/feedback/${id}/reject`);
    return response.data;
  },

  /** Admin xóa feedback */
  delete: async (id: number): Promise<void> => {
    await httpClient.delete(`/feedback/${id}`);
  }
};

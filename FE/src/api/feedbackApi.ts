import { httpClient } from "./httpClient";

export type FeedbackType = "LOST_TICKET" | "WRONG_FEE" | "HARD_TO_FIND" | "SLOT_OCCUPIED" | "OTHER";
export type FeedbackStatus = "NEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface CreateFeedbackRequest {
  type: FeedbackType;
  content: string;
  sessionId?: number;
}

export interface FeedbackResponse {
  id: number;
  userId: number;
  username: string;
  sessionId: number | null;
  type: string;
  content: string;
  status: string;
  response: string | null;
  respondedByUsername: string | null;
  createdAt: string;
  resolvedAt: string | null;
}

export const feedbackApi = {
  create: async (payload: CreateFeedbackRequest): Promise<FeedbackResponse> => {
    const response = await httpClient.post<FeedbackResponse>("/feedbacks", payload);
    return response.data;
  },

  getMine: async (): Promise<FeedbackResponse[]> => {
    const response = await httpClient.get<FeedbackResponse[]>("/feedbacks/me");
    return response.data;
  },

  getAll: async (status?: FeedbackStatus): Promise<FeedbackResponse[]> => {
    const response = await httpClient.get<FeedbackResponse[]>("/feedbacks", {
      params: status ? { status } : undefined
    });
    return response.data;
  },

  resolve: async (id: number, payload: { resolution: string }): Promise<FeedbackResponse> => {
    const response = await httpClient.patch<FeedbackResponse>(`/feedbacks/${id}/resolve`, payload);
    return response.data;
  }
};

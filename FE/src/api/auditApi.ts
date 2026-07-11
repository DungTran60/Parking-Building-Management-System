import { httpClient } from "./httpClient";

export interface AuditLog {
  id: number;
  action: string;
  resource: string;
  resourceId: number;
  actorId: number;
  actorUsername: string;
  createdAt: string;
}

interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface AuditLogQuery {
  resource?: string;
  resourceId?: number;
  action?: string;
  actorUsername?: string;
  page?: number;
  size?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export const auditApi = {
  getAll: async (params?: AuditLogQuery): Promise<PaginatedResult<AuditLog>> => {
    const response = await httpClient.get<PageResponse<AuditLog>>("/audit-logs", { params });
    return {
      data: response.data.content,
      total: response.data.totalElements,
      page: response.data.number,
      totalPages: response.data.totalPages
    };
  },

  getByResource: async (resource: string, resourceId: number): Promise<AuditLog[]> => {
    const response = await httpClient.get<PageResponse<AuditLog>>("/audit-logs", {
      params: { resource, resourceId }
    });
    return response.data.content;
  }
};

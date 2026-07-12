import { httpClient } from "@/api/httpClient";
import type { AuditLog } from "@/types/domain";

export interface AuditLogPageResult {
  content: AuditLog[];
  totalPages: number;
  totalElements: number;
}

export interface AuditLogQuery {
  action?: string;
  actorUsername?: string;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const auditApi = {
  getAll: async (params?: AuditLogQuery): Promise<AuditLogPageResult> => {
    const response = await httpClient.get<AuditLogPageResult>("/audit-logs/all", { params });
    return response.data;
  },

  getByResource: async (resource: string, resourceId: number): Promise<AuditLog[]> => {
    const response = await httpClient.get<AuditLog[]>("/audit-logs", { params: { resource, resourceId } });
    return response.data;
  }
};

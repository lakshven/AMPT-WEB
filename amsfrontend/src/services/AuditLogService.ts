// services/AuditLogService.ts
import axiosInstance from "../utils/axiosInstance";
import { AuditLog } from "../types/AuditLog";

const AuditLogService = {
  getLogs(limit: number = 100) {
    return axiosInstance.get<{ logs: AuditLog[] }>(
      `/audit-logs?limit=${limit}`
    );
  },

  getLogsByUser(userId: number) {
    return axiosInstance.get<{ logs: AuditLog[] }>(
      `/audit-logs/user/${userId}`
    );
  },

  getLogsByEntity(entity: string, entityId: number) {
    return axiosInstance.get<{ logs: AuditLog[] }>(
      `/audit-logs/entity/${entity}/${entityId}`
    );
  },

  getLogsForAsset(assetId: number) {
    return axiosInstance.get<{ logs: AuditLog[] }>(
      `/assets/${assetId}/audit-logs`
    );
  },

  getFilteredLogs(params: {
    action?: string;
    performedBy?: string;
    actorUserId?: number;
    from?: string;
    to?: string;
    limit?: number;
  }) {
    const query = new URLSearchParams();

    if (params.action) query.append("action", params.action);
    if (params.performedBy) query.append("performedBy", params.performedBy);
    if (params.actorUserId) query.append("actorUserId", String(params.actorUserId));
    if (params.from) query.append("from", params.from);
    if (params.to) query.append("to", params.to);
    if (params.limit) query.append("limit", String(params.limit));

    return axiosInstance.get<{ logs: AuditLog[] }>(
      `/audit-logs/filter?${query.toString()}`
    );
  },

  getPaginatedLogs(page: number = 1, limit: number = 20) {
    return axiosInstance.get<{
      logs: AuditLog[];
      total: number;
      page: number;
      limit: number;
    }>(`/audit-logs/paginated?page=${page}&limit=${limit}`);
  },
};

export default AuditLogService;
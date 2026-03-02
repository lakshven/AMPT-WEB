// hooks/useAuditLogs.ts
import { useEffect, useState, useCallback } from "react";
import AuditLogService from "../services/AuditLogService";
import { AuditLog } from "../types/AuditLog";

export function useAuditLogs(limit: number = 100) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await AuditLogService.getLogs(limit);
      setLogs(res.data.logs || []);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
      setError("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    load();
    console.log("Audit logs loaded");

  }, [load]);

  return { logs, loading, error, refresh: load };
}
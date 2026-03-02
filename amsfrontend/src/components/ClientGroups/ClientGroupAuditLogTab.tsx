import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

interface Props {
  groupId: number;
}

export default function ClientGroupAuditLogTab({ groupId }: Props) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get(`/client-groups/${groupId}/audit-logs`)
      .then(res => setLogs(res.data.logs || []))
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [groupId]);

  if (loading) return <div className="text-gray-500">Loading audit logs…</div>;

  if (logs.length === 0)
    return <div className="text-gray-500">No audit logs found.</div>;

  return (
    <div className="space-y-3">
      {logs.map(log => (
        <div key={log.id} className="border p-3 rounded bg-gray-50">
          <div className="font-semibold text-gray-800">{log.action}</div>

          {log.details && (
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          )}

          <div className="text-xs text-gray-500 mt-1">
            Performed by: {log.performedBy}
          </div>

          <div className="text-xs text-gray-400">
            {new Date(log.createdAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}
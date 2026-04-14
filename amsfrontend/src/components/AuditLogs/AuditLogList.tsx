import React, { useEffect, useMemo, useState } from "react";
import { useAuditLogs } from "../../hooks/useAuditLogs";
import { AuditLog } from "../../types/AuditLog";
import AuditLogDetailsModal from "./AuditLogDetailsModal";

interface AuditLogListProps {
  logs?: AuditLog[]; // optional: asset-specific logs
  onSelect?: (log: AuditLog) => void;   // ⭐ Add this
  limit?: number;
}

const PAGE_SIZE = 20;

const AuditLogList: React.FC<AuditLogListProps> = ({ logs, onSelect, limit = 100 }) => {
  const { logs: hookLogs, loading: hookLoading } = useAuditLogs(200);

  const [finalLogs, setFinalLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [userFilter, setUserFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  // Grouping + pagination
  const [groupByAction, setGroupByAction] = useState(false);
  const [page, setPage] = useState(1);

  // Modal
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Load logs (from props or hook)
  useEffect(() => {
    if (logs) {
      setFinalLogs(logs);
      setLoading(false);
    } else {
      setFinalLogs(hookLogs);
      setLoading(hookLoading);
    }
  }, [logs, hookLogs, hookLoading]);

  // Unique actions for filter dropdown
  const uniqueActions = useMemo(() => {
    const set = new Set<string>();
    finalLogs.forEach((l) => set.add(l.action));
    return Array.from(set).sort();
  }, [finalLogs]);

  // Apply filters
  const filteredLogs = useMemo(() => {
    return finalLogs.filter((log) => {
      if (
        userFilter &&
        !log.performedBy.toLowerCase().includes(userFilter.toLowerCase())
      ) {
        return false;
      }

      if (actionFilter && log.action !== actionFilter) {
        return false;
      }

      if (startDate) {
        const logDate = new Date(log.createdAt).getTime();
        const start = new Date(startDate).getTime();
        if (logDate < start) return false;
      }

      if (endDate) {
        const logDate = new Date(log.createdAt).getTime();
        const end = new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1;
        if (logDate > end) return false;
      }

      return true;
    });
  }, [finalLogs, userFilter, actionFilter, startDate, endDate]);

  // Grouping
  const groupedLogs = useMemo(() => {
    if (!groupByAction) return { __all: filteredLogs };

    const groups: Record<string, AuditLog[]> = {};
    filteredLogs.forEach((log) => {
      const key = log.action || "Other";
      if (!groups[key]) groups[key] = [];
      groups[key].push(log);
    });
    return groups;
  }, [filteredLogs, groupByAction]);

  // Pagination (only when not grouped)
  const totalPages = useMemo(() => {
    if (groupByAction) return 1;
    return Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  }, [filteredLogs.length, groupByAction]);

  const paginatedLogs = useMemo(() => {
    if (groupByAction) return filteredLogs;
    const start = (page - 1) * PAGE_SIZE;
    return filteredLogs.slice(start, start + PAGE_SIZE);
  }, [filteredLogs, page, groupByAction]);

  if (loading) return <p className="p-4">Loading audit logs...</p>;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold mb-2 text-[#066A6F]">Audit Logs</h2>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white rounded shadow p-3 border-[#549E39]/30">
        <div>
          <label className="block text-xs font-semibold mb-1">User</label>
          <input
            type="text"
            value={userFilter}
            onChange={(e) => {
              setUserFilter(e.target.value);
              setPage(1);
            }}
            className="w-full border rounded px-2 py-1 text-sm"
            placeholder="Search by user..."
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">Action</label>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="w-full border rounded px-2 py-1 text-sm"
          >
            <option value="">All</option>
            {uniqueActions.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">From date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="w-full border rounded px-2 py-1 text-sm"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1">To date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="w-full border rounded px-2 py-1 text-sm"
          />
        </div>
      </div>

      {/* Grouping + summary */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <input
            id="groupByAction"
            type="checkbox"
            checked={groupByAction}
            onChange={(e) => setGroupByAction(e.target.checked)}
          />
          <label htmlFor="groupByAction" className="cursor-pointer">
            Group by action
          </label>
        </div>
        <div className="text-gray-600">
          Showing {filteredLogs.length} log
          {filteredLogs.length === 1 ? "" : "s"}
        </div>
      </div>

  {/* Table */}
{!groupByAction && (
  <div className="bg-white rounded shadow overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="bg-[#066A6F]/10 border-b">
          <th className="p-2 border text-[#066A6F]">User</th>
          <th className="p-2 border text-[#066A6F]">Action</th>
          <th className="p-2 border text-[#066A6F]">Entity</th>
          <th className="p-2 border text-[#066A6F]">Timestamp</th>
        </tr>
      </thead>

      <tbody>
        {paginatedLogs.map((log) => (
          <tr
            key={log.id}
            className="border hover:bg-[#066A6F]/10 cursor-pointer transition"
            onClick={() => {
              if (onSelect) onSelect(log);
              else setSelectedLog(log);
            }}
          >
            <td className="p-2 border">
              {log.actor?.username || log.performedBy}
            </td>

            <td className="p-2 border">{log.action}</td>

            <td className="p-2 border">
              {log.targetType}
              {log.targetId ? ` #${log.targetId}` : ""}
            </td>

            <td className="p-2 border">
              {new Date(log.createdAt).toLocaleString()}
            </td>
          </tr>
        ))}

        {paginatedLogs.length === 0 && (
          <tr>
            <td
              colSpan={4}
              className="p-3 text-center text-gray-500 border"
            >
              No logs match the current filters.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
)}

{/* Grouped view */}
{groupByAction && (
  <div className="space-y-4">
    {Object.entries(groupedLogs).map(([action, logs]) => (
      <div key={action} className="bg-white rounded shadow">
        <div className="px-4 py-2 border-b flex justify-between items-center bg-[#066A6F]/10">
          <span className="font-semibold text-[#066A6F]">
            Action: {action === "__all" ? "All" : action}
          </span>
          <span className="text-xs text-gray-500">
            {logs.length} log{logs.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-2 border">User</th>
                <th className="p-2 border">Entity</th>
                <th className="p-2 border">Timestamp</th>
              </tr>
            </thead>

            <tbody>
              {logs.map((log) => (
                <tr
                  key={log.id}
                  className="border hover:bg-blue-50 cursor-pointer"
                  onClick={() => {
                    if (onSelect) onSelect(log);
                    else setSelectedLog(log);
                  }}
                >
                  <td className="p-2 border">
                    {log.actor?.username || log.performedBy}
                  </td>

                  <td className="p-2 border">
                    {log.targetType}
                    {log.targetId ? ` #${log.targetId}` : ""}
                  </td>

                  <td className="p-2 border">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}

              {logs.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="p-3 text-center text-gray-500 border"
                  >
                    No logs in this group.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    ))}
  </div>
)}

{/* Pagination controls */}
{!groupByAction && totalPages > 1 && (
  <div className="flex items-center justify-end gap-2 text-sm">
    <button
      disabled={page === 1}
      onClick={() => setPage((p) => Math.max(1, p - 1))}
      className={`px-3 py-1 rounded border ${
        page === 1
          ? "text-gray-400 border-gray-200 cursor-not-allowed"
          : "text-[#066A6F] border-[#066A6F]/40 hover:bg-[#066A6F]/10"

      }`}
    >
      Prev
    </button>

    <span>
      Page {page} of {totalPages}
    </span>

    <button
      disabled={page === totalPages}
      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
      className={`px-3 py-1 rounded border ${
        page === totalPages
          ? "text-gray-400 border-gray-200 cursor-not-allowed"
          : "text-[#066A6F] border-[#066A6F]/40 hover:bg-[#066A6F]/10"
      }`}
    >
      Next
    </button>
  </div>
)}
      {/* Details modal */}
      <AuditLogDetailsModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
};

export default AuditLogList;
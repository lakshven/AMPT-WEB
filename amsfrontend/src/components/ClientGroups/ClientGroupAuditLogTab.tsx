import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

interface Props {
  groupId: number;
}

export default function ClientGroupAuditLogTab({ groupId }: Props) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ⭐ Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // ⭐ Sorting
  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  // ⭐ Filtering
  const [actionFilter, setActionFilter] = useState("");

  // ⭐ Search
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [groupId, page, sort, order, actionFilter, search]);

  async function fetchLogs() {
    setLoading(true);

    try {
      const res = await axiosInstance.get(
        `/client-groups/${groupId}/audit-logs`,
        {
          params: {
            page,
            limit,
            sort,
            order,
            action: actionFilter || undefined,
            search: search || undefined,
          },
        }
      );

      setLogs(res.data.logs || []);
      setTotalPages(res.data.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Failed to load audit logs", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return (
      <div className="text-gray-500 italic">
        Loading audit logs…
      </div>
    );

  return (
    <div className="space-y-4">

      {/* ⭐ Filters + Sorting */}
      <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg shadow border border-gray-200">

        {/* Search */}
        <input
          type="text"
          placeholder="Search logs..."
          className="border p-2 rounded w-1/3 focus:outline-none focus:ring-2"
          style={{ borderColor: "#0989B1" }}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        {/* Filter by action */}
        <select
          className="border p-2 rounded focus:outline-none focus:ring-2"
          style={{ borderColor: "#0989B1" }}
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Actions</option>
          <option value="USER_ASSIGNED">User Assigned</option>
          <option value="USER_MOVED">User Moved</option>
          <option value="USER_REMOVED">User Removed</option>
          <option value="GROUP_UPDATED">Group Updated</option>
          <option value="GROUP_CREATED">Group Created</option>
        </select>

        {/* Sort field */}
        <select
          className="border p-2 rounded focus:outline-none focus:ring-2"
          style={{ borderColor: "#0989B1" }}
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
        >
          <option value="createdAt">Sort by Date</option>
          <option value="action">Sort by Action</option>
          <option value="performedBy">Sort by Performed By</option>
        </select>

        {/* Sort order */}
        <select
          className="border p-2 rounded focus:outline-none focus:ring-2"
          style={{ borderColor: "#0989B1" }}
          value={order}
          onChange={(e) => {
            setOrder(e.target.value);
            setPage(1);
          }}
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {/* ⭐ Logs */}
      {logs.length === 0 ? (
        <div className="text-gray-500">No audit logs found.</div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="border rounded-lg p-4 bg-white shadow-sm"
              style={{ borderColor: "#0989B1" }}
            >
              <div className="font-semibold text-[#0989B1]">
                {log.action}
              </div>

              {log.details && (
                <pre className="text-xs bg-gray-100 p-2 rounded mt-2 overflow-auto border border-gray-200">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              )}

              <div className="text-xs text-gray-600 mt-2">
                Performed by: {log.performedBy}
              </div>

              <div className="text-xs text-gray-400">
                {new Date(log.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ⭐ Pagination */}
      <div className="flex justify-center items-center gap-4 mt-4">
        <button
          className="px-3 py-1 rounded text-white"
          style={{ backgroundColor: "#0989B1" }}
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>

        <span className="text-gray-700">
          Page {page} of {totalPages}
        </span>

        <button
          className="px-3 py-1 rounded text-white"
          style={{ backgroundColor: "#0989B1" }}
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}

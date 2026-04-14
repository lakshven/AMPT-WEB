import React, { useEffect, useState, useCallback } from "react";
import ActivityLogList from "../../components/CompanyAdmin/activity/ActivityLogList";
import { getCompanyActivityLogs } from "../../services/companyActivityService";

const CompanyActivityLogs: React.FC = () => {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  // ⭐ Corrected filters — strict types for order
  const [filters, setFilters] = useState({
    performedBy: "",
    action: "",
    from: "",
    to: "",
    sort: "createdAt",
    order: "desc" as "asc" | "desc",
    page: 1,
    limit: 25,
  });

  // ⭐ Debounce for user search
  const debounce = (fn: any, delay = 400) => {
    let timer: any;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  const debouncedUserSearch = React.useMemo(() => {
  return debounce((value: string) => {
    setFilters((prev) => ({ ...prev, performedBy: value, page: 1 }));
  });
  }, []);
  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);

      const res = await getCompanyActivityLogs(filters);

      setLogs(res.data ?? []);
      setPagination(res.pagination ?? null);
    } catch (err) {
      console.error("Error loading activity logs:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // ⭐ Sorting handler — fixed type
  const handleSort = (field: string) => {
    setFilters((prev) => ({
      ...prev,
      sort: field,
      order: (prev.order === "asc" ? "desc" : "asc") as "asc" | "desc",
      page: 1,
    }));
  };

  // ⭐ Clear Filters
  const clearFilters = () => {
    setFilters({
      performedBy: "",
      action: "",
      from: "",
      to: "",
      sort: "createdAt",
      order: "desc" as "asc" | "desc",
      page: 1,
      limit: 25,
    });
  };

  // ⭐ Date Presets
  const applyPreset = (days: number) => {
    const to = new Date().toISOString().split("T")[0];
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    setFilters((prev) => ({ ...prev, from, to, page: 1 }));
  };

  // ⭐ CSV Export
  const exportCSV = () => {
    const header = "User,Action,Timestamp\n";
    const rows = logs
      .map((log: any) => `${log.performedBy},${log.action},${log.timestamp}`)
      .join("\n");

    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "activity_logs.csv";
    a.click();
  };

  // ⭐ Extract unique actions
  const uniqueActions = Array.from(new Set(logs.map((l: any) => l.action)));

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-[#0989B1] mb-6">
        Company Activity Logs
      </h1>

      {/* ⭐ TOP FILTER BAR */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">

          {/* Search User */}
          <input
            type="text"
            placeholder="Search user..."
            onChange={(e) => debouncedUserSearch(e.target.value)}
            className="border p-2 rounded w-48"
          />

          {/* Action Dropdown */}
          <select
            value={filters.action}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, action: e.target.value, page: 1 }))
            }
            className="border p-2 rounded w-40"
          >
            <option value="">All Actions</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>

          {/* Date From */}
          <input
            type="date"
            value={filters.from}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, from: e.target.value, page: 1 }))
            }
            className="border p-2 rounded"
          />

          {/* Date To */}
          <input
            type="date"
            value={filters.to}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, to: e.target.value, page: 1 }))
            }
            className="border p-2 rounded"
          />

          {/* Clear Filters */}
          <button
            onClick={clearFilters}
            className="px-3 py-2 border rounded text-sm"
          >
            Clear
          </button>

          {/* Date Presets */}
          <button
            onClick={() => applyPreset(7)}
            className="px-3 py-2 border rounded text-sm"
          >
            Last 7 Days
          </button>

          <button
            onClick={() => applyPreset(30)}
            className="px-3 py-2 border rounded text-sm"
          >
            Last 30 Days
          </button>
        </div>

        {/* CSV Export */}
        <button
          onClick={exportCSV}
          className="bg-green-600 text-white px-4 py-2 rounded shadow"
        >
          Export CSV
        </button>
      </div>

      {/* Logs Table */}
      {loading ? (
        <p className="text-gray-600">Loading activity logs...</p>
      ) : (
        <ActivityLogList logs={logs} onSort={handleSort} />
      )}

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center gap-4 mt-4">
          <button
            disabled={filters.page === 1}
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: prev.page - 1 }))
            }
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            disabled={filters.page === pagination.totalPages}
            onClick={() =>
              setFilters((prev) => ({ ...prev, page: prev.page + 1 }))
            }
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CompanyActivityLogs;

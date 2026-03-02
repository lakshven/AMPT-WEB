import React, { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";

import AuditLogList from "../../components/AuditLogs/AuditLogList";
import AuditLogSearch from "../../components/AuditLogs/AuditLogSearch";
import AuditLogFilters from "../../components/AuditLogs/AuditLogFilters";
import AuditLogPagination from "../../components/AuditLogs/AuditLogPagination";
import AuditLogAnalytics from "../../components/AuditLogs/AuditLogAnalytics";
import AuditLogExportButton from "../../components/AuditLogs/AuditLogExportButtons";
import AuditLogMetadata from "../../components/AuditLogs/AuditLogMetadataViewer";
import AuditLogSearchResults from "../../components/AuditLogs/AuditLogSearchResults";

import { AuditLog } from "../../types/AuditLog";
import AuditLogMetadataViewer from "../../components/AuditLogs/AuditLogMetadataViewer";

const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchResults, setSearchResults] = useState<AuditLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);

  const loadPaginatedLogs = () => {
    axiosInstance
      .get(`/audit-logs/paginated?page=${page}&limit=${limit}`)
      .then((res) => {
        setLogs(res.data.logs || []);
        setTotal(res.data.total || 0);
      })
      .catch((err) => console.error("Failed to load logs:", err));
  };

  useEffect(() => {
    loadPaginatedLogs();
  }, [page, limit]);

  const handleSearch = (query: string) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    axiosInstance
      .get(`/audit-logs/search?q=${query}`)
      .then((res) => setSearchResults(res.data.logs || []))
      .catch((err) => console.error("Search failed:", err));
  };

  const handleFilter = (filters: any) => {
    axiosInstance
      .post(`/audit-logs/filter`, filters)
      .then((res) => setLogs(res.data.logs || []))
      .catch((err) => console.error("Filter failed:", err));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Audit Logs</h1>

      <AuditLogAnalytics />
      <AuditLogExportButton />
      <AuditLogSearch onSearch={handleSearch} />
      <AuditLogFilters onFilter={handleFilter} />

      {searchResults.length > 0 ? (
        <AuditLogSearchResults
          results={searchResults}
        />
      ) : (
        <>
          <AuditLogList logs={logs}  />
          <AuditLogPagination
            total={total}
            page={page}
            limit={limit}
            onChange={(p, l) => {
              setPage(p);
              setLimit(l);
            }}
          />
        </>
      )}

      {selectedLog && (
        <AuditLogMetadataViewer
          metadata={selectedLog.metadata}
          details={selectedLog.details}
          actor={selectedLog.actor}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
};

export default AuditLogsPage;
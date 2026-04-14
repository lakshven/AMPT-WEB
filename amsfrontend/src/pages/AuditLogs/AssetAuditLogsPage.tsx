// pages/AuditLogs/AssetAuditLogsPage.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { AuditLog } from "../../types/AuditLog";

// ✅ Correct import path (component, not page)
import AuditLogList from "../../components/AuditLogs/AuditLogList";
import AuditLogMetadataViewer from "../../components/AuditLogs/AuditLogMetadataViewer";

const AssetAuditLogsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    if (!id) {
      setError("Missing asset ID");
      setLoading(false);
      return;
    }

    const assetId = Number(id);
    if (Number.isNaN(assetId)) {
      setError("Invalid asset ID");
      setLoading(false);
      return;
    }

    axiosInstance
      .get(`/assets/${assetId}/audit-logs`)
      .then((res) => {
        setLogs(res.data.logs || []);
      })
      .catch((err) => {
        console.error("Failed to fetch asset audit logs:", {
          status: err.response?.status,
          data: err.response?.data,
          url: err.config?.url,
          message: err.message,
        });

        if (err.response?.status === 404) {
          setError("Asset not found or no logs available");
        } else if (err.response?.status === 403) {
          setError("You are not allowed to view logs for this asset");
        } else {
          setError("Failed to load audit logs");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Asset Audit Logs</h1>
        <p>Loading logs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Asset Audit Logs</h1>
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Asset Audit Logs</h1>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Back
        </button>
      </div>

      {/* Reuse your enhanced AuditLogList component */}
      <AuditLogList logs={logs} />
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

export default AssetAuditLogsPage;
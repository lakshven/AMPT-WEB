// src/components/AuditLogs/AuditLogDetailsModal.tsx
import React from "react";
import { AuditLog } from "../../types/AuditLog";

interface AuditLogDetailsModalProps {
  log: AuditLog | null;
  onClose: () => void;
}

const AuditLogDetailsModal: React.FC<AuditLogDetailsModalProps> = ({
  log,
  onClose,
}) => {
  if (!log) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded shadow-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-lg font-bold">Audit Log Details</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto max-h-[70vh]">
          {/* Actor */}
          {log.actor && (
            <div>
              <span className="font-semibold">Actor:</span>{" "}
              <span>
                {log.actor.username} ({log.actor.role})
              </span>
            </div>
          )}

          <div>
            <span className="font-semibold">Performed By:</span>{" "}
            <span>{log.performedBy}</span>
          </div>
          <div>
            <span className="font-semibold">Action:</span>{" "}
            <span>{log.action}</span>
          </div>
          <div>
            <span className="font-semibold">Target:</span>{" "}
            <span>
              {log.targetType}
              {log.targetId ? ` #${log.targetId}` : ""}
            </span>
          </div>
          <div>
            <span className="font-semibold">Timestamp:</span>{" "}
            <span>{new Date(log.createdAt).toLocaleString()}</span>
          </div>

          <div>
            <span className="font-semibold">Client Group ID:</span>{" "}
            <span>{log.clientGroupId ?? "N/A"}</span>
          </div>
          {/* DETAILS */}
          <div>
            <span className="font-semibold">Details:</span>
            <pre className="mt-2 bg-gray-100 rounded p-2 text-xs overflow-x-auto">
              {log.details
                ? JSON.stringify(log.details, null, 2)
                : "// No details"}
            </pre>
          </div>


          <div>
            <span className="font-semibold">Metadata:</span>
            <pre className="mt-2 bg-gray-100 rounded p-2 text-xs overflow-x-auto">
              {log.metadata
                ? JSON.stringify(log.metadata, null, 2)
                : "// No metadata"}
            </pre>
          </div>
        </div>

        <div className="px-4 py-3 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditLogDetailsModal;
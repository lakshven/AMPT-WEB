import React from "react";
import { Modal } from "antd";

interface Props {
  metadata: Record<string, any> | null;
  details?: Record<string, any> | null;
  actor?: {
    id: number;
    username: string;
    role: string;
  } | null;
  onClose: () => void;
}



const AuditLogMetadataViewer: React.FC<Props> = ({ metadata, details, actor, onClose }) => {
  return (
    <Modal
      open={true}
      title="Audit Log Details"
      onCancel={onClose}
      onOk={onClose}
      width={600}
    >
      {actor && (
        <div className="mb-4">
          <strong>Actor:</strong> {actor.username} ({actor.role})
        </div>
      )}

      <div className="mb-4">
        <strong>Details:</strong>
        {!details ? (
          <p>No details available</p>
        ) : (
          <pre
            style={{
              background: "#f5f5f5",
              padding: "12px",
              borderRadius: "6px",
              maxHeight: "300px",
              overflow: "auto"
            }}
          >
            {JSON.stringify(details, null, 2)}
          </pre>
        )}
      </div>

      <div>
        <strong>Metadata:</strong>
        {!metadata ? (
          <p>No metadata available</p>
        ) : (
          <pre
            style={{
              background: "#f5f5f5",
              padding: "12px",
              borderRadius: "6px",
              maxHeight: "300px",
              overflow: "auto"
            }}
          >
            {JSON.stringify(metadata, null, 2)}
          </pre>
        )}
      </div>
    </Modal>


  );
};

export default AuditLogMetadataViewer;
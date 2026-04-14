import React from "react";
import { List, Card, Tag } from "antd";
import { AuditLog } from "../../types/AuditLog";

interface Props {
  results: AuditLog[];
  onSelect?: (log: AuditLog) => void;
}

const AuditLogSearchResults: React.FC<Props> = ({ results, onSelect }) => {
  if (!results.length) {
    return (
      <Card style={{ marginTop: 16 }}>
        No matching audit logs found.
      </Card>
    );
  }

  return (
    <Card title="Search Results" style={{ marginTop: 16 }}>
      <List
        dataSource={results}
        renderItem={(log) => (
          <List.Item
            style={{ cursor: "pointer" }}
            onClick={() => onSelect && onSelect(log)}
          >
            <List.Item.Meta
              title={
                <>
                  <Tag color="blue">{log.action}</Tag>
                  <span style={{ marginLeft: 8 }}>
                    {log.actor?.username || log.performedBy}
                  </span>
                </>
              }
              description={
                <>
                  <div>
                    Target: {log.targetType} — {log.targetId ?? "N/A"}
                  </div>
                  <div>
                    {new Date(log.createdAt).toLocaleString()}
                  </div>
                </>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default AuditLogSearchResults;
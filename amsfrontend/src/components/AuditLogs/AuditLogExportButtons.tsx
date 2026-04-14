import React from "react";
import { Button, Space } from "antd";
import { DownloadOutlined } from "@ant-design/icons";

const AuditLogExportButtons: React.FC = () => {
  const handleExport = (type: "csv" | "excel") => {
    const url = `/api/audit-logs/export/${type}`;
    window.open(url, "_blank");
  };

  return (
    <Space>
      <Button
        icon={<DownloadOutlined />}
        onClick={() => handleExport("csv")}
      >
        Export CSV
      </Button>
      <Button
        icon={<DownloadOutlined />}
        onClick={() => handleExport("excel")}
      >
        Export Excel
      </Button>
    </Space>
  );
};

export default AuditLogExportButtons;
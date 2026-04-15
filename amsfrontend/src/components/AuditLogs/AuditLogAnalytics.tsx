import React, { useEffect, useState } from "react";
import { Card, Statistic, Row, Col, List } from "antd";
import axiosInstance from "../../utils/axiosInstance";

interface AnalyticsData {
  totalLogs: number;
  logsLast30Days: number;
  topActions: { action: string; _count: { action: number } }[];
  topUsers: { performedBy: string; _count: { performedBy: number } }[];
}

const AuditLogAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
useEffect(() => {
    axiosInstance
      .get("/audit-logs/analytics")
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to load audit analytics", err));
  }, []);

  if (!data) return null;

  return (
    <Row gutter={16} style={{ marginBottom: 24 }}>
      <Col span={6}>
        <Card>
          <Statistic title="Total Logs" value={data.totalLogs} />
        </Card>
      </Col>

      <Col span={6}>
        <Card>
          <Statistic title="Last 30 Days" value={data.logsLast30Days} />
        </Card>
      </Col>

      <Col span={6}>
        <Card title="Top Actions">
          <List
            dataSource={data.topActions}
            renderItem={(item) => (
              <List.Item>
                {item.action} — {item._count.action}
              </List.Item>
            )}
          />
        </Card>
      </Col>

      <Col span={6}>
        <Card title="Top Users">
          <List
            dataSource={data.topUsers}
            renderItem={(item) => (
              <List.Item>
                {item.performedBy} — {item._count.performedBy}
              </List.Item>
            )}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default AuditLogAnalytics;
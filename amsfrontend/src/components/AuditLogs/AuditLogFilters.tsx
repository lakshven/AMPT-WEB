import React, { useState } from "react";
import { Select, DatePicker, Space, Button } from "antd";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;

interface Props {
  onFilter: (filters: {
    action?: string;
    performedBy?: string;
    from?: string;
    to?: string;
  }) => void;
}

const AuditLogFilters: React.FC<Props> = ({ onFilter }) => {
  const [action, setAction] = useState<string | undefined>();
  const [performedBy, setPerformedBy] = useState<string | undefined>();
  const [range, setRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  const handleApply = () => {
    const filters: any = {};

    if (action) filters.action = action;
    if (performedBy) filters.performedBy = performedBy;

    if (range && range[0] && range[1]) {
      filters.from = range[0].toISOString();
      filters.to = range[1].toISOString();
    }

    onFilter(filters);
  };

  return (
    <Space wrap style={{ marginBottom: 16 }}>
      <Select
        placeholder="Action"
        allowClear
        style={{ width: 160 }}
        value={action}
        onChange={setAction}
        options={[
          { label: "create", value: "create" },
          { label: "update", value: "update" },
          { label: "delete", value: "delete" },
          { label: "login", value: "login" },
          { label: "logout", value: "logout" },
          { label: "restore", value: "restore" },
          { label: "routeOrder", value: "routeOrder" },
          { label: "optimizeRoute", value: "optimizeRoute" }
        ]}
      />

      <Select
        placeholder="Performed By"
        allowClear
        style={{ width: 160 }}
        value={performedBy}
        onChange={setPerformedBy}
        options={[
          { label: "Lakshmi", value: "Lakshmi" },
          { label: "System", value: "System" }
        ]}
      />

      <RangePicker value={range} onChange={setRange} />

      <Button type="primary" onClick={handleApply}>
        Apply Filters
      </Button>
    </Space>
  );
};

export default AuditLogFilters;
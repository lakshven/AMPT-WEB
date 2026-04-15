import React, { useState } from "react";
import { Input } from "antd";

interface Props {
  onSearch: (query: string) => void;
}

const AuditLogSearch: React.FC<Props> = ({ onSearch }) => {
  const [value, setValue] = useState("");

  const handleSearch = () => {
    onSearch(value.trim());
  };

  return (
    <Input.Search
      placeholder="Search audit logs..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onSearch={handleSearch}
      allowClear
      enterButton
      style={{ marginBottom: 16 }}
    />
  );
};

export default AuditLogSearch;
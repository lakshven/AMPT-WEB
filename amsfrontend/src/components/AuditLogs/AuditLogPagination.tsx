import React from "react";
import { Pagination } from "antd";

interface Props {
  total: number;
  page: number;
  limit: number;
  onChange: (page: number, limit: number) => void;
}

const AuditLogPagination: React.FC<Props> = ({
  total,
  page,
  limit,
  onChange
}) => {
  return (
    <Pagination
      current={page}
      pageSize={limit}
      total={total}
      showSizeChanger
      onChange={onChange}
      style={{ marginTop: 16 }}
    />
  );
};

export default AuditLogPagination;
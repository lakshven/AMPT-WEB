import React from "react";
import { formatDate } from "../../../utils/date";
interface Log {
  id: number;
  performedBy: string;
  action: string;
  timestamp: string;
  details?: any;
}

interface Props {
  logs: Log[];
  onSort: (field: string) => void; // ⭐ Sorting callback
}

const ActivityLogList: React.FC<Props> = ({ logs, onSort }) => {
  if (!logs.length) {
    return <p className="text-gray-600">No activity logs found.</p>;
  }
  // ⭐ Safe renderer for details (handles objects, arrays, null, strings)
  const renderDetails = (details: any) => {
    if (!details) return "-";

    if (typeof details === "string") return details;

    try {
      return JSON.stringify(details);
    } catch (err) {
      return "-";
    }}
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
             {/* ⭐ Clickable sortable headers */}
            <th
              className="py-2 font-semibold cursor-pointer hover:text-[#0989B1]"
              onClick={() => onSort("performedBy")}
            >
              User
            </th>

            <th
              className="py-2 font-semibold cursor-pointer hover:text-[#0989B1]"
              onClick={() => onSort("action")}
            >
              Action
            </th>

            <th
              className="py-2 font-semibold cursor-pointer hover:text-[#0989B1]"
              onClick={() => onSort("createdAt")}
            >
              Timestamp
            </th>
            <th className="py-2 font-semibold">Details</th> {/* ⭐ New column */}
          </tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id} className="border-b">
              <td className="py-2">{log.performedBy}</td>
              <td className="py-2">{log.action}</td>
              <td className="py-2"> {formatDate(log.timestamp)} </td>
              <td className="py-2 text-gray-700">
                {renderDetails(log.details)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityLogList;
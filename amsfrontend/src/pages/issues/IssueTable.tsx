import React from "react";
import { Issue } from "../../types/IssueTypes";

interface IssueTableProps {
  issues: Issue[];
  sortBy: string;
  sortDirection: "asc" | "desc";
  onSort: (field: string) => void;
  onView: (id: number) => void;
  onEdit?: (id: number) => void;
  onAssign?: (id: number) => void;
  onComplete?: (id: number) => void;
  onDelete?: (id: number) => void;
  onRestore?: (id: number) => void;
  canEdit: boolean;
  canAssign: boolean;
  canComplete: boolean;
  canDelete: boolean;
}

const IssueTable: React.FC<IssueTableProps> = ({
  issues,
  sortBy,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onAssign,
  onComplete,
  onDelete,
  onRestore,
  canEdit,
  canAssign,
  canComplete,
  canDelete,
}) => {
  const renderSortArrow = (field: string) => {
    if (sortBy !== field) return null;
    return sortDirection === "asc" ? "▲" : "▼";
  };

  return (
    <div className="rounded-lg shadow-md overflow-hidden border border-[#E2E8F0]">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[#0989B1] text-white border-b-4 border-[#549E39]">

            <th
              className="p-3 border border-[#E2E8F0] cursor-pointer text-left font-semibold"
              onClick={() => onSort("id")}
            >
              ID {renderSortArrow("id")}
            </th>

            <th
              className="p-3 border border-[#E2E8F0] cursor-pointer text-left font-semibold"
              onClick={() => onSort("title")}
            >
              Title {renderSortArrow("title")}
            </th>

            <th
              className="p-3 border border-[#E2E8F0] cursor-pointer text-left font-semibold"
              onClick={() => onSort("score")}
            >
              Score {renderSortArrow("score")}
            </th>

            <th
              className="p-3 border border-[#E2E8F0] cursor-pointer text-left font-semibold"
              onClick={() => onSort("status")}
            >
              Status {renderSortArrow("status")}
            </th>

            <th className="p-3 border border-[#E2E8F0] text-left font-semibold">
              Location
            </th>

            <th className="p-3 border border-[#E2E8F0] text-left font-semibold">
              Assigned To
            </th>

            <th className="p-3 border border-[#E2E8F0] text-left font-semibold">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {issues.map((issue) => (
            <tr
              key={issue.id}
              className="hover:bg-[#E6F4F7] transition-colors"
            >
              <td className="p-3 border border-[#E2E8F0]">{issue.id}</td>

              <td className="p-3 border border-[#E2E8F0]">{issue.title}</td>

              <td className="p-3 border border-[#E2E8F0] font-semibold text-[#549E39]">
                {issue.score ?? "N/A"}
              </td>

              <td className="p-3 border border-[#E2E8F0] capitalize">
                {issue.status}
              </td>

              <td className="p-3 border border-[#E2E8F0]">
                {issue.asset?.location ?? "N/A"}
              </td>

              <td className="p-3 border border-[#E2E8F0]">
                {issue.assignedUser
                  ? `${issue.assignedUser.firstname} ${issue.assignedUser.lastname}`
                  : "Unassigned"}
              </td>

              <td className="p-3 border border-[#E2E8F0] space-x-3">

                {issue.status === "deleted" ? (
                  <button
                    onClick={() => onRestore?.(issue.id)}
                    className="text-[#0989B1] font-medium hover:underline"
                  >
                    Restore
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onView(issue.id)}
                      className="text-[#0989B1] font-medium hover:underline"
                    >
                      View
                    </button>

                    {canEdit && (
                      <button
                        onClick={() => onEdit?.(issue.id)}
                        className="text-[#549E39] font-medium hover:underline"
                      >
                        Edit
                      </button>
                    )}

                    {canAssign && (
                      <button
                        onClick={() => onAssign?.(issue.id)}
                        className="text-purple-700 font-medium hover:underline"
                      >
                        Assign
                      </button>
                    )}

                    {canComplete && (
                      <button
                        onClick={() => onComplete?.(issue.id)}
                        className="text-orange-600 font-medium hover:underline"
                      >
                        Complete
                      </button>
                    )}

                    {canDelete && (
                      <button
                        onClick={() => onDelete?.(issue.id)}
                        className="text-red-600 font-medium hover:underline"
                      >
                        Delete
                      </button>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IssueTable;
import React from "react";

interface ClientGroup {
  id: number;
  name: string;
  department?: string | null;
  isDeleted?: boolean;
  accessCode: string;
  createdAt: string;
}

interface ClientGroupsTableProps {
  groups: ClientGroup[];
  onEdit: (group: ClientGroup) => void;
  onDelete: (group: ClientGroup) => void;
  onRestore: (group: ClientGroup) => void;
}

export default function ClientGroupsTable({
  groups,
  onEdit,
  onDelete,
  onRestore,
}: ClientGroupsTableProps) {
  return (
    <div className="w-full border rounded-lg shadow-sm bg-white">
      <table className="w-full text-left">
        <thead className="bg-gray-100 border-b">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Department</th>
            <th className="p-3">Status</th>
            <th className="p-3 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {groups.map((group) => (
            <tr key={group.id} className="border-b hover:bg-gray-50">
              <td className="p-3">{group.name}</td>
              <td className="p-3">{group.department || "-"}</td>
              <td className="p-3">
                {group.isDeleted ? (
                  <span className="text-red-600 font-medium">Deleted</span>
                ) : (
                  <span className="text-green-700 font-medium">Active</span>
                )}
              </td>

              <td className="p-3 text-right space-x-3">
                {!group.isDeleted && (
                  <button
                    onClick={() => onEdit(group)}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </button>
                )}

                {!group.isDeleted && (
                  <button
                    onClick={() => onDelete(group)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                )}

                {group.isDeleted && (
                  <button
                    onClick={() => onRestore(group)}
                    className="text-green-600 hover:underline"
                  >
                    Restore
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
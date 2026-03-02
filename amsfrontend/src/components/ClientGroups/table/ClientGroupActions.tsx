import React from "react";

interface ClientGroup {
  id: number;
  name: string;
  isDeleted?: boolean;
}

interface ClientGroupActionsProps {
  group: ClientGroup;
  onEdit: (group: ClientGroup) => void;
  onDelete: (group: ClientGroup) => void;
  onRestore: (group: ClientGroup) => void;
}

export default function ClientGroupActions({
  group,
  onEdit,
  onDelete,
  onRestore,
}: ClientGroupActionsProps) {
  return (
    <div className="mt-1 space-x-3 text-sm">
      {!group.isDeleted && (
        <>
          <button
            onClick={() => onEdit(group)}
            className="text-blue-600 hover:underline"
          >
            Edit
          </button>

          <button
            onClick={() => onDelete(group)}
            className="text-red-600 hover:underline"
          >
            Delete
          </button>
        </>
      )}

      {group.isDeleted && (
        <button
          onClick={() => onRestore(group)}
          className="text-green-600 hover:underline"
        >
          Restore
        </button>
      )}
    </div>
  );
}
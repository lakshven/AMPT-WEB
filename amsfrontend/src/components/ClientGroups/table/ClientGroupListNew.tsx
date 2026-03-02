import React from "react";

interface ClientGroup {
  id: number;
  name: string;
  department?: string | null;
  isDeleted?: boolean;
  createdAt: string;
}

interface ClientGroupListNewProps {
  groups: ClientGroup[];
  onInvite: (groupId: number) => void;
}

export default function ClientGroupListNew({
  groups,
  onInvite,
}: ClientGroupListNewProps) {
  if (groups.length === 0) {
    return (
      <p className="text-gray-500 text-sm text-center py-6">
        No client groups yet.
      </p>
    );
  }

  return (
    <ul className="space-y-4 mb-10">
      {groups.map((g) => (
        <li
          key={g.id}
          className="bg-white shadow-sm border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="text-lg font-semibold text-gray-900">
                {g.name}
              </div>

              <div className="text-xs text-gray-500 mt-1">
                Created: {new Date(g.createdAt).toLocaleString()}
              </div>

              <div className="text-xs mt-1">
                Status:{" "}
                {g.isDeleted ? (
                  <span className="text-red-600 font-medium">Deleted</span>
                ) : (
                  <span className="text-green-700 font-medium">Active</span>
                )}
              </div>

              <button
                className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                onClick={() => onInvite(g.id)}
              >
                <span className="underline">Invite User (New Token Flow)</span>
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
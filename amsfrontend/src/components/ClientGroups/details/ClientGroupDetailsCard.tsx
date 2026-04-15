import React from "react";

interface ClientGroupDetailsCardProps {
  group: {
    id: number;
    name: string;
    department?: string | null;
    accessCode?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
}

export default function ClientGroupDetailsCard({ group }: ClientGroupDetailsCardProps) {
  return (
    <div className="bg-white p-4 rounded shadow space-y-3">
      <h3 className="text-lg font-semibold text-gray-800">Client Group Details</h3>

      <div className="text-sm">
        <p>
          <span className="font-medium">Name:</span> {group.name}
        </p>

        {group.department && (
          <p>
            <span className="font-medium">Department:</span> {group.department}
          </p>
        )}

        {group.accessCode && (
          <p>
            <span className="font-medium">Access Code:</span> {group.accessCode}
          </p>
        )}

        {group.createdAt && (
          <p>
            <span className="font-medium">Created:</span>{" "}
            {new Date(group.createdAt).toLocaleDateString()}
          </p>
        )}

        {group.updatedAt && (
          <p>
            <span className="font-medium">Updated:</span>{" "}
            {new Date(group.updatedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
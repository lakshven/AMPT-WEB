import React from "react";

interface ClientGroupFormProps {
  name: string;
  department: string;
  setName: (value: string) => void;
  setDepartment: (value: string) => void;
  error?: string;
}

export default function ClientGroupForm({
  name,
  department,
  setName,
  setDepartment,
  error,
}: ClientGroupFormProps) {
  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div>
        <label className="text-sm font-medium">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded mt-1"
          placeholder="Enter client group name"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Department</label>
        <input
          type="text"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="w-full border px-3 py-2 rounded mt-1"
          placeholder="Enter department (optional)"
        />
      </div>
    </div>
  );
}
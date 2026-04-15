import React from "react";

interface ClientGroupUserFormProps {
  email: string;
  setEmail: (value: string) => void;

  name: string;
  setName: (value: string) => void;

  role: string;
  setRole: (value: string) => void;

  groupId: number | null;
  setGroupId: (value: number) => void;

  groups: { id: number; name: string }[]; // for dropdown

  error?: string;
}

export default function ClientGroupUserForm({
  email,
  setEmail,
  name,
  setName,
  role,
  setRole,
  groupId,
  setGroupId,
  groups,
  error,
}: ClientGroupUserFormProps) {
  return (
    <div className="flex flex-col gap-4">

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* Email */}
      <div>
        <label className="text-sm font-medium">User Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded mt-1"
          placeholder="Enter user email"
        />
      </div>

      {/* Name */}
      <div>
        <label className="text-sm font-medium">User Name (optional)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border px-3 py-2 rounded mt-1"
          placeholder="Enter user name"
        />
      </div>

      {/* Role */}
      <div>
        <label className="text-sm font-medium">Role</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="w-full border px-3 py-2 rounded mt-1"
        >
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Client Group */}
      <div>
        <label className="text-sm font-medium">Client Group</label>
        <select
          value={groupId ?? ""}
          onChange={(e) => setGroupId(Number(e.target.value))}
          className="w-full border px-3 py-2 rounded mt-1"
        >
          <option value="">Select a group</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

    </div>
  );
}
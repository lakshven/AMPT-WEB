import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";
import ClientGroupUserForm from "./ClientGroupUserForm";

interface AssignUserModalProps {
  clientGroupId: number;
  isOpen: boolean;
  onClose: () => void;
  onAssigned: () => void;
}

export default function AssignUserModal({
  clientGroupId,
  isOpen,
  onClose,
  onAssigned,
}: AssignUserModalProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("viewer");
  const [groupId, setGroupId] = useState<number | null>(clientGroupId);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setGroupId(clientGroupId);
      fetchUsers();
    }
  }, [isOpen, clientGroupId]);

  async function fetchUsers() {
    try {
      const res = await axiosInstance.get("/users");
      setUsers(res.data.users || []);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  }

  async function assignUser() {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!groupId) {
      setError("Group ID missing");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await axiosInstance.post("/client-groups/assign-user", {
        email,
        name: name.trim() || null,
        role,
        clientGroupId: groupId,
      });

      onAssigned();
      onClose();
    } catch (err) {
      console.error("Failed to assign user", err);
      setError("Failed to assign user");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[420px]">
        <h2 className="text-xl font-semibold mb-4">Assign User to Group</h2>

        <ClientGroupUserForm
          email={email}
          setEmail={setEmail}
          name={name}
          setName={setName}
          role={role}
          setRole={setRole}
          groupId={groupId}
          setGroupId={setGroupId}
          groups={[{ id: clientGroupId, name: "Selected Group" }]}
          error={error}
        />

        <div className="flex justify-end gap-3 mt-4">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={assignUser}
            disabled={loading}
          >
            {loading ? "Assigning..." : "Assign"}
          </button>
        </div>
      </div>
    </div>
  );
}
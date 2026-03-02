import React, { useEffect, useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";

interface MoveUserModalProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onMoved: () => void;
}

export default function MoveUserModal({
  user,
  isOpen,
  onClose,
  onMoved,
}: MoveUserModalProps) {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchGroups();
    }
  }, [isOpen]);

  async function fetchGroups() {
    try {
      const res = await axiosInstance.get("/client-groups", {
        params: { filter: "active", sort: "name", order: "asc" },
      });

      const filtered = res.data.groups.filter(
        (g: any) => g.id !== user?.clientGroupId
      );

      setGroups(filtered);
    } catch (err) {
      console.error("Failed to fetch client groups", err);
    }
  }

  async function moveUser() {
    if (!selectedGroupId || !user) return;

    setLoading(true);
    try {
      await axiosInstance.post("/client-groups/move-user", {
        userId: user.id,
        newGroupId: selectedGroupId,
      });

      onMoved();
      onClose();
    } catch (err) {
      console.error("Failed to move user", err);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[420px]">
        <h2 className="text-xl font-semibold mb-4">
          Move User: {user.firstname} {user.lastname}
        </h2>

        <label className="block mb-2 font-medium">Select New Client Group</label>

        <select
          className="w-full border p-2 rounded mb-4"
          value={selectedGroupId || ""}
          onChange={(e) => setSelectedGroupId(Number(e.target.value))}
        >
          <option value="">Select a group</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name} {g.department ? `(${g.department})` : ""}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={moveUser}
            disabled={loading || !selectedGroupId}
          >
            {loading ? "Moving..." : "Move User"}
          </button>
        </div>
      </div>
    </div>
  );
}
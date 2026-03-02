import { useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";

interface EditClientGroupModalProps {
  group: {
    id: number;
    name: string;
    department?: string | null;
    accessCode: string;
    createdAt: string;
    isDeleted?: boolean;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditClientGroupModal({
  group,
  onClose,
  onSuccess,
}: EditClientGroupModalProps) {
  const [name, setName] = useState(group.name);
  const [department, setDepartment] = useState(group.department || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    console.log("Save clicked");
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.put("/client-groups/update", {
        id: group.id,
        name: name.trim(),
        department: department.trim() || null,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Update failed");
      }
    
      onSuccess(); // refresh table
      setTimeout(() => {
      onClose();
    }, 50);
  // close modal
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4">Edit Client Group</h2>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <div className="flex flex-col gap-3">
          <div>
            <label className="text-sm font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Department</label>
            <input
              type="text"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full border px-3 py-2 rounded mt-1"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
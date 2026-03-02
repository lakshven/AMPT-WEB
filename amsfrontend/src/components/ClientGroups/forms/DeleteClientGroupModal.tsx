import { useState } from "react";
import axiosInstance from "../../../utils/axiosInstance";

interface DeleteClientGroupModalProps {
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

export default function DeleteClientGroupModal({
  group,
  onClose,
  onSuccess,
}: DeleteClientGroupModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.put("/client-groups/delete", {
        id: group.id,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Delete failed");
      }

      onSuccess(); // refresh table
     // Close modal AFTER axios + refresh
      setTimeout(() => {
        onClose();
      }, 50);


    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[9999]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4 text-red-600">
          Delete Client Group
        </h2>

        <p className="text-sm text-gray-700 mb-4">
          Are you sure you want to delete <strong>{group.name}</strong>?  
          This action can be reversed later using Restore.
        </p>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <div className="flex justify-end gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            disabled={loading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
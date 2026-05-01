import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { FileColumn } from "./FileCell";
interface FileChoiceModalProps {
  rowId: number | null;
  column: FileColumn;
  onClose: () => void;
  onChooseUpload: () => void; // NEW
  onSuccess: () => void; // NEW
  setUploadedFile: React.Dispatch<React.SetStateAction<File | null>>;
  setDefaultSelected?: React.Dispatch<React.SetStateAction<boolean>>; // ⭐ NEW
  hasExistingFile?: boolean; // ⭐ NEW
}

export default function FileChoiceModal({
  rowId,
  column,
  onClose,
  onChooseUpload,
  onSuccess,
  setUploadedFile,
  setDefaultSelected,
  hasExistingFile = true
}: FileChoiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUseDefault = async () => {
    try {
      
      setError("");
      // ⭐ CASE 1: NEW ASSET → handle in frontend only
      if (rowId === null || isNaN(Number(rowId))) {
        setUploadedFile(null);
        setDefaultSelected && setDefaultSelected(true);
        onClose();
        onSuccess();
        return;
      }
      setLoading(true);
      const response = await axiosInstance.post("/upload/set-default-file", {
        rowId,
        column,
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to set default file");
      }
      setUploadedFile(null);
      setDefaultSelected && setDefaultSelected(true);

      onClose();
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  // ⭐ DELETE FILE
  const handleDeleteFile = async () => {
    try {
      if (!rowId) {
        setError("Cannot delete file for unsaved asset");
        return;
      }

      setLoading(true);
      setError("");

      const res = await axiosInstance.delete(
        `/assets/${rowId}/file?column=${column}`
      );

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to delete file");
      }

      setUploadedFile(null);
      setDefaultSelected && setDefaultSelected(false);

      onClose();
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to delete file");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4">Choose File Option</h2>

        <p className="text-sm text-gray-600 mb-4">
          Select how you want to attach the file for this asset.
        </p>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleUseDefault}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-300"
          >
            {loading ? "Saving..." : "Use Default File"}
          </button>

          <button
            onClick={() => {
              // ⭐ Reset uploaded file before opening upload modal
              setUploadedFile(null);
              setDefaultSelected && setDefaultSelected(false);
              onChooseUpload();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Upload Your File
          </button>
          
           {/* ⭐ DELETE EXISTING FILE */}
          {hasExistingFile && (
            <button
              onClick={handleDeleteFile}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300"
            >
              {loading ? "Deleting..." : "Delete File"}
            </button>
          )}
 
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

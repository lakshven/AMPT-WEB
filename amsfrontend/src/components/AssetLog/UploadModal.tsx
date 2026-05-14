import { useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { FileColumn } from "./FileCell";

interface UploadModalProps {
  rowId: number | null;
  column: FileColumn;
  existingCount: number;        // ⭐ NEW — how many files already exist
  onClose: () => void;
  onSuccess: () => void;
}

const ALLOWED_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

const MAX_SIZE_MB = 10;

export default function UploadModal({
  rowId,
  column,
  existingCount,
  onClose,
  onSuccess,
}: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const isRecords = column === "records";
  const maxFiles = isRecords ? 20 : 1;

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    if (existingCount >= maxFiles) {
      setError(`Maximum ${maxFiles} file(s) allowed.`);
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Invalid file type. Allowed: .xlsx, .xls, .pdf, .doc, .docx");
      return;
    }

    const maxBytes = MAX_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File is too large. Max allowed size is ${MAX_SIZE_MB} MB.`);
      return;
    }

    // ⭐ NEW ASSET — store locally only
    if (rowId === null || isNaN(Number(rowId))) {
      setShowSuccess(true);
      onSuccess();
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();
      formData.append(column, file);
      formData.append("column", column);
      formData.append("rowId", String(rowId));

      const response = await axiosInstance.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Upload failed");
      }

      setShowSuccess(true);
      onSuccess();
      // ⭐ ADD THIS LINE
      setTimeout(() => {
       window.dispatchEvent(new CustomEvent("asset-files-updated"));
      }, 50);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-lg font-semibold mb-4">Upload File</h2>

          {/* ⭐ Disable input if max reached */}
          <input
            type="file"
            accept=".xlsx,.xls,.pdf,.doc,.docx"
            disabled={existingCount >= maxFiles}
            onChange={(e) => {
              setError("");
              setFile(e.target.files?.[0] || null);
            }}
            className="mb-2"
          />

          <p className="text-xs text-gray-500 mb-2">
            Allowed: .xlsx, .xls, .pdf, .doc, .docx — Max size: {MAX_SIZE_MB} MB
          </p>

          {existingCount >= maxFiles && (
            <p className="text-red-600 text-sm mb-2">
              Maximum {maxFiles} file(s) allowed. Delete a file to upload more.
            </p>
          )}

          {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              onClick={handleUpload}
              disabled={loading || existingCount >= maxFiles}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      </div>

      {/* ⭐ SUCCESS POPUP */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            <h2 className="text-lg font-semibold mb-4">Upload Successful</h2>
            <p className="text-gray-700 mb-6">
              Your file has been uploaded successfully.
            </p>
            <button
             onClick={() => {
             setShowSuccess(false);
             onClose();

             // ⭐ Trigger refresh AFTER modal closes
             setTimeout(() => {
             window.dispatchEvent(new CustomEvent("asset-files-updated"));
             }, 50);
             }}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              OK
            </button>

          </div>
        </div>
      )}
    </>
  );
}

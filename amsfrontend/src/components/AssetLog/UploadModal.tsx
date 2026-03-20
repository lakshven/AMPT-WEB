import { useState , useEffect} from "react";
import axiosInstance from "../../utils/axiosInstance";
import { FileColumn } from "./FileCell";
interface UploadModalProps {
  rowId: number | null; // allow null for new assets that don't have an ID yet
  column: FileColumn;
  onClose: () => void;
  onSuccess: () => void; // optional callback for successful upload
  setUploadedFile: React.Dispatch<React.SetStateAction<File | null>>;
}

const ALLOWED_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/msword", // .doc
];

const MAX_SIZE_MB = 5; // 5 MB

export default function UploadModal({ rowId, column, onClose, onSuccess, setUploadedFile }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
   // ⭐ Reset uploaded file preview when modal opens
  useEffect(() => {
    setUploadedFile(null);
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file");
      return;
    }

    // File type validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Invalid file type. Only Excel files (.xlsx, .xls) are allowed.");
      return;
    }
    
    // File size validation
    const maxBytes = MAX_SIZE_MB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`File is too large. Max allowed size is ${MAX_SIZE_MB} MB.`);
      return;
    }
    // ⭐ CASE 1: NEW ASSET → handle in frontend only
    if (rowId === null || isNaN(Number(rowId))) {
      setUploadedFile(file); // store file for preview
      onClose();
      onSuccess();
      return;
    }
    try {
      setLoading(true);
      setError("");

      // ⭐ Updated: use axiosInstance instead of fetch
      const formData = new FormData();
      formData.append("file", file);
      formData.append("column", column);
      formData.append("rowId", String(rowId));

      const response = await axiosInstance.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || "Upload failed");
      }
      setUploadedFile(file); // ⭐ Update state with the newly uploaded file
      onClose();
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4">Upload File</h2>

        <input
          type="file"
          onChange={(e) => {
            setError("");
            const selected = e.target.files?.[0] || null;
            setFile(selected);
            setUploadedFile(selected || null); // ⭐ Update parent state immediately for preview

          }}
          className="mb-2"
        />

        <p className="text-xs text-gray-500 mb-2">
          Allowed: .xlsx, .xls — Max size: {MAX_SIZE_MB} MB
        </p>

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
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}

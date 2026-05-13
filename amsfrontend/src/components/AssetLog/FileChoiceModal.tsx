import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import { FileColumn } from "./FileCell";
import { usePopup } from "../../context/PopupContext";
import { getFileUrl } from "../../services/fileService";   // ⭐ NEW

interface FileChoiceModalProps {
  rowId: number;
  column: FileColumn;
  fileUrls: string[]; // ⭐ NEW — required for listing files
  onClose: () => void;
  onChooseUpload: () => void; // NEW
  onSuccess: () => void; // NEW
}

export default function FileChoiceModal({
  rowId,
  column,
  fileUrls,
  onClose,
  onChooseUpload,
  onSuccess,
}: FileChoiceModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const { showPopup } = usePopup();   // ⭐ ADDED
  // ⭐ LOCAL STATE FOR FILE LIST (CRITICAL FIX)
  const [localFiles, setLocalFiles] = useState<string[]>(fileUrls);
  // ⭐ KEEP LOCAL FILES IN SYNC WHEN MODAL OPENS
  useEffect(() => {
    setLocalFiles(fileUrls);
  }, [fileUrls]);

  // ⭐ LISTEN FOR UPLOAD EVENT → REFRESH FILE LIST
  useEffect(() => {
    const handler = async () => {
      try {
        const res = await axiosInstance.get(`/assets/${rowId}?t=${Date.now()}`, {
          headers: {
            "Cache-Control": "no-cache",
            "Pragma": "no-cache",
          },
        });

        const updated = res.data.asset[column] || [];
        setLocalFiles(updated);
      } catch (err) {
        console.error("Failed to refresh files", err);
      }
    };

    window.addEventListener("asset-files-updated", handler);
    return () => window.removeEventListener("asset-files-updated", handler);
  }, [rowId, column]);
  // ⭐ CLEAN INVALID VALUES
  const safeFileUrls = (fileUrls || []).filter(
    (f) => typeof f === "string" && f.trim() !== ""
  );
  // ⭐ Convert filenames → full URLs
  const files = safeFileUrls.map((name) => {
  return {
    fileName: name.split("/").pop(),
    fullPath: name,
    url: getFileUrl(column, name),
  };
});

  // ⭐ LOad Deletion History
  useEffect(() => {
  const fetchHistory = async () => {
    try {
      const res = await axiosInstance.get(`/assets/deletion-logs/${rowId}`);
      setHistory(res.data.logs || []);
    } catch (err) {
      console.error("Failed to load deletion history", err);
    }
   };

   fetchHistory();
  }, [rowId]);
  const isRecords = column === "records";
  const maxFiles = isRecords ? 20 : 1;
  const fileCount = safeFileUrls.length;

  // ⭐ DELETE Must send the file path, not url (soft delete)
  const handleDeleteFile = async (filePath: string) => {
    try {
      setLoading(true);
      setError("");

      const res = await axiosInstance.delete(
        `/assets/${rowId}/file?column=${column}&fileUrl=${encodeURIComponent(filePath)}`
      );

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to delete file");
      }
      showPopup("File deleted successfully");   // ⭐ FIXED POPUP
      onSuccess();
      window.dispatchEvent(new CustomEvent("asset-files-updated"));
      
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to delete file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-start justify-center pt-20 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[450px]">
        <h2 className="text-lg font-semibold mb-4">Manage Files</h2>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
        {/* ⭐ FILE LIST */}
        {files.length === 0 ? (
          <p className="text-gray-600 text-sm mb-4">No files uploaded.</p>
        ) : (
          <div className="max-h-60 overflow-y-auto mb-4 border p-2 rounded">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b py-2"
              >
                <span className="text-sm text-gray-700 truncate w-40">
                  {file.fileName}
                </span>

                <div className="flex gap-3">
                  {/* ⭐ VIEW */}
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline text-sm"
                  >
                    View
                  </a>

                  {/* ⭐ DOWNLOAD */}
                  <a
                    href={file.url}
                    download
                    className="text-green-600 underline text-sm"
                  >
                    Download
                  </a>

                  {/* ⭐ DELETE */}
                  <button
                    onClick={() => handleDeleteFile(file.fullPath)}
                    disabled={loading}
                    className="text-red-600 underline text-sm hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
         {/* ⭐ COLLAPSIBLE DELETED FILE HISTORY */}
        <div className="mb-4">
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="w-full text-left text-sm font-semibold text-gray-800 mb-2"
          >
            {historyOpen ? "▼" : "▶"} Deleted Files History
          </button>

          {historyOpen && (
          <div className="border p-2 rounded max-h-60 overflow-y-auto bg-gray-50">
          {history.length === 0 ? (
           <p className="text-gray-600 text-sm">No deleted files found.</p>
           ) : (
           history.map((log, index) => {
           const snap = log.asset_snapshot || {};
           return (
           <div
            key={index}
            className="border-b py-2 text-sm text-gray-700"
           >
            <div className="font-medium">
              {snap.file_url?.split("/").pop()}
            </div>

            <div className="text-xs text-gray-500">
              Column: {snap.column}
            </div>

            <div className="text-xs text-gray-500">
              Deleted By: {log.deleted_by || "Unknown"}
            </div>

            <div className="text-xs text-gray-500">
              Deleted At:{" "}
              {snap.deleted_at
                ? new Date(snap.deleted_at).toLocaleString("en-GB")
                : "Unknown"}
            </div>
            </div>
             );
            })
           )}
        </div>
        )}

        </div>
        {/* ⭐ UPLOAD BUTTON */}
        <button
          onClick={onChooseUpload}
          disabled={fileCount >= maxFiles}
          className={`px-4 py-2 text-white rounded w-full mb-3 ${
            fileCount >= maxFiles
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {fileCount >= maxFiles
            ? `Maximum ${maxFiles} file${maxFiles > 1 ? "s" : ""} reached`
            : "Upload File"}
        </button>

        {/* CANCEL */}
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 w-full"
        >
          Close
        </button>
       </div>
       </div>
      ); 
     }

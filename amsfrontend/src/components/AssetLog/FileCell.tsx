import { useState } from "react";
import UploadModal from "./UploadModal";
import FileChoiceModal from "./FileChoiceModal";
import axiosInstance from "../../utils/axiosInstance";
// ⭐ UPDATED — Accept all file column keys used in your table
export type FileColumn =
  | "visual_report"
  | "detailed_report"
  | "assessment"
  | "records";

interface FileCellProps {
  fileUrl: string | null;
  rowId: number;
  column: FileColumn;   // ⭐ FIXED — now supports all file columns
  onRefresh?: () => void;
  isNewAsset: boolean;
}

export default function FileCell({
  fileUrl,
  rowId,
  column,
  onRefresh,
  isNewAsset,
}: FileCellProps) {
  const [openChoice, setOpenChoice] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const[showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // ⭐ Determine file states
  const hasDefaultFile = !!fileUrl;
  const hasUploadedFile = !!uploadedFile;

  // ⭐ Compute view button logic
  let viewLabel = "";
  let viewHref = "";

  if (hasUploadedFile) {
    viewLabel = "View Uploaded File";
    viewHref = URL.createObjectURL(uploadedFile!);
  } else if (hasDefaultFile) {
    viewLabel = "View Default File";
    viewHref = `http://localhost:5000/files/excel/${column}/${rowId}`;
  }

  // ⭐ Choose File ALWAYS visible
  const showChooseFile = true;

  const handleOpenChoice = () => { setOpenChoice(true); };

  const handleSuccess = () => {
    setShowConfirm(true);
    if (onRefresh) onRefresh();
  };
  
  // ⭐ DELETE FILE API CALL
  const handleDeleteFile = async () => {
  try {
    const res = await axiosInstance.delete(`/assets/${rowId}/file`, {
      params: { column },
    });

    if (res.data.success) {
      setUploadedFile(null);
      setShowDeleteConfirm(false);
      if (onRefresh) onRefresh();
    } else {
      alert(res.data.message || "Failed to delete file");
    }
  } catch (err) {
    console.error("Delete file error:", err);
    alert("Error deleting file");
  }
  };
  return (
   <> 
   <div className="flex items-center gap-3">
      {/* Always show the Choose File button */}
      {showChooseFile && (
        <button
          onClick={handleOpenChoice}
          className="text-sm text-blue-700 underline hover:text-blue-900"
        >
          Choose File
        </button>
      )}

      {/* Show View only if default or uploaded file exists */}
      {(hasUploadedFile || hasDefaultFile) && (
        <a
          href={viewHref}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:text-blue-800"
        >
          {viewLabel}
        </a>
      )}
      
      {/* ⭐ DELETE FILE BUTTON */}
      {(hasUploadedFile || hasDefaultFile) && (
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="text-sm text-red-600 underline hover:text-red-800"
        >
          Delete File
        </button>
      )}
   </div>

      {/* Choice modal */}
      {openChoice && (
        <FileChoiceModal
          rowId={rowId}
          column={column}
          onClose={() => setOpenChoice(false)}
          onChooseUpload={() => {
            setOpenChoice(false);
            setOpenUpload(true);
          }}
          onSuccess={handleSuccess}
          setUploadedFile={setUploadedFile}
        />
      )}

      {/* Upload modal */}
      {openUpload && (
        <UploadModal
          rowId={rowId}
          column={column}
          onClose={() => setOpenUpload(false)}
          onSuccess={handleSuccess}
          setUploadedFile={setUploadedFile}
        />
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            <h2 className="text-lg font-semibold mb-4">Success</h2>
            <p className="text-gray-700 mb-6">
              File updated successfully.
            </p>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
     {/* ⭐ DELETE CONFIRMATION MODAL */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            <h2 className="text-lg font-semibold mb-4">Delete File</h2>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this file?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteFile}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

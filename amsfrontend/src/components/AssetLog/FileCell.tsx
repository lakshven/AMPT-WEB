import { useState } from "react";
import UploadModal from "./UploadModal";
import FileChoiceModal from "./FileChoiceModal";

interface FileCellProps {
  fileUrl: string | null;
  rowId: number;
  column: "exam_report" | "assessment" | "records";
  onRefresh?: () => void;
  isNewAsset: boolean; // NEW prop to indicate if this is a new asset without backend file
}

export default function FileCell({ fileUrl, rowId, column, onRefresh, isNewAsset }: FileCellProps) {
  const [openChoice, setOpenChoice] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  // ⭐ Determine file states
  const hasDefaultFile = !!fileUrl;        // backend file exists
  const hasUploadedFile = !!uploadedFile;  // user selected new file
  // ⭐ Compute view button logic
  let showView = false;
  let viewLabel = "";
  let viewHref = "";

  if (hasUploadedFile) {
    showView = true;
    viewLabel = "View Uploaded File";
    viewHref = URL.createObjectURL(uploadedFile!);
  } else if (hasDefaultFile) {
    showView = true;
    viewLabel = "View Default File";
    viewHref = `http://localhost:5000/files/excel/${column}/${rowId}`;
  }
  // ⭐ NEW — Choose File visibility logic
  // ⭐ Choose File ALWAYS visible (your rule)
  const showChooseFile = true;

  const handleOpenChoice = () => {
    // if(!rowId) return; // safety check
    setOpenChoice(true);
  };
  const handleSuccess = () => {
    setShowConfirm(true);   // show confirmation modal
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
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
          onSuccess={handleSuccess} // ⭐ NEW
          setUploadedFile={setUploadedFile} // ⭐ Pass setter to track uploaded file
        />
      )}

      {/* Upload modal */}
      {openUpload && (
        <UploadModal
          rowId={rowId}
          column={column}
          onClose={() => setOpenUpload(false)}
          onSuccess={handleSuccess}
          setUploadedFile={setUploadedFile} // ⭐ Pass setter to track uploaded file
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

    </div>
  );
}
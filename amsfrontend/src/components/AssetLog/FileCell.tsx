import { useState, useEffect } from "react";
import UploadModal from "./UploadModal";
import FileChoiceModal from "./FileChoiceModal";

export type FileColumn =
  | "visual_report"
  | "detailed_report"
  | "assessment"
  | "records";

interface FileCellProps {
  fileUrls: string[]; 
  rowId: number;
  column: FileColumn;   // ⭐ FIXED — now supports all file columns
  onRefresh?: () => void;
  isNewAsset: boolean;
}

export default function FileCell({
  fileUrls,
  rowId,
  column,
  onRefresh,
  isNewAsset,
}: FileCellProps) {
  const [openChoice, setOpenChoice] = useState(false);
  const [openUpload, setOpenUpload] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const fileCount = Array.isArray(fileUrls) ? fileUrls.length : 0;
  useEffect(() => {
  const handler = () => {
    onRefresh?.();
  };

  window.addEventListener("asset-files-updated", handler);
  return () => window.removeEventListener("asset-files-updated", handler);
  }, [onRefresh]);


  // ⭐ When opening Manage Files → refresh first
  const openManageFiles = async () => {
    if (onRefresh) {
      await Promise.resolve(onRefresh());
   }
    setOpenChoice(true);
  };

  const handleSuccess = () => {
    //setShowConfirm(true);
    if (onRefresh) onRefresh();
  };
  
  return (
   <> 
   <div className="flex items-center gap-3">
      {/* File Count */}
        <span className="text-sm text-gray-700">
          {fileCount === 0
            ? "No files"
            : `${fileCount} file${fileCount > 1 ? "s" : ""} uploaded`}
        </span>

        {/* Manage Files */}
        <button
          onClick={openManageFiles}
          className="text-sm text-blue-700 underline hover:text-blue-900"
        >
          Manage Files
        </button>
      </div>

      {/* Manage Files Modal */}
      {openChoice && (
        <FileChoiceModal
          rowId={rowId}
          column={column}
          fileUrls={fileUrls}
          onClose={() => setOpenChoice(false)}
          onChooseUpload={() => {
            setOpenChoice(false);
            setOpenUpload(true);
          }}
          onSuccess={handleSuccess}
        />
      )}

      {/* Upload modal */}
      {openUpload && (
        <UploadModal
          rowId={rowId}
          column={column}
          existingCount={fileCount}
          onClose={() => setOpenUpload(false)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Success Confirmation */}
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
    </>
  );
}

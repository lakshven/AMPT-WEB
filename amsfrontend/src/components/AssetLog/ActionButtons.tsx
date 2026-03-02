import React from "react";

interface ActionButtonsProps {
  isEditing: boolean;
  isNew: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onSave: () => void;
  onSaveNew: () => void;
  onCancel: () => void;
  isDeleted: boolean;
  canEditFields: boolean;
  // ⭐ Role flags now come from parent (no AuthContext here)
  isAdmin: boolean;
  isAssetManager: boolean;
  isEditor: boolean;
  isViewer: boolean;
}
export default function ActionButtons({
  isEditing,
  isNew,
  onEdit,
  onDelete,
  onRestore,
  onSave,
  onSaveNew,
  onCancel,
  isDeleted,
  canEditFields,
  isAdmin,
  isAssetManager,
  isEditor,
  isViewer,
}: ActionButtonsProps) {

  if (isEditing) {
    return (
      <div className="p-2 whitespace-nowrap">
        {isNew ? (
          <button
            onClick={onSaveNew}
            className="bg-green-600 text-white px-2 py-1 rounded mr-2"
          >
            Save
          </button>
        ) : (
          <button
            onClick={onSave}
            className="bg-green-600 text-white px-2 py-1 rounded mr-2"
          >
            Save
          </button>
        )}
        <button
          onClick={onCancel}
          className="bg-gray-500 text-white px-2 py-1 rounded"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="p-2 whitespace-nowrap">
      {/* ✅ Hide Edit for viewers */}
      {(canEditFields && !isEditing && !isNew) && (
        <button
          onClick={onEdit}
          className="bg-blue-600 text-white px-2 py-1 rounded mr-2"
        >
          Edit
        </button>
      )}

      {isAdmin && !isDeleted && (
        <button
          onClick={onDelete}
          className="bg-red-600 text-white px-2 py-1 rounded"
        >
          Delete
        </button>
      )}

      {isAdmin && isDeleted && (
        <button
          onClick={onRestore}
          className="bg-teal-600 text-white px-2 py-1 rounded"
        >
          Restore
        </button>
      )}
    </div>
  );
}
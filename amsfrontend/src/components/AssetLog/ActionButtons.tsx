import React from "react";

interface ActionButtonsProps {
  isEditing: boolean;
  isNew: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
  onSave: () => void;
  onSaveNew: () => void;
  onCancel: () => void;
  isDeleted: boolean;
  canEditFields: boolean;
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
  onPermanentDelete,
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
        <button
          onClick={isNew ? onSaveNew : onSave}
          className="bg-green-600 text-white px-2 py-1 rounded mr-2"
        >
          Save
        </button>

        <button onClick={onCancel} className="bg-gray-500 text-white px-2 py-1 rounded">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="p-2 whitespace-nowrap">
      {canEditFields && !isDeleted && (
        <button onClick={onEdit} className="bg-blue-600 text-white px-2 py-1 rounded mr-2">
          Edit
        </button>
      )}

      {isAdmin && !isDeleted && (
        <button onClick={onDelete} className="bg-red-600 text-white px-2 py-1 rounded">
          Delete
        </button>
      )}

      {isAdmin && isDeleted && (
        <button onClick={onRestore} className="bg-teal-600 text-white px-2 py-1 rounded mr-2">
          Restore
        </button>
      )}
      {/* ⭐ Only show Permanent Delete to Admins when the item is already deleted */}
      {isAdmin && isDeleted && (
        <button onClick={onPermanentDelete} className="bg-black text-white px-2 py-1 rounded">
          Permanent Delete
        </button>
      )}
    </div>
  );
}

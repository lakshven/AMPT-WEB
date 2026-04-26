import React from "react";

interface WorkItemRowProps {
  workItem: any;
  onEdit: (wi: any) => void;
  onDelete: (id: string | number) => void;
  onRestore?: (id: string | number) => void;
  onPermanentDelete?: (id: string | number) => void;
}

const WorkItemRow: React.FC<WorkItemRowProps> = ({ workItem, onEdit, onDelete, onRestore, onPermanentDelete }) => {
  const ratingBadge = (rating: number) => {
    if (!rating && rating !== 0) return "bg-gray-200 text-gray-700";
    if (rating >= 10) return "bg-red-600 text-white";
    if (rating >= 5) return "bg-yellow-400 text-black";
    return "bg-green-600 text-white";
  };
  const isDeleted = workItem.isDeleted === true;
  return (
    <tr className={`w-full overflow-x-auto whitespace-nowrap text-sm ${
        isDeleted ? "bg-gray-100 text-gray-400 italic" : "bg-white"
      }`}>
      <td className="px-3 py-2">{workItem.work_item || "-"}</td>
      <td className="px-3 py-2">{workItem.possible_consequence || "-"}</td>

      <td className="px-3 py-2 text-center">{workItem.current_likelihood}</td>
      <td className="px-3 py-2 text-center">{workItem.current_severity}</td>

      <td className="px-3 py-2 text-center">
        <span className={`px-2 py-1 rounded ${ratingBadge(workItem.current_rating)}`}>
          {workItem.current_rating}
        </span>
      </td>

      <td className="px-3 py-2">
        {workItem.current_date_logged?.slice(0, 10) || "-"}
      </td>

      <td className="px-3 py-2 text-center">{workItem.mitigation_likelihood}</td>
      <td className="px-3 py-2 text-center">{workItem.mitigation_severity}</td>

      <td className="px-3 py-2 text-center">
        <span className={`px-2 py-1 rounded ${ratingBadge(workItem.mitigation_rating)}`}>
          {workItem.mitigation_rating}
        </span>
      </td>

      <td className="px-3 py-2">
        {workItem.mitigation_completion?.slice(0, 10) || "-"}
      </td>

      <td className="px-3 py-2">{workItem.status || "-"}</td>

      <td className="px-3 py-2 text-right flex justify-end gap-2">

        {/* EDIT BUTTON — disabled for deleted items */}
        <button
          onClick={() => !isDeleted && onEdit(workItem)}
          disabled={isDeleted}
          className={`px-2 py-1 text-xs rounded ${
            isDeleted
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white"
          }`}
        >
          Edit
        </button>

        {/* DELETE / RESTORE BUTTON */}
        {!isDeleted ? (
          <button
            onClick={() => onDelete(workItem.id)}
            className="px-2 py-1 text-xs bg-red-600 text-white rounded"
          >
            Delete
          </button>
        ) : (
          <>
          <button
            onClick={() => onRestore && onRestore(workItem.id)}
            className="px-2 py-1 text-xs bg-green-600 text-white rounded"
          >
            Restore
          </button>
         {/* ⭐ PERMANENT DELETE BUTTON (only visible when deleted) */}
            <button
              onClick={() => onPermanentDelete && onPermanentDelete(workItem.id)}
              className="px-2 py-1 text-xs bg-black text-white rounded"
            >
              Permanent Delete
            </button>
          </>
         )}
      </td>
    </tr>
  );
};

export default WorkItemRow;

import React, { useState, useEffect } from "react";
import { workItemColumns } from "./columns";

interface WorkItemModalProps {
  open: boolean;
  onClose: () => void;
  assetId: number | string;
  onSave: (assetId: number | string, workItem: any) => void;
  initialData?: any;
}

const WorkItemModal: React.FC<WorkItemModalProps> = ({
  open,
  onClose,
  assetId,
  onSave,
  initialData,
}) => {
  const [form, setForm] = useState<any>({});

  // Load form data when modal opens or initialData changes
  useEffect(() => {
    if (!open) return;

    if (initialData) {
      {/* ✔ KEEP the ID passed from AssetRow (temp or real) */}
      setForm({ ...initialData,
        isDeleted: initialData.isDeleted ?? false, 
       });
    } else {
      setForm({
        id: crypto.randomUUID(), // safer unique ID
        work_item: "",
        possible_consequence: "",
        current_likelihood: "",
        current_severity: "",
        current_rating: "",
        current_date_logged: "",
        risk_mitigation_proposals: "",
        mitigation_likelihood: "",
        mitigation_severity: "",
        mitigation_rating: "",
        mitigation_completion: "",
        status: "Open",
      });
    }
  }, [open, initialData]);

  const updateField = (key: string, value: any) => {
    setForm((prev: any) => {
      const updated = { ...prev, [key]: value };

      // Auto-calc current rating
      if (key === "current_likelihood" || key === "current_severity") {
        const cl = Number(updated.current_likelihood || 0);
        const cs = Number(updated.current_severity || 0);
        updated.current_rating = cl * cs;
      }

      // Auto-calc mitigation rating
      if (key === "mitigation_likelihood" || key === "mitigation_severity") {
        const ml = Number(updated.mitigation_likelihood || 0);
        const ms = Number(updated.mitigation_severity || 0);
        updated.mitigation_rating = ml * ms;
      }

      return updated;
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-start justify-end z-50">
      <div className="bg-white p-6 rounded shadow-lg w-[700px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800">
          {initialData ? "Edit Work Item" : "Add Work Item"}
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {workItemColumns.map((col) => (
            <div key={col.key} className="flex flex-col">
              <label className="text-xs text-gray-600 mb-1">{col.label}</label>

              {col.key === "current_rating" || col.key === "mitigation_rating" ? (
                <div className="p-2 border rounded bg-gray-100">
                  {form[col.key] ?? ""}
                </div>
              ) : col.type === "date" ? (
                <input
                  type="date"
                  value={form[col.key] ? String(form[col.key]).substring(0, 10) : ""}
                  onChange={(e) => updateField(col.key, e.target.value)}
                  className="border p-2 rounded"
                />
              ) : col.type === "dropdown" ? (
                <select
                  value={form[col.key] ?? ""}
                  onChange={(e) => updateField(col.key, e.target.value)}
                  className="border p-2 rounded"
                >
                  <option value="">Select...</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              ) : col.type === "statusDropdown" ? (
                <select
                  value={form[col.key] ?? ""}
                  onChange={(e) => updateField(col.key, e.target.value)}
                  className="border p-2 rounded"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Mitigated">Mitigated</option>
                  <option value="Completed">Completed</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={form[col.key] ?? ""}
                  onChange={(e) => updateField(col.key, e.target.value)}
                  className="border p-2 rounded"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>

          <button
            onClick={() => onSave(assetId, form)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Work Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkItemModal;

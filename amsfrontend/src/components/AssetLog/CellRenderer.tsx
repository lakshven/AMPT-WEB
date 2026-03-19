import React from "react";
import { API_BASE } from "../../constants/api";
import FileLink from "../common/FileLink";

// ✅ Asset type (flexible for Prisma)
export interface Asset {
  id?: number | string;
  [key: string]: any;
}

// ✅ Props for CellRenderer
interface CellRendererProps {
  field: string;
  type: string;
  asset: Asset;
  editingId: number | string | null;
  editedAsset: Record<string, any>;
  setEditedAsset: (updater: (prev: any) => any) => void;
  dropdownOptions: Record<string, any[]>;
  disabled?: boolean;   // ⭐ ADDED — fixes your TypeScript error
}

const CellRenderer: React.FC<CellRendererProps> = ({
  field,
  type,
  asset,
  editingId,
  editedAsset,
  setEditedAsset,
  dropdownOptions,
  disabled = false,  // ⭐ ADDED default value
}) => {
  const isEditing = editingId === asset.id;
  // ⭐ FIXED — frontend keys map to frontend dropdown keys
  const fieldToCategoryMap: Record<string, string> = {
  structure_type: "structure_type",
    material_type: "material_type",
    work_item: "work_item",
    possible_consequence: "possible_consequence",

    current_likelihood: "current_likelihood",
    current_severity: "current_severity",
    current_rating: "current_rating",

    mitigation_likelihood: "mitigation_likelihood",
    mitigation_severity: "mitigation_severity",
    mitigation_rating: "mitigation_rating",

    detailed_exam_years: "detailed_exam_years",

    spans: "spans",
    carries: "carries",
    status: "status",
};
  // ✅ EDIT MODE
  if (isEditing) {
    // If disabled (e.g., viewer), just show value read-only
    if (disabled) {
      const value = asset[field];
      return <span className="text-[#333]">{typeof value === "object" ? value?.value : value ?? ""}</span>;

    }
    // ✅ Dropdown fields
    if (type === "dropdown") {
      const key = fieldToCategoryMap[field] || field;
      const options = dropdownOptions[key] || [];
      return (
        <select
          value={editedAsset[field] ?? asset[field] ?? ""}
          onChange={(e) =>
            setEditedAsset((prev) => ({
              ...prev,
              [field]: e.target.value,
            }))
          }
          className="border border-[#549E39] rounded px-2 py-1 w-full focus:ring-[#0989B1] focus:border-[#0989B1] text-[#333]"
        >
          {options.map((opt, i) => (
            <option key={i} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }

    // ✅ Date fields
    if (type === "date") {
      const rawValue = editedAsset[field] ?? asset[field] ?? "";
      const dateValue = typeof rawValue === "string" ? rawValue.slice(0, 10) : "";

      return (
        <input
          type="date"
          value={dateValue}
          onChange={(e) =>
            setEditedAsset((prev) => ({
              ...prev,
              [field]: e.target.value,
            }))
          }
          className="border border-[#549E39] rounded px-2 py-1 w-full focus:ring-[#0989B1] focus:border-[#0989B1] text-[#333]"
        />
      );
    }

    // ✅ Default text input
    return (
      <input
        value={editedAsset[field] ?? asset[field] ?? ""}
        onChange={(e) =>
          setEditedAsset((prev) => ({
            ...prev,
            [field]: e.target.value,
          }))
        }
        className="border border-[#549E39] rounded px-2 py-1 w-full min-w-[100px] focus:ring-[#0989B1] focus:border-[#0989B1] text-[#333]"
      />
    );
  }

  // ✅ FILE LINK RENDERING
  if (type === "file") {
    const value = asset[field];
    const filename =
      typeof value === "object" && value !== null
        ? value.filename
        : typeof value === "string"
        ? value
        : null;

    if (filename) {
      const isFullUrl =
        filename.startsWith("/public") || filename.startsWith("http");

      const fileUrl = isFullUrl
        ? filename
        : `${API_BASE}/uploads/${field}/${filename}`;

      return (
        <FileLink
          href={fileUrl}
          assetId={asset.id}
          type={field}
          label="Link"
          className="underline text-[#0989B1] font-medium text-center block"
        />
      );
    }

    return <span className="text-gray-500">No file uploaded</span>;
  }
  const value = asset[field];
  // ✅ DEFAULT READ MODE
  // Fix React crash: if value is object, show .value
  if (value && typeof value === "object") {
    return <span className="text-[#333] whitespace-normal break-words">{value.value ?? ""}</span>;
  }
  return <span className="text-[#333] whitespace-normal break-words">{value ?? ""}</span>;
};

export default CellRenderer;

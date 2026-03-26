import React from "react";
import { API_BASE } from "../../constants/api";
import FileLink from "../common/FileLink";

export interface Asset {
  id?: number | string;
  [key: string]: any;
}

interface CellRendererProps {
  field: string;
  type: string;
  asset: Asset;
  editingId: number | string | null;
  editedAsset: Record<string, any>;
  setEditedAsset: (updater: (prev: any) => any) => void;
  dropdownOptions: Record<string, any[]>;
  disabled?: boolean;
}

const CellRenderer: React.FC<CellRendererProps> = ({
  field,
  type,
  asset,
  editingId,
  editedAsset,
  setEditedAsset,
  dropdownOptions,
  disabled = false,
}) => {
  const isEditing = editingId === asset.id;

  const options = dropdownOptions[field] || [];

  const getOptionValue = (opt: any) =>
    typeof opt === "string" || typeof opt === "number"
      ? opt
      : opt?.value ?? opt?.id ?? "";

  const getOptionLabel = (opt: any) =>
    typeof opt === "string" || typeof opt === "number"
      ? opt
      : opt?.label ?? opt?.value ?? opt?.id ?? "";

  const normalizeValue = (val: any) => {
    if (val === null || val === undefined) return "";
    return typeof val === "string" || typeof val === "number"
      ? val
      : val.label ?? val.value ?? val.id ?? "";
  };

  const mergedValue =
    editedAsset[field] !== undefined ? editedAsset[field] : asset[field] ?? "";

  if (isEditing) {
    if (disabled)
      return <span className="text-[#333]">{normalizeValue(asset[field])}</span>;

    // ⭐ FIXED: dropdowns now ALWAYS store strings (Prisma-safe)
    if (type === "dropdown") {
      return (
        <select
          value={mergedValue}
          onChange={(e) => {
            const raw = e.target.value;

            setEditedAsset((prev) => ({
              ...prev,
              [field]: raw, // ALWAYS string — no Number() conversion
            }));
          }}
          className="border border-[#549E39] rounded px-2 py-1 w-full focus:ring-[#0989B1] focus:border-[#0989B1] text-[#333]"
          style={{ minWidth: "60px" }}
        >
            <option value = ""> --Select--</option>
            {options.map((opt, i) => (
            <option key={i} value={getOptionValue(opt)}>
              {getOptionLabel(opt)}
            </option>
          ))}
        </select>
      );
    }

    if (type === "date") {
      const raw = mergedValue;
      const dateValue = typeof raw === "string" ? raw.slice(0, 10) : "";

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

    return (
      <input
        value={mergedValue ?? ""}
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
        filename.startsWith("http") || filename.startsWith("/");
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

  return (
    <span className="text-[#333] whitespace-normal break-words">
      {normalizeValue(asset[field])}
    </span>
  );
};

export default CellRenderer;

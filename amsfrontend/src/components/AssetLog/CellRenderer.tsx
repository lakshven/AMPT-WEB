import React from "react";

interface CellRendererProps {
  field: string;
  type: string;
  value: any;
  asset: any;
  editingId: string | number | null;
  editedAsset: any;
  setEditedAsset: (asset: any) => void;
  dropdownOptions: Record<string, any[]>;
  disabled?: boolean;
}

const CellRenderer: React.FC<CellRendererProps> = ({
  field,
  type,
  value,
  asset,
  editingId,
  editedAsset,
  setEditedAsset,
  dropdownOptions,
  disabled,
}) => {

  // ⭐ Editing mode applies to both AssetRow + WorkItemRow
  const isEditing = editingId != null;

  const handleChange = (newValue: any) => {
    setEditedAsset((prev: any) => ({
      ...prev,
      [field]: newValue,
    }));
  };

  /* -----------------------------
     READ‑ONLY MODE
  ------------------------------*/
  if (!isEditing) {
    if (type === "date" && value) {
      const formatted = new Date(value).toLocaleDateString("en-GB");
      return <span>{formatted}</span>;
    }
    return <span>{value ?? ""}</span>;
  }

  /* -----------------------------
     EDIT MODE — STATUS DROPDOWN
  ------------------------------*/
  if (type === "statusDropdown") {
    const options = dropdownOptions[field] || [];
    return (
      <select
        value={value ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        className="border p-1 rounded w-full"
      >
        <option value="">Select...</option>
        {options.map((opt: any, i: number) => (
          <option
            key={i}
            value={typeof opt === "string" ? opt : opt.value ?? opt.id}
          >
            {typeof opt === "string"
              ? opt
              : opt.label ?? opt.value ?? opt.id}
          </option>
        ))}
      </select>
    );
  }

  /* -----------------------------
     EDIT MODE — DROPDOWN
  ------------------------------*/
  if (type === "dropdown") {
    const options = dropdownOptions[field] || [];
    return (
      <select
        value={value ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        className="border p-1 rounded w-full"
      >
        <option value="">Select...</option>
        {options.map((opt: any, i: number) => (
          <option
            key={i}
            value={typeof opt === "string" ? opt : opt.value ?? opt.id}
          >
            {typeof opt === "string"
              ? opt
              : opt.label ?? opt.value ?? opt.id}
          </option>
        ))}
      </select>
    );
  }

  /* -----------------------------
     EDIT MODE — DATE
  ------------------------------*/
  if (type === "date") {
    return (
      <input
        type="date"
        value={value ? String(value).substring(0, 10) : ""}
        onChange={(e) => handleChange(e.target.value)}
        disabled={disabled}
        className="border p-1 rounded w-full"
      />
    );
  }

  /* -----------------------------
     EDIT MODE — TEXT
  ------------------------------*/
  return (
    <input
      type="text"
      value={value ?? ""}
      onChange={(e) => handleChange(e.target.value)}
      disabled={disabled}
      className="border p-1 rounded w-full"
    />
  );
};

export default CellRenderer;

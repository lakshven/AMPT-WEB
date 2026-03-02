import React from "react";
import AssetRow, { Asset } from "./AssetRow";
import { columns } from "./columns";

interface AssetTableProps {
  assets: Asset[];
  editingId: number | string | null;
  editedAsset: Asset | {};
  newAsset: Asset | null;
  setEditedAsset: (asset: any) => void;
  dropdownOptions: Record<string, any[]>;

  onEdit: (asset: Asset) => void;
  onDelete: (id: number | string) => Promise<void>;
  onRestore: (id: number | string) => Promise<void>;

  onSave: () => Promise<void>;
  onSaveNew: () => Promise<void>;
  onCancel: () => void;

  isAdmin: boolean;
  isAssetManager: boolean;
  isEditor: boolean;
  isViewer: boolean;

  sortBy: string;
  sortOrder: "asc" | "desc";
  setSortBy: (key: string) => void;
  setSortOrder: (order: "asc" | "desc") => void;

  filters: Record<string, any>;
  setFilters: (f: Record<string, any>) => void;

  isNewAsset: boolean;
}

const AssetTable: React.FC<AssetTableProps> = ({
  assets,
  editingId,
  editedAsset,
  newAsset,
  setEditedAsset,
  dropdownOptions,
  onEdit,
  onDelete,
  onRestore,
  onSave,
  onSaveNew,
  onCancel,
  isAdmin,
  isAssetManager,
  isEditor,
  isViewer,
  sortBy,
  sortOrder,
  setSortBy,
  setSortOrder,
  filters,
  setFilters,
  isNewAsset
}) => {
  const showActionsColumn = isAdmin || isAssetManager || isEditor;

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };

  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              className={(col.headerClass || "") + " p-2 border border-gray-300 bg-[#0989B1] text-white font-semibold cursor-pointer select-none border-b-2 border-b-[#549E39] whitespace-normal break-words"}
              onClick={() => handleSort(col.key)}
            >
              {col.label}
              {sortBy === col.key && (
                <span className="ml-1">{sortOrder === "asc" ? "▲" : "▼"}</span>
              )}
            </th>
          ))}

          {showActionsColumn && (
            <th className="p-2 border border-gray-300 bg-[#0989B1] text-white font-semibold border-b-2 border-b-[#549E39]">
              Actions
            </th>
          )}
        </tr>

        <tr>
          {columns.map((col) => (
            <th key={col.key} className="p-1 border border-gray-300 bg-[#F0F7F9]">
              {col.filterType === "text" && (
                <input
                  className="border border-[#549E39] p-1 w-full focus:ring-[#0989B1] focus:border-[#0989B1]"
                  value={filters[col.key] || ""}
                  onChange={(e) => handleFilterChange(col.key, e.target.value)}
                />
              )}

              {col.filterType === "dropdown" && (
                <select
                  className="border border-[#549E39] p-1 w-full focus:ring-[#0989B1]"
                  value={filters[col.key] || ""}
                  onChange={(e) => handleFilterChange(col.key, e.target.value)}
                >
                  <option value="">All</option>
                  {(dropdownOptions[col.key] || []).map((opt) => (
                    <option key={opt} value={opt}>
                      {opt.value}
                    </option>
                  ))}
                </select>
              )}

              {col.filterType === "dateRange" && (
                <div className="flex gap-1">
                  <input
                    type="date"
                    className="border border-[#549E39] p-1 w-full focus:ring-[#0989B1]"
                    value={filters[col.key + "_from"] || ""}
                    onChange={(e) =>
                      handleFilterChange(col.key + "_from", e.target.value)
                    }
                  />
                  <input
                    type="date"
                    className="border border-[#549E39] p-1 w-full focus:ring-[#0989B1]"
                    value={filters[col.key + "_to"] || ""}
                    onChange={(e) =>
                      handleFilterChange(col.key + "_to", e.target.value)
                    }
                  />
                </div>
              )}

              {col.filterType === "none" && <span />}
            </th>
          ))}

          {showActionsColumn && <th className="bg-[#F0F7F9]" />}
        </tr>
      </thead>

      <tbody>
        {newAsset && (
          <AssetRow
            key={newAsset.id}
            asset={newAsset}
            editingId={editingId}
            editedAsset={editedAsset}
            newAsset={newAsset}
            setEditedAsset={setEditedAsset}
            dropdownOptions={dropdownOptions}
            onEdit={onEdit}
            onDelete={onDelete}
            onRestore={onRestore}
            onSave={onSave}
            onSaveNew={onSaveNew}
            onCancel={onCancel}
            isAdmin={isAdmin}
            isAssetManager={isAssetManager}
            isEditor={isEditor}
            isViewer={isViewer}
            isNewAsset={isNewAsset}
          />
        )}

        {assets.map((asset) => (
          <AssetRow
            key={asset.id}
            asset={asset}
            editingId={editingId}
            editedAsset={editedAsset}
            newAsset={newAsset}
            setEditedAsset={setEditedAsset}
            dropdownOptions={dropdownOptions}
            onEdit={onEdit}
            onDelete={onDelete}
            onRestore={onRestore}
            onSave={onSave}
            onSaveNew={onSaveNew}
            onCancel={onCancel}
            isAdmin={isAdmin}
            isAssetManager={isAssetManager}
            isEditor={isEditor}
            isViewer={isViewer}
            isNewAsset={isNewAsset}
          />
        ))}
      </tbody>
    </table>
  );
};

export default AssetTable;
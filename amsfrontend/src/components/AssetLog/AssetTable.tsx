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
}) => {
  const showActionsColumn = isAdmin || isAssetManager || isEditor;

  const [showMatrix, setShowMatrix] = React.useState(false);

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
      [key]: value,
    });
  };

  return (
    <>
      {/* Risk Matrix Button */}
       <div className="flex w-full mb-4">
      <button
        onClick={() => setShowMatrix(true)}
        className="mb-4 px-4 py-2 bg-[#0989B1] text-white rounded shadow"
      >
        View Risk Scoring Matrix
      </button>
     </div>
     {/* Risk Matrix Modal */}
     {showMatrix && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-lg max-w-xl w-full text-center">

      <h2 className="text-lg font-semibold mb-4 text-[#0989B1]">
        Risk Scoring Matrix
      </h2>

      <p className="text-gray-700 mb-4">
        Click the button below to open the Risk Scoring Matrix Excel file.
      </p>

      {/* ⭐ Opens Excel file in new tab (works in local + Azure) */}
      <a
        href="/RiskScoringMatrix.xlsx"
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 bg-[#549E39] text-white rounded shadow inline-block"
      >
        Open Excel File
      </a>

      <button
        onClick={() => setShowMatrix(false)}
        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded block mx-auto"
      >
         Close
      </button>
     </div>
   </div>
  )}

     <div className="overflow-x-auto">
      <table className="w-full table-fixed border-collapse border border-gray-300">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={
                  (col.headerClass || "") +
                  " p-2 border border-gray-300 bg-[#0989B1] text-white font-semibold cursor-pointer select-none border-b-2 border-b-[#549E39] whitespace-normal break-words"
                }
                onClick={() => handleSort(col.key)}
              >
                {col.label}
                {sortBy === col.key && (
                  <span className="ml-1">{sortOrder === "asc" ? "▲" : "▼"}</span>
                )}
              </th>
            ))}

            {showActionsColumn && (
              <th className="p-2 border border-gray-300 bg-[#0989B1] text-white font-semibold border-b-2 border-b-[#549E39] w-[140px]">
                Actions
              </th>
            )}
          </tr>

          {/* Filters Row */}
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
                    {(dropdownOptions[col.key] || []).map((opt, i) => (
                      <option key={i} value={typeof opt === "string" ? opt : opt.value ?? opt.id}>
                        {typeof opt === "string" ? opt : opt.label ?? opt.value ?? opt.id}
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
                      onChange={(e) => handleFilterChange(col.key + "_from", e.target.value)}
                    />
                    <input
                      type="date"
                      className="border border-[#549E39] p-1 w-full focus:ring-[#0989B1]"
                      value={filters[col.key + "_to"] || ""}
                      onChange={(e) => handleFilterChange(col.key + "_to", e.target.value)}
                    />
                  </div>
                )}

                {col.filterType === "none" && <span />}
              </th>
            ))}

            {showActionsColumn && <th className="bg-[#F0F7F9] w-[140px]" />}
          </tr>
        </thead>

        <tbody>
          {/* New Asset Row */}
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
            />
          )}

          {/* Existing Rows */}
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
            />
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
};

export default AssetTable;

import React from "react";
import CellRenderer from "./CellRenderer";
import ActionButtons from "./ActionButtons";
import { assetColumns, fileColumns } from "./columns";
import FileCell, { FileColumn } from "./FileCell";
import WorkItemModal from "./WorkItemModal";
import { usePopup } from "../../context/PopupContext";
import WorkItemTable from "./WorkItemTable";

export interface Asset {
  id?: number | string;
  isDeleted?: boolean;
  isNewAsset?: boolean;
  workItems?: any[];
  geocodeWarning?: string;
  [key: string]: any;
}

export interface AssetRowProps {
  asset: Asset;
  editingId: string | number | null;
  editedAsset: Asset | {};
  newAsset: Asset | null;

  setEditedAsset: (asset: any) => void;
  setEditingId: (id: any) => void;

  dropdownOptions: Record<string, any[]>;

  onEdit: (asset: Asset) => void;
  onDelete: (id: string | number) => Promise<void>;
  onRestore: (id: string | number) => Promise<void>;
  onPermanentDelete: (id: string | number) => Promise<void>;
  onSave: () => Promise<void>;
  onSaveNew: () => Promise<void>;
  onCancel: () => void;

  addWorkItem: (assetId: string | number) => any;

  isAdmin: boolean;
  isAssetManager: boolean;
  isEditor: boolean;
  isViewer: boolean;
  refreshAsset: (id: number | string) => void;
  showActionsColumn: boolean;
  allColumnsCount: number;
 }

const AssetRow: React.FC<AssetRowProps> = ({
  asset,
  editingId,
  newAsset,
  editedAsset,
  setEditedAsset,
  setEditingId,
  dropdownOptions,
  onEdit,
  onDelete,
  onRestore,
  onPermanentDelete,
  onSave,
  onSaveNew,
  onCancel,
  addWorkItem,
  isAdmin,
  isAssetManager,
  isEditor,
  isViewer,
  refreshAsset,
  showActionsColumn,
  allColumnsCount,
}) => {
  const { showPopup } = usePopup();

  const realAssetId = asset.id;
  const isNew = asset.isNewAsset === true;
  const isEditing =
    editingId === realAssetId ||
    (isNew && editingId === "new");

  const mergedAsset: Asset = React.useMemo(() => {
    if (isEditing) return { ...(editedAsset as Asset) };
     return { ...asset };
  }, [isEditing, editedAsset, asset]);

  const canEditFields = isAdmin || isAssetManager || isEditor;

  const [collapsed, setCollapsed] = React.useState(false);
  const [workItemModalOpen, setWorkItemModalOpen] = React.useState(false);
  const [editingWorkItem, setEditingWorkItem] = React.useState<any | null>(null);

  if (!realAssetId && !isNew) return null;
  const allColumns = [...assetColumns, ...fileColumns];
  const rowBg = asset.isDeleted ? "bg-red-50" : "bg-white";

  return (
    <div className={`border border-gray-300 mb-1 ${rowBg} overflow-hidden`>

      {/* MAIN ASSET ROW */}
      <div className="w-full overflow-x-auto">
        <div className="flex" style={{ width: "max-content" }}>
          {allColumns.map((col) => {
            const isFile = col.type === "file";
            const displayValue = mergedAsset[col.key] ?? "";

            return (
              <div
                key={col.key}
                style={{ width: col.width, minWidth: col.width }}
                className="p-2 border border-gray-200 text-[#333]"
              >
                {isFile ? (
                  <FileCell
                    fileUrl={mergedAsset[col.key] || null}
                    rowId={Number(realAssetId)}
                    column={col.key as FileColumn}
                    isNewAsset={!!asset.isNewAsset}
                    onRefresh={() => refreshAsset(realAssetId)}
                  />
                ) : (
                  <CellRenderer
                    field={col.key}
                    type={col.type || "text"}
                    value={displayValue}
                    asset={mergedAsset}
                    editingId={editingId}
                    editedAsset={editedAsset}
                    setEditedAsset={setEditedAsset}
                    dropdownOptions={dropdownOptions}
                    disabled={!canEditFields}
                  />
                )}
              </div>
            );
          })}
          
          {/* ACTION BUTTONS CELL */}
          {showActionsColumn && (
          <div
            style={{ width: 150, minWidth: 150 }}
            className="p-2 border border-gray-200"
          >
            <ActionButtons
              isEditing={isEditing}
              isNew={isNew}
              onEdit={() => {
                onEdit(asset);
                setEditedAsset({ ...asset });
                setEditingId(realAssetId);
              }}
              onDelete={() => onDelete(realAssetId)}
              onRestore={() => onRestore(realAssetId)}
              onPermanentDelete={() => onPermanentDelete(realAssetId)}
              onSave={onSave}
              onSaveNew={onSaveNew}
              onCancel={onCancel}
              isDeleted={!!asset.isDeleted}
              canEditFields={canEditFields}
              isAdmin={isAdmin}
              isAssetManager={isAssetManager}
              isEditor={isEditor}
              isViewer={isViewer}
            />
          </div>
          )}
         </div>
      </div>

      {/* ADD WORK ITEM BUTTON */}
      {isEditing && (
        <div className="p-2 bg-blue-50 border-t border-gray-200">
          <button
            onClick={() => {
              // Create a TEMP work item in memory only, like an Excel new row
              const tempWI = {
                id: "temp-" + Date.now(),
                asset_id: realAssetId,
                work_item: "",
                possible_consequence: "",
                risk_mitigation_proposals: "",
                current_likelihood: "",
                current_severity: "",
                current_rating: "",
                current_date_logged: "",
                mitigation_likelihood: "",
                mitigation_severity: "",
                mitigation_rating: "",
                mitigation_completion: "",
                status: "Open",
                isDeleted: false,
              };     
              setEditingWorkItem(tempWI);
              setWorkItemModalOpen(true);
            }}
            className=" px-3 py-1 bg-blue-600 text-white rounded text-sm"
          >
            + Add Work Item
          </button>
        </div>
      )}

      {/* COLLAPSE / EXPAND */}
      {mergedAsset.workItems?.length > 0 && (
        <div className="px-3 py-1 bg-gray-50 border-t border-gray-200">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-sm text-[#0989B1] underline"
          >
            {collapsed ? "Show Work Items" : "Hide Work Items"}
          </button>
        </div>
      )}

      {/* WORK ITEM TABLE */}
      {!collapsed && (mergedAsset.workItems ?? []).length > 0 && (
        <div className="bg-gray-50 border-t border-gray-200">
          <WorkItemTable
            workItems={mergedAsset.workItems ?? []}
            onEdit={(w) => {
              setEditingWorkItem(w);
              setWorkItemModalOpen(true);
            }}
            onDelete={(id) => {
              setEditedAsset((prev: any) => ({
                ...prev,
                workItems: (prev.workItems ?? []).map((wi: any) =>
                  wi.id === id ? { ...wi, isDeleted: true } : wi
                ),
              }));
            }}
            onRestore={(id) => {
              setEditedAsset((prev: any) => ({
                ...prev,
                workItems: (prev.workItems ?? []).map((wi: any) =>
                  wi.id === id ? { ...wi, isDeleted: false } : wi
                ),
              }));
            }}
            onPermanentDelete={(id) => {
             setEditedAsset((prev: any) => ({
             ...prev,
             workItems: (prev.workItems ?? []).filter((wi: any) => wi.id !== id),
           }));
            }}            
            isAdmin={isAdmin}
            isAssetManager={isAssetManager}
            isEditor={isEditor}
           />
        </div>
      )}

      {/* GEOCODE WARNING */}
      {asset.geocodeWarning && (
        <div className="px-3 py-2 border-t border-gray-200">
          <div className="bg-yellow-200 text-yellow-900 p-2 border border-yellow-400 rounded text-sm">
            ⚠ Unable to geocode this address. Please check spelling or postcode.
          </div>
        </div>
      )}

      {/* WORK ITEM MODAL */}
      <WorkItemModal
        open={workItemModalOpen}
        onClose={() => {
          setWorkItemModalOpen(false);
          setEditingWorkItem(null);
        }}
        assetId={realAssetId}
        initialData={editingWorkItem || undefined}
        onSave={(assetId, updatedWI) => {
          setEditedAsset((prev: any) => {
            const prevItems = prev.workItems ?? [];
            const isNewWI = String(updatedWI.id).startsWith("temp-");

            return {
              ...prev,
              workItems: isNewWI
                ? [...prevItems, updatedWI] // append new work item
                : prevItems.map((wi: any) =>
                    wi.id === updatedWI.id ? updatedWI : wi
                  ), 
            };
          });

          showPopup("Work item saved successfully");
        }}
      />
    </div>
  );
};

export default AssetRow;

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
  onSave: () => Promise<void>;
  onSaveNew: () => Promise<void>;
  onCancel: () => void;

  addWorkItem: (assetId: string | number) => any;

  isAdmin: boolean;
  isAssetManager: boolean;
  isEditor: boolean;
  isViewer: boolean;
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
  onSave,
  onSaveNew,
  onCancel,
  addWorkItem,
  isAdmin,
  isAssetManager,
  isEditor,
  isViewer,
}) => {
  const { showPopup } = usePopup();

  const realAssetId = asset.id;
  const isEditing = editingId === realAssetId;
  const isNew = newAsset?.id === realAssetId;

  const mergedAsset: Asset = React.useMemo(() => {
    return isEditing ? { ...(editedAsset as Asset) } : { ...asset };
  }, [isEditing, editedAsset, asset]);

  const canEditFields = isAdmin || isAssetManager || isEditor;

  const [collapsed, setCollapsed] = React.useState(false);
  const [workItemModalOpen, setWorkItemModalOpen] = React.useState(false);
  const [editingWorkItem, setEditingWorkItem] = React.useState<any | null>(null);

  if (!realAssetId) return null;

  return (
    <div className="border border-gray-300 rounded bg-white shadow-sm mb-3">

      {/* MAIN ASSET ROW */}
      <div className="w-full overflow-x-auto">
        <div className="flex min-w-max">
          {[...assetColumns, ...fileColumns].map((col) => {
            const isFile = col.type === "file";
            const displayValue = mergedAsset[col.key] ?? "";

            return (
              <div
                key={col.key}
                style={{ width: col.width }}
                className="p-2 border border-gray-200 text-[#333]"
              >
                {isFile ? (
                  <FileCell
                    fileUrl={mergedAsset[col.key] || null}
                    rowId={Number(realAssetId)}
                    column={col.key as FileColumn}
                    isNewAsset={!!asset.isNewAsset}
                    onRefresh={() => {}}
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

          {/* ACTION BUTTONS */}
          <div
            style={{ width: 150 }}
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
        </div>
      </div>

      {/* ADD WORK ITEM BUTTON */}
      {isEditing && (
        <div className="p-2">
          <button
            onClick={() => {
              const newWI = addWorkItem(realAssetId);
              if (!newWI) return;
              setEditingWorkItem(newWI);
              setWorkItemModalOpen(true);
            }}
            className="mt-2 mb-2 px-3 py-1 bg-blue-600 text-white rounded text-sm"
          >
            + Add Work Item
          </button>
        </div>
      )}

      {/* COLLAPSE / EXPAND */}
      {mergedAsset.workItems?.length > 0 && (
        <div className="p-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-sm text-gray-600 underline mb-2"
          >
            {collapsed ? "Show Work Items" : "Hide Work Items"}
          </button>
        </div>
      )}

      {/* WORK ITEM TABLE */}
      {!collapsed && (mergedAsset.workItems ?? []).length > 0 && (
        <div className="p-2">
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
          />
        </div>
      )}

      {/* GEOCODE WARNING */}
      {asset.geocodeWarning && (
        <div className="p-2">
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
          setEditedAsset((prev: any) => ({
            ...prev,
            workItems: prev.workItems.map((wi: any) =>
              wi.id === updatedWI.id ? updatedWI : wi
            ),
          }));
          showPopup("Work item saved successfully");
        }}
      />
    </div>
  );
};

export default AssetRow;

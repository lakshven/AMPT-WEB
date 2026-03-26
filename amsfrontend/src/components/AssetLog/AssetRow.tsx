import React from "react";
import CellRenderer from "./CellRenderer";
import ActionButtons from "./ActionButtons";
import { columns } from "./columns";
import FileCell, { FileColumn } from "./FileCell";
import { useAssets } from "../../hooks/useAssets";

export interface Asset {
  id?: number | string;
  is_deleted?: boolean;
  [key: string]: any;
}

export interface AssetRowProps {
  asset: Asset;
  editingId: string | number | null;
  editedAsset: Asset | {};
  newAsset: Asset | null;
  setEditedAsset: (asset: any) => void;
  dropdownOptions: Record<string, any[]>;

  onEdit: (asset: Asset) => void;
  onDelete: (id: string | number) => Promise<void>;
  onRestore: (id: string | number) => Promise<void>;
  onSave: () => Promise<void>;
  onSaveNew: () => Promise<void>;
  onCancel: () => void;

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
}) => {
  const isEditing = editingId === asset.id;
  const isNew = newAsset?.id === asset.id;

  const normalizedAsset = {
    ...asset,
    structure_type: asset.structure_type,
    material_type: asset.material_type,
    work_item: asset.work_item,
    possible_consequence: asset.possible_consequence,
    current_likelihood: asset.current_likelihood,
    current_severity: asset.current_severity,
    current_rating: asset.current_rating,
    mitigation_likelihood: asset.mitigation_likelihood,
    mitigation_severity: asset.mitigation_severity,
    mitigation_rating: asset.mitigation_rating,
    detailed_exam_years: asset.detailed_exam_years,
    status: asset.status,
    carries: asset.carries,
    over: asset.over,
    spans: asset.spans,
  };

  // ⭐ FIX: Only merge editedAsset for the row being edited
  const mergedAsset = isEditing ? { ...normalizedAsset, ...editedAsset } : normalizedAsset;

  const canEditFields = isAdmin || isAssetManager || isEditor;

  const { fetchAssets } = useAssets();

  return (
    <>
      <tr className="border-b border-gray-200 hover:bg-[#E6F4F7] transition-colors">
        {columns.map((col) => (
          <td
            key={col.key}
            className={(col.cellClass || "") + " p-2 border border-gray-200 text-[#333] whitespace-normal break-words"}
          >
            {col.type === "file" ? (
              <div className="min-w-[250px]">
              <FileCell
                fileUrl={asset[col.key] || null}
                rowId={Number(asset.id)}
                column={col.key as FileColumn}
                isNewAsset={isNew}  // ⭐ FIXED
                onRefresh={fetchAssets}
              />
             </div>
            ) : (
              <CellRenderer
                field={col.key}
                type={col.type || "text"}
                asset={mergedAsset}
                editingId={editingId}
                editedAsset={editedAsset}
                setEditedAsset={setEditedAsset}
                dropdownOptions={dropdownOptions}
                disabled={!canEditFields}
              />
            )}
          </td>
        ))}

        <td className="p-2 border border-gray-200">
          <ActionButtons
            isEditing={isEditing}
            isNew={isNew}
            onEdit={() =>{ 
              onEdit(asset);
             setEditedAsset({...asset})
          }}
            onDelete={() => asset.id !== undefined && onDelete(asset.id)}
            onRestore={() => asset.id !== undefined && onRestore(asset.id)}
            onSave={onSave}
            onSaveNew={onSaveNew}
            onCancel={onCancel}
            isDeleted={!!asset.is_deleted}
            canEditFields={canEditFields}
            isAdmin={isAdmin}
            isAssetManager={isAssetManager}
            isEditor={isEditor}
            isViewer={isViewer}
          />
        </td>
      </tr>

      {asset.geocodeWarning && (
        <tr>
          <td colSpan={columns.length + 1}>
            <div className="bg-yellow-200 text-yellow-900 p-2 border border-yellow-400 rounded text-sm">
              ⚠ Unable to geocode this address. Please check spelling or postcode.
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

export default AssetRow;

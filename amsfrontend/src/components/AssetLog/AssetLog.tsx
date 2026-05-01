import React, { useEffect, useContext } from "react";
import { useAssets } from "../../hooks/useAssets";
import { useDropdownOptions } from "../../hooks/useDropdownOptions";
import AssetTable from "./AssetTable";
import { AuthContext } from "../../context/AuthContext";
import RoleBadge from "../common/RoleBadge";
import { useRBAC } from "../../hooks/useRBAC";
import axiosInstance from "../../utils/axiosInstance";
export interface Asset {
  id?: number | string;
  [key: string]: any;
}

export interface AssetLogProps {
  role?: string;
}

const AssetLog: React.FC<AssetLogProps> = ({ role }) => {
  const {
    assets,
    total,
    page,
    limit,
    search,
    showDeleted,

    setPage,
    setLimit,
    setSearch,
    setShowDeleted,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,

    filters,
    setFilters,

    editingId,
    editedAsset,
    setEditedAsset,
    newAsset,
    fetchAssets,
    handleEdit,
    handleDelete,
    handleRestore,
    handlePermanentDelete,
    handleSave,
    handleAdd,
    handleSaveNew,
    setEditingId,
    setNewAsset,
    addWorkItem,   // ⭐ NEW — required
  } = useAssets();

  const dropdownOptions = useDropdownOptions();
  const auth = useContext(AuthContext);

  const effectiveRole = role ?? auth.user?.role;
  const rbac = useRBAC();

  useEffect(() => {
    fetchAssets({
      includeDeleted: showDeleted,
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      filters,
    });
  }, [showDeleted, page, limit, search, sortBy, sortOrder, filters, fetchAssets]);
  
  const refreshAsset = async (id: number | string) => {
  try {
    const res = await axiosInstance.get(`/assets/${id}`);
    const updated = res.data.asset;

    // Replace only the updated asset in the list
    fetchAssets({
      includeDeleted: showDeleted,
      page,
      limit,
      search,
      sortBy,
      sortOrder,
      filters,
    });

  } catch (err) {
    console.error("Failed to refresh asset:", err);
  }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl text-black text-center font-bold mb-4">
        Asset Log Table
      </h2>

      <div className="text-center mb-4">
        <RoleBadge role={String(effectiveRole ?? "")} />
      </div>

      <input
        type="text"
        placeholder="Search assets..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="border p-2 rounded mb-4 w-full"
      />

      {rbac.canAddAssets && (
        <button
          onClick={handleAdd}
          disabled={!!newAsset}
          className={`px-4 py-2 rounded mb-4 text-white ${
            newAsset
              ? "bg-green-300 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {newAsset ? "Finish current asset first" : "Add Asset"}
        </button>
      )}

      {rbac.canSeeDeletedToggle && (
        <label className="block mb-4">
          <input
            type="checkbox"
            checked={showDeleted}
            onChange={(e) => {
              setShowDeleted(e.target.checked);
              setPage(1);
            }}
          />
          Show Deleted Assets
        </label>
      )}

      <AssetTable
        assets={assets}
        editingId={editingId}
        editedAsset={editedAsset}
        newAsset={newAsset}
        setEditedAsset={setEditedAsset}
        setEditingId={setEditingId}
        dropdownOptions={dropdownOptions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
        onSave={handleSave}
        onSaveNew={handleSaveNew}
        onPermanentDelete={handlePermanentDelete}
        // ⭐ FIXED: Cancel now resets everything
        onCancel={() => {
          setEditingId(null);
          setEditedAsset({});
          setNewAsset(null);
        }}
        addWorkItem={addWorkItem}
        isAdmin={rbac.isAdmin || rbac.isAppAdmin || rbac.isCompanyAdmin}
        isAssetManager={rbac.isAssetManager}
        isEditor={rbac.isEditor || rbac.isSingleUser}
        isViewer={rbac.isViewer}
        sortBy={sortBy}
        sortOrder={sortOrder}
        setSortBy={setSortBy}
        setSortOrder={setSortOrder}
        filters={filters}
        setFilters={setFilters}
        refreshAsset={refreshAsset}
       />

      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border rounded"
        >
          Previous
        </button>

        <span>
          Page {page} of {Math.max(1, Math.ceil(total / limit) || 1)}
        </span>

        <button
          disabled={assets.length < limit}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 border rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AssetLog;

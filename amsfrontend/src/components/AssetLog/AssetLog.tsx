import React, { useEffect, useContext } from "react";
import { useAssets } from "../../hooks/useAssets";
import { useDropdownOptions } from "../../hooks/useDropdownOptions";
import AssetTable from "./AssetTable";
import { AuthContext } from "../../context/AuthContext";
import RoleBadge from "../common/RoleBadge";
import { useRBAC } from "../../hooks/useRBAC";

// ✅ Asset type (Prisma-friendly)
export interface Asset {
  id?: number | string;
  [key: string]: any;
}

// ✅ Props for AssetLog
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
    handleSave,
    handleAdd,
    handleSaveNew,
    setEditingId,
  } = useAssets();

  const dropdownOptions = useDropdownOptions();
  const auth = useContext(AuthContext);
  // ⭐ Use role prop OR fallback to authenticated user role
  const effectiveRole = role ?? auth.user?.role;
  // ⭐ One-line RBAC
  const rbac = useRBAC();
  // ⭐ Debug logs (kept as you had them)
  useEffect(() => {
    console.log("AUTH USER:", auth.user);
    console.log("ROLE FROM AUTH:", auth.user?.role);
    console.log("ROLE FROM FLAGS:", effectiveRole);
  }, [auth.user, effectiveRole]);

  // ✅ Refetch assets whenever pagination/filter changes
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

  return (
    <div className="p-4">
      <h2 className="text-xl text-black text-center font-bold mb-4">
        Asset Log Table
      </h2>

      {/* Role badge based on prop or context role */}
      <div className="text-center mb-4">
        <RoleBadge role={String(effectiveRole ?? "")} />
      </div>


      {/* 🔍 Global Search bar  */}
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

      {/* Add Asset button */}
      {rbac.canAddAssets && (
        <button
          onClick={handleAdd}
          disabled={!!newAsset} // ✅ prevent multiple new rows
          className={`px-4 py-2 rounded mb-4 text-white ${
            newAsset
              ? "bg-green-300 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {newAsset ? "Finish current asset first" : "Add Asset"}
        </button>
      )}



      {/* ✅ Admin-only toggle */}
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
        dropdownOptions={dropdownOptions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRestore={handleRestore}
        onSave={handleSave}
        onSaveNew={handleSaveNew}
        onCancel={() => setEditingId(null)}
        isAdmin={rbac.isAdmin || rbac.isAppAdmin || rbac.isCompanyAdmin}
        isAssetManager={rbac.isAssetManager}
        isEditor={rbac.isEditor || rbac.isSingleUser}
        isViewer={rbac.isViewer}
        // ⭐ ADD THESE 4 LINES
        sortBy={sortBy}
        sortOrder={sortOrder}
        setSortBy={setSortBy}
        setSortOrder={setSortOrder}
        filters={filters}
        setFilters={setFilters}
      />
      {/* 📄 Pagination controls (minimal) */}
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

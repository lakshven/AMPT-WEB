// frontend/src/utils/rbac.ts

interface GetRoleFlagsArgs {
  role?: string | null;
}

export function getRoleFlags({ role }: GetRoleFlagsArgs) {
  const normalizedRole = (role || "").toLowerCase();

  const isAppAdmin = normalizedRole === "app_admin";
  const isAdmin = normalizedRole === "admin";
  const isCompanyAdmin = normalizedRole === "company_admin";
  const isAssetManager = normalizedRole === "asset_manager";
  const isEditor = normalizedRole === "editor";
  const isViewer = normalizedRole === "viewer";
  const isSingleUser = normalizedRole === "single_user";
  // ⭐ NEW: Who can manage users?
  const canManageUsers =
    isAppAdmin || isAdmin || isCompanyAdmin;

  // ✅ Who can add assets?
  const canAddAssets =
    isAppAdmin ||
    isAdmin ||
    isCompanyAdmin ||
    isAssetManager ||
    isEditor||
    isSingleUser; // ⭐ allow single_user

  // ✅ Who can see deleted toggle?
  const canSeeDeletedToggle =
    isAppAdmin || isAdmin || isCompanyAdmin;

  // ⭐ NEW ISSUE PERMISSIONS
  const canAddIssues =
    isAppAdmin ||
    isAdmin ||
    isCompanyAdmin ||
    isEditor;

  const canEditIssues =
    isAppAdmin ||
    isAdmin ||
    isCompanyAdmin ||
    isEditor;

  const canAssignIssues =
    isAppAdmin ||
    isAdmin ||
    isCompanyAdmin;

  const canCompleteIssues =
    isAppAdmin ||
    isAdmin ||
    isCompanyAdmin ||
    isEditor;

  const canDeleteIssues =
    isAppAdmin ||
    isAdmin ||
    isCompanyAdmin;

  return {
     // Role flags
    isAppAdmin,
    isAdmin,
    isCompanyAdmin,
    isAssetManager,
    isEditor,
    isViewer,
    isSingleUser,
    // User permissions
    canManageUsers,
// Asset permissions (unchanged)
    canAddAssets,
    canSeeDeletedToggle,
// ⭐ Issue permissions (new)
    canAddIssues,
    canEditIssues,
    canAssignIssues,
    canCompleteIssues,
    canDeleteIssues,
  };
}
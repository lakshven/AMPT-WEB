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
    isAppAdmin || isAdmin || isCompanyAdmin || isEditor || isAssetManager;

  // ⭐ NEW ISSUE PERMISSIONS
  const canAddIssues =
    isAppAdmin ||
    isAdmin ||
    isCompanyAdmin ||
    isEditor ||
    isAssetManager ;

  const canEditIssues =
    isAppAdmin ||
    isAdmin ||
    isCompanyAdmin ||
    isEditor ||
    isAssetManager;

  const canAssignIssues =
    isAppAdmin ||
    isAdmin ||
    isCompanyAdmin;

  const canCompleteIssues =
    isAppAdmin ||
    isAdmin ||
    isCompanyAdmin ||
    isEditor ||
    isAssetManager;

  const canDeleteIssues =
    isAppAdmin ||
    isAdmin ||
    isCompanyAdmin ||
    isAssetManager ||
    isEditor ; 

  return {
    // Role flags
    isAppAdmin,
    isAdmin,
    isCompanyAdmin,
    isAssetManager,
    isEditor,
    isViewer,
    isSingleUser,
    // permissions
    canManageUsers,
    canAddAssets,
    canSeeDeletedToggle,
    canAddIssues,
    canEditIssues,
    canAssignIssues,
    canCompleteIssues,
    canDeleteIssues,
  };
}

const API_URL = process.env.REACT_APP_API_URL;

export const manualPaths: Record<string, string> = {
  app_admin: `${API_URL}/manuals/app_admin.pdf`,
  company_admin: `${API_URL}/manuals/company_admin.pdf`,
  asset_manager: `${API_URL}/manuals/asset_manager.pdf`,
  editor: `${API_URL}/manuals/editor.pdf`,
  viewer: `${API_URL}/manuals/viewer.pdf`,
  single_user: `${API_URL}/manuals/single_user.pdf`,
};

export function getManualForRole(role: string | null): string {
  if (!role) return `${API_URL}/manuals/default.pdf`;
  return manualPaths[role] || `${API_URL}/manuals/default.pdf`;
}
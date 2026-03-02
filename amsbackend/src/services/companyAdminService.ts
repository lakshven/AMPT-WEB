import {
  getCompanyStatsQuery,
  getCompanyAlertsQuery,
  getCompanyActivityLogsQuery,
  getCompanyAnalyticsQuery,
  getCompanySettingsQuery,
  updateCompanyInfoQuery,
  updateBrandingQuery,
  updatePreferencesQuery,
} from "../controllers/companyadmin/companyQueries";

// Dashboard Stats
export const fetchCompanyStats = async (companyId: number) => {
  return await getCompanyStatsQuery(companyId);
};

// Alerts
export const fetchCompanyAlerts = async (companyId: number) => {
  return await getCompanyAlertsQuery(companyId);
};

// Activity Logs
export const fetchCompanyActivityLogs = async (companyId: number, filters: any) => {
  return await getCompanyActivityLogsQuery(companyId, filters);
};

// Analytics
export const fetchCompanyAnalytics = async (companyId: number) => {
  return await getCompanyAnalyticsQuery(companyId);
};

// Settings
export const fetchCompanySettings = async (companyId: number) => {
  return await getCompanySettingsQuery(companyId);
};

// Update Company Info
export const saveCompanyInfo = async (companyId: number, data: any) => {
  return await updateCompanyInfoQuery(companyId, data);
};

// Update Branding
export const saveBranding = async (companyId: number, data: any) => {
  return await updateBrandingQuery(companyId, data);
};

// Update Preferences
export const savePreferences = async (companyId: number, data: any) => {
  return await updatePreferencesQuery(companyId, data);
};
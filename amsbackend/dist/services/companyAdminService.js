"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.savePreferences = exports.saveBranding = exports.saveCompanyInfo = exports.fetchCompanySettings = exports.fetchCompanyAnalytics = exports.fetchCompanyActivityLogs = exports.fetchCompanyAlerts = exports.fetchCompanyStats = void 0;
const companyQueries_1 = require("../controllers/companyadmin/companyQueries");
// Dashboard Stats
const fetchCompanyStats = async (companyId) => {
    return await (0, companyQueries_1.getCompanyStatsQuery)(companyId);
};
exports.fetchCompanyStats = fetchCompanyStats;
// Alerts
const fetchCompanyAlerts = async (companyId) => {
    return await (0, companyQueries_1.getCompanyAlertsQuery)(companyId);
};
exports.fetchCompanyAlerts = fetchCompanyAlerts;
// Activity Logs
const fetchCompanyActivityLogs = async (companyId, filters) => {
    return await (0, companyQueries_1.getCompanyActivityLogsQuery)(companyId, filters);
};
exports.fetchCompanyActivityLogs = fetchCompanyActivityLogs;
// Analytics
const fetchCompanyAnalytics = async (companyId) => {
    return await (0, companyQueries_1.getCompanyAnalyticsQuery)(companyId);
};
exports.fetchCompanyAnalytics = fetchCompanyAnalytics;
// Settings
const fetchCompanySettings = async (companyId) => {
    return await (0, companyQueries_1.getCompanySettingsQuery)(companyId);
};
exports.fetchCompanySettings = fetchCompanySettings;
// Update Company Info
const saveCompanyInfo = async (companyId, data) => {
    return await (0, companyQueries_1.updateCompanyInfoQuery)(companyId, data);
};
exports.saveCompanyInfo = saveCompanyInfo;
// Update Branding
const saveBranding = async (companyId, data) => {
    return await (0, companyQueries_1.updateBrandingQuery)(companyId, data);
};
exports.saveBranding = saveBranding;
// Update Preferences
const savePreferences = async (companyId, data) => {
    return await (0, companyQueries_1.updatePreferencesQuery)(companyId, data);
};
exports.savePreferences = savePreferences;
//# sourceMappingURL=companyAdminService.js.map
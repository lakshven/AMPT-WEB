"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePreferences = exports.updateBranding = exports.updateCompanyInfo = exports.getCompanySettings = exports.getCompanyAnalytics = exports.getCompanyActivityLogs = exports.getCompanyAlerts = exports.getCompanyStats = void 0;
const companyAdminService_1 = require("../../services/companyAdminService");
// Dashboard Stats
const getCompanyStats = async (req, res) => {
    try {
        const companyId = req.user?.companyId ?? null;
        if (!companyId) {
            return res.status(400).json({ message: "Company ID missing" });
        }
        const data = await (0, companyAdminService_1.fetchCompanyStats)(companyId);
        res.json(data);
    }
    catch (error) {
        console.error("Error fetching company stats:", error);
        res.status(500).json({ message: "Failed to load company stats" });
    }
};
exports.getCompanyStats = getCompanyStats;
// Alerts
const getCompanyAlerts = async (req, res) => {
    try {
        const companyId = req.user?.companyId ?? null;
        if (!companyId) {
            return res.status(400).json({ message: "Company ID missing" });
        }
        const data = await (0, companyAdminService_1.fetchCompanyAlerts)(companyId);
        res.json(data);
    }
    catch (error) {
        console.error("Error fetching company alerts:", error);
        res.status(500).json({ message: "Failed to load company alerts" });
    }
};
exports.getCompanyAlerts = getCompanyAlerts;
// Activity Logs
const getCompanyActivityLogs = async (req, res) => {
    try {
        const companyId = req.user?.companyId ?? null;
        if (!companyId) {
            return res.status(400).json({ message: "Company ID missing" });
        }
        // ⭐ Read query params
        const { userId, action, from, to, sort = "createdAt", order = "desc", page = "1", limit = "25", } = req.query;
        const filters = {
            userId: userId ? Number(userId) : undefined,
            action: action ? String(action) : undefined,
            from: from ? new Date(String(from)) : undefined,
            to: to ? new Date(String(to)) : undefined,
            sort: String(sort),
            order: String(order).toLowerCase() === "asc" ? "asc" : "desc",
            page: Number(page),
            limit: Number(limit),
        };
        const logs = await (0, companyAdminService_1.fetchCompanyActivityLogs)(companyId, filters);
        // ⭐ FIX: Normalize timestamps for frontend compatibility
        const normalizedLogs = logs.data.map((log) => ({
            ...log,
            timestamp: log.createdAt, // frontend now receives a valid timestamp
        }));
        res.json({ pagination: logs.pagination, data: normalizedLogs });
    }
    catch (error) {
        console.error("Error fetching activity logs:", error);
        res.status(500).json({ message: "Failed to load activity logs" });
    }
};
exports.getCompanyActivityLogs = getCompanyActivityLogs;
// Analytics
const getCompanyAnalytics = async (req, res) => {
    try {
        const companyId = req.user?.companyId ?? null;
        if (!companyId) {
            return res.status(400).json({ message: "Company ID missing" });
        }
        const analytics = await (0, companyAdminService_1.fetchCompanyAnalytics)(companyId);
        res.json(analytics);
    }
    catch (error) {
        console.error("Error fetching analytics:", error);
        res.status(500).json({ message: "Failed to load analytics" });
    }
};
exports.getCompanyAnalytics = getCompanyAnalytics;
// Settings
const getCompanySettings = async (req, res) => {
    try {
        const companyId = req.user?.companyId ?? null;
        if (!companyId) {
            return res.status(400).json({ message: "Company ID missing" });
        }
        const settings = await (0, companyAdminService_1.fetchCompanySettings)(companyId);
        res.json(settings);
    }
    catch (error) {
        console.error("Error fetching settings:", error);
        res.status(500).json({ message: "Failed to load settings" });
    }
};
exports.getCompanySettings = getCompanySettings;
// Update Company Info
const updateCompanyInfo = async (req, res) => {
    try {
        const companyId = req.user?.companyId ?? null;
        if (!companyId) {
            return res.status(400).json({ message: "Company ID missing" });
        }
        await (0, companyAdminService_1.saveCompanyInfo)(companyId, req.body);
        res.json({ message: "Company info updated successfully" });
    }
    catch (error) {
        console.error("Error updating company info:", error);
        res.status(500).json({ message: "Failed to update company info" });
    }
};
exports.updateCompanyInfo = updateCompanyInfo;
// Update Branding
const updateBranding = async (req, res) => {
    try {
        const companyId = req.user?.companyId ?? null;
        if (!companyId) {
            return res.status(400).json({ message: "Company ID missing" });
        }
        await (0, companyAdminService_1.saveBranding)(companyId, req.body);
        res.json({ message: "Branding updated successfully" });
    }
    catch (error) {
        console.error("Error updating branding:", error);
        res.status(500).json({ message: "Failed to update branding" });
    }
};
exports.updateBranding = updateBranding;
// Update Preferences
const updatePreferences = async (req, res) => {
    try {
        const companyId = req.user?.companyId ?? null;
        if (!companyId) {
            return res.status(400).json({ message: "Company ID missing" });
        }
        await (0, companyAdminService_1.savePreferences)(companyId, req.body);
        res.json({ message: "Preferences updated successfully" });
    }
    catch (error) {
        console.error("Error updating preferences:", error);
        res.status(500).json({ message: "Failed to update preferences" });
    }
};
exports.updatePreferences = updatePreferences;
//# sourceMappingURL=CompanyAdminController.js.map
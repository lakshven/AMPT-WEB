import {
  fetchCompanyStats,
  fetchCompanyAlerts,
  fetchCompanyActivityLogs,
  fetchCompanyAnalytics,
  fetchCompanySettings,
  saveCompanyInfo,
  saveBranding,
  savePreferences,
} from "../../services/companyAdminService";

import { Request, Response } from "express";

// Dashboard Stats
export const getCompanyStats = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId ?? null;

    if (!companyId) {
      return res.status(400).json({ message: "Company ID missing" });
    }

    const data = await fetchCompanyStats(companyId);
    res.json(data);
  } catch (error) {
    console.error("Error fetching company stats:", error);
    res.status(500).json({ message: "Failed to load company stats" });
  }
};

// Alerts
export const getCompanyAlerts = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId ?? null;

    if (!companyId) {
      return res.status(400).json({ message: "Company ID missing" });
    }

    const data = await fetchCompanyAlerts(companyId);
    res.json(data);
  } catch (error) {
    console.error("Error fetching company alerts:", error);
    res.status(500).json({ message: "Failed to load company alerts" });
  }
};

// Activity Logs
export const getCompanyActivityLogs = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId ?? null;

    if (!companyId) {
      return res.status(400).json({ message: "Company ID missing" });
    }
        // ⭐ Read query params
    const {
      userId,
      action,
      from,
      to,
      sort = "createdAt",
      order = "desc",
      page = "1",
      limit = "25",
    } = req.query;

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

    const logs = await fetchCompanyActivityLogs(companyId, filters);
    // ⭐ FIX: Normalize timestamps for frontend compatibility
    const normalizedLogs = logs.data.map((log: any) => ({
      ...log,
      timestamp: log.createdAt, // frontend now receives a valid timestamp
    }));
    res.json({ pagination: logs.pagination, data: normalizedLogs });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    res.status(500).json({ message: "Failed to load activity logs" });
  }
};

// Analytics
export const getCompanyAnalytics = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId ?? null;

    if (!companyId) {
      return res.status(400).json({ message: "Company ID missing" });
    }

    const analytics = await fetchCompanyAnalytics(companyId);
    res.json(analytics);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Failed to load analytics" });
  }
};

// Settings
export const getCompanySettings = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId ?? null ;

    if (!companyId) {
      return res.status(400).json({ message: "Company ID missing" });
    }

    const settings = await fetchCompanySettings(companyId);
    res.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ message: "Failed to load settings" });
  }
};

// Update Company Info
export const updateCompanyInfo = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId ?? null ;

    if (!companyId) {
      return res.status(400).json({ message: "Company ID missing" });
    }

    await saveCompanyInfo(companyId, req.body);
    res.json({ message: "Company info updated successfully" });
  } catch (error) {
    console.error("Error updating company info:", error);
    res.status(500).json({ message: "Failed to update company info" });
  }
};

// Update Branding
export const updateBranding = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId ?? null ;

    if (!companyId) {
      return res.status(400).json({ message: "Company ID missing" });
    }

    await saveBranding(companyId, req.body);
    res.json({ message: "Branding updated successfully" });
  } catch (error) {
    console.error("Error updating branding:", error);
    res.status(500).json({ message: "Failed to update branding" });
  }
};

// Update Preferences
export const updatePreferences = async (req: Request, res: Response) => {
  try {
    const companyId = req.user?.companyId ?? null ;

    if (!companyId) {
      return res.status(400).json({ message: "Company ID missing" });
    }

    await savePreferences(companyId, req.body);
    res.json({ message: "Preferences updated successfully" });
  } catch (error) {
    console.error("Error updating preferences:", error);
    res.status(500).json({ message: "Failed to update preferences" });
  }
};
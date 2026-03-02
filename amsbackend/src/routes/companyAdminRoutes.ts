import { Router } from "express";
import {
  getCompanyStats,
  getCompanyAlerts,
  getCompanyActivityLogs,
  getCompanyAnalytics,
  getCompanySettings,
  updateCompanyInfo,
  updateBranding,
  updatePreferences,
} from "../controllers/companyadmin/CompanyAdminController";

import { attachUserContext } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";

const router = Router();

// Only Company Admin can access these routes
router.use(attachUserContext, requireRole("company_admin", "company", "COMPANY_ADMIN"));

// Dashboard
router.get("/stats", getCompanyStats);
router.get("/alerts", getCompanyAlerts);

// Activity Logs
router.get("/activity-logs", getCompanyActivityLogs);

// Analytics
router.get("/analytics", getCompanyAnalytics);

// Settings
router.get("/settings", getCompanySettings);
router.put("/settings/company-info", updateCompanyInfo);
router.put("/settings/branding", updateBranding);
router.put("/settings/preferences", updatePreferences);

export default router;
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CompanyAdminController_1 = require("../controllers/companyadmin/CompanyAdminController");
const auth_1 = require("../middleware/auth");
const requireRole_1 = require("../middleware/requireRole");
const router = (0, express_1.Router)();
// Only Company Admin can access these routes
router.use(auth_1.attachUserContext, (0, requireRole_1.requireRole)("company_admin", "company", "COMPANY_ADMIN"));
// Dashboard
router.get("/stats", CompanyAdminController_1.getCompanyStats);
router.get("/alerts", CompanyAdminController_1.getCompanyAlerts);
// Activity Logs
router.get("/activity-logs", CompanyAdminController_1.getCompanyActivityLogs);
// Analytics
router.get("/analytics", CompanyAdminController_1.getCompanyAnalytics);
// Settings
router.get("/settings", CompanyAdminController_1.getCompanySettings);
router.put("/settings/company-info", CompanyAdminController_1.updateCompanyInfo);
router.put("/settings/branding", CompanyAdminController_1.updateBranding);
router.put("/settings/preferences", CompanyAdminController_1.updatePreferences);
exports.default = router;
//# sourceMappingURL=companyAdminRoutes.js.map
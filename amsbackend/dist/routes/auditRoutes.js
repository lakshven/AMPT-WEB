"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/auditRoutes.ts
const express_1 = require("express");
const globalLogs_1 = require("../controllers/audit/globalLogs");
const filterLogs_1 = require("../controllers/audit/filterLogs");
const paginatedLogs_1 = require("../controllers/audit/paginatedLogs");
const analytics_1 = require("../controllers/audit/analytics");
const exportLogs_1 = require("../controllers/audit/exportLogs");
const searchLogs_1 = require("../controllers/audit/searchLogs");
const auth_1 = require("../middleware/auth");
const requireRole_1 = require("../middleware/requireRole");
const requirePermission_1 = require("../middleware/requirePermission");
const router = (0, express_1.Router)();
const allowedRoles = [
    "app_admin",
    "company_admin",
    "asset_manager",
    "single_user",
];
// ----------------------
// GLOBAL AUDIT LOGS
// ----------------------
router.get("/", auth_1.attachUserContext, (0, requireRole_1.requireRole)(...allowedRoles), (0, requirePermission_1.requirePermission)("VIEW_AUDIT_LOGS"), globalLogs_1.getGlobalAuditLogs);
router.get("/user/:userId", auth_1.attachUserContext, (0, requireRole_1.requireRole)(...allowedRoles), (0, requirePermission_1.requirePermission)("VIEW_AUDIT_LOGS"), globalLogs_1.getAuditLogsByUser);
router.get("/entity/:entity/:entityId", auth_1.attachUserContext, (0, requireRole_1.requireRole)(...allowedRoles), (0, requirePermission_1.requirePermission)("VIEW_AUDIT_LOGS"), globalLogs_1.getAuditLogsByEntity);
// ----------------------
// FILTERING
// ----------------------
router.get("/filter", auth_1.attachUserContext, (0, requireRole_1.requireRole)(...allowedRoles), (0, requirePermission_1.requirePermission)("VIEW_AUDIT_LOGS"), filterLogs_1.filterAuditLogs);
// ----------------------
// PAGINATION
// ----------------------
router.get("/paginated", auth_1.attachUserContext, (0, requireRole_1.requireRole)(...allowedRoles), (0, requirePermission_1.requirePermission)("VIEW_AUDIT_LOGS"), paginatedLogs_1.getPaginatedAuditLogs);
// ----------------------
// FULL-TEXT SEARCH
// ----------------------
router.get("/search", auth_1.attachUserContext, (0, requireRole_1.requireRole)(...allowedRoles), (0, requirePermission_1.requirePermission)("VIEW_AUDIT_LOGS"), searchLogs_1.searchAuditLogs);
// ----------------------
// ANALYTICS
// ----------------------
router.get("/analytics", auth_1.attachUserContext, (0, requireRole_1.requireRole)(...allowedRoles), (0, requirePermission_1.requirePermission)("VIEW_AUDIT_LOGS"), analytics_1.getAuditAnalytics);
// ----------------------
// EXPORT (CSV + EXCEL)
// ----------------------
router.get("/export/csv", auth_1.attachUserContext, (0, requireRole_1.requireRole)(...allowedRoles), (0, requirePermission_1.requirePermission)("VIEW_AUDIT_LOGS"), exportLogs_1.exportAuditLogsCSV);
router.get("/export/excel", auth_1.attachUserContext, (0, requireRole_1.requireRole)(...allowedRoles), (0, requirePermission_1.requirePermission)("VIEW_AUDIT_LOGS"), exportLogs_1.exportAuditLogsExcel);
exports.default = router;
//# sourceMappingURL=auditRoutes.js.map
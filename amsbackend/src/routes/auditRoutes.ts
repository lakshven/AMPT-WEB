// routes/auditRoutes.ts
import { Router } from "express";

import {
  getGlobalAuditLogs,
  getAuditLogsByUser,
  getAuditLogsByEntity,
} from "../controllers/audit/globalLogs";

import { filterAuditLogs } from "../controllers/audit/filterLogs";
import { getPaginatedAuditLogs } from "../controllers/audit/paginatedLogs";
import { getAuditAnalytics } from "../controllers/audit/analytics";
import {
  exportAuditLogsCSV,
  exportAuditLogsExcel,
} from "../controllers/audit/exportLogs";
import { searchAuditLogs } from "../controllers/audit/searchLogs";

import { attachUserContext } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { requirePermission } from "../middleware/requirePermission";

const router = Router();

const allowedRoles = [
  "app_admin",
  "company_admin",
  "asset_manager",
  "single_user",
];

// ----------------------
// GLOBAL AUDIT LOGS
// ----------------------
router.get(
  "/",
  attachUserContext,
  requireRole(...allowedRoles),
  requirePermission("VIEW_AUDIT_LOGS"),
  getGlobalAuditLogs
);

router.get(
  "/user/:userId",
  attachUserContext,
  requireRole(...allowedRoles),
  requirePermission("VIEW_AUDIT_LOGS"),
  getAuditLogsByUser
);

router.get(
  "/entity/:entity/:entityId",
  attachUserContext,
  requireRole(...allowedRoles),
  requirePermission("VIEW_AUDIT_LOGS"),
  getAuditLogsByEntity
);

// ----------------------
// FILTERING
// ----------------------
router.get(
  "/filter",
  attachUserContext,
  requireRole(...allowedRoles),
  requirePermission("VIEW_AUDIT_LOGS"),
  filterAuditLogs
);

// ----------------------
// PAGINATION
// ----------------------
router.get(
  "/paginated",
  attachUserContext,
  requireRole(...allowedRoles),
  requirePermission("VIEW_AUDIT_LOGS"),
  getPaginatedAuditLogs
);

// ----------------------
// FULL-TEXT SEARCH
// ----------------------
router.get(
  "/search",
  attachUserContext,
  requireRole(...allowedRoles),
  requirePermission("VIEW_AUDIT_LOGS"),
  searchAuditLogs
);

// ----------------------
// ANALYTICS
// ----------------------
router.get(
  "/analytics",
  attachUserContext,
  requireRole(...allowedRoles),
  requirePermission("VIEW_AUDIT_LOGS"),
  getAuditAnalytics
);

// ----------------------
// EXPORT (CSV + EXCEL)
// ----------------------
router.get(
  "/export/csv",
  attachUserContext,
  requireRole(...allowedRoles),
  requirePermission("VIEW_AUDIT_LOGS"),
  exportAuditLogsCSV
);

router.get(
  "/export/excel",
  attachUserContext,
  requireRole(...allowedRoles),
  requirePermission("VIEW_AUDIT_LOGS"),
  exportAuditLogsExcel
);

export default router;
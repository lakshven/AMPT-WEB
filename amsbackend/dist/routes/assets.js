"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const summary_1 = require("../controllers/assets/summary");
const create_1 = require("../controllers/assets/create");
const update_1 = require("../controllers/assets/update");
const remove_1 = require("../controllers/assets/remove");
const restore_1 = require("../controllers/assets/restore");
const export_1 = require("../controllers/assets/export");
const archives_1 = require("../controllers/assets/archives");
const bulkUpload_1 = require("../controllers/assets/bulkUpload"); // Update the path if the actual file name differs in casing, e.g., bulkupload, BulkUpload, or bulk-upload
const auditLogs_1 = require("../controllers/assets/auditLogs");
const deletionLogs_1 = require("../controllers/assets/deletionLogs");
const upload_1 = require("../middleware/upload");
const list_1 = require("../controllers/assets/list");
const auth_1 = require("../middleware/auth");
const requireRole_1 = require("../middleware/requireRole");
const requirePermission_1 = require("../middleware/requirePermission");
const updateRouteOrder_1 = require("../controllers/assets/updateRouteOrder");
const optimizeRoute_1 = require("../controllers/assets/optimizeRoute");
const router = (0, express_1.Router)();
//  PUBLIC ROUTES (viewer/editor/asset_manager/admin)
router.get("/", auth_1.attachUserContext, (req, res) => (0, list_1.getAssets)(req, res));
router.get("/summary", auth_1.attachUserContext, (req, res) => (0, summary_1.getSummary)(req, res));
router.get("/locations", auth_1.attachUserContext, (req, res) => (0, list_1.getAssetLocations)(req, res));
//   PROTECTED ROUTES (asset_manager + admin)
const allowedRoles = ["asset_manager", "app_admin", "company_admin", "single_user"];
// Create asset
router.post("/", auth_1.attachUserContext, (0, requireRole_1.requireRole)(...allowedRoles), (0, requirePermission_1.requirePermission)("CREATE_ASSET"), upload_1.upload.fields([
    { name: "visual_report", maxCount: 1 },
    { name: "detailed_report", maxCount: 1 },
    { name: "assessment", maxCount: 1 },
    { name: "records", maxCount: 1 },
]), (req, res) => (0, create_1.addAsset)(req, res));
// Update asset
// Update asset (⭐ FIXED: added upload.fields)
router.put("/:id", auth_1.attachUserContext, (0, requireRole_1.requireRole)(...allowedRoles), (0, requirePermission_1.requirePermission)("EDIT_ASSET"), upload_1.upload.fields([
    { name: "visual_report", maxCount: 1 },
    { name: "detailed_report", maxCount: 1 },
    { name: "assessment", maxCount: 1 },
    { name: "records", maxCount: 1 },
]), (req, res) => (0, update_1.updateAsset)(req, res));
// ⭐ NEW: Update route order (drag-and-drop map)
router.post("/update-route-order", auth_1.attachUserContext, (0, requireRole_1.requireRole)(...allowedRoles), (0, requirePermission_1.requirePermission)("EDIT_ASSET"), (req, res) => (0, updateRouteOrder_1.updateRouteOrder)(req, res));
// ⭐ NEW: Optimize route (auto-sort by distance)
router.post("/optimize-route", auth_1.attachUserContext, (0, requireRole_1.requireRole)(...allowedRoles), (0, requirePermission_1.requirePermission)("EDIT_ASSET"), (req, res) => (0, optimizeRoute_1.optimizeRoute)(req, res));
// Delete asset
router.delete("/:id", auth_1.attachUserContext, (0, requireRole_1.requireRole)(...allowedRoles), (0, requirePermission_1.requirePermission)("DELETE_ASSET"), (req, res) => (0, remove_1.deleteAssetController)(req, res));
// Restore asset
router.put("/restore/:id", auth_1.attachUserContext, (0, requireRole_1.requireRole)(...allowedRoles), (0, requirePermission_1.requirePermission)("RESTORE_ASSET"), (req, res) => (0, restore_1.restoreAssetController)(req, res));
// Export asset
router.get("/export/:id", auth_1.attachUserContext, (0, requireRole_1.requireRole)(...allowedRoles), (0, requirePermission_1.requirePermission)("EXPORT_ASSET"), (req, res) => (0, export_1.exportAssetController)(req, res));
// Archive asset
router.put("/archive/:id", auth_1.attachUserContext, (0, requireRole_1.requireRole)(...allowedRoles), (0, requirePermission_1.requirePermission)("ARCHIVE_ASSET"), (req, res) => (0, archives_1.archiveAssetController)(req, res));
// Bulk upload assets
router.post("/bulk-upload", auth_1.attachUserContext, (0, requireRole_1.requireRole)(...allowedRoles), (0, requirePermission_1.requirePermission)("BULK_UPLOAD_ASSETS"), upload_1.upload.single("file"), (req, res) => (0, bulkUpload_1.bulkUploadAssetsController)(req, res));
// View asset audit logs
router.get("/audit/:id", auth_1.attachUserContext, (0, requireRole_1.requireRole)(...allowedRoles), (0, requirePermission_1.requirePermission)("VIEW_ASSET_AUDIT_LOGS"), (req, res) => (0, auditLogs_1.viewAssetAuditLogsController)(req, res));
// OPTIONAL: view deletion snapshot logs
router.get("/deletion-logs/:id", auth_1.attachUserContext, (0, requireRole_1.requireRole)(...allowedRoles), (0, requirePermission_1.requirePermission)("VIEW_ASSET_AUDIT_LOGS"), (req, res) => (0, deletionLogs_1.viewAssetDeletionLogsController)(req, res));
exports.default = router;
//# sourceMappingURL=assets.js.map
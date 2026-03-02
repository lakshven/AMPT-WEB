import { Router, Request, Response } from "express";
import { getSummary } from "../controllers/assets/summary";
import { addAsset } from "../controllers/assets/create";
import { updateAsset } from "../controllers/assets/update";
import { deleteAssetController } from "../controllers/assets/remove";
import { restoreAssetController } from "../controllers/assets/restore";
import { exportAssetController } from "../controllers/assets/export"
import { archiveAssetController } from "../controllers/assets/archives";
import { bulkUploadAssetsController } from "../controllers/assets/bulkUpload"; // Update the path if the actual file name differs in casing, e.g., bulkupload, BulkUpload, or bulk-upload
import { viewAssetAuditLogsController } from "../controllers/assets/auditLogs";
import {viewAssetDeletionLogsController} from "../controllers/assets/deletionLogs";
import { upload } from "../middleware/upload";
import { getAssets, getAssetLocations } from "../controllers/assets/list";
import { attachUserContext } from "../middleware/auth";
import { requireRole } from "../middleware/requireRole";
import { requirePermission } from "../middleware/requirePermission";
import { updateRouteOrder } from "../controllers/assets/updateRouteOrder";
import { optimizeRoute } from "../controllers/assets/optimizeRoute";

const router = Router();

 //  PUBLIC ROUTES (viewer/editor/asset_manager/admin)
router.get("/", attachUserContext, (req: Request, res: Response) => getAssets(req, res));
router.get("/summary", attachUserContext, (req: Request, res: Response) => getSummary(req, res));
router.get("/locations", attachUserContext, (req: Request, res: Response) => getAssetLocations(req, res));
//   PROTECTED ROUTES (asset_manager + admin)
const allowedRoles = ["asset_manager", "app_admin", "company_admin", "single_user"];
// Create asset
router.post(
  "/",
  attachUserContext,
  requireRole(...allowedRoles),
  requirePermission("CREATE_ASSET"),
  upload.fields([
    { name: "visual_report", maxCount: 1 },
    { name: "detailed_report", maxCount: 1 },
    { name: "assessment", maxCount: 1 },
    { name: "records", maxCount: 1 },
  ]),
  (req: Request, res: Response) => addAsset(req, res)
);
// Update asset
// Update asset (⭐ FIXED: added upload.fields)
router.put(
  "/:id",
  attachUserContext,
  requireRole(...allowedRoles),
  requirePermission("EDIT_ASSET"),
  upload.fields([
    { name: "visual_report", maxCount: 1 },
    { name: "detailed_report", maxCount: 1 },
    { name: "assessment", maxCount: 1 },
    { name: "records", maxCount: 1 },
  ]),
  (req: Request, res: Response) => updateAsset(req, res)
);

// ⭐ NEW: Update route order (drag-and-drop map)
router.post(
  "/update-route-order",
  attachUserContext,
  requireRole(...allowedRoles),
  requirePermission("EDIT_ASSET"),
  (req: Request, res: Response) => updateRouteOrder(req, res)
);

// ⭐ NEW: Optimize route (auto-sort by distance)
router.post(
  "/optimize-route",
  attachUserContext,
  requireRole(...allowedRoles),
  requirePermission("EDIT_ASSET"),
  (req: Request, res: Response) => optimizeRoute(req, res)
);


// Delete asset
router.delete(
  "/:id",
  attachUserContext,
  requireRole(...allowedRoles),
  requirePermission("DELETE_ASSET"),
  (req: Request, res: Response) => deleteAssetController(req, res)
);
// Restore asset
router.put(
  "/restore/:id",
  attachUserContext,
  requireRole(...allowedRoles),
  requirePermission("RESTORE_ASSET"),
  (req: Request, res: Response) => restoreAssetController(req, res)
);
// Export asset
router.get(
  "/export/:id",
  attachUserContext,
  requireRole(...allowedRoles),
  requirePermission("EXPORT_ASSET"),
  (req: Request, res: Response) => exportAssetController(req, res)
);
// Archive asset
router.put(
  "/archive/:id",
  attachUserContext,
  requireRole(...allowedRoles),
  requirePermission("ARCHIVE_ASSET"),
  (req: Request, res: Response) => archiveAssetController(req, res)
);
// Bulk upload assets
router.post(
  "/bulk-upload",
  attachUserContext,
  requireRole(...allowedRoles),
  requirePermission("BULK_UPLOAD_ASSETS"),
  upload.single("file"),
  (req: Request, res: Response) => bulkUploadAssetsController(req, res)
);
// View asset audit logs
router.get(
  "/audit/:id",
  attachUserContext,
  requireRole(...allowedRoles),
  requirePermission("VIEW_ASSET_AUDIT_LOGS"),
  (req: Request, res: Response) => viewAssetAuditLogsController(req, res)
);
// OPTIONAL: view deletion snapshot logs
router.get(
  "/deletion-logs/:id",
  attachUserContext,
  requireRole(...allowedRoles),
  requirePermission("VIEW_ASSET_AUDIT_LOGS"),
  (req: Request, res: Response) => viewAssetDeletionLogsController(req, res)
);

export default router;
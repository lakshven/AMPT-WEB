"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewAssetDeletionLogsController = viewAssetDeletionLogsController;
const client_1 = __importDefault(require("../../prisma/client"));
async function viewAssetDeletionLogsController(req, res) {
    try {
        const assetId = Number(req.params.id);
        if (Number.isNaN(assetId)) {
            return res.status(400).json({ message: "Invalid asset id" });
        }
        const isAppAdmin = req.user?.role === "app_admin";
        const isSingle = req.user?.accountType === "single";
        const userGroup = req.user?.clientGroupId;
        // Fetch asset to validate ownership
        const asset = await client_1.default.assets.findUnique({
            where: { id: assetId },
            select: { clientGroupId: true }
        });
        if (!asset) {
            return res.status(404).json({ message: "Asset not found" });
        }
        // Tenant isolation rules
        if (!isAppAdmin) {
            // single_user → only null-group assets
            if (isSingle && asset.clientGroupId !== null) {
                return res.status(403).json({ message: "Not allowed to view logs for this asset" });
            }
            // company users → only their own group
            if (!isSingle && asset.clientGroupId !== userGroup) {
                return res.status(403).json({ message: "Not allowed to view logs for this asset" });
            }
        }
        const logs = await client_1.default.asset_deletion_log.findMany({
            where: { asset_id: assetId },
            orderBy: { deleted_at: "desc" },
        });
        return res.json({ logs });
    }
    catch (err) {
        console.error("Asset deletion log error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
//# sourceMappingURL=deletionLogs.js.map
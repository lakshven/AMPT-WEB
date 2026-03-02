"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewAssetAuditLogsController = viewAssetAuditLogsController;
const client_1 = __importDefault(require("../../prisma/client"));
async function viewAssetAuditLogsController(req, res) {
    try {
        const assetId = Number(req.params.id);
        if (isNaN(assetId)) {
            return res.status(400).json({ message: "Invalid asset ID" });
        }
        const isAppAdmin = req.user?.role === "app_admin";
        const isSingle = req.user?.accountType === "single";
        const userGroup = req.user?.clientGroupId;
        // Validate asset ownership
        const asset = await client_1.default.assets.findUnique({
            where: { id: assetId },
            select: { clientGroupId: true }
        });
        if (!asset) {
            return res.status(404).json({ message: "Asset not found" });
        }
        if (!isAppAdmin) {
            if (isSingle && asset.clientGroupId !== null) {
                return res.status(403).json({ message: "Not allowed to view logs for this asset" });
            }
            if (!isSingle && asset.clientGroupId !== userGroup) {
                return res.status(403).json({ message: "Not allowed to view logs for this asset" });
            }
        }
        // Direct asset logs
        const directLogs = await client_1.default.audit.findMany({
            where: {
                targetType: "asset",
                targetId: assetId
            },
            orderBy: { createdAt: "desc" }
        });
        // Route-order logs
        const routeOrderLogs = await client_1.default.audit.findMany({
            where: { targetType: "routeOrder" },
            orderBy: { createdAt: "desc" }
        });
        // Safely filter route-order logs
        const filteredRouteLogs = routeOrderLogs.filter((log) => {
            const meta = log.metadata;
            if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
                return false;
            }
            const changes = meta.routeChanges;
            if (!Array.isArray(changes)) {
                return false;
            }
            return changes.some((c) => c.id === assetId);
        });
        // Merge + sort
        const logs = [...directLogs, ...filteredRouteLogs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return res.json({ logs });
    }
    catch (err) {
        console.error("Audit log error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
//# sourceMappingURL=auditLogs.js.map
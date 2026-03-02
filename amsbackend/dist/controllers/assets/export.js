"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportAssetController = exportAssetController;
const client_1 = __importDefault(require("../../prisma/client"));
const Audit_1 = require("../../models/Audit");
async function exportAssetController(req, res) {
    try {
        const id = Number(req.params.id);
        const isAppAdmin = req.user?.role === "app_admin";
        const userGroup = req.user?.clientGroupId;
        const user = req.user;
        let asset;
        if (isAppAdmin) {
            asset = await client_1.default.assets.findUnique({ where: { id } });
        }
        else if (req.user?.accountType === "single") {
            asset = await client_1.default.assets.findFirst({
                where: { id, clientGroupId: null }
            });
        }
        else {
            asset = await client_1.default.assets.findFirst({
                where: { id, clientGroupId: userGroup }
            });
        }
        if (!asset) {
            return res.status(404).json({ message: "Asset not found" });
        }
        // ⭐⭐⭐ AUDIT LOGGING ADDED HERE ⭐⭐⭐
        await (0, Audit_1.logAudit)({
            action: "export",
            targetType: "asset",
            targetId: id,
            performedBy: user.username,
            clientGroupId: asset.clientGroupId, // correct for all roles
            companyId: asset.companyId, // correct for all roles
            metadata: {
                exported: true
            }
        });
        return res.json({ message: "Asset export successful", asset });
    }
    catch (err) {
        console.error("Export asset error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
//# sourceMappingURL=export.js.map
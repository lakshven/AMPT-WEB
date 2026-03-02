"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAssetController = void 0;
const Assets_js_1 = require("../../models/Assets.js");
const client_1 = __importDefault(require("../../prisma/client"));
const Audit_js_1 = require("../../models/Audit.js");
const deleteAssetController = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    const assetId = Number(id);
    if (isNaN(assetId)) {
        res.status(400).json({ success: false, message: 'Invalid asset ID' });
        return;
    }
    const isSingle = req.user?.accountType === "single";
    const isCompany = req.user?.accountType === "company";
    const isAppAdmin = req.user?.role === "app_admin";
    const hasGroup = req.user?.clientGroupId !== null &&
        req.user?.clientGroupId !== undefined;
    if (!isSingle && !isAppAdmin && !hasGroup) {
        res.status(403).json({ success: false, message: "User has no client group assigned" });
        return;
    }
    try {
        const existing = await client_1.default.assets.findUnique({
            where: { id: assetId },
            select: {
                clientGroupId: true,
                companyId: true,
                structure_no: true,
                structure_name: true,
            }
        });
        if (!existing) {
            res.status(404).json({ success: false, message: "Asset not found" });
            return;
        }
        // ⭐ Ownership rules
        if (!isAppAdmin) {
            // single_user → can only delete assets with clientGroupId = null
            if (isSingle && existing.clientGroupId !== null) {
                res.status(403).json({ success: false, message: "Not allowed to delete this asset" });
                return;
            }
            // company users → can only delete assets in their own group
            if (isCompany &&
                existing.clientGroupId !== null &&
                existing.clientGroupId !== req.user.clientGroupId) {
                res.status(403).json({ success: false, message: "Not allowed to delete this asset" });
                return;
            }
        }
        const deletedBy = req.user?.username || 'unknown';
        // ⭐ FIXED: correct groupId handling
        const groupId = isSingle ? null : req.user.clientGroupId ?? null;
        const result = await (0, Assets_js_1.deleteAsset)(assetId, deletedBy, groupId, isAppAdmin);
        if (!result) {
            res.status(404).json({
                success: false,
                message: 'Asset not found or already deleted'
            });
            return;
        }
        // ⭐⭐⭐ AUDIT LOGGING ADDED HERE ⭐⭐⭐
        await (0, Audit_js_1.logAudit)({
            action: "delete",
            targetType: "asset",
            targetId: assetId,
            performedBy: user.username,
            actorUserId: user.id,
            clientGroupId: existing.clientGroupId, // correct for all roles
            companyId: existing.companyId ?? null,
            details: {
                reason: "soft delete",
                structure_no: existing.structure_no,
                structure_name: existing.structure_name
            },
            metadata: {
                deletedBy: user.username,
                role: user.role,
                accountType: user.accountType
            }
        });
        res.json(result);
    }
    catch (err) {
        console.error('Delete asset error:', err);
        res.status(500).json({
            success: false,
            message: 'Delete failed'
        });
    }
};
exports.deleteAssetController = deleteAssetController;
//# sourceMappingURL=remove.js.map
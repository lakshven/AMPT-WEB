"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreAssetController = void 0;
const Assets_1 = require("../../models/Assets"); // ✅ must be .js for ESM
const client_1 = __importDefault(require("../../prisma/client"));
const Audit_1 = require("../../models/Audit");
const restoreAssetController = async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    // ✅ Convert string → number
    const assetId = Number(id);
    if (isNaN(assetId)) {
        res.status(400).json({ success: false, message: 'Invalid asset ID' });
        return;
    }
    const isSingle = req.user?.accountType === "single";
    const isCompany = req.user?.accountType === "company";
    const isAppAdmin = req.user?.role === "app_admin";
    const userGroup = req.user?.clientGroupId;
    // ⭐ Company users MUST have a group (but NOT app_admin)
    if (!isSingle && !isAppAdmin && (userGroup === null)) {
        res.status(400).json({ success: false, message: "Missing client group on user" });
        return;
    }
    try {
        // Fetch asset to check ownership
        const existing = await client_1.default.assets.findUnique({
            where: { id: assetId },
            select: {
                clientGroupId: true,
                companyId: true,
                structure_no: true,
                structure_name: true,
                is_deleted: true
            }
        });
        if (!existing) {
            res.status(404).json({ success: false, message: "Asset not found" });
            return;
        }
        if (!existing.is_deleted) {
            res.status(400).json({ success: false, message: "Asset is not deleted" });
            return;
        }
        // ⭐ Ownership rules
        if (!isAppAdmin) {
            // single_user → can only restore null-group assets
            if (isSingle && existing.clientGroupId !== null) {
                res.status(403).json({ success: false, message: "Not allowed to restore this asset" });
                return;
            }
            // company users → can only restore assets in their own group
            if (isCompany &&
                existing.clientGroupId !== null &&
                existing.clientGroupId !== userGroup) {
                res.status(403).json({ success: false, message: "Not allowed to restore this asset" });
                return;
            }
        }
        const result = await (0, Assets_1.restoreAsset)(assetId, userGroup ?? null, isAppAdmin);
        if (!result) {
            res.status(404).json({
                success: false,
                message: 'Asset not found or not deleted'
            });
            return;
        }
        // ⭐⭐⭐ AUDIT LOGGING ADDED HERE ⭐⭐⭐
        await (0, Audit_1.logAudit)({
            action: "restore",
            targetType: "asset",
            targetId: assetId,
            performedBy: user.username,
            actorUserId: user.id,
            clientGroupId: existing.clientGroupId, // correct for all roles
            companyId: existing.companyId ?? null,
            details: {
                restored: true,
                structure_no: existing.structure_no,
                structure_name: existing.structure_name
            },
            metadata: {
                restoredFromDeleted: true,
                role: user.role,
                accountType: user.accountType
            }
        });
        res.json(result);
    }
    catch (err) {
        console.error('Restore asset error:', err);
        res.status(500).json({
            success: false,
            message: 'Restore failed'
        });
    }
};
exports.restoreAssetController = restoreAssetController;
//# sourceMappingURL=restore.js.map
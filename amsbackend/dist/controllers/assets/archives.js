"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.archiveAssetController = archiveAssetController;
const client_1 = require("../../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
const Audit_1 = require("../../models/Audit"); // ⭐ ADDED
async function archiveAssetController(req, res) {
    try {
        const id = Number(req.params.id);
        const user = req.user;
        if (isNaN(id)) {
            return res.status(400).json({ error: "Invalid asset ID" });
        }
        const isAppAdmin = req.user?.role === "app_admin";
        const isSingle = req.user?.accountType === "single";
        const userGroup = req.user?.clientGroupId;
        // Fetch asset
        const asset = await prismaClient().assets.findUnique({
            where: { id },
            select: { id: true, clientGroupId: true, companyId: true } // select for audit log
        });
        if (!asset) {
            return res.status(404).json({ error: "Asset not found" });
        }
        // Tenant isolation rules
        if (!isAppAdmin) {
            // single_user → only null-group assets
            if (isSingle && asset.clientGroupId !== null) {
                return res.status(403).json({ error: "Not allowed to archive this asset" });
            }
            // company users → only their own group
            if (!isSingle && asset.clientGroupId !== userGroup) {
                return res.status(403).json({ error: "Not allowed to archive this asset" });
            }
        }
        // ⭐ Archive asset
        await prismaClient().assets.update({
            where: { id },
            data: { archived_at: new Date() }
        });
        // ⭐⭐⭐ AUDIT LOGGING ADDED HERE ⭐⭐⭐
        await (0, Audit_1.logAudit)({
            action: "archive",
            targetType: "asset",
            targetId: id,
            performedBy: user.username,
            actorUserId: user.id ?? null,
            clientGroupId: asset.clientGroupId ?? null, // correct for all roles
            companyId: asset.companyId ?? null, // correct for all roles
            metadata: {
                archived: true
            }
        });
        return res.json({ message: "Asset archived successfully" });
    }
    catch (err) {
        console.error("Archive asset error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
//# sourceMappingURL=archives.js.map
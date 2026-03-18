"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreClientGroup = restoreClientGroup;
const client_1 = require("../../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
const Audit_1 = require("../../models/Audit");
async function restoreClientGroup(req, res) {
    const { id } = req.body;
    const userId = req.user?.id;
    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Client group ID is required",
        });
    }
    try {
        const restored = await prismaClient().clientGroup.update({
            where: { id },
            data: { isDeleted: false, deletedAt: null },
            select: {
                id: true,
                name: true,
                department: true,
                isDeleted: true,
                deletedAt: true,
                accessCode: true,
                createdAt: true,
                companyId: true,
            },
        });
        // ⭐ IMPROVED AUDIT LOG ENTRY
        await (0, Audit_1.logAudit)({
            action: "RESTORE_CLIENT_GROUP",
            targetType: "ClientGroup",
            targetId: restored.id,
            actorUserId: userId,
            clientGroupId: restored.id,
            companyId: restored.companyId,
            details: {
                previousState: { isDeleted: true },
                newState: { isDeleted: false }
            },
            metadata: {
                name: restored.name,
                department: restored.department
            }
        });
        res.json({
            success: true,
            message: "Client group restored successfully",
            data: restored,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "Restore failed",
            error: err,
        });
    }
}
//# sourceMappingURL=restoreClientGroups.js.map
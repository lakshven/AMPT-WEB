"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateClientGroup = updateClientGroup;
const client_1 = require("../../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
const Audit_1 = require("../../models/Audit");
async function updateClientGroup(req, res) {
    const { id, name, department } = req.body;
    const userId = req.user?.id;
    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Client group ID is required",
        });
    }
    try {
        // ⭐ Fetch previous state for audit logging
        const previous = await prismaClient().clientGroup.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                department: true,
                isDeleted: true,
                accessCode: true,
                createdAt: true,
                companyId: true,
            },
        });
        if (!previous) {
            return res.status(404).json({
                success: false,
                message: "Client group not found",
            });
        }
        const updated = await prismaClient().clientGroup.update({
            where: { id },
            data: {
                name,
                department: department || null,
            },
            select: {
                id: true,
                name: true,
                department: true,
                isDeleted: true,
                accessCode: true,
                createdAt: true,
                companyId: true,
            },
        });
        // ⭐ AUDIT LOG ENTRY (Improved)
        await (0, Audit_1.logAudit)({
            action: "UPDATE_CLIENT_GROUP",
            targetType: "ClientGroup",
            targetId: updated.id,
            actorUserId: userId,
            clientGroupId: updated.id,
            companyId: updated.companyId,
            details: {
                previousState: {
                    name: previous.name,
                    department: previous.department
                },
                newState: {
                    name: updated.name,
                    department: updated.department
                }
            }
        });
        return res.json({
            success: true,
            message: "Client group updated successfully",
            data: updated,
        });
    }
    catch (err) {
        console.error("Update error:", err);
        return res.status(500).json({
            success: false,
            message: "Update failed",
            error: err,
        });
    }
}
//# sourceMappingURL=updateClientGroups.js.map
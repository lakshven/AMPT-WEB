"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteClientGroup = deleteClientGroup;
const client_1 = __importDefault(require("../../prisma/client"));
const Audit_1 = require("../../models/Audit");
async function deleteClientGroup(req, res) {
    const { id } = req.body;
    const userId = req.user?.id;
    if (!id) {
        return res.status(400).json({
            success: false,
            message: "Client group ID is required",
        });
    }
    try {
        const deleted = await client_1.default.clientGroup.update({
            where: { id },
            data: { isDeleted: true, deletedAt: new Date() },
            select: {
                id: true,
                name: true,
                department: true,
                isDeleted: true,
                accessCode: true,
                createdAt: true,
                companyId: true,
                deletedAt: true,
            },
        });
        // ⭐ AUDIT LOG ENTRY (Improved)
        await (0, Audit_1.logAudit)({
            action: "DELETE_CLIENT_GROUP",
            targetType: "ClientGroup",
            targetId: deleted.id,
            actorUserId: userId,
            clientGroupId: deleted.id,
            companyId: deleted.companyId,
            details: {
                previousState: { isDeleted: false },
                newState: { isDeleted: true, deletedAt: deleted.deletedAt }
            },
            metadata: {
                name: deleted.name,
                department: deleted.department
            }
        });
        res.json({
            success: true,
            message: "Client group deleted successfully",
            data: deleted,
        });
    }
    catch (err) {
        res.status(500).json({
            success: false,
            message: "Delete failed",
            error: err,
        });
    }
}
//# sourceMappingURL=deleteClientGroups.js.map
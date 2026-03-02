"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveUserToAnotherGroup = moveUserToAnotherGroup;
const client_1 = __importDefault(require("../../prisma/client"));
const Audit_1 = require("../../models/Audit");
async function moveUserToAnotherGroup(req, res) {
    try {
        const { userId, newGroupId } = req.body;
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        if (!userId || !newGroupId) {
            return res.status(400).json({
                success: false,
                message: "userId and newGroupId are required",
            });
        }
        const actor = req.user;
        // Fetch user
        const user = await client_1.default.users.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const previousGroupId = user.clientGroupId;
        if (!previousGroupId) {
            return res.status(400).json({
                success: false,
                message: "User is not currently assigned to any client group",
            });
        }
        // Fetch old group
        const oldGroup = await client_1.default.clientGroup.findUnique({
            where: { id: previousGroupId },
        });
        if (!oldGroup) {
            return res.status(404).json({
                success: false,
                message: "Previous client group not found",
            });
        }
        // Fetch new group
        const newGroup = await client_1.default.clientGroup.findUnique({
            where: { id: newGroupId },
        });
        if (!newGroup) {
            return res.status(404).json({
                success: false,
                message: "New client group not found",
            });
        }
        // Company Admin restriction
        if (actor.role === "company_admin") {
            if (actor.companyId !== oldGroup.companyId || actor.companyId !== newGroup.companyId) {
                return res.status(403).json({
                    success: false,
                    message: "You cannot move users between groups outside your company",
                });
            }
        }
        // Update user assignment
        const updatedUser = await client_1.default.users.update({
            where: { id: userId },
            data: { clientGroupId: newGroupId },
        });
        // ⭐ AUDIT LOG
        await (0, Audit_1.logAudit)({
            action: "MOVE_USER_TO_ANOTHER_GROUP",
            targetType: "ClientGroup",
            targetId: newGroupId,
            actorUserId: actor.id,
            clientGroupId: newGroupId,
            companyId: newGroup.companyId,
            details: {
                userId,
                fromGroupId: previousGroupId,
                toGroupId: newGroupId,
            },
            metadata: {
                username: user.username,
                fromGroupName: oldGroup.name,
                toGroupName: newGroup.name,
            },
        });
        return res.json({
            success: true,
            message: "User moved to the new client group successfully",
            data: updatedUser,
        });
    }
    catch (error) {
        console.error("Move user error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to move user to another group",
        });
    }
}
//# sourceMappingURL=moveUserToAnotherGroup.js.map
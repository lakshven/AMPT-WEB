"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUserFromClientGroup = removeUserFromClientGroup;
const client_1 = require("../../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
const Audit_1 = require("../../models/Audit");
async function removeUserFromClientGroup(req, res) {
    try {
        const { userId } = req.body;
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: "userId is required",
            });
        }
        const actor = req.user;
        // Fetch user
        const user = await prismaClient().users.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        if (!user.clientGroupId) {
            return res.status(400).json({
                success: false,
                message: "User is not assigned to any client group",
            });
        }
        const previousGroupId = user.clientGroupId;
        // Fetch group for permission check
        const group = await prismaClient().clientGroup.findUnique({
            where: { id: previousGroupId },
        });
        if (!group) {
            return res.status(404).json({ success: false, message: "Client group not found" });
        }
        // Company Admin restriction
        if (actor.role === "company_admin" && actor.companyId !== group.companyId) {
            return res.status(403).json({
                success: false,
                message: "You cannot remove users from groups outside your company",
            });
        }
        // Remove user from group
        const updatedUser = await prismaClient().users.update({
            where: { id: userId },
            data: { clientGroupId: null },
        });
        // ⭐ AUDIT LOG
        await (0, Audit_1.logAudit)({
            action: "REMOVE_USER_FROM_CLIENT_GROUP",
            targetType: "ClientGroup",
            targetId: previousGroupId,
            actorUserId: actor.id,
            clientGroupId: previousGroupId,
            companyId: group.companyId,
            details: {
                userId,
                previousGroupId,
                newGroupId: null,
            },
            metadata: {
                username: user.username,
                groupName: group.name,
            },
        });
        return res.json({
            success: true,
            message: "User removed from client group successfully",
            data: updatedUser,
        });
    }
    catch (error) {
        console.error("Remove user error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to remove user",
        });
    }
}
//# sourceMappingURL=removeUserFromClientGroup.js.map
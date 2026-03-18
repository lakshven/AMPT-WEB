"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignUserToClientGroup = assignUserToClientGroup;
const client_1 = require("../../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
const Audit_1 = require("../../models/Audit");
async function assignUserToClientGroup(req, res) {
    try {
        const { userId, clientGroupId } = req.body;
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }
        if (!userId || !clientGroupId) {
            return res.status(400).json({
                success: false,
                message: "userId and clientGroupId are required",
            });
        }
        const actor = req.user;
        // Fetch group
        const group = await prismaClient().clientGroup.findUnique({
            where: { id: clientGroupId },
            include: { company: true },
        });
        if (!group) {
            return res.status(404).json({ success: false, message: "Client group not found" });
        }
        // Company Admin restriction
        if (actor.role === "company_admin" && actor.companyId !== group.companyId) {
            return res.status(403).json({
                success: false,
                message: "You cannot assign users to groups outside your company",
            });
        }
        // Fetch user
        const user = await prismaClient().users.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const previousGroupId = user.clientGroupId;
        // Update user assignment
        const updatedUser = await prismaClient().users.update({
            where: { id: userId },
            data: { clientGroupId, companyId: group.companyId },
        });
        // ⭐ AUDIT LOG
        await (0, Audit_1.logAudit)({
            action: "ASSIGN_USER_TO_CLIENT_GROUP",
            targetType: "ClientGroup",
            targetId: clientGroupId,
            companyId: group.companyId,
            actorUserId: actor.id,
            clientGroupId,
            details: {
                userId,
                previousGroupId,
                newGroupId: clientGroupId,
            },
            metadata: {
                username: user.username,
                groupName: group.name,
            },
        });
        return res.json({
            success: true,
            message: "User assigned to client group successfully",
            data: updatedUser,
        });
    }
    catch (error) {
        console.error("Assign user error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to assign user",
        });
    }
}
//# sourceMappingURL=assignUserToClientGroup.js.map
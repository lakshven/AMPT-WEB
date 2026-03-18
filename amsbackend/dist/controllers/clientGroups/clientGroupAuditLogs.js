"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientGroupAuditLogs = void 0;
const client_1 = require("../../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
const getClientGroupAuditLogs = async (req, res) => {
    try {
        const groupId = Number(req.params.groupId);
        // Fetch the group to verify company ownership
        const group = await prismaClient().clientGroup.findUnique({
            where: { id: groupId },
            select: { companyId: true }
        });
        if (!group) {
            return res.status(404).json({ success: false, message: "Group not found" });
        }
        // Company Admin cannot access other companies' groups
        if (req.user?.role === "company_admin" &&
            group.companyId !== req.user?.companyId) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }
        const logs = await prismaClient().audit.findMany({
            where: {
                targetType: "client_group",
                targetId: groupId,
                clientGroupId: groupId
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({ success: true, logs });
    }
    catch (err) {
        console.error("ClientGroup Audit Error:", err);
        res.status(500).json({ success: false, message: "Failed to load logs" });
    }
};
exports.getClientGroupAuditLogs = getClientGroupAuditLogs;
//# sourceMappingURL=clientGroupAuditLogs.js.map
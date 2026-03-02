"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClientGroupAuditLogs = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const getClientGroupAuditLogs = async (req, res) => {
    try {
        const groupId = Number(req.params.groupId);
        // Fetch the group to verify company ownership
        const group = await client_1.default.clientGroup.findUnique({
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
        const logs = await client_1.default.audit.findMany({
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
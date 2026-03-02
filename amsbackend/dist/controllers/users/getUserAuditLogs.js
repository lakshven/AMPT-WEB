"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserAuditLogs = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const getUserAuditLogs = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        // Fetch the user to verify company ownership
        const userRecord = await client_1.default.users.findUnique({
            where: { id: userId },
            select: { companyId: true }
        });
        if (!userRecord) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const actor = req.user;
        const actorRole = actor.role;
        // ⭐ app_admin → full access
        if (actorRole !== "app_admin") {
            // ⭐ Everyone else must belong to the same company
            if (userRecord.companyId !== actor.companyId) {
                return res.status(403).json({ success: false, message: "Access denied" });
            }
        }
        const logs = await client_1.default.audit.findMany({
            where: {
                targetType: "user",
                targetId: userId
            },
            orderBy: { createdAt: "desc" },
        });
        res.json({ success: true, logs });
    }
    catch (err) {
        console.error("User Audit Error:", err);
        res.status(500).json({ success: false, message: "Failed to load logs" });
    }
};
exports.getUserAuditLogs = getUserAuditLogs;
//# sourceMappingURL=getUserAuditLogs.js.map
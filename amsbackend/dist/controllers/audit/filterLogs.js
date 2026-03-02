"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterAuditLogs = filterAuditLogs;
const client_1 = __importDefault(require("../../prisma/client"));
async function filterAuditLogs(req, res) {
    try {
        const { action, user, from, to, entity, entityId } = req.query;
        const where = {};
        // Filter by action
        if (action) {
            where.action = String(action);
        }
        // Filter by performedBy username
        if (user) {
            where.performedBy = String(user);
        }
        // Filter by entity type + ID
        if (entity) {
            where.targetType = String(entity);
        }
        if (entityId) {
            where.targetId = Number(entityId);
        }
        // Date range filter
        if (from || to) {
            where.createdAt = {};
            if (from)
                where.createdAt.gte = new Date(String(from));
            if (to)
                where.createdAt.lte = new Date(String(to));
        }
        const logs = await client_1.default.audit.findMany({
            where,
            orderBy: { createdAt: "desc" }
        });
        return res.json({ logs });
    }
    catch (err) {
        console.error("Filter audit logs error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
//# sourceMappingURL=filterLogs.js.map
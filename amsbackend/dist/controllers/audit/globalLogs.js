"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobalAuditLogs = getGlobalAuditLogs;
exports.getAuditLogsByUser = getAuditLogsByUser;
exports.getAuditLogsByEntity = getAuditLogsByEntity;
const client_1 = __importDefault(require("../../prisma/client"));
/**
 * GET /audit-logs?limit=100
 * Returns global audit logs, ordered by newest first
 */
async function getGlobalAuditLogs(req, res) {
    try {
        const limit = Number(req.query.limit) || 100;
        const logs = await client_1.default.audit.findMany({
            take: limit,
            orderBy: { createdAt: "desc" }
        });
        return res.json({ logs });
    }
    catch (err) {
        console.error("Global audit log error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
/**
 * GET /audit-logs/user/:userId
 * Returns audit logs performed by a specific user
 */
async function getAuditLogsByUser(req, res) {
    try {
        const userId = Number(req.params.userId);
        const logs = await client_1.default.audit.findMany({
            where: { actorUserId: userId },
            orderBy: { createdAt: "desc" }
        });
        return res.json({ logs });
    }
    catch (err) {
        console.error("Audit logs by user error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
/**
 * GET /audit-logs/entity/:entity/:entityId
 * Returns audit logs for a specific entity type and ID
 */
async function getAuditLogsByEntity(req, res) {
    try {
        // FIX: force-cast to string to avoid TS error
        const entity = String(req.params.entity);
        const entityId = Number(req.params.entityId);
        const logs = await client_1.default.audit.findMany({
            where: {
                targetType: entity,
                targetId: Number(entityId)
            },
            orderBy: { createdAt: "desc" }
        });
        return res.json({ logs });
    }
    catch (err) {
        console.error("Audit logs by entity error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
//# sourceMappingURL=globalLogs.js.map
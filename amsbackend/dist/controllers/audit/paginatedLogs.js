"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaginatedAuditLogs = getPaginatedAuditLogs;
const client_1 = __importDefault(require("../../prisma/client"));
async function getPaginatedAuditLogs(req, res) {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            client_1.default.audit.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: "desc" }
            }),
            client_1.default.audit.count()
        ]);
        return res.json({
            logs,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        });
    }
    catch (err) {
        console.error("Paginated audit logs error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
//# sourceMappingURL=paginatedLogs.js.map
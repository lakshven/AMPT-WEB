"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditAnalytics = getAuditAnalytics;
const client_1 = require("../../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
async function getAuditAnalytics(req, res) {
    try {
        const totalLogs = await prismaClient().audit.count();
        const logsLast30Days = await prismaClient().audit.count({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                }
            }
        });
        const topActions = await prismaClient().audit.groupBy({
            by: ["action"],
            _count: { action: true },
            orderBy: { _count: { action: "desc" } },
            take: 5
        });
        const topUsers = await prismaClient().audit.groupBy({
            by: ["performedBy"],
            _count: { performedBy: true },
            orderBy: { _count: { performedBy: "desc" } },
            take: 5
        });
        return res.json({
            totalLogs,
            logsLast30Days,
            topActions,
            topUsers
        });
    }
    catch (err) {
        console.error("Audit analytics error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
//# sourceMappingURL=analytics.js.map
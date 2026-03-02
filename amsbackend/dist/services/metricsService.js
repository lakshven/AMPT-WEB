"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemMetrics = getSystemMetrics;
exports.checkSystemMetricsAndCreateAlerts = checkSystemMetricsAndCreateAlerts;
const client_1 = __importDefault(require("../prisma/client"));
const alertsService_1 = require("./alertsService");
async function getSystemMetrics() {
    const totalUsers = await client_1.default.users.count();
    const active24h = await client_1.default.audit.groupBy({
        by: ["actorUserId"],
        where: {
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
    });
    const active7d = await client_1.default.audit.groupBy({
        by: ["actorUserId"],
        where: {
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
    });
    const active24hCount = active24h.length;
    const active7dCount = active7d.length;
    const dbSizeQuery = await client_1.default.$queryRaw `
    SELECT pg_database_size(current_database()) AS size;
  `;
    const dbSizeBytes = Number(dbSizeQuery[0].size);
    const dbSizeMB = Math.round(dbSizeBytes / (1024 * 1024));
    const maxDbMB = 10240;
    const dbCapacityPercent = Math.round((dbSizeMB / maxDbMB) * 100);
    return {
        totalUsers,
        active24h: active24hCount,
        active7d: active7dCount,
        dbSizeMB,
        dbCapacityPercent,
    };
}
async function checkSystemMetricsAndCreateAlerts() {
    await (0, alertsService_1.deleteExpiredAlerts)();
    const stats = await getSystemMetrics();
    if (stats.dbCapacityPercent > 90) {
        await (0, alertsService_1.createAlertIfNew)(null, {
            type: "db_usage",
            severity: "critical",
            message: `Database usage at ${stats.dbCapacityPercent}%. Immediate action needed.`,
        });
    }
    else if (stats.dbCapacityPercent > 75) {
        await (0, alertsService_1.createAlertIfNew)(null, {
            type: "db_usage",
            severity: "warning",
            message: `Database usage at ${stats.dbCapacityPercent}%. Plan capacity.`,
        });
    }
    return stats;
}
//# sourceMappingURL=metricsService.js.map
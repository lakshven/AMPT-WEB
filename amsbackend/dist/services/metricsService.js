"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSystemMetrics = getSystemMetrics;
exports.checkSystemMetricsAndCreateAlerts = checkSystemMetricsAndCreateAlerts;
const alertsService_1 = require("./alertsService");
async function getSystemMetrics() {
    const { getPrisma } = await Promise.resolve().then(() => __importStar(require("../prisma/client")));
    function prismaClient() { return getPrisma(); }
    const totalUsers = await prismaClient().users.count();
    const active24h = await prismaClient().audit.groupBy({
        by: ["actorUserId"],
        where: {
            createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
    });
    const active7d = await prismaClient().audit.groupBy({
        by: ["actorUserId"],
        where: {
            createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
    });
    const active24hCount = active24h.length;
    const active7dCount = active7d.length;
    const dbSizeQuery = await prismaClient().$queryRaw `
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
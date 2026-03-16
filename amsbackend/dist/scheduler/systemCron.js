"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCronJobs = startCronJobs;
const node_cron_1 = __importDefault(require("node-cron"));
const metricsService_1 = require("../services/metricsService");
const client_1 = __importDefault(require("../prisma/client"));
function startCronJobs() {
    console.log("⏱️ Cron jobs started...");
    //  Every 10 minutes → System metrics + alerts
    node_cron_1.default.schedule("*/10 * * * *", async () => {
        try {
            await (0, metricsService_1.checkSystemMetricsAndCreateAlerts)();
        }
        catch (err) {
            console.error("Cron error:", err);
        }
    });
    // Daily at 3 AM → Cleanup soft-deleted client groups older than 30 days
    node_cron_1.default.schedule("0 3 * * *", async () => {
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const result = await client_1.default.clientGroup.deleteMany({
                where: {
                    isDeleted: true,
                    deletedAt: {
                        lte: thirtyDaysAgo,
                    },
                },
            });
            if (result.count > 0) {
                console.log(`🧹 Cleanup: Removed ${result.count} old deleted client groups`);
            }
        }
        catch (error) {
            console.error("Client group cleanup failed:", error);
        }
    });
}
//# sourceMappingURL=systemCron.js.map
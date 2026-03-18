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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCronJobs = startCronJobs;
const node_cron_1 = __importDefault(require("node-cron"));
function startCronJobs() {
    console.log("⏱️ Cron jobs started...");
    //  Every 10 minutes → System metrics + alerts
    node_cron_1.default.schedule("*/10 * * * *", async () => {
        try {
            const { checkSystemMetricsAndCreateAlerts } = await Promise.resolve().then(() => __importStar(require("../services/metricsService")));
            await checkSystemMetricsAndCreateAlerts();
        }
        catch (err) {
            console.error("Cron error:", err);
        }
    });
    // Daily at 3 AM → Cleanup soft-deleted client groups older than 30 days
    node_cron_1.default.schedule("0 3 * * *", async () => {
        try {
            const { getPrisma } = await Promise.resolve().then(() => __importStar(require("../prisma/client")));
            function prismaClient() { return getPrisma(); }
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const result = await prismaClient().clientGroup.deleteMany({
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
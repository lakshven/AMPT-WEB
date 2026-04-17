import cron from "node-cron";
import { getSystemMetrics, checkSystemMetricsAndCreateAlerts } from "../services/metricsService";
let cronStarted = false;  // ← guard
export function startCronJobs() {
  if (cronStarted) {
    console.warn("⚠️ Cron jobs already running, skipping duplicate start.");
    return;
  }
  cronStarted = true;

  console.log("⏱️ Cron jobs started...");
  // Every 10 minutes → System metrics + alerts
  cron.schedule("*/10 * * * *", async () => {
    try {
      console.log("Cron: loading metricsService...");
      await checkSystemMetricsAndCreateAlerts();   // ⭐ Direct call
      console.log("Cron: metricsService done ✅");
      } catch (err) {
      console.error("Cron error:", err);
    }
  });

  // Daily at 3 AM → Cleanup soft-deleted client groups older than 30 days
  cron.schedule("0 3 * * *", async () => {
    try {
      console.log("Cron: running cleanup job...");

      const { getPrisma } = await import("../prisma/client");
      function prismaClient() {
        return getPrisma();
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const result = await prismaClient().clientGroup.deleteMany({
        where: {
          isDeleted: true,
          deletedAt: { lte: thirtyDaysAgo },
        },
      });

      if (result.count > 0) {
        console.log(`🧹 Cleanup: Removed ${result.count} old deleted client groups`);
      }
    } catch (error) {
      console.error("Client group cleanup failed:", error);
    }
  });
}

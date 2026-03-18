import cron from "node-cron";
export function startCronJobs() {
  console.log("⏱️ Cron jobs started...");
//  Every 10 minutes → System metrics + alerts
cron.schedule("*/10 * * * *", async () => {
  try {
    const {checkSystemMetricsAndCreateAlerts} = await import("../services/metricsService");
    await checkSystemMetricsAndCreateAlerts();
  } catch (err) {
    console.error("Cron error:", err);
  }
});
// Daily at 3 AM → Cleanup soft-deleted client groups older than 30 days
cron.schedule("0 3 * * *", async () => {
  try {
    const {getPrisma} = await import("../prisma/client");
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
  } catch (error) {
    console.error("Client group cleanup failed:", error);
  }
});
}

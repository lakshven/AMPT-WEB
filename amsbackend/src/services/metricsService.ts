import { getPrisma } from "../prisma/client";  // ← static import at top
import { createAlertIfNew as _createAlertIfNew, deleteExpiredAlerts as _deleteExpiredAlerts } from "./alertsService";

type DbSizeResult = {
  size: bigint | number;
};

export async function getSystemMetrics() {
   const prisma = getPrisma();
  // Total users
  const totalUsers = await prisma.users.count();

  // Active users in last 24 hours
  const active24h = await prisma.audit.groupBy({
    by: ["actorUserId"],
    where: {
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    }
  });

  // Active users in last 7 days
  const active7d = await prisma.audit.groupBy({
    by: ["actorUserId"],
    where: {
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }
  });

  const active24hCount = active24h.length;
  const active7dCount = active7d.length;

  // Database size
  const dbSizeQuery = await prisma.$queryRaw<DbSizeResult[]>`
    SELECT pg_database_size(current_database()) AS size;
  `;

  const dbSizeBytes = Number(dbSizeQuery[0].size);
  const dbSizeMB = Math.round(dbSizeBytes / (1024 * 1024));

  // Max DB size (10GB)
  const maxDbMB = 10240;
  const dbCapacityPercent = Math.round((dbSizeMB / maxDbMB) * 100);

  return {
    totalUsers,
    active24h: active24hCount,
    active7d: active7dCount,
    dbSizeMB,
    dbCapacityPercent
  };
}

export async function checkSystemMetricsAndCreateAlerts() {
  await _deleteExpiredAlerts();

  const stats = await getSystemMetrics();

  if (stats.dbCapacityPercent > 90) {
    await _createAlertIfNew(null, {
      type: "db_usage",
      severity: "critical",
      message: `Database usage at ${stats.dbCapacityPercent}%. Immediate action needed.`
    });
  } else if (stats.dbCapacityPercent > 75) {
    await _createAlertIfNew(null, {
      type: "db_usage",
      severity: "warning",
      message: `Database usage at ${stats.dbCapacityPercent}%. Plan capacity.`
    });
  }

  return stats;
}


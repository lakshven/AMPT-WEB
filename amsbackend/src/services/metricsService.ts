import prisma from "../prisma/client";
import { createAlertIfNew, deleteExpiredAlerts } from "./alertsService";

type DbSizeResult = {
  size: bigint | number;
};

export async function getSystemMetrics() {
  const totalUsers = await prisma.users.count();

  const active24h = await prisma.audit.groupBy({
    by: ["actorUserId"],
    where: {
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });

  const active7d = await prisma.audit.groupBy({
    by: ["actorUserId"],
    where: {
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
  });

  const active24hCount = active24h.length;
  const active7dCount = active7d.length;

  const dbSizeQuery = await prisma.$queryRaw<DbSizeResult[]>`
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
export async function checkSystemMetricsAndCreateAlerts() {
  await deleteExpiredAlerts(); 
  const stats = await getSystemMetrics();

  if (stats.dbCapacityPercent > 90) {
    await createAlertIfNew(null,{
      type: "db_usage",
      severity: "critical",
      message: `Database usage at ${stats.dbCapacityPercent}%. Immediate action needed.`,
    });
  } else if (stats.dbCapacityPercent > 75) {
    await createAlertIfNew(null, {
      type: "db_usage",
      severity: "warning",
      message: `Database usage at ${stats.dbCapacityPercent}%. Plan capacity.`,
    });
  }

  return stats;
}
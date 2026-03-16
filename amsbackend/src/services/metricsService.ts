import { getPrisma } from "../../prisma/client";
const prisma = getPrisma();
// Define the shape of an alert creation request
export interface CreateAlertInput {
  type: string;
  message: string;
  severity: "info" | "warning" | "critical";
}

export async function createAlertIfNew(companyId: number | null, { type, message, severity }: CreateAlertInput) {
  const recent = await prisma.systemAlert.findFirst({
    where: {
      type,
      severity,
      companyId,
      createdAt: {
        gte: new Date(Date.now() - 30 * 60 * 1000), // last 30 min
      },
    },
  });

  if (recent) return;

  await prisma.systemAlert.create({
    data: { type, message, severity, companyId },
  });
}

// Type for alerts returned from Prisma
export type SystemAlert = Awaited<ReturnType<typeof getAlerts>>[number];

export async function getAlerts() {
  return prisma.systemAlert.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function markAlertsRead(ids: number[]) {
  return prisma.systemAlert.updateMany({
    where: { id: { in: ids } },
    data: { isRead: true },
  });
}

export async function deleteExpiredAlerts() {
  await prisma.systemAlert.deleteMany({
    where: {
      createdAt: {
        lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    }
  });
}
import { createAlertIfNew as _createAlertIfNew, deleteExpiredAlerts as _deleteExpiredAlerts } from "./alertsService";

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
  await _deleteExpiredAlerts(); 
  const stats = await getSystemMetrics();

  if (stats.dbCapacityPercent > 90) {
    await _createAlertIfNew(null,{
      type: "db_usage",
      severity: "critical",
      message: `Database usage at ${stats.dbCapacityPercent}%. Immediate action needed.`,
    });
  } else if (stats.dbCapacityPercent > 75) {
    await _createAlertIfNew(null, {
      type: "db_usage",
      severity: "warning",
      message: `Database usage at ${stats.dbCapacityPercent}%. Plan capacity.`,
    });
  }

  return stats;
}

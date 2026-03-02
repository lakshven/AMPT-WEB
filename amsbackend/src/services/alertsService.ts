import prisma from "../prisma/client";

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
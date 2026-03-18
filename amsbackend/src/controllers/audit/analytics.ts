// controllers/audit/analytics.ts
import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }

export async function getAuditAnalytics(req: Request, res: Response) {
  try {
    const totalLogs = await prismaClient().audit.count();

    const logsLast30Days = await prismaClient().audit.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const topActions = await prismaClient().audit.groupBy({
      by: ["action"],
      _count: { action: true },
      orderBy: { _count: { action: "desc" } },
      take: 5
    });

    const topUsers = await prismaClient().audit.groupBy({
      by: ["performedBy"],
      _count: { performedBy: true },
      orderBy: { _count: { performedBy: "desc" } },
      take: 5
    });

    return res.json({
      totalLogs,
      logsLast30Days,
      topActions,
      topUsers
    });
  } catch (err) {
    console.error("Audit analytics error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
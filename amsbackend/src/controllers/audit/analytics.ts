// controllers/audit/analytics.ts
import { Request, Response } from "express";
import prisma from "../../prisma/client";

export async function getAuditAnalytics(req: Request, res: Response) {
  try {
    const totalLogs = await prisma.audit.count();

    const logsLast30Days = await prisma.audit.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const topActions = await prisma.audit.groupBy({
      by: ["action"],
      _count: { action: true },
      orderBy: { _count: { action: "desc" } },
      take: 5
    });

    const topUsers = await prisma.audit.groupBy({
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
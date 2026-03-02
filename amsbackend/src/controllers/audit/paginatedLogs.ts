// controllers/audit/paginatedLogs.ts
import { Request, Response } from "express";
import prisma from "../../prisma/client";

export async function getPaginatedAuditLogs(req: Request, res: Response) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      prisma.audit.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.audit.count()
    ]);

    return res.json({
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error("Paginated audit logs error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
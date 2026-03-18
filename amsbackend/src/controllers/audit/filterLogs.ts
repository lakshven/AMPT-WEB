// controllers/audit/filterLogs.ts
import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }

export async function filterAuditLogs(req: Request, res: Response) {
  try {
    const { action, user, from, to, entity, entityId } = req.query;

    const where: any = {};

    // Filter by action
    if (action) {
      where.action = String(action);
    }

    // Filter by performedBy username
    if (user) {
      where.performedBy = String(user);
    }

    // Filter by entity type + ID
    if (entity) {
      where.targetType = String(entity);
    }

    if (entityId) {
      where.targetId = Number(entityId);
    }

    // Date range filter
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(String(from));
      if (to) where.createdAt.lte = new Date(String(to));
    }

    const logs = await prismaClient().audit.findMany({
      where,
      orderBy: { createdAt: "desc" }
    });

    return res.json({ logs });
  } catch (err) {
    console.error("Filter audit logs error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
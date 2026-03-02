// controllers/audit/globalLogs.ts
import { Request, Response } from "express";
import prisma from "../../prisma/client";

/**
 * GET /audit-logs?limit=100
 * Returns global audit logs, ordered by newest first
 */
export async function getGlobalAuditLogs(req: Request, res: Response) {
  try {
    const limit = Number(req.query.limit) || 100;

    const logs = await prisma.audit.findMany({
      take: limit,
      orderBy: { createdAt: "desc" }
    });

    return res.json({ logs });
  } catch (err) {
    console.error("Global audit log error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * GET /audit-logs/user/:userId
 * Returns audit logs performed by a specific user
 */
export async function getAuditLogsByUser(req: Request, res: Response) {
  try {
    const userId = Number(req.params.userId);

    const logs = await prisma.audit.findMany({
      where: { actorUserId: userId },
      orderBy: { createdAt: "desc" }
    });

    return res.json({ logs });
  } catch (err) {
    console.error("Audit logs by user error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}

/**
 * GET /audit-logs/entity/:entity/:entityId
 * Returns audit logs for a specific entity type and ID
 */
export async function getAuditLogsByEntity(req: Request, res: Response) {
  try {
    // FIX: force-cast to string to avoid TS error
    const entity = String(req.params.entity);
    const entityId = Number(req.params.entityId);

    const logs = await prisma.audit.findMany({
      where: {
        targetType: entity,
        targetId: Number(entityId)
      },
      orderBy: { createdAt: "desc" }
    });

    return res.json({ logs });
  } catch (err) {
    console.error("Audit logs by entity error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
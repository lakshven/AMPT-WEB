// models/Audit.ts
import { recordUserActivity } from "./UserActivity";
import { getPrisma } from "../prisma/client";
function prismaClient() { return getPrisma(); }

export async function logAudit({
  action,
  targetType,
  targetId,
  performedBy = "system",
  actorUserId = null,
  clientGroupId,
  companyId,
  details = null,
  metadata = {}
}: {
  action: string;
  targetType: string;
  targetId?: string | number | null;
  performedBy?: string;
  actorUserId?: number | null;
  clientGroupId: number | null;
  companyId: number | null;
  details?: any;
  metadata?: Record<string, any>;
}) {
  // Convert targetId to number because Prisma schema requires Int?
  const numericTargetId =
    targetId !== undefined && targetId !== null
      ? Number(targetId)
      : null;

  const audit = await prismaClient().audit.create({
    data: {
      action,
      targetType,
      targetId: numericTargetId,
      performedBy: performedBy || String(actorUserId) || "system",
      actorUserId,
      clientGroupId,
      companyId,
      details,
      metadata
    }
  });

  // Analytics tracking
  if (actorUserId && companyId) {
    await recordUserActivity({
      userId: actorUserId,
      companyId,
      category: action
    });
  }

  return audit;
}

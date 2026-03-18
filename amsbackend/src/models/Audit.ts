// models/Audit.ts
import { recordUserActivity } from "./UserActivity"; // Analytics tracking

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
  targetId?: number | null;
  performedBy?: string;
  actorUserId?: number | null;
  clientGroupId: number | null;
  companyId: number | null;
  details?: any;
  metadata?: Record<string, any>;
}) {
  // 1. Create the audit log
  const { getPrisma } = await import("../prisma/client");
  const prisma = getPrisma(); 
  const audit = await prisma.audit.create({
    data: {
      action,
      targetType,
      targetId,
      performedBy: performedBy || String(actorUserId) || "system",
      actorUserId,
      clientGroupId,
      companyId,
      details,
      metadata
    }
  });

  // 2. Record analytics (only when user + company exist)
  if (actorUserId && companyId) {
    await recordUserActivity({
      userId: actorUserId,
      companyId,
      category: action
    });
  }

  return audit;
}

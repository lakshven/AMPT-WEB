// controllers/audit/logAudit.ts
import prisma from "../../prisma/client";
import { Prisma } from "@prisma/client";

interface LogAuditInput {
  action: string;
  targetType: string;
  targetId?: number | null;
  performedBy: string;
  clientGroupId?: number | null;
  metadata?: Prisma.InputJsonValue | null;
  details?: Prisma.InputJsonValue | null;
  actorUserId?: number | null;
}

export async function logAudit({
  action,
  targetType,
  targetId = null,
  performedBy,
  clientGroupId = null,
  metadata = null,
  details = null,
  actorUserId = null
}: LogAuditInput) {
  return prisma.audit.create({
    data: {
      action,
      targetType,
      targetId,
      performedBy,
      clientGroupId,
      details: details === null ? Prisma.JsonNull : details,
      // Prisma requires JsonNull instead of plain null
      metadata: metadata === null ? Prisma.JsonNull : metadata,
      actorUserId
    }
  });
}
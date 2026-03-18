import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }
import { logAudit } from "../../models/Audit";
export async function restoreClientGroup(req: Request, res: Response) {
  const { id } = req.body;
  const userId = req.user?.id;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Client group ID is required",
    });
  }

  try {
    const restored = await prismaClient().clientGroup.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null },
      select: {
        id: true,
        name: true,
        department: true,
        isDeleted: true,
        deletedAt: true,
        accessCode: true,
        createdAt: true,
        companyId: true,
      },
    });

    // ⭐ IMPROVED AUDIT LOG ENTRY
    await logAudit({
  action: "RESTORE_CLIENT_GROUP",
  targetType: "ClientGroup",
  targetId: restored.id,
  actorUserId: userId,
  clientGroupId: restored.id,
  companyId: restored.companyId,
  details: {
    previousState: { isDeleted: true },
    newState: { isDeleted: false }
  },
  metadata: {
    name: restored.name,
    department: restored.department
  }
});

    res.json({
      success: true,
      message: "Client group restored successfully",
      data: restored,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Restore failed",
      error: err,
    });
  }
}
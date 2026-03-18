import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }
import { logAudit } from "../../models/Audit";
export async function deleteClientGroup(req: Request, res: Response) {
  const { id } = req.body;
  const userId = req.user?.id;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Client group ID is required",
    });
  }

  try {
    const deleted = await prismaClient().clientGroup.update({
      where: { id },
      data: { isDeleted: true, deletedAt: new Date() },
      select: {
        id: true,
        name: true,
        department: true,
        isDeleted: true,
        accessCode: true,
        createdAt: true,
        companyId: true,
        deletedAt: true,
      },
    });

    // ⭐ AUDIT LOG ENTRY (Improved)
    await logAudit({
  action: "DELETE_CLIENT_GROUP",
  targetType: "ClientGroup",
  targetId: deleted.id,
  actorUserId: userId,
  clientGroupId: deleted.id,
  companyId: deleted.companyId,
  details: {
    previousState: { isDeleted: false },
    newState: { isDeleted: true, deletedAt: deleted.deletedAt }
  },
  metadata: {
    name: deleted.name,
    department: deleted.department
  }
});

    res.json({
      success: true,
      message: "Client group deleted successfully",
      data: deleted,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Delete failed",
      error: err,
    });
  }
}
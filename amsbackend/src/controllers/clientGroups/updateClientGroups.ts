import { Request, Response } from "express";
import prisma from "../../prisma/client";
import { logAudit } from "../../models/Audit";
export async function updateClientGroup(req: Request, res: Response) {
  const { id, name, department } = req.body;
  const userId = req.user?.id;

  if (!id) {
    return res.status(400).json({
      success: false,
      message: "Client group ID is required",
    });
  }

  try {
    // ⭐ Fetch previous state for audit logging
    const previous = await prisma.clientGroup.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        department: true,
        isDeleted: true,
        accessCode: true,
        createdAt: true,
        companyId: true,
      },
    });

    if (!previous) {
      return res.status(404).json({
        success: false,
        message: "Client group not found",
      });
    }

    const updated = await prisma.clientGroup.update({
      where: { id },
      data: {
        name,
        department: department || null,
      },
      select: {
        id: true,
        name: true,
        department: true,
        isDeleted: true,
        accessCode: true,
        createdAt: true,
        companyId: true,
      },
    });

    // ⭐ AUDIT LOG ENTRY (Improved)
    await logAudit({
  action: "UPDATE_CLIENT_GROUP",
  targetType: "ClientGroup",
  targetId: updated.id,
  actorUserId: userId,
  clientGroupId: updated.id,
  companyId: updated.companyId,
  details: {
    previousState: {
      name: previous.name,
      department: previous.department
    },
    newState: {
      name: updated.name,
      department: updated.department
    }
  }
});

    return res.json({
      success: true,
      message: "Client group updated successfully",
      data: updated,
    });

  } catch (err) {
    console.error("Update error:", err);

    return res.status(500).json({
      success: false,
      message: "Update failed",
      error: err,
    });
  }
}
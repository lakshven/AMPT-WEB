// src/controllers/clientGroups/generateInviteToken.ts
import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }
import crypto from "crypto";
import { logAudit } from "../../models/Audit";

export async function generateInviteToken(req: Request, res: Response) {
  try {
    if (!req.user || !["company_admin", "app_admin"].includes(String(req.user.role))) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: admin access required",
      });
    }

    const { groupId, role, email } = req.body;

    if (!groupId || !role) {
      return res.status(400).json({
        success: false,
        message: "groupId and role are required",
      });
    }

    // Validate group exists
    const group = await prismaClient().clientGroup.findUnique({
      where: { id: Number(groupId) },
    });

    if (!group || !group.companyId) {
      return res.status(404).json({
        success: false,
        message: "Client group not found or not linked to a company",
      });
    }

    // Generate secure token
    const token = crypto.randomBytes(20).toString("hex");

    // Token expires in 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Save token
    const invite = await prismaClient().inviteToken.create({
      data: {
        token,
        role,
        email: email || null,
        groupId: group.id,
        // companyId: group.companyId,
        expiresAt,
      },
    });

    const inviteLink = `${process.env.FRONTEND_URL}/invite?token=${invite.token}`;

    // Audit log
    await logAudit({
      action: "GENERATE_INVITE_TOKEN",
      targetType: "ClientGroupInvite",
      targetId: invite.id,
      actorUserId: req.user?.id || null,
      clientGroupId: group.id,
      companyId: group.companyId,
      details: { role, email, inviteLink },
    });

    return res.json({
      success: true,
      message: "Invite token generated",
      inviteLink,
    });
  } catch (error) {
    console.error("Error generating invite token:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

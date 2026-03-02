// src/controllers/clientGroups/verifyInviteToken.ts

import { Request, Response } from "express";
import prisma from "../../prisma/client";

export async function verifyInviteToken(req: Request, res: Response) {
  try {
    const token = String(req.query.token || "");

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    const invite = await prisma.inviteToken.findUnique({
      where: { token },
      include: {
        clientGroup: true,
      },
    });

    if (!invite) {
      return res.status(404).json({
        success: false,
        message: "Invalid invite token",
      });
    }

    if (invite.used) {
      return res.status(400).json({
        success: false,
        message: "This invite link has already been used",
      });
    }

    if (invite.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "This invite link has expired",
      });
    }

    return res.json({
      success: true,
      group: {
        id: invite.clientGroup.id,
        name: invite.clientGroup.name,
        companyId: invite.clientGroup.companyId
      },
      role: invite.role,
      email: invite.email,
    });
  } catch (error) {
    console.error("Error verifying invite token:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
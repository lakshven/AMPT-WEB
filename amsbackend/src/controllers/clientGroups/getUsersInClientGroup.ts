import { Request, Response } from "express";
import prisma from "../../prisma/client";

export async function getUsersInClientGroup(req: Request, res: Response) {
  try {
    const { clientGroupId } = req.params;

    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!clientGroupId) {
      return res.status(400).json({
        success: false,
        message: "clientGroupId is required",
      });
    }

    const actor = req.user;

    // Fetch group
    const group = await prisma.clientGroup.findUnique({
      where: { id: Number(clientGroupId) },
    });

    if (!group) {
      return res.status(404).json({ success: false, message: "Client group not found" });
    }

    // Company Admin restriction
    if (actor.role === "company_admin" && actor.companyId !== group.companyId) {
      return res.status(403).json({
        success: false,
        message: "You cannot view users of groups outside your company",
      });
    }

    // Fetch users in this group
    const users = await prisma.users.findMany({
      where: { clientGroupId: Number(clientGroupId) },
      select: {
        id: true,
        firstname: true,
        lastname: true,
        username: true,
        email: true,
        role: true,
        disabled: true,
      },
      orderBy: { firstname: "asc" },
    });

    return res.json({
      success: true,
      users,
    });

  } catch (error) {
    console.error("Get users in group error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
}
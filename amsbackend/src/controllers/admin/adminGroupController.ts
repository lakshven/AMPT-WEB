import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }

export const addUserToGroup = async (req: Request, res: Response) => {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = Number(req.params.userId);
    const { groupName } = req.body;
    if (!groupName || !Number.isInteger(userId) || userId <= 0) {
      res.status(400).json({ message: "Invalid input" });
      return;
    }

    // 🔒 Load target user for tenant checks
    const targetUser = await prismaClient().users.findUnique({
      where: { id: userId },
      select: { id: true, companyId: true },
    });

    if (!targetUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // 🔒 Only app_admin or company admin in same company can add to groups
    if (currentUser.role !== "app_admin") {
      if (currentUser.accountType !== "company") {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      if (targetUser.companyId !== currentUser.companyId) {
        res.status(403).json({ message: "Cross-tenant access denied" });
        return;
      }
    }


    const group = await prismaClient().group.findFirst({
      where: {
          name: groupName, 
          companyId: currentUser.role === "app_admin" ? undefined : currentUser.companyId
       },
      select: { id: true }
    });

    if (!group) {
      res.status(400).json({ message: "Group not found" });
      return;
    }

    await prismaClient().userGroup.upsert({
      where: {
        userId_groupId: {
          userId,
          groupId: group.id
        }
      },
      update: {},
      create: {
        userId,
        groupId: group.id
      }
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to add user to group" });
  }
};

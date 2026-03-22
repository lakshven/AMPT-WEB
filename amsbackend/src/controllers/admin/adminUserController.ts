import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }

export const assignRoleToUser = async (req: Request, res: Response) => {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const userId = Number(req.params.userId);
    const { roleName } = req.body;
    if (!roleName || !Number.isInteger(userId) || userId <= 0) {
      res.status(400).json({ message: "Invalid input" });
      return;
    }

    // 🔒 Load target user for tenant checks
    const targetUser = await prismaClient().users.findUnique({
      where: { id: userId },
      select: { id: true, companyId: true, role: true },
    });

    if (!targetUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // 🔒 Only app_admin or company admin in same company can change roles
    if (currentUser.role !== "app_admin") {
      if (currentUser.accountType !== "company") {
        res.status(403).json({ message: "Access denied" });
        return;
      }

      if (targetUser.companyId !== currentUser.companyId) {
        res.status(403).json({ message: "Cross-tenant access denied" });
        return;
      }

      // Optional: prevent changing app_admin or higher roles
      if (targetUser.role === "app_admin") {
        res.status(403).json({ message: "Cannot modify app admin" });
        return;
      }
    }

    const role = await prismaClient().role.findUnique({
      where: { name: roleName },
      select: { id: true }
    });

    if (!role) {
      res.status(400).json({ message: "Role not found" });
      return;
    }

    await prismaClient().users.update({
      where: { id: userId },
      data: { role_id: role.id }
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to assign role" });
  }
};

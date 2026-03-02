import { Request, Response } from "express";
import prisma from "../../prisma/client";

export const assignRoleToUser = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);
    const { roleName } = req.body;

    const role = await prisma.role.findUnique({
      where: { name: roleName },
      select: { id: true }
    });

    if (!role) {
      res.status(400).json({ message: "Role not found" });
      return;
    }

    await prisma.users.update({
      where: { id: userId },
      data: { role_id: role.id }
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to assign role" });
  }
};
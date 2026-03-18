import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }

export const getUserAuditLogs = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.params.userId);

    // Fetch the user to verify company ownership
    const userRecord = await prismaClient().users.findUnique({
      where: { id: userId },
      select: { companyId: true }
    });

    if (!userRecord) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const actor = req.user!;
    const actorRole = actor.role;

    // ⭐ app_admin → full access
    if (actorRole !== "app_admin") {
      // ⭐ Everyone else must belong to the same company
      if (userRecord.companyId !== actor.companyId) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
    }

    const logs = await prismaClient().audit.findMany({
      where: {
        targetType: "user",
        targetId: userId
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, logs });
  } catch (err) {
    console.error("User Audit Error:", err);
    res.status(500).json({ success: false, message: "Failed to load logs" });
  }
};
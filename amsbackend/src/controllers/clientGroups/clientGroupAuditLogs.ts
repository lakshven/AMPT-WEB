import { Request, Response } from "express";
import prisma from "../../prisma/client";

export const getClientGroupAuditLogs = async (req: Request, res: Response) => {
  try {
    const groupId = Number(req.params.groupId);

    // Fetch the group to verify company ownership
    const group = await prisma.clientGroup.findUnique({
      where: { id: groupId },
      select: { companyId: true }
    });

    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    // Company Admin cannot access other companies' groups
    if (
      req.user?.role === "company_admin" &&
      group.companyId !== req.user?.companyId
    ) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const logs = await prisma.audit.findMany({
      where: {
        targetType: "client_group",
        targetId: groupId,
        clientGroupId: groupId
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, logs });
  } catch (err) {
    console.error("ClientGroup Audit Error:", err);
    res.status(500).json({ success: false, message: "Failed to load logs" });
  }
};
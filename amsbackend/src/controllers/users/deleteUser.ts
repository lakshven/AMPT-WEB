import { Request, Response } from "express";
import prisma from "../../prisma/client";
import { logAudit } from "../../models/Audit";

export async function deleteUser(req: Request, res: Response): Promise<void> {
  const admin = req.user!;
  const adminRole = String(admin.role).toLowerCase();

  // Only app_admin or company_admin can delete users
  if (!["app_admin", "company_admin"].includes(adminRole)) {
    res.status(403).json({ success: false, message: "Forbidden: admin access required" });
    return;
  }

  const userId = Number(req.params.id);

  try {
    const targetUser = await prisma.users.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // ⭐ Company Admin can only delete users inside their own company
    if (adminRole === "company_admin" && targetUser.companyId !== admin.companyId) {
      res.status(403).json({
        success: false,
        message: "Forbidden: cannot delete users outside your company"
      });
      return;
    }

    // Prevent deleting yourself
    if (targetUser.id === admin.id) {
      res.status(400).json({ success: false, message: "You cannot delete your own account" });
      return;
    }

    // ⭐ Soft delete
    const deletedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        disabled: true,
        disabledAt: new Date()
      }
    });

    // Audit log
    await logAudit({
      action: "delete_user",
      targetType: "user",
      targetId: userId,
      performedBy: admin.username,
      actorUserId: admin.id,
      clientGroupId: admin.clientGroupId,
      companyId: admin.companyId,
      details: {
        deletedUserId: targetUser.id,
        deletedUsername: targetUser.username,
        deletedEmail: targetUser.email,
        deletedRole: targetUser.role
      },
      metadata: {
        deletedRole: targetUser.role,
        deletedEmail: targetUser.email,
        role: admin.role,
        accountType: admin.accountType
      }
    });

    res.json({
      success: true,
      message: "User deleted successfully",
      user: deletedUser
    });

  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ success: false, message: "Server error during user deletion" });
  }
}
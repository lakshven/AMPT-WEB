import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }
import { logAudit } from "../../models/Audit";

export async function updateUser(req: Request, res: Response): Promise<void> {
  const admin = req.user!;
  const adminRole = String(admin.role).toLowerCase();

  // Only app_admin or company_admin can update users
  if (!["app_admin", "company_admin"].includes(adminRole)) {
    res.status(403).json({ success: false, message: "Forbidden: admin access required" });
    return;
  }

  const userId = Number(req.params.id);
  const { firstname, lastname, username, email, role: newRole, clientGroupId } = req.body;

  try {
    const existingUser = await prismaClient().users.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    // ⭐ Company Admin cannot update users from another company
    if (adminRole === "company_admin" && existingUser.companyId !== admin.companyId) {
      res.status(403).json({
        success: false,
        message: "Forbidden: cannot update users outside your company"
      });
      return;
    }

    // Validate role change
    let finalRoleName = existingUser.role;
    let finalRoleId = existingUser.role_id;

    if (newRole) {
      const roleRow = await prismaClient().role.findUnique({ where: { name: newRole } });
      if (!roleRow) {
        res.status(400).json({ success: false, message: "Role not found" });
        return;
      }

      finalRoleName = roleRow.name;
      finalRoleId = roleRow.id;
    }

    // Validate clientGroup change
    let finalClientGroupId = existingUser.clientGroupId;
    let finalCompanyId = existingUser.companyId;

    if (clientGroupId !== undefined) {
      const group = await prismaClient().clientGroup.findUnique({
        where: { id: Number(clientGroupId) }
      });

      if (!group) {
        res.status(400).json({ success: false, message: "Target client group not found" });
        return;
      }

      // ⭐ Company Admin cannot move users to another company
      if (adminRole === "company_admin" && group.companyId !== admin.companyId) {
        res.status(403).json({
          success: false,
          message: "Forbidden: cannot move users to groups outside your company"
        });
        return;
      }

      finalClientGroupId = group.id;
      finalCompanyId = group.companyId; // ⭐ CRITICAL FIX
    }

    // Update user
    const updatedUser = await prismaClient().users.update({
      where: { id: userId },
      data: {
        firstname: firstname ?? existingUser.firstname,
        lastname: lastname ?? existingUser.lastname,
        username: username ?? existingUser.username,
        email: email ?? existingUser.email,
        role: finalRoleName,
        role_id: finalRoleId,
        clientGroupId: finalClientGroupId,
        companyId: finalCompanyId // ⭐ CRITICAL FIX
      }
    });

    // Audit log
    await logAudit({
      action: "update_user",
      targetType: "user",
      targetId: updatedUser.id,
      performedBy: admin.username,
      actorUserId: admin.id,
      clientGroupId: finalClientGroupId,
      companyId: finalCompanyId,
      details: {
        oldValues: {
          firstname: existingUser.firstname,
          lastname: existingUser.lastname,
          username: existingUser.username,
          email: existingUser.email,
          role: existingUser.role,
          clientGroupId: existingUser.clientGroupId,
          companyId: existingUser.companyId
        },
        newValues: {
          firstname,
          lastname,
          username,
          email,
          role: newRole,
          clientGroupId,
          companyId: finalCompanyId
        }
      },
      metadata: {
        updatedFields: Object.keys(req.body),
        role: admin.role,
        accountType: admin.accountType
      }
    });

    res.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser
    });

  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ success: false, message: "Server error during user update" });
  }
}
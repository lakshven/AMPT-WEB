import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }

export async function upgradeToCompany(req: Request, res: Response) {
  try {
    const userId = Number(req.params.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: req.user missing"
      });
    }
    // 1. Fetch target user
    const targetUser = await prismaClient().users.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // 2. Permission check — company_admin cannot upgrade users from another company
    if (
      req.user.role === "company_admin" &&
      targetUser.companyId !== req.user.companyId
    ) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: cannot upgrade user from another company"
      });
    }

    // 3. Prevent upgrading an already company_admin
    if (targetUser.role === "company_admin") {
      return res.status(400).json({
        success: false,
        message: "User is already a company_admin"
      });
    }
    // 4. Fetch company_admin role
    const companyAdminRole = await prismaClient().role.findUnique({
      where: { name: "company_admin" }
    });

    if (!companyAdminRole) {
      return res.status(400).json({
        success: false,
        message: "company_admin role not found in database"
      });
    }

    // 2. Fetch company accountType
    const companyAccountType = await prismaClient().accountTypeOption.findUnique({
      where: { value: "company" }
    });

    if (!companyAccountType) {
      return res.status(400).json({
        success: false,
        message: "company accountType not found"
      });
    }

    // 3. Create a default group for the new company
    const newGroup = await prismaClient().clientGroup.create({
      data: {
        name: "Default Group",
        accessCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
        companyId: targetUser.companyId
      }
    });

    // 4. Update user role + accountType + group
    const updatedUser = await prismaClient().users.update({
      where: { id: userId },
      data: {
        role: "company_admin",
        role_id: companyAdminRole.id,
        accountTypeId: companyAccountType.id,
        clientGroupId: newGroup.id
      }
    });

    return res.json({
      success: true,
      message: "User successfully upgraded to company_admin",
      user: updatedUser
    });

  } catch (err) {
    console.error("Upgrade error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during upgrade"
    });
  }
}

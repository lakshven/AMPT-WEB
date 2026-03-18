import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }
import sendMail from "../../utils/sendEmail";
import { logAudit } from "../../models/Audit";

/**
 * GET /api/client-groups
 * Company Admin → only their company
 * App Admin → all companies
 */
export async function getClientGroups(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const isAppAdmin = req.user.role === "app_admin";
   // ⭐ Filtering
    const filter = String(req.query.filter || "active");

    let whereClause: any = {
      ...(isAppAdmin ? {} : { companyId: req.user.companyId }),
    };

    if (filter === "active") whereClause.isDeleted = false;
    if (filter === "deleted") whereClause.isDeleted = true;
    // ⭐ Sorting
    const allowedSortFields = ["name", "createdAt", "department"];
    const sort = allowedSortFields.includes(String(req.query.sort))
      ? String(req.query.sort)
      : "name";

    const order = String(req.query.order || "asc");

    // ⭐ Pagination
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 10);
    const skip = (page - 1) * limit;

    const clientGroups = await prismaClient().clientGroup.findMany({
      where: whereClause,
      orderBy: { [sort]: order },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        department: true,
        createdAt: true,
        accessCode: true,
        isDeleted: true,
        deletedAt: true,
        companyId: true,
      },
    });

    const total = await prismaClient().clientGroup.count({ where: whereClause });

    // ⭐ Ensure access code exists
    for (const g of clientGroups) {
      if (!g.accessCode) {
        const newCode = Math.random().toString(36).substring(2, 10).toUpperCase();

        await prismaClient().clientGroup.update({
          where: { id: g.id },
          data: { accessCode: newCode },
        });

        g.accessCode = newCode;

        // ⭐ AUDIT LOG
        await logAudit({
          action: "AUTO_GENERATE_ACCESS_CODE",
          targetType: "ClientGroup",
          targetId: g.id,
          actorUserId: req.user?.id || null,
          clientGroupId: g.id,
          companyId: g.companyId,
          details: { newAccessCode: newCode },
        });
      }
    }

    return res.json({
      success: true,
      groups: clientGroups,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching client groups:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/client-groups
 */
export async function createClientGroup(req: Request, res: Response) {
  try {
     if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const isAppAdmin = req.user.role === "app_admin";
    const isCompanyAdmin = req.user.role === "company_admin";
    const isSingleUser = req.user.role === "single_user";
    // Allow: app_admin, company_admin, single_user
    if (!isAppAdmin && !isCompanyAdmin && !isSingleUser) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: admin access required",
      });
    }

    // If single_user → create a company for them and upgrade role
    if (isSingleUser && !req.user.companyId) {
      const newCompany = await prismaClient().company.create({
        data: {
          name: `${req.user.username}'s Company`,
        },
      });
       // Load company_admin role dynamically
      const companyAdminRole = await prismaClient().role.findUnique({
        where: { name: "company_admin" },
      });

      if (!companyAdminRole) {
        return res.status(500).json({
          success: false,
          message: "Role 'company_admin' not found in roles table",
        });
      }

      await prismaClient().users.update({
        where: { id: req.user.id },
        data: {
          companyId: newCompany.id,
          role: "company_admin",
          role_id: companyAdminRole.id,
        },
      });

      req.user.companyId = newCompany.id;
      req.user.role = "company_admin";
      req.user.roleId = companyAdminRole.id;
    }

    let { name, accessCode, department, companyId } = req.body;

    if (!name?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Client group name is required",
      });
    }

    if (!accessCode?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Access code is required",
      });
    }

    if (!isAppAdmin) {
      companyId = req.user.companyId ?? undefined;
    }

    if (!isAppAdmin && !companyId) {
      return res.status(400).json({
        success: false,
        message: "companyId is required",
      });
    }

    const existingByName = await prismaClient().clientGroup.findFirst({
      where: { name, companyId },
    });

    if (existingByName) {
      return res.status(400).json({
        success: false,
        message: "A client group with this name already exists in this company",
      });
    }

    const existingByCode = await prismaClient().clientGroup.findFirst({
      where: { accessCode, companyId },
    });

    if (existingByCode) {
      return res.status(400).json({
        success: false,
        message: "This access code is already in use in this company",
      });
    }

    const group = await prismaClient().clientGroup.create({
      data: {
        name: name.trim(),
        accessCode: accessCode.trim(),
        department: department || null,
        companyId,
      },
    });
    // ⭐ PERMANENT FIX: auto-assign user to their first client group
    if (!req.user.clientGroupId) {
      await prismaClient().users.update({
        where: { id: req.user.id },
        data: { clientGroupId: group.id },
      });

      req.user.clientGroupId = group.id;
    }


    // ⭐ AUDIT LOG
    await logAudit({
      action: "CREATE_CLIENT_GROUP",
      targetType: "ClientGroup",
      targetId: group.id,
      actorUserId: req.user?.id || null,
      clientGroupId: group.id,
      companyId: group.companyId,
      details: {
        name: group.name,
        department: group.department,
        companyId: group.companyId,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Client group created successfully",
      group: {
        id: group.id,
        name: group.name,
        accessCode: group.accessCode,
        department: group.department,
        createdAt: group.createdAt,
        companyId: group.companyId,
      },
    });
  } catch (error) {
    console.error("Error creating client group:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

//  * GET /api/client-groups/assets-summary
export async function getClientGroupAssetSummary(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const isAppAdmin = req.user.role === "app_admin";

    const groups = await prismaClient().clientGroup.findMany({
      where: {
        ...(isAppAdmin ? {} : { companyId: req.user.companyId }),
      },
      include: {
        _count: {
          select: { assets: true },
        },
      },
      orderBy: { name: "asc" },
    });

    const summary = groups.map((g: any) => ({
      clientGroupId: g.id,
      name: g.name,
      department: g.department,
    }));

    return res.json(summary);
  } catch (error) {
    console.error("Error fetching client group asset summary:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/client-groups/send-invite
 */
export async function sendInviteEmail(req: Request, res: Response) {
  try {
    if (!req.user || !["company_admin", "app_admin"].includes(String(req.user.role))) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: admin access required",
      });
    }

    const { email, link } = req.body;

    if (!email || !link) {
      return res.status(400).json({
        success: false,
        message: "Email and invite link are required",
      });
    }

    await sendMail({
      to: email,
      subject: "Your Client Group Invite",
      html: `
        <p>You have been invited to join a client group.</p>
        <p>Click the link below to sign up:</p>
        <p><a href="${link}">${link}</a></p>
      `,
    });

    // ⭐ AUDIT LOG
    await logAudit({
      action: "SEND_INVITE_EMAIL",
      targetType: "ClientGroupInvite",
      targetId: null,
      actorUserId: req.user?.id || null,
      clientGroupId: null,
      companyId: null,
      details: { email, link },
    });

    return res.json({
      success: true,
      message: "Invite email sent successfully",
    });
  } catch (error) {
    console.error("Error sending invite email:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send invite email",
    });
  }
}
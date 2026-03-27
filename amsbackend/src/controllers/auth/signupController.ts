import { Request, Response } from "express";
import { hash } from "bcryptjs";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }
import { logAudit } from "../../models/Audit";
export async function signup(req: Request, res: Response): Promise<Response | void> {
  try {
    // ⭐ ADD THIS BLOCK HERE
    if (!req.user || req.user.role !== "app_admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only app_admin can create users."
      });
    }
    console.log("🔥 SIGNUP BODY RECEIVED:", req.body);  // ⭐ ADD THIS
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      accountType,          // "single" | "company"
      isCompanyAdmin,       // boolean
      clientGroupId,        // only for company users
      companyName,
      accessCode,           // ⭐ for Single User (Company A) and possibly others
      role: invitedRole,
      inviteToken   // ⭐ NEW: role from invite link (viewer/editor)
    } = req.body;
    // Check if username or email already exists
    const existingUser = await prismaClient().users.findFirst({
      where: { OR: [{ username }, { email }] }
    });

    if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username or email already exists"
        });
      }

      const hashedPassword = await hash(password, 10);
      // Resolve accountTypeId from AccountTypeOption
    const accountTypeRow = await prismaClient().accountTypeOption.findUnique({
      where: { value: accountType }
    });

    if (!accountTypeRow) {
      return res.status(400).json({
        success: false,
        message: "Invalid account type"
      });
    }
    // ⭐ NEW INVITE TOKEN FLOW (inviteToken)
if (inviteToken) {
  // 1. Find token
  const token = await prismaClient().inviteToken.findUnique({
    where: { token: inviteToken },
  });

  if (!token || token.used || token.expiresAt < new Date()) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired invite token",
    });
  }

  // 2. Fetch group
  const group = await prismaClient().clientGroup.findUnique({
    where: { id: token.groupId },
    include: { company: true },
  });

  if (!group) {
    return res.status(400).json({
      success: false,
      message: "Client group not found",
    });
  }
  // 3. Determine role
  const allowedRoles = ["viewer", "editor"];
  const finalRoleName = allowedRoles.includes(token.role)
    ? token.role
    : "viewer";

  const role = await prismaClient().role.findUnique({
    where: { name: finalRoleName },
  });

  if (!role) {
    return res.status(400).json({
      success: false,
      message: "Role not found",
    });
  }

  // 4. Create user
  const newUser = await prismaClient().users.create({
    data: {
      firstname: firstName,
      lastname: lastName,
      username,
      email,
      password: hashedPassword,
      role: role.name,
      role_id: role.id,
      accountTypeId: accountTypeRow.id,
      clientGroupId: group.id,
      companyId: group.companyId ,
      disabled: false
     },
    });

  // 5. Mark token as used
  await prismaClient().inviteToken.update({
    where: { token: inviteToken },
    data: { used: true, usedAt: new Date() },
  });

  // 6. Audit log
  await logAudit({
    action: "signup_invite_token",
    targetType: "user",
    targetId: newUser.id,
    performedBy: req.user.username,
    actorUserId: req.user.id,
    clientGroupId: group.id,
    companyId: group.companyId,
    details: {
      invitedRole: finalRoleName,
      inviteToken,
    },
    metadata: { invitedRole: finalRoleName },
  });

  return res.json({
    success: true,
    message: "Signup successful via invite token",
    user: newUser,
  });
}
   // 1️⃣ SINGLE USER SIGNUP (Option B: Single User belongs to a Company)
if (accountType === "single") {
  // Single users never belong to a company
  const role = await prismaClient().role.findUnique({
    where: { name: "single_user" }
  });

  if (!role) {
    return res.status(400).json({
      success: false,
      message: "Role not found"
    });
  }
  // 2. Create a unique company for this single user (their own tenant)
  const singleCompany = await prismaClient().company.create({
    data: {
      name: companyName || `single_user_${username}`,
    },
  });

  // Step 2: Create the user, isolated intheir own company,no group
  const newUser = await prismaClient().users.create({
    data: {
      firstname: firstName,
      lastname: lastName,
      username,
      email,
      password: hashedPassword,
      role: role.name,
      role_id: role.id,
      accountTypeId: accountTypeRow.id,
      clientGroupId: null,
      companyId: singleCompany.id,
      disabled: false   
    }
  });

  // Step 3: Audit log
  await logAudit({
    action: "signup_single_user",
    targetType: "user",
    targetId: newUser.id,
    performedBy: req.user.username,
    actorUserId: req.user.id,
    clientGroupId: null,
    companyId: singleCompany.id,
    details: { accountType: "single", companyId: singleCompany.id, companyName: singleCompany.name },
    metadata: { accountType: "single" }
  });

  return res.json({
    success: true,
    message: "Signup successful",
    user: newUser,
  });
}
    // 2️⃣ COMPANY ADMIN SIGNUP (creates group)
    if (accountType === "company" && isCompanyAdmin === true) {
      if (!companyName) {
        return res.status(400).json({
          success: false,
          message: "Company name is required"
        });
      }

      const role = await prismaClient().role.findUnique({ where: { name: "company_admin" } });
      if (!role) return res.status(400).json({ success: false, message: "Role not found" });
      // ⭐ STEP 1 — Create Company
      const newCompany = await prismaClient().company.create({
      data: { name: companyName }
     });
      // Create client group
      const newGroup = await prismaClient().clientGroup.create({
        data: {
          name: companyName,
          accessCode: accessCode || Math.random().toString(36).substring(2, 10).toUpperCase(),
          companyId: newCompany.id
        }
      });
      // Create admin user
      const newUser = await prismaClient().users.create({
        data: {
          firstname: firstName,
          lastname: lastName,
          username,
          email,
          password: hashedPassword,
          role: role.name,
          role_id: role.id, // admin role ID
          accountTypeId: accountTypeRow.id, // ✅ use scalar FK
          clientGroupId: newGroup.id,
          companyId: newCompany.id,
          disabled: false
        }
      });
     // Audit
      await logAudit({
        action: "signup_company_admin",
        targetType: "user",
        targetId: newUser.id,
        performedBy: req.user.username,
        actorUserId: req.user.id,
        clientGroupId: newGroup.id,
        companyId: newCompany.id,
        details: {
           companyName,
           createdGroupId: newGroup.id,
           companyId: newCompany.id
        },
        metadata: { companyName }
      });

      return res.json({
        success: true,
        message: "Company admin signup successful",
        user: newUser,
        clientGroup: newGroup,
       company: newCompany
      });
    }
  
    // 3️⃣ COMPANY USER SIGNUP (joins group)
    if (accountType === "company" && isCompanyAdmin === false) {
      if (!clientGroupId || !accessCode) {
        return res.status(400).json({
          success: false,
          message: "Client group and access code are required"
        });
      }

      const group = await prismaClient().clientGroup.findUnique({
        where: { id: Number(clientGroupId) },
        include: { company: true }
      });

      if (!group || group.accessCode.trim() !== accessCode.trim()){
        return res.status(400).json({
          success: false,
          message: "Client group not found or access code invalid"
        });
      }
      if (!group.companyId) {
        return res.status(400).json({
          success: false,
          message: "This client group is not linked to any company"
        });
      }

      // ⭐ NEW: Role from invite link (viewer/editor)
      const allowedRoles = ["viewer", "editor"];
      const finalRoleName = allowedRoles.includes(invitedRole) ? invitedRole : "viewer";

      const role = await prismaClient().role.findUnique({ where: { name: finalRoleName } });
      if (!role) return res.status(400).json({ success: false, message: "Role not found" });

      const newUser = await prismaClient().users.create({
        data: {
          firstname: firstName,
          lastname: lastName,
          username,
          email,
          password: hashedPassword,
          role: role.name,
          role_id: role.id,     // viewer role ID
          accountTypeId: accountTypeRow.id, // ✅ use scalar FK
          clientGroupId: group.id,
          companyId: group.companyId,
          disabled: false
        }
      });
      // Audit
      await logAudit({
        action: "signup_company_user",
        targetType: "user",
        targetId: newUser.id,
        performedBy: req.user.username,
        actorUserId: req.user.id,
        clientGroupId: group.id,
          companyId: group.companyId,
        details: {
          invitedRole: finalRoleName,
          clientGroupId: group.id,
          companyId: group.companyId 
  },
        metadata: { invitedRole: finalRoleName }
      });

      return res.json({
        success: true,
        message: "Company user signup successful",
        user: newUser
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid signup request"
    });

  } catch (err) {
    console.error("Signup error:", err);
    await logAudit({
      action: "signup_error",
      targetType: "system",
      targetId: null,
      performedBy: req.user?.username || "anonymous",
      actorUserId: req.user?.id || null,
      clientGroupId: null,
      companyId: null,
      details: { error: String(err) },
      metadata: { error: String(err) }
    });

    res.status(500).json({
      success: false,
      message: "Server error during signup"
    });
  }
}

import { Request, Response } from "express";
import { hash } from "bcryptjs";
import prisma  from "../../prisma/client";
import { logAudit } from "../../models/Audit";
export async function signup(req: Request, res: Response): Promise<Response | void> {
  try {
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
    const existingUser = await prisma.users.findFirst({
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
    const accountTypeRow = await prisma.accountTypeOption.findUnique({
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
  const token = await prisma.inviteToken.findUnique({
    where: { token: inviteToken },
  });

  if (!token || token.used || token.expiresAt < new Date()) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired invite token",
    });
  }

  // 2. Fetch group
  const group = await prisma.clientGroup.findUnique({
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

  const role = await prisma.role.findUnique({
    where: { name: finalRoleName },
  });

  if (!role) {
    return res.status(400).json({
      success: false,
      message: "Role not found",
    });
  }

  // 4. Create user
  const newUser = await prisma.users.create({
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
    },
  });

  // 5. Mark token as used
  await prisma.inviteToken.update({
    where: { token: inviteToken },
    data: { used: true, usedAt: new Date() },
  });

  // 6. Audit log
  await logAudit({
    action: "signup_invite_token",
    targetType: "user",
    targetId: newUser.id,
    performedBy: "anonymous",
    actorUserId: null,
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
  const role = await prisma.role.findUnique({
    where: { name: "single_user" }
  });

  if (!role) {
    return res.status(400).json({
      success: false,
      message: "Role not found"
    });
  }
  
  // Step 2: Create the user inside that group
  const newUser = await prisma.users.create({
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
      companyId: null   
    }
  });

  // Step 3: Audit log
  await logAudit({
    action: "signup_single_user",
    targetType: "user",
    targetId: newUser.id,
    performedBy: "anonymous",
    actorUserId: null,
    clientGroupId: null,
      companyId: null,
    details: { accountType: "single" },
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

      const role = await prisma.role.findUnique({ where: { name: "company_admin" } });
      if (!role) return res.status(400).json({ success: false, message: "Role not found" });
      // ⭐ STEP 1 — Create Company
      const newCompany = await prisma.company.create({
      data: { name: companyName }
     });
      // Create client group
      const newGroup = await prisma.clientGroup.create({
        data: {
          name: companyName,
          accessCode: accessCode || Math.random().toString(36).substring(2, 10).toUpperCase(),
          companyId: newCompany.id
        }
      });
      // Create admin user
      const newUser = await prisma.users.create({
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
          companyId: newCompany.id
        }
      });
     // Audit
      await logAudit({
        action: "signup_company_admin",
        targetType: "user",
        targetId: newUser.id,
        performedBy: "anonymous",
        actorUserId: null,
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

      const group = await prisma.clientGroup.findUnique({
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

      const role = await prisma.role.findUnique({ where: { name: finalRoleName } });
      if (!role) return res.status(400).json({ success: false, message: "Role not found" });

      const newUser = await prisma.users.create({
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
          companyId: group.companyId
        }
      });
      // Audit
      await logAudit({
        action: "signup_company_user",
        targetType: "user",
        targetId: newUser.id,
        performedBy: "anonymous",
        actorUserId: null,
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
      performedBy: "anonymous",
      actorUserId: null,
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
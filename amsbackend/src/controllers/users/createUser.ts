import { Request, Response } from "express";
import { hash } from "bcryptjs";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }
import { logAudit } from "../../models/Audit";

export async function createUser(req: Request, res: Response): Promise<void> {
  // ⭐ NEW: Prevent empty-body requests (cron jobs, system calls, etc.)
  if (!req.body || Object.keys(req.body).length === 0) {
    res.status(400).json({
      success: false,
      message: "Request body cannot be empty"
    });
    return;
  }

  const user = req.user!;
  const role = String(user.role).toLowerCase();

  if (!["app_admin", "company_admin"].includes(role)) {
    res.status(403).json({ success: false, message: "Forbidden: admin access required" });
    return;
  }

  const { firstname, lastname, username, email, password, invitedRole, clientGroupId } = req.body;

  if (!firstname || !lastname || !username || !email) {
    res.status(400).json({ success: false, message: "Missing required fields" });
    return;
  }

  const finalRoleName = invitedRole;

  // ⭐ FIX: Prevent Prisma crash when invitedRole is missing
  if (!finalRoleName) {
    res.status(400).json({ success: false, message: "invitedRole is required" });
    return;
  }

  const existing = await prismaClient().users.findFirst({
    where: { OR: [{ username }, { email }] }
  });

  if (existing) {
    res.status(400).json({ success: false, message: "Username or email already exists" });
    return;
  }

  const roleRow = await prismaClient().role.findUnique({ where: { name: finalRoleName } });
  if (!roleRow) {
    res.status(400).json({ success: false, message: "Role not found" });
    return;
  }

  const accountTypeRow = await prismaClient().accountTypeOption.findUnique({
    where: { value: user.accountType }
  });

  if (!accountTypeRow) {
    res.status(400).json({ success: false, message: "Invalid account type" });
    return;
  }

  // ⭐ Determine final clientGroupId
  const finalClientGroupId = clientGroupId ?? user.clientGroupId;

  // ⭐ Fetch group to validate company ownership
  const group = await prismaClient().clientGroup.findUnique({
    where: { id: finalClientGroupId },
    select: { id: true, companyId: true }
  });

  if (!group) {
    res.status(400).json({ success: false, message: "Client group not found" });
    return;
  }

  // ⭐ Company Admin cannot create users in another company
  if (role === "company_admin" && group.companyId !== user.companyId) {
    res.status(403).json({
      success: false,
      message: "Forbidden: cannot create users in another company"
    });
    return;
  }

  // ⭐ Auto-generate password if not provided
  const rawPassword = password ?? Math.random().toString(36).slice(2, 10);
  const hashedPassword = await hash(rawPassword, 10);

  // ⭐ Create user with correct companyId
  const newUser = await prismaClient().users.create({
    data: {
      firstname,
      lastname,
      username,
      email,
      password: hashedPassword,
      role: roleRow.name,
      role_id: roleRow.id,
      accountTypeId: accountTypeRow.id,
      clientGroupId: finalClientGroupId,
      companyId: group.companyId,   // ⭐ CRITICAL FIX
      disabled: false
    }
  });

  await logAudit({
    action: "create_user",
    targetType: "user",
    targetId: newUser.id,
    performedBy: user.username,
    actorUserId: user.id,
    clientGroupId: finalClientGroupId,
    companyId: group.companyId,
    details: {
      firstname,
      lastname,
      username,
      email,
      assignedRole: finalRoleName,
      assignedGroup: finalClientGroupId
    },
    metadata: {
      invitedRole: finalRoleName,
      email,
      role: user.role,
      accountType: user.accountType
    }
  });

  res.json({ success: true, message: "User created successfully", user: newUser });
}

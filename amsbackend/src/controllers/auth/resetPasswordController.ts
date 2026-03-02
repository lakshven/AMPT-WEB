import { Request, Response } from "express";
import { hash } from "bcryptjs";
import prisma  from "../../prisma/client";
import { logAudit } from "../../models/Audit";

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { token } = req.params as { token: string };
  const { password } = req.body as { password: string };

  try {
    // ❗ Validate token
    if (!token || typeof token !== "string") {
      res.status(400).json({ message: "Invalid reset token" });
      return;
    }
    // ❗ Validate password
    if (!password || password.trim().length < 6) {
      res.status(400).json({ message: "Password must be at least 6 characters" });
      return;
    }
    // ✅ Find user with valid (non-expired) token
    const resetRecord  = await prisma.passwordReset.findFirst({
      where: {
        token,
        expiresAt: { gt: new Date() }
      },
      include: {
        user: true
      }
    });

    if (!resetRecord || !resetRecord.user) {
      await logAudit({
        action: "reset_password_invalid_token",
        targetType: "user",
        targetId: null,
        performedBy: "anonymous",
        actorUserId: null,
        clientGroupId: null,
        companyId: null,
        details: { token },
        metadata: { token }
      });

      res.status(400).json({ message: "Invalid or expired token" });
      return;
    }

    // ✅ Hash new password
    const hashed = await hash(password, 10);

    // ✅ Update user password
    await prisma.users.update({
      where: { id: resetRecord.user.id },
      data: { password: hashed }
    });

    // ✅ Clear reset token
    await prisma.passwordReset.deleteMany({
      where: { userId: resetRecord.user.id }
    });
    await logAudit({
      action: "reset_password_success",
      targetType: "user",
      targetId: resetRecord.user.id,
      performedBy: "anonymous",
      actorUserId: null,
      clientGroupId: resetRecord.user.clientGroupId,
      companyId: resetRecord.user.companyId,
      details: {
      tokenUsed: token,
      userId: resetRecord.user.id
    },
      metadata: { tokenUsed: token }
    });

    res.json({ message: "Password has been reset successfully" });

  } catch (err) {
    console.error("Reset password error:", err);
     await logAudit({
      action: "reset_password_error",
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
      message: "Server error during password reset"
    });
  }
}
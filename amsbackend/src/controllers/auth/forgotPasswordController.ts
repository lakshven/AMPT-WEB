import { Request, Response } from "express";
import prisma  from "../../prisma/client";
import sendEmail from "../../utils/sendEmail";
import { requestPasswordReset } from "../../models/PasswordReset";
import { logAudit } from "../../models/Audit";

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body as { email: string };

  try {
    const user = await prisma.users.findUnique({
      where: { email },
    });
    // ✅ Always return success to avoid email enumeration
    if (!user) {
      await logAudit({
        action: "forgot_password_requested",
        targetType: "user",
        targetId: null,
        performedBy: "anonymous",
        actorUserId: null,
        clientGroupId: null,
          companyId: null,
        details: { email },
        metadata: { email }
      });

      res.json({ success: true, message: "Reset link sent if email exists" });
      return;
    }
    // ✅ Generate + store token using your new Prisma helper
    const { token, expiresAt } = await requestPasswordReset(user.id);
    const resetLink = `http://localhost:3000/reset-password/${token}`;

    const emailHtml = `
      <p>Hello ${user.firstname},</p>
      <p>You requested to reset your password. Click the link below:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire at: ${expiresAt.toLocaleString()}</p>
    `;

    // ✅ Send email
    await sendEmail({
      to: email,
      subject: "Password Reset Request",
      html: emailHtml,
    });
    await logAudit({
      action: "forgot_password_email_sent",
      targetType: "user",
      targetId: user.id,
      performedBy: "anonymous",
      actorUserId: null,
      clientGroupId: user.clientGroupId,
      companyId: user.companyId,
      details: {
      email,
      resetTokenGenerated: true,
      expiresAt
      },
      metadata: { email }
    });

    res.json({ success: true, message: "Reset link sent if email exists" });
  } catch (err) {
    console.error("Forgot password error:", err);
     await logAudit({
      action: "forgot_password_error",
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
      message: "Server error during password reset",
    });
  }
}
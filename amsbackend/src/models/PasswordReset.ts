import  prisma  from "../prisma/client";
import crypto from "crypto";

// ✅ Generate a secure token
function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

// ✅ Request password reset (send email separately)
export async function requestPasswordReset(userId: number) {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

  await prisma.passwordReset.upsert({
    where: { userId },
    update: { token, expiresAt },
    create: { userId, token, expiresAt }
  });

  return { token, expiresAt };
}

// ✅ Verify token
export async function verifyPasswordResetToken(userId: number, token: string) {
  return prisma.passwordReset.findFirst({
    where: {
      userId,
      token,
      expiresAt: { gt: new Date() }
    }
  });
}

// ✅ Reset password (after verifying token)
export async function resetPassword(userId: number, newHashedPassword: string) {
  // Update user password
  await prisma.users.update({
    where: { id: userId },
    data: { password: newHashedPassword }
  });

  // Clear token
  await prisma.passwordReset.deleteMany({
    where: { userId }
  });

  return { success: true, message: "Password updated successfully" };
}

// ✅ Clear token manually (optional)
export async function clearPasswordResetToken(userId: number) {
  await prisma.passwordReset.deleteMany({
    where: { userId }
  });
}
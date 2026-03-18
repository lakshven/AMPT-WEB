"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestPasswordReset = requestPasswordReset;
exports.verifyPasswordResetToken = verifyPasswordResetToken;
exports.resetPassword = resetPassword;
exports.clearPasswordResetToken = clearPasswordResetToken;
const client_1 = require("../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
const crypto_1 = __importDefault(require("crypto"));
// ✅ Generate a secure token
function generateToken() {
    return crypto_1.default.randomBytes(32).toString("hex");
}
// ✅ Request password reset (send email separately)
async function requestPasswordReset(userId) {
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes
    await prismaClient().passwordReset.upsert({
        where: { userId },
        update: { token, expiresAt },
        create: { userId, token, expiresAt }
    });
    return { token, expiresAt };
}
// ✅ Verify token
async function verifyPasswordResetToken(userId, token) {
    return prismaClient().passwordReset.findFirst({
        where: {
            userId,
            token,
            expiresAt: { gt: new Date() }
        }
    });
}
// ✅ Reset password (after verifying token)
async function resetPassword(userId, newHashedPassword) {
    // Update user password
    await prismaClient().users.update({
        where: { id: userId },
        data: { password: newHashedPassword }
    });
    // Clear token
    await prismaClient().passwordReset.deleteMany({
        where: { userId }
    });
    return { success: true, message: "Password updated successfully" };
}
// ✅ Clear token manually (optional)
async function clearPasswordResetToken(userId) {
    await prismaClient().passwordReset.deleteMany({
        where: { userId }
    });
}
//# sourceMappingURL=PasswordReset.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPassword = forgotPassword;
const client_1 = require("../../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
const sendEmail_1 = __importDefault(require("../../utils/sendEmail"));
const PasswordReset_1 = require("../../models/PasswordReset");
const Audit_1 = require("../../models/Audit");
async function forgotPassword(req, res) {
    const { email } = req.body;
    try {
        const user = await prismaClient().users.findUnique({
            where: { email },
        });
        // ✅ Always return success to avoid email enumeration
        if (!user) {
            await (0, Audit_1.logAudit)({
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
        const { token, expiresAt } = await (0, PasswordReset_1.requestPasswordReset)(user.id);
        const resetLink = `http://localhost:3000/reset-password/${token}`;
        const emailHtml = `
      <p>Hello ${user.firstname},</p>
      <p>You requested to reset your password. Click the link below:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire at: ${expiresAt.toLocaleString()}</p>
    `;
        // ✅ Send email
        await (0, sendEmail_1.default)({
            to: email,
            subject: "Password Reset Request",
            html: emailHtml,
        });
        await (0, Audit_1.logAudit)({
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
    }
    catch (err) {
        console.error("Forgot password error:", err);
        await (0, Audit_1.logAudit)({
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
//# sourceMappingURL=forgotPasswordController.js.map
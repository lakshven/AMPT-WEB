"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = login;
const bcryptjs_1 = require("bcryptjs");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = __importDefault(require("../../prisma/client"));
const Audit_1 = require("../../models/Audit");
async function login(req, res) {
    const { identifier, password } = req.body;
    try {
        // Fetch user by username or email
        const user = await client_1.default.users.findFirst({
            where: {
                OR: [
                    { username: identifier },
                    { email: identifier }
                ]
            },
            include: {
                roleRef: {
                    include: {
                        permissions: {
                            include: { Permission: true }
                        }
                    }
                },
                accountType: true
            }
        });
        if (!user) {
            await (0, Audit_1.logAudit)({
                action: "login_failed_user_not_found",
                targetType: "user",
                targetId: null,
                performedBy: identifier,
                actorUserId: null,
                clientGroupId: null,
                companyId: null,
                details: { identifier },
                metadata: { identifier }
            });
            res.status(401).json({ success: false, message: "User not found" });
            return;
        }
        // Block disabled users (soft delete)
        if (user.disabled) {
            await (0, Audit_1.logAudit)({
                action: "login_failed_disabled_user",
                targetType: "user",
                targetId: user.id,
                performedBy: user.username,
                actorUserId: user.id,
                clientGroupId: user.clientGroupId,
                companyId: user.companyId,
                details: { disabledAt: user.disabledAt },
                metadata: {}
            });
            res.status(403).json({ success: false, message: "Account disabled" });
            return;
        }
        // ✅ Compare password
        const isMatch = await (0, bcryptjs_1.compare)(password, user.password);
        if (!isMatch) {
            await (0, Audit_1.logAudit)({
                action: "login_failed_invalid_password",
                targetType: "user",
                targetId: user.id,
                performedBy: user.username,
                actorUserId: user.id,
                clientGroupId: user.clientGroupId,
                companyId: user.companyId,
                details: { attemptedPassword: true },
                metadata: {}
            });
            res.status(401).json({ success: false, message: "Invalid password" });
            return;
        }
        // ✅ Extract permission names from nested structure
        const permissionNames = user.roleRef?.permissions?.map((p) => p.Permission.name.toUpperCase()) ?? [];
        // Normalize backend role → frontend role
        let normalizedRole = user.roleRef?.name?.toLowerCase() ?? "user";
        if (normalizedRole === "personal_owner")
            normalizedRole = "single_user";
        if (normalizedRole === "viewer")
            normalizedRole = "viewer";
        if (normalizedRole === "editor")
            normalizedRole = "editor";
        if (normalizedRole === "company_admin")
            normalizedRole = "company_admin";
        if (normalizedRole === "app_admin")
            normalizedRole = "app_admin";
        // ✅ Normalize accountType from relation → frontend string
        const rawAccountType = user.accountType?.value?.toLowerCase() ?? "company";
        // Map backend accountType names to frontend values
        // personal_owner  -> "single"
        // viewer/others   -> "company"
        const normalizedAccountType = rawAccountType === "personal_owner" ? "single" : "company";
        const jwtToken = jsonwebtoken_1.default.sign({
            id: user.id,
            username: user.username,
            roleId: user.role_id,
            role: normalizedRole,
            permissions: permissionNames,
            clientGroupId: user.clientGroupId,
            companyId: user.companyId,
            accountType: normalizedAccountType
        }, process.env.JWT_SECRET, { expiresIn: "12h" });
        // Audit success
        await (0, Audit_1.logAudit)({
            action: "login_success",
            targetType: "user",
            targetId: user.id,
            performedBy: user.username,
            actorUserId: user.id,
            clientGroupId: user.clientGroupId,
            companyId: user.companyId,
            details: {
                loginTime: new Date().toISOString(),
                ip: req.ip
            },
            metadata: {
                role: normalizedRole,
                accountType: normalizedAccountType
            }
        });
        // ✅ Response unchanged
        res.json({
            success: true,
            token: jwtToken,
            user: {
                id: user.id,
                username: user.username,
                roleId: user.role_id,
                role: normalizedRole,
                permissions: permissionNames,
                clientGroupId: user.clientGroupId,
                companyId: user.companyId, // ⭐ added
                accountType: normalizedAccountType,
                needsStartupPage: normalizedAccountType === "single"
            }
        });
    }
    catch (err) {
        console.error("Login error:", err);
        await (0, Audit_1.logAudit)({
            action: "login_error",
            targetType: "system",
            targetId: null,
            performedBy: identifier,
            actorUserId: null,
            clientGroupId: null,
            companyId: null,
            details: { error: String(err) },
            metadata: { error: String(err) }
        });
        res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
}
//# sourceMappingURL=loginController.js.map
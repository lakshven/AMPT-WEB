"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreUser = restoreUser;
const client_1 = __importDefault(require("../../prisma/client"));
const Audit_1 = require("../../models/Audit");
async function restoreUser(req, res) {
    const admin = req.user;
    const adminRole = String(admin.role).toLowerCase();
    if (!["app_admin", "company_admin"].includes(adminRole)) {
        res.status(403).json({ success: false, message: "Forbidden" });
        return;
    }
    const userId = Number(req.params.id);
    const existing = await client_1.default.users.findUnique({ where: { id: userId } });
    if (!existing) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
    }
    // ⭐ CRITICAL: company_admin can only restore users in their own company
    if (adminRole === "company_admin" && existing.companyId !== admin.companyId) {
        res.status(403).json({
            success: false,
            message: "Forbidden: cannot restore users outside your company"
        });
        return;
    }
    const restored = await client_1.default.users.update({
        where: { id: userId },
        data: {
            disabled: false,
            disabledAt: null
        }
    });
    await (0, Audit_1.logAudit)({
        action: "restore_user",
        targetType: "user",
        targetId: restored.id,
        performedBy: admin.username,
        actorUserId: admin.id,
        clientGroupId: admin.clientGroupId,
        companyId: admin.companyId,
        details: {
            restoredUserId: restored.id,
            restoredUsername: restored.username,
            restoredEmail: restored.email,
            restoredRole: restored.role
        },
        metadata: {
            restoredFromDisabled: true,
            role: admin.role,
            accountType: admin.accountType
        }
    });
    res.json({ success: true, message: "User restored", user: restored });
}
//# sourceMappingURL=restoreUser.js.map
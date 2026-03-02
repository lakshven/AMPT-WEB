"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPermissions = getPermissions;
const client_1 = __importDefault(require("../../prisma/client"));
const Audit_1 = require("../../models/Audit");
async function getPermissions(req, res) {
    try {
        if (!req.user || !req.user.id) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const user = await client_1.default.users.findUnique({
            where: { id: req.user.id },
            include: {
                roleRef: {
                    include: {
                        permissions: {
                            include: { Permission: true },
                        },
                    },
                },
            },
        });
        // If somehow user is missing (deleted, etc.), treat as no permissions
        const permissionNames = user?.roleRef?.permissions?.map((p) => p.Permission.name) ?? [];
        await (0, Audit_1.logAudit)({
            action: "get_permissions",
            targetType: "user",
            targetId: req.user.id,
            performedBy: req.user.username,
            actorUserId: req.user.id,
            clientGroupId: req.user.clientGroupId,
            companyId: req.user.companyId,
            details: {
                permissionsReturned: permissionNames
            },
            metadata: {}
        });
        res.json({ success: true, permissions: permissionNames });
    }
    catch (err) {
        console.error("Permissions error:", err);
        await (0, Audit_1.logAudit)({
            action: "get_permissions_error",
            targetType: "system",
            targetId: null,
            performedBy: req.user ? req.user.username : "anonymous",
            actorUserId: req.user ? req.user.id : null,
            clientGroupId: req.user ? req.user.clientGroupId : null,
            companyId: req.user ? req.user.companyId : null,
            details: { error: String(err) },
            metadata: { error: String(err) }
        });
        res.status(500).json({ message: "Server error fetching permissions" });
    }
}
//# sourceMappingURL=permissionController.js.map
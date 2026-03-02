"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        let userRole = String(req.user.role).toLowerCase();
        // ⭐ Allow single_user ONLY during first-time setup (no company yet)
        if (userRole === "single_user" && req.user.companyId === null) {
            next();
            return;
        }
        const allowed = roles.map(r => r.toLowerCase());
        if (!allowed.includes(userRole)) {
            res.status(403).json({ message: "Forbidden: insufficient Role", requiredRoles: roles });
            return;
        }
        next();
    };
}
//# sourceMappingURL=requireRole.js.map
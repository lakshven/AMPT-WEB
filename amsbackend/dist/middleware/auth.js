"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachUserContext = attachUserContext;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = __importDefault(require("../prisma/client"));
async function attachUserContext(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) {
        req.user = undefined;
        return next();
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // ⭐ Always load fresh user from DB (Prisma-safe)
        const dbUser = await client_1.default.users.findUnique({
            where: { id: decoded.id },
            include: {
                roleRef: true,
                clientGroup: true,
                accountType: true
            }
        });
        if (!dbUser) {
            res.status(401).json({ message: "User not found" });
            return;
        }
        // ⭐ Keep roles EXACTLY as stored in DB
        const role = dbUser.role;
        req.user = {
            id: dbUser.id,
            username: dbUser.username,
            role,
            roleId: dbUser.role_id,
            permissions: decoded.permissions || [], // frontend expects this
            clientGroupId: dbUser.clientGroupId,
            companyId: dbUser.companyId,
            accountType: dbUser.accountType?.value || "company"
        };
        return next();
    }
    catch (err) {
        console.error("❗ JWT verification failed:", err);
        res.status(401).json({ message: "Invalid token" });
        return;
    }
}
//# sourceMappingURL=auth.js.map
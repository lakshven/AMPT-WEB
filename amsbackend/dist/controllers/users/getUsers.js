"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = getUsers;
const client_1 = __importDefault(require("../../prisma/client"));
async function getUsers(req, res) {
    const user = req.user;
    const role = String(user.role).toLowerCase();
    const { page = 1, pageSize = 10, search = "", roleFilter = "", status = "active" // active | disabled | all
     } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);
    const where = {};
    // ⭐ MULTI‑TENANT ISOLATION
    // app_admin → sees all users
    // everyone else → only users in their company
    if (role !== "app_admin") {
        where.companyId = user.companyId;
    }
    // Search filter
    if (search) {
        where.OR = [
            { firstname: { contains: String(search), mode: "insensitive" } },
            { lastname: { contains: String(search), mode: "insensitive" } },
            { email: { contains: String(search), mode: "insensitive" } },
            { username: { contains: String(search), mode: "insensitive" } }
        ];
    }
    // Role filter
    if (roleFilter) {
        where.role = String(roleFilter);
    }
    // Status filter
    if (status === "active")
        where.disabled = false;
    if (status === "disabled")
        where.disabled = true;
    const [users, total] = await Promise.all([
        client_1.default.users.findMany({
            where,
            skip,
            take,
            orderBy: { id: "asc" }
        }),
        client_1.default.users.count({ where })
    ]);
    res.json({
        success: true,
        data: users,
        pagination: {
            page: Number(page),
            pageSize: Number(pageSize),
            total
        }
    });
}
//# sourceMappingURL=getUsers.js.map
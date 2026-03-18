"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = getUsers;
const client_1 = require("../../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
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
        prismaClient().users.findMany({
            where,
            skip,
            take,
            orderBy: { id: "asc" }
        }),
        prismaClient().users.count({ where })
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
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssignableUsers = void 0;
const client_1 = require("../../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
const getAssignableUsers = async (req, res) => {
    try {
        const actor = req.user;
        if (!actor) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        // ⭐ app_admin sees all users
        const where = { disabled: false };
        // ⭐ everyone else sees only users in their company
        if (actor.role !== "app_admin") {
            where.companyId = actor.companyId;
        }
        const users = await prismaClient().users.findMany({
            where,
            select: {
                id: true,
                firstname: true,
                lastname: true,
                role: true,
                clientGroup: {
                    select: { name: true }
                }
            },
            orderBy: { firstname: "asc" },
        });
        res.json(users);
    }
    catch (err) {
        console.error("Error fetching assignable users:", err);
        res.status(500).json({ error: "Failed to fetch users" });
    }
};
exports.getAssignableUsers = getAssignableUsers;
//# sourceMappingURL=getAssignableUsers.js.map
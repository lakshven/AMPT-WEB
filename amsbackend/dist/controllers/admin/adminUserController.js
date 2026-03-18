"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignRoleToUser = void 0;
const client_1 = require("../../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
const assignRoleToUser = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const { roleName } = req.body;
        const role = await prismaClient().role.findUnique({
            where: { name: roleName },
            select: { id: true }
        });
        if (!role) {
            res.status(400).json({ message: "Role not found" });
            return;
        }
        await prismaClient().users.update({
            where: { id: userId },
            data: { role_id: role.id }
        });
        res.json({ ok: true });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to assign role" });
    }
};
exports.assignRoleToUser = assignRoleToUser;
//# sourceMappingURL=adminUserController.js.map
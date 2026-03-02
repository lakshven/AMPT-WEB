"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignRoleToUser = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const assignRoleToUser = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const { roleName } = req.body;
        const role = await client_1.default.role.findUnique({
            where: { name: roleName },
            select: { id: true }
        });
        if (!role) {
            res.status(400).json({ message: "Role not found" });
            return;
        }
        await client_1.default.users.update({
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
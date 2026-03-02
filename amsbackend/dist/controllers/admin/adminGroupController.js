"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addUserToGroup = void 0;
const client_1 = __importDefault(require("../../prisma/client"));
const addUserToGroup = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        const { groupName } = req.body;
        const group = await client_1.default.group.findUnique({
            where: { name: groupName },
            select: { id: true }
        });
        if (!group) {
            res.status(400).json({ message: "Group not found" });
            return;
        }
        await client_1.default.userGroup.upsert({
            where: {
                userId_groupId: {
                    userId,
                    groupId: group.id
                }
            },
            update: {},
            create: {
                userId,
                groupId: group.id
            }
        });
        res.json({ ok: true });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to add user to group" });
    }
};
exports.addUserToGroup = addUserToGroup;
//# sourceMappingURL=adminGroupController.js.map
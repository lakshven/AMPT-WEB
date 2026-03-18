"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserById = getUserById;
const client_1 = require("../../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
async function getUserById(req, res) {
    const idParam = req.params.id;
    const userId = parseInt(idParam, 10);
    if (isNaN(userId)) {
        return res.status(400).json({ error: "Invalid user ID" });
    }
    const user = await prismaClient().users.findUnique({
        where: { id: userId },
    });
    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }
    const actor = req.user;
    const actorRole = actor.role;
    // ⭐ app_admin → full access
    if (actorRole === "app_admin") {
        return res.json(user);
    }
    // ⭐ Everyone else → must belong to the same company
    if (user.companyId !== actor.companyId) {
        return res.status(403).json({ error: "Access denied: different company" });
    }
    return res.json(user);
}
//# sourceMappingURL=getUserById.js.map
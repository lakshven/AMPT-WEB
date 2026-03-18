"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvePermissionsForUser = resolvePermissionsForUser;
const client_1 = require("../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
async function resolvePermissionsForUser(userId) {
    // ✅ 1. Direct role permissions (user → role → permissions)
    const directPermissions = await prismaClient().permission.findMany({
        where: {
            rolePermissions: {
                some: {
                    Role: {
                        users: {
                            some: { id: userId }
                        }
                    }
                }
            }
        },
        select: { name: true }
    });
    // ✅ 2. Group-based permissions (recursive group tree)
    // Step A: Get all groups the user belongs to
    const userGroups = await prismaClient().userGroup.findMany({
        where: { userId: userId },
        select: { groupId: true }
    });
    const visited = new Set();
    const queue = userGroups.map((g) => g.groupId);
    // Step B: BFS to resolve parent groups (recursive)
    while (queue.length > 0) {
        const groupId = queue.shift();
        if (visited.has(groupId))
            continue;
        visited.add(groupId);
        const parent = await prismaClient().group.findUnique({
            where: { id: groupId },
            select: { parentGroupId: true }
        });
        if (parent?.parentGroupId) {
            queue.push(parent.parentGroupId);
        }
    }
    const allGroupIds = Array.from(visited);
    // ✅ 3. Fetch permissions from all groups
    const groupPermissions = await prismaClient().permission.findMany({
        where: {
            rolePermissions: {
                some: {
                    Role: {
                        groupRoles: {
                            some: {
                                groupId: { in: allGroupIds }
                            }
                        }
                    }
                }
            }
        },
        select: { name: true }
    });
    // ✅ 4. Merge + dedupe
    const merged = Array.from(new Set([
        ...directPermissions.map((p) => p.name),
        ...groupPermissions.map((p) => p.name)
    ]));
    return merged;
}
exports.default = resolvePermissionsForUser;
//# sourceMappingURL=permissionsResolver.js.map
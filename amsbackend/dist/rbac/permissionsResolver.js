"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvePermissionsForUser = resolvePermissionsForUser;
const client_1 = __importDefault(require("../prisma/client"));
async function resolvePermissionsForUser(userId) {
    // ✅ 1. Direct role permissions (user → role → permissions)
    const directPermissions = await client_1.default.permission.findMany({
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
    const userGroups = await client_1.default.userGroup.findMany({
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
        const parent = await client_1.default.group.findUnique({
            where: { id: groupId },
            select: { parentGroupId: true }
        });
        if (parent?.parentGroupId) {
            queue.push(parent.parentGroupId);
        }
    }
    const allGroupIds = Array.from(visited);
    // ✅ 3. Fetch permissions from all groups
    const groupPermissions = await client_1.default.permission.findMany({
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
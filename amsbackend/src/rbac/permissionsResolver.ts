import prisma  from "../prisma/client";
export async function resolvePermissionsForUser(userId: number): Promise<string[]> {
  // ✅ 1. Direct role permissions (user → role → permissions)
  const directPermissions = await prisma.permission.findMany({
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
  const userGroups = await prisma.userGroup.findMany({
    where: { userId: userId },
    select: { groupId: true }
  });

  const visited = new Set<number>();
  const queue = userGroups.map((g: { groupId: number }) => g.groupId);

  // Step B: BFS to resolve parent groups (recursive)
  while (queue.length > 0) {
    const groupId = queue.shift()!;
    if (visited.has(groupId)) continue;

    visited.add(groupId);

    const parent = await prisma.group.findUnique({
      where: { id: groupId },
      select: { parentGroupId: true }
    });

    if (parent?.parentGroupId) {
      queue.push(parent.parentGroupId);
    }
  }

  const allGroupIds = Array.from(visited);

  // ✅ 3. Fetch permissions from all groups
  const groupPermissions = await prisma.permission.findMany({
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
  const merged = Array.from(
    new Set([
      ...directPermissions.map((p:{name: string}) => p.name),
      ...groupPermissions.map((p:{name: string}) => p.name)
    ])
  );

  return merged;
}

export default resolvePermissionsForUser;
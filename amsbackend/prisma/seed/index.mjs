// /backend/src/db/seed/index.js
import dotenv from "dotenv";
dotenv.config();
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { PERMISSIONS } from "./permissions.mjs";
import { ROLES } from "./roles.mjs";
import { ROLE_PERMISSIONS } from "./rolePermissions.mjs";
import { ensureAdminUser } from "./createAdmin.mjs";
import { GROUPS } from "./groups.mjs";
import { GROUP_ROLES } from "./groupRoles.mjs";
import { seedDropdowns } from "./dropdowns.mjs";
import { seedClientGroups } from "./clientGroups.mjs";
import {seedUsers} from "./seedUsers.mjs"
import {seedAssetIssues} from "./assetIssues.mjs"
import { seedAccountTypes } from "./AccountTypeOption.mjs";
// ✅ Seed Permissions
async function seedPermissions() {
  await prisma.permission.createMany({
    data: PERMISSIONS,
    skipDuplicates: true,
  });
  console.log("✅ Permissions seeded");
}
// ✅ Seed Roles
async function seedRoles() {
  await prisma.role.createMany({
    data: ROLES,
    skipDuplicates: true,
  });
  console.log("✅ Roles seeded");
}
// ✅ Seed Role → Permission mapping
async function seedRolePermissions() {
  for (const [roleName, perms] of Object.entries(ROLE_PERMISSIONS)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) {
      console.warn(`⚠️ Role '${roleName}' not found`);
      continue;
    }
    const permissions =
      perms === "ALL"
        ? await prisma.permission.findMany()
        : await prisma.permission.findMany({
            where: { name: { in: perms } },
          });

    for (const perm of permissions) {
      if (!perm) {
        console.warn(`⚠️ Permission not found for role '${roleName}'`);
        continue;
      }
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: { roleId: role.id, permissionId: perm.id },
      });
    }
  }
  console.log("✅ Role permissions seeded");
}

// ✅ Seed Groups + Hierarchy
async function seedGroups() {
  // Create groups
  for (const g of GROUPS) {
    await prisma.group.upsert({
      where: { name: g.name },
      update: {},
      create: { name: g.name },
    });
  }

  // Apply hierarchy
  for (const g of GROUPS) {
    if (g.parent) {
      const parent = await prisma.group.findUnique({ where: { name: g.parent }, });
      const child = await prisma.group.findUnique({ where: { name: g.name }, });

      if (parent && child) {
        await prisma.group.update({
          where: { id: child.id },
          data: { parentGroupId: parent.id },
        });
      }
    }
  }

  console.log("✅ Groups seeded with hierarchy");
}

// ✅ Seed Group → Role mapping
async function seedGroupRoles() {
  for (const [groupName, roleName] of Object.entries(GROUP_ROLES)) {
    const group = await prisma.group.findUnique({ where: { name: groupName } });
    const role = await prisma.role.findUnique({ where: { name: roleName } });

    if (group && role) {
      await prisma.groupRole.upsert({
        where: {
          groupId_roleId: {
            groupId: group.id,
            roleId: role.id,
          },
        },
        update: {},
        create: { groupId: group.id, roleId: role.id },
      });
    }
  }
  console.log("✅ Group roles seeded");
}
// ✅ Main Seed Runner
export async function seed() {
  try {
    await seedAccountTypes(prisma);
    await seedPermissions();
    await seedRoles();
    await seedRolePermissions();
    await ensureAdminUser(prisma);
    await seedGroups();
    await seedGroupRoles();
    await seedDropdowns(prisma);
    // 🔥 Create default group ONCE
    const defaultGroup  = await seedClientGroups(prisma);
    // 🔥 Pass prisma + defaultGroup to all seeders    
    await seedUsers(prisma, defaultGroup);
    await seedAssetIssues(prisma, defaultGroup);
    console.log("✅ Seeding complete");
  } catch (e) {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// ✅ ESM-safe "run directly" check
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);

if (process.argv[1] === __filename) {
  seed();
}
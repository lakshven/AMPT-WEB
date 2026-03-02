import bcrypt from "bcrypt";

export async function ensureAdminUser(prisma) {
  const existingAdmin = await prisma.users.findFirst({
    where: { username: "system_admin" },
  });

  if (existingAdmin) {
    console.log("✔ system_admin already exists");
    return;
  }

  let adminRole = await prisma.role.findUnique({
    where: { name: "app_admin" }
  });

  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: { name: "app_admin" }
    });
  }
  const hashedPassword = await bcrypt.hash("Admin@123", 10);
  await prisma.users.create({
    data: {
      firstname: "System",
      lastname: "Admin",
      username: "system_admin",
      email: "admin@system.local",
      password: hashedPassword,
      role: "app_admin",
      role_id: adminRole.id,
      clientGroupId: 1,
      companyId: 1,
      accountTypeId: 2, // Assuming 1 is the default account type
     disabled: false,
    }
  });

  console.log("⭐ Default app_admin created");
}
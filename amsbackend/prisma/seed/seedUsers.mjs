import bcrypt from "bcryptjs";

export async function seedUsers(prisma) {
  const adminEmail = "lakshmiangular8@gmail.com";

  // Check if admin already exists
  const existing = await prisma.users.findUnique({
    where: { email: adminEmail }
  });

  if (existing) {
    console.log("⚠️ App admin already exists. Skipping seeding.");
    return;
  }

  // Fetch role
  const roleRecord = await prisma.role.findUnique({
    where: { name: "app_admin" }
  });

  if (!roleRecord) {
    console.error("❌ Role 'app_admin' not found. Cannot seed admin.");
    return;
  }

  // Fetch accountTypeOption
  const accountTypeOption = await prisma.accountTypeOption.findUnique({
    where: { value: "company" } // app_admin behaves like company type
  });

  if (!accountTypeOption) {
    console.error("❌ AccountTypeOption 'company' not found.");
    return;
  }

  const hashedPassword = await bcrypt.hash("AppAdmin@123", 10);

  await prisma.users.create({
    data: {
      firstname: "System",
      lastname: "Admin",
      username: "app_admin",
      email: adminEmail,
      password: hashedPassword,
      role: roleRecord.name,
      role_id: roleRecord.id,
      accountTypeId: accountTypeOption.id,
      clientGroupId: null,
      companyId: null,
      disabled: false
    }
  });

  console.log("✅ App admin seeded successfully");
}
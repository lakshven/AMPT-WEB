import bcrypt from "bcryptjs";
export async function seedUsers(prisma, defaultGroup) {
  const USERS = [
    {
      firstname: "System",
      lastname: "Admin",
      username: "admin_user",
      email: "admin@example.com",
      role: "company_admin",
      accountType: "company"
    },
    {
      firstname: "Field",
      lastname: "Editor",
      username: "field_editor",
      email: "editor@example.com",
      role: "editor",
      accountType: "company"
    },
    {
      firstname: "Read",
      lastname: "Only",
      username: "viewer_user",
      email: "viewer@example.com",
      role: "viewer",
      accountType: "company"
    },
    {
      firstname: "Personal",
      lastname: "Owner",
      username: "personal_owner",
      email: "owner@example.com",
      role: "personal_owner",
      accountType: "single"
    }
  ];

  const hashedPassword = await bcrypt.hash("Test@123", 10); // Replace with secure password in prod

  for (const user of USERS) {
    const roleRecord = await prisma.role.findUnique({
      where: { name: user.role }
    });

    if (!roleRecord) {
      console.warn(`⚠️ Role '${user.role}' not found. Skipping user ${user.email}`);
      continue;
    }
    // ⭐ FIX: define accountTypeOption BEFORE using it
    const accountTypeOption = await prisma.accountTypeOption.findUnique({
      where: { value: user.accountType }
    });

    if (!accountTypeOption) {
      console.warn(
        `⚠️ AccountTypeOption '${user.accountType}' not found. Skipping user ${user.email}`
      );
      continue;
    }
    await prisma.users.upsert({
      where: { email: user.email },
      update: {},
      create: {
        firstname: user.firstname,
        lastname: user.lastname,
        username: user.username,
        email: user.email,
        password: hashedPassword,
        role: roleRecord.name,
        // ⭐ Correct relation syntax
        roleRef: { connect: { id: roleRecord.id } },
        accountType: { connect: { id: accountTypeOption.id } },
        clientGroup: { connect: { id: defaultGroup.id } }
      }
    });
  }
  console.log("✅ Users seeded successfully");
}
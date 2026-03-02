// seed/clientGroups.mjs

export async function seedClientGroups(prisma) {
  const accessCode = "DEFAULT001"; // ⭐ fixed unique code

  const defaultGroup = await prisma.clientGroup.upsert({
    where: { accessCode },   // ⭐ always unique
    update: {},
    create: {
      name: "Default Client Group",
      accessCode,
    },
  });

  console.log("✅ Default Client Group seeded:");
  console.log(`   Name: ${defaultGroup.name}`);
  console.log(`   Access Code: ${defaultGroup.accessCode}`);

  return defaultGroup;
}
export async function seedAccountTypes(prisma) {
  await prisma.accountTypeOption.createMany({
    data: [
      { value: "single", label: "Single User" },
      { value: "company", label: "Company User" }
    ],
    skipDuplicates: true
  });
}
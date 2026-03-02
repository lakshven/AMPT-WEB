// ✅ dropdowns.mjs
export const DROPDOWN_CATEGORIES = [
  {
    name: "spans",
    values: Array.from({ length: 11 }, (_, i) => i.toString()),
  },
  {
    name: "structuralType",
    values: ["Bridge", "Tunnel", "Culvert"],
  },
  {
    name: "materialType",
    values: ["Steel", "Concrete", "Wood"],
  },
  {
    name: "workItem",
    values: ["Fractures", "Spalled masonry", "Open joints"],
  },
  {
    name: "CL",
    values: Array.from({ length: 10 }, (_, i) => `${i + 1}`),
  },
  {
    name: "CS",
    values: Array.from({ length: 10 }, (_, i) => `${i + 1}`),
  },
  {
    name: "CR",
    values: Array.from({ length: 10 }, (_, i) => `${i + 1}`),
  },
  {
    name: "ML",
    values: Array.from({ length: 10 }, (_, i) => `${i + 1}`),
  },
  {
    name: "MS",
    values: Array.from({ length: 10 }, (_, i) => `${i + 1}`),
  },
  {
    name: "MR",
    values: Array.from({ length: 10 }, (_, i) => `${i + 1}`),
  },
  {
    name: "status",
    values: ["Active", "Inactive", "Under Review", "Complete"],
  },
  {
    name: "carries",
    values: ["Rail over water"],
  },
  {
    name: "possibleConsequence",
    values: ["Loss of Strength", "Loss of Mortar"],
  },
  {
    name: "examRegime",
    values: Array.from({ length: 15 }, (_, i) => `${i + 1} year`),
  },
];

export async function seedDropdowns(prisma) {
  for (const cat of DROPDOWN_CATEGORIES) {
    const created = await prisma.dropdownCategory.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name },
    });

    for (const val of cat.values) {
      await prisma.dropdownValue.upsert({
        where: {
          value_categoryId: {
            value: val,
            categoryId: created.id,
          },
        },
        update: {},
        create: {
          value: val,
          categoryId: created.id,
        },
      });
    }
  }

  console.log("✅ Dropdowns seeded");
}
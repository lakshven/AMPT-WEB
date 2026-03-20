// prisma/seed/dropdowns.mjs

export const DROPDOWN_CATEGORIES = [
  {
    name: "structure_type",
    values: ["Bridge", "Tunnel", "Culvert", "Retaining Wall"],
  },
  {
    name: "spans",
    values: Array.from({ length: 11 }, (_, i) => i.toString()),
  },
  {
    name: "carries",
    values: ["Rail", "Road", "Water", "Farm Access"],
  },
  {
    name: "over",
    values: ["Rail", "Road", "Water", "Farm Access"],
  },
  {
    name: "material_type",
    values: ["Metal", "Masonry", "Concrete", "Timber"],
  },

  // ⭐ Scoring columns
  {
    name: "current_likelihood",   // CL
    values: Array.from({ length: 10 }, (_, i) => `${i + 1}`),
  },
  {
    name: "current_severity",     // CS
    values: Array.from({ length: 10 }, (_, i) => `${i + 1}`),
  },
  {
    name: "current_rating",       // CR = CL × CS → 1–25
    values: Array.from({ length: 25 }, (_, i) => `${i + 1}`),
  },
  {
    name: "mitigation_likelihood", // ML
    values: Array.from({ length: 10 }, (_, i) => `${i + 1}`),
  },
  {
    name: "mitigation_severity",   // MS
    values: Array.from({ length: 10 }, (_, i) => `${i + 1}`),
  },
  {
    name: "mitigation_rating",     // MR = ML × MS → 1–25
    values: Array.from({ length: 25 }, (_, i) => `${i + 1}`),
  },

  {
    name: "status",
    values: ["Active", "Inactive", "Under Review", "Complete"],
  },

  {
    name: "detailed_exam_years",
    values: Array.from({ length: 15 }, (_, i) => `${i + 1}`),
  },
];

// ⭐ REQUIRED EXPORT — fixes your seed error
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

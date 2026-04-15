import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }

export default async function getAllDropdowns(req: Request, res: Response) {
  try {
    // Load all dropdown categories with ONLY active values
    const categories = await prismaClient().dropdownCategory.findMany({
      orderBy: { name: "asc" }, // Keep UI consistent
      include: {
        values: {
          where: { isDeleted: false },
          orderBy: { value: "asc" }
        }
      }
    });

    const dynamicOptions: Record<string, string[]> = {};

    // Categories that should NEVER appear in dropdowns
    const blockedCategories = ["current_rating", "mitigation_rating"];

    categories.forEach((cat: any) => {
      // Skip system-calculated categories
      if (blockedCategories.includes(cat.name)) return;

      // Map values safely
      dynamicOptions[cat.name] = cat.values.map((v: any) => String(v.value));
    });

    // Return clean, validated dropdowns
    res.json(dynamicOptions);

  } catch (err) {
    console.error("Unified dropdown fetch error:", err);
    res.status(500).json({ error: "Failed to load dropdowns" });
  }
}

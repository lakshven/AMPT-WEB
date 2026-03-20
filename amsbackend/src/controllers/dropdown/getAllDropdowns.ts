import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }

export default async function getAllDropdowns(req: Request, res: Response) {
  try {
    // 2️⃣ Load DYNAMIC dropdowns (only non-deleted values)
    const categories = await prismaClient().dropdownCategory.findMany({
      include: {
        values: {
          where: { isDeleted: false },
          orderBy: { value: "asc" }
        }
      }
    });

    const dynamicOptions: Record<string, string[]> = {};

    categories.forEach(((cat: { name: string; values: { value: string }[] }
) => {
      dynamicOptions[cat.name] = cat.values.map((v) => v.value);
    }));

    // 3️⃣  DYNAMIC DROP DOWN
    const finalDropdowns = {
      ...dynamicOptions
    };

    res.json(finalDropdowns);
  } catch (err) {
    console.error("Unified dropdown fetch error:", err);
    res.status(500).json({ error: "Failed to load dropdowns" });
  }
}

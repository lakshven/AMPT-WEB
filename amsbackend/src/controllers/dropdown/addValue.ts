// controllers/dropdown/addValue.ts
import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }
import { logAudit } from "../../models/Audit";

export default async function addValue(req: Request, res: Response) {
  try {
    const rawCategory = req.params.category;
    const category = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory;

    const { value } = req.body;

    if (!value || !category) {
      return res.status(400).json({ error: "Missing category or value" });
    }

    // 1️⃣ Validate category
    const cat = await prismaClient().dropdownCategory.findUnique({
      where: { name: category }
    });

    if (!cat) {
      return res.status(404).json({ error: "Category not found" });
    }

    const actor =
      (req as any).user?.username ||
      (req as any).user?.email ||
      "system";

    const actorUserId = (req as any).user?.id || null;
    const clientGroupId = (req as any).user?.clientGroupId || null;
    const companyId = (req as any).user?.companyId ?? null;   // ← REQUIRED
    // 2️⃣ Prevent duplicates (active)
    const existingActive = await prismaClient().dropdownValue.findFirst({
      where: {
        categoryId: cat.id,
        value,
        isDeleted: false
      }
    });

    if (existingActive) {
      return res.status(400).json({ error: "Value already exists" });
    }

    // 3️⃣ If soft‑deleted → restore instead of creating new
    const existingDeleted = await prismaClient().dropdownValue.findFirst({
      where: {
        categoryId: cat.id,
        value,
        isDeleted: true
      }
    });

    let finalValueId: number | null = null;
    let operation: "create" | "restore" = "create";

    if (existingDeleted) {
      const updated = await prismaClient().dropdownValue.update({
        where: { id: existingDeleted.id },
        data: { isDeleted: false }
      });
      finalValueId = updated.id;
      operation = "restore";
    } else {
      const created = await prismaClient().dropdownValue.create({
        data: {
          value,
          categoryId: cat.id
        }
      });
      finalValueId = created.id;
      operation = "create";
    }

    // 4️⃣ Audit log
    await logAudit({
      action: "dropdown_change",
      targetType: "dropdown_value",
      targetId: finalValueId,
      performedBy: actor,
      actorUserId,
      clientGroupId,
      companyId,
      details: {
        category,
        value,
        operation
      }
    });

    // 5️⃣ Load dynamic dropdowns
    const categories = await prismaClient().dropdownCategory.findMany({
      include: {
        values: {
          where: { isDeleted: false },
          orderBy: { value: "asc" }
        }
      }
    });

    const dynamicOptions: Record<string, string[]> = {};
    categories.forEach((c) => {
      dynamicOptions[c.name] = c.values.map((v) => v.value);
    });


    res.json({
      success: true,
      dropdowns: {
        ...dynamicOptions
      }
    });
  } catch (err) {
    console.error("Add dropdown value error:", err);
    res.status(500).json({ error: "Failed to add value" });
  }
}

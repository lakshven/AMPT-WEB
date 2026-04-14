import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }
import { logAudit } from "../../models/Audit";

export default async function deleteValue(req: Request, res: Response) {
  try {
    const rawCategory = req.params.category;
    const rawValue = req.params.value;

    const category = Array.isArray(rawCategory) ? rawCategory[0] : rawCategory;
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;

    // 1️⃣ Validate category
    const cat = await prismaClient().dropdownCategory.findUnique({
      where: { name: category }
    });

    if (!cat) {
      return res.status(404).json({ error: "Category not found" });
    }

    // 2️⃣ Block deletion for system-calculated categories
    const blockedCategories = ["current_rating", "mitigation_rating"];
    if (blockedCategories.includes(category)) {
      return res.status(400).json({
        error: `Category "${category}" cannot be deleted because it is system‑calculated.`
      });
    }

    // 3️⃣ Find active value
    const existing = await prismaClient().dropdownValue.findFirst({
      where: {
        categoryId: cat.id,
        value,
        isDeleted: false
      }
    });

    if (!existing) {
      return res.status(404).json({
        error: "Value not found or already deleted"
      });
    }

    // 4️⃣ Check if value is used in ASSETS
    const assetsUsingValue = await prismaClient().assets.count({
      where: { [category]: value }
    });

    if (assetsUsingValue > 0) {
      return res.status(400).json({
        error: `Cannot delete. Value "${value}" is used in ${assetsUsingValue} asset records.`
      });
    }

    // 5️⃣ Check if value is used in WORK ITEMS
    const workItemsUsingValue = await prismaClient().workItem.count({
      where: { [category]: value }
    });

    if (workItemsUsingValue > 0) {
      return res.status(400).json({
        error: `Cannot delete. Value "${value}" is used in ${workItemsUsingValue} work item records.`
      });
    }

    // 6️⃣ PERMANENT DELETE (not soft delete)
    await prismaClient().dropdownValue.delete({
      where: { id: existing.id }
    });

    const actor =
      (req as any).user?.username ||
      (req as any).user?.email ||
      "system";

    // 7️⃣ Audit log
    await logAudit({
      action: "dropdown_change",
      targetType: "dropdown_value",
      targetId: existing.id,
      performedBy: actor,
      actorUserId: (req as any).user?.id || null,
      clientGroupId: (req as any).user?.clientGroupId || null,
      companyId: (req as any).user?.companyId ?? null,
      details: {
        category,
        value,
        operation: "permanent_delete"
      }
    });

    // 8️⃣ Load updated dropdowns
    const categories = await prismaClient().dropdownCategory.findMany({
      include: {
        values: {
          where: { isDeleted: false },
          orderBy: { value: "asc" }
        }
      }
    });

    const dynamicOptions: Record<string, string[]> = {};
    categories.forEach((c: any) => {
      dynamicOptions[c.name] = c.values.map((v: any) => v.value);
    });

    res.json({
      success: true,
      dropdowns: {
        ...dynamicOptions
      }
    });

  } catch (err) {
    console.error("Permanent delete dropdown value error:", err);
    res.status(500).json({ error: "Failed to delete value" });
  }
}

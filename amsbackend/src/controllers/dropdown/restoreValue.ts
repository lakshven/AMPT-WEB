import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }
import { logAudit } from "../../models/Audit";

export default async function restoreValue(req: Request, res: Response) {
  try {
    // 1️⃣ Ensure params are strings
    const category: string = Array.isArray(req.params.category)
      ? req.params.category[0]
      : req.params.category;

    const value: string = Array.isArray(req.params.value)
      ? req.params.value[0]
      : req.params.value;

    // 2️⃣ Validate category
    const cat = await prismaClient().dropdownCategory.findUnique({
      where: { name: category }
    });

    if (!cat) {
      return res.status(404).json({ error: "Category not found" });
    }

    // 3️⃣ Block restore for system-calculated categories
    const blockedCategories = ["current_rating", "mitigation_rating"];
    if (blockedCategories.includes(category)) {
      return res.status(400).json({
        error: `Category "${category}" cannot be restored because it is system‑calculated.`
      });
    }

    // 4️⃣ Find soft-deleted value
    const existing = await prismaClient().dropdownValue.findFirst({
      where: {
        categoryId: cat.id,
        value,
        isDeleted: true
      }
    });

    if (!existing) {
      return res.status(404).json({
        error: "Value not found or not deleted"
      });
    }

    // 5️⃣ Check for duplicate active value
    const duplicate = await prismaClient().dropdownValue.findFirst({
      where: {
        categoryId: cat.id,
        value,
        isDeleted: false
      }
    });

    if (duplicate) {
      return res.status(400).json({
        error: `Cannot restore. Value "${value}" already exists in this category.`
      });
    }

    // 6️⃣ Restore the value
    const restored = await prismaClient().dropdownValue.update({
      where: { id: existing.id },
      data: { isDeleted: false }
    });

    const actor =
      (req as any).user?.username ||
      (req as any).user?.email ||
      "system";

    // 7️⃣ Audit log
    await logAudit({
      action: "dropdown_change",
      targetType: "dropdown_value",
      targetId: restored.id,
      performedBy: actor,
      actorUserId: (req as any).user?.id || null,
      clientGroupId: (req as any).user?.clientGroupId || null,
      companyId: (req as any).user?.companyId ?? null,
      details: {
        category,
        value,
        operation: "restore"
      }
    });

    // 8️⃣ Return updated dropdowns
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
      dynamicOptions[c.name] = c.values.map((v: any) => String(v.value));
    });

    res.json({
      success: true,
      dropdowns: {
        ...dynamicOptions
      }
    });

  } catch (err) {
    console.error("Restore dropdown value error:", err);
    res.status(500).json({ error: "Failed to restore value" });
  }
}

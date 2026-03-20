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

    // 2️⃣ Find active value
    const existing = await prismaClient().dropdownValue.findFirst({
      where: {
        categoryId: cat.id,
        value,
        isDeleted: false
      }
    });

    if (!existing) {
      return res.status(404).json({ error: "Value not found or already deleted" });
    }

    // 3️⃣ Check if value is used in assets
    const assetsUsingValue = await prismaClient().assets.findMany({
      where: {
        [category]: value
      }
    });

    if (assetsUsingValue.length > 0) {
      return res.status(400).json({
        error: `Cannot delete. Value "${value}" is used in ${assetsUsingValue.length} asset records.`
      });
    }

    // 4️⃣ Soft delete
    const deleted = await prismaClient().dropdownValue.update({
      where: { id: existing.id },
      data: { isDeleted: true }
    });
     const actor =
      (req as any).user?.username ||
      (req as any).user?.email ||
      "system";

    // 5️⃣ Audit log
    await logAudit({
      action: "dropdown_change",
      targetType: "dropdown_value",
      targetId: deleted.id,
      performedBy: actor,
      actorUserId: (req as any).user?.id || null,
      clientGroupId: (req as any).user?.clientGroupId || null,
      companyId: (req as any).user?.companyId ?? null,   // ← REQUIRED
      details: {
        category,
        value,
        operation: "delete"
      }
    })
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
    categories.forEach(
      (c: { name: string; values: { value: string }[] }) => {
        dynamicOptions[c.name] = c.values.map(
          (v: { value: string }) => v.value
        );
      }
    );


    // 7️⃣ Merge static + dynamic
    const finalDropdowns: Record<string, any> = {
      ...dynamicOptions
    };

    res.json({
      success: true,
      dropdowns: finalDropdowns
    });
  } catch (err) {
    console.error("Delete dropdown value error:", err);
    res.status(500).json({ error: "Failed to delete value" });
  }
}

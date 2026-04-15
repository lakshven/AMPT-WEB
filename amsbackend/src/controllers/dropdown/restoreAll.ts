import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }
import { logAudit } from "../../models/Audit";

export default async function restoreAll(req: Request, res: Response) {
  try {
    const category: string = Array.isArray(req.params.category)
      ? req.params.category[0]
      : req.params.category;

    // 1️⃣ Validate category
    const cat = await prismaClient().dropdownCategory.findUnique({
      where: { name: category }
    });

    if (!cat) {
      return res.status(404).json({ error: "Category not found" });
    }

    // 2️⃣ Block restore for system-calculated categories
    const blockedCategories = ["current_rating", "mitigation_rating"];
    if (blockedCategories.includes(category)) {
      return res.status(400).json({
        error: `Category "${category}" cannot be restored because it is system‑calculated.`
      });
    }

    // 3️⃣ Fetch deleted values
    const deletedValues = await prismaClient().dropdownValue.findMany({
      where: {
        categoryId: cat.id,
        isDeleted: true
      }
    });

    if (deletedValues.length === 0) {
      return res.status(404).json({
        error: "No deleted values to restore for this category"
      });
    }

    // 4️⃣ Check for duplicates BEFORE restoring
    const activeValues = await prismaClient().dropdownValue.findMany({
      where: {
        categoryId: cat.id,
        isDeleted: false
      }
    });

    const activeSet = new Set(activeValues.map((v: any) => v.value));

    const conflicts = deletedValues.filter((v: any) => activeSet.has(v.value));

    if (conflicts.length > 0) {
      return res.status(400).json({
        error: "Cannot restore deleted values because some already exist.",
        conflicts: conflicts.map((c: any) => c.value)
      });
    }

    // 5️⃣ Restore all deleted values (safe)
    const restored = await prismaClient().dropdownValue.updateMany({
      where: {
        categoryId: cat.id,
        isDeleted: true
      },
      data: {
        isDeleted: false
      }
    });

    const actor =
      (req as any).user?.username ||
      (req as any).user?.email ||
      "system";

    const actorUserId = (req as any).user?.id || null;
    const clientGroupId = (req as any).user?.clientGroupId || null;
    const companyId = (req as any).user?.companyId ?? null;

    // 6️⃣ Audit log
    await logAudit({
      action: "dropdown_change",
      targetType: "dropdown_category",
      targetId: cat.id,
      performedBy: actor,
      actorUserId,
      clientGroupId,
      companyId,
      details: {
        category,
        operation: "restore_all",
        restoredCount: restored.count
      }
    });

    // 7️⃣ Load updated dropdowns
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
    console.error("Restore all dropdown values error:", err);
    res.status(500).json({ error: "Failed to restore all values" });
  }
}

import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }
import getStaticOptions from "./dropDownController";
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

    // 2️⃣ Restore all deleted values
    const result = await prismaClient().dropdownValue.updateMany({
      where: {
        categoryId: cat.id,
        isDeleted: true
      },
      data: {
        isDeleted: false
      }
    });

    if (result.count === 0) {
      return res
        .status(404)
        .json({ error: "No deleted values to restore for this category" });
    }

    const actor =
      (req as any).user?.username ||
      (req as any).user?.email ||
      "system";

    // 3️⃣ Audit log
    await logAudit({
      action: "dropdown_change",
      targetType: "dropdown_category",
      targetId: cat.id,
      performedBy: actor,
      actorUserId: (req as any).user?.id || null,
      clientGroupId: (req as any).user?.clientGroupId || null,
      companyId: (req as any).user?.companyId ?? null,   // ← REQUIRED
      details: {
        category,
        operation: "restore_all",
        restoredCount: result.count
      }
    });



    // 4️⃣ Load updated dropdowns
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

    // Load static dropdowns
    const staticOptions = await (async (): Promise<Record<string, any>> => {
      return new Promise((resolve) => {
        const fakeReq = {} as Request;
        const fakeRes = {
          json: (data: any) => resolve(data)
        } as unknown as Response;

        getStaticOptions(fakeReq, fakeRes);
      });
    })();

    res.json({
      success: true,
      dropdowns: {
        ...staticOptions,
        ...dynamicOptions
      }
    });
  } catch (err) {
    console.error("Restore all dropdown values error:", err);
    res.status(500).json({ error: "Failed to restore all values" });
  }
}
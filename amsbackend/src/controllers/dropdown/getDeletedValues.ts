import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }

export const getDeletedValues = async (req: Request, res: Response) => {
  try {
    // Ensure category is always a string
    const category: string = Array.isArray(req.params.category)
      ? req.params.category[0]
      : req.params.category;

    // Validate category exists
    const categoryRecord = await prismaClient().dropdownCategory.findUnique({
      where: { name: category }
    });

    if (!categoryRecord) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Fetch ONLY soft-deleted values
    const deletedValues = await prismaClient().dropdownValue.findMany({
      where: {
        categoryId: categoryRecord.id,
        isDeleted: true
      },
      orderBy: { value: "asc" }
    });

    // Return clean list of deleted values
    res.json({
      deleted: deletedValues.map((v: any) => String(v.value))
    });

  } catch (error) {
    console.error("Error fetching deleted values:", error);
    res.status(500).json({ error: "Failed to fetch deleted values" });
  }
};

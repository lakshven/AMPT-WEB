import { Request, Response } from "express";
import prisma from "../../prisma/client";

export const getDeletedValues = async (req: Request, res: Response) => {
  try {
    // Ensure category is always a string
    const category = Array.isArray(req.params.category)
      ? req.params.category[0]
      : req.params.category;

    const categoryRecord = await prisma.dropdownCategory.findUnique({
      where: { name: category }
    });

    if (!categoryRecord) {
      return res.status(404).json({ error: "Category not found" });
    }

    const deletedValues = await prisma.dropdownValue.findMany({
      where: {
        categoryId: categoryRecord.id,
        isDeleted: true
      },
      orderBy: { value: "asc" }
    });

    res.json({ deleted: deletedValues.map(v => v.value) });
  } catch (error) {
    console.error("Error fetching deleted values:", error);
    res.status(500).json({ error: "Failed to fetch deleted values" });
  }
};
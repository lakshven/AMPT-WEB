import { Request, Response } from "express";
import { getPrisma } from "../../../prisma/client";
function prismaClient() { return getPrisma(); }

export const deleteWorkItem = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    await prismaClient().workItem.delete({
      where: { id }
    });

    res.json({ success: true, message: "Work item deleted" });
  } catch (err) {
    console.error("Delete work item error:", err);
    res.status(500).json({ error: "Failed to delete work item" });
  }
};

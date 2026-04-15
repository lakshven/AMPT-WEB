import { Request, Response } from "express";
import { getPrisma } from "../../../prisma/client";
function prismaClient() { return getPrisma(); }

export const getWorkItem = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const item = await prismaClient().workItem.findUnique({
      where: { id }
    });

    if (!item) {
      res.status(404).json({ error: "Work item not found" });
      return;
    }

    res.json({ success: true, workItem: item });
  } catch (err) {
    console.error("Get work item error:", err);
    res.status(500).json({ error: "Failed to fetch work item" });
  }
};

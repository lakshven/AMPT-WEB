import { Request, Response } from "express";
import { getPrisma } from "../../../prisma/client";
function prismaClient() { return getPrisma(); }

export const listWorkItems = async (req: Request, res: Response) => {
  try {
    const assetId = Number(req.params.assetId);

    const items = await prismaClient().workItem.findMany({
      where: { asset_id: assetId },
      orderBy: { current_date_logged: "desc" }
    });

    res.json({ success: true, workItems: items });
  } catch (err) {
    console.error("List work items error:", err);
    res.status(500).json({ error: "Failed to fetch work items" });
  }
};

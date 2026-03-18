import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }

export async function viewAssetDeletionLogsController(
  req: Request,
  res: Response
) {
  try {
    const assetId = Number(req.params.id);

    if (Number.isNaN(assetId)) {
      return res.status(400).json({ message: "Invalid asset id" });
    }
    const isAppAdmin = req.user?.role === "app_admin";
    const isSingle = req.user?.accountType === "single";
    const userGroup = req.user?.clientGroupId;

    // Fetch asset to validate ownership
    const asset = await prismaClient().assets.findUnique({
      where: { id: assetId },
      select: { clientGroupId: true }
    });

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }
   
    // Tenant isolation rules
    if (!isAppAdmin) {
      // single_user → only null-group assets
      if (isSingle && asset.clientGroupId !== null) {
        return res.status(403).json({ message: "Not allowed to view logs for this asset" });
      }

      // company users → only their own group
      if (!isSingle && asset.clientGroupId !== userGroup) {
        return res.status(403).json({ message: "Not allowed to view logs for this asset" });
      }
    }


    const logs = await prismaClient().asset_deletion_log.findMany({
      where: { asset_id: assetId },
      orderBy: { deleted_at: "desc" },
    });

    return res.json({ logs });
  } catch (err) {
    console.error("Asset deletion log error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
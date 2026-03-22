import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }
import { logAudit } from "../../models/Audit";
export async function exportAssetController(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const isAppAdmin = req.user?.role === "app_admin";
    const isSingle = req.user?.accountType === "single";
    const userGroup = req.user?.clientGroupId;
    const userCompanyId = req.user?.companyId;
    const user = req.user!;

    let asset;

    if (isAppAdmin) {
      asset = await prismaClient().assets.findUnique({ where: { id } });
    } else if (isSingle) {
      asset = await prismaClient().assets.findFirst({
        where: { id, clientGroupId: null }
      });
    } else {
      asset = await prismaClient().assets.findFirst({
        where: { id, clientGroupId: userGroup }
      });
    }
    
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }
    // ⭐ Critical tenant isolation: company boundary
    if (!isAppAdmin) {
      if (!userCompanyId) {
        return res.status(403).json({ message: "User has no company assigned" });
      }
      if (asset.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Not allowed to export this asset" });
      }
    }
    // ⭐⭐⭐ AUDIT LOGGING ADDED HERE ⭐⭐⭐
    await logAudit({
      action: "export",
      targetType: "asset",
      targetId: id,
      performedBy: user.username,
      clientGroupId: asset.clientGroupId,   // correct for all roles
      companyId: asset.companyId,           // correct for all roles
      metadata: {
        exported: true
      }
    });


    return res.json({ message: "Asset export successful", asset });
  } catch (err) {
    console.error("Export asset error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
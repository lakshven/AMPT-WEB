import { Request, Response } from "express";
import  prisma  from "../../prisma/client";
import { logAudit } from "../../models/Audit";
export async function exportAssetController(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    const isAppAdmin = req.user?.role === "app_admin";
    const userGroup = req.user?.clientGroupId;
    const user = req.user!;

    let asset;

    if (isAppAdmin) {
      asset = await prisma.assets.findUnique({ where: { id } });
    } else if (req.user?.accountType === "single") {
      asset = await prisma.assets.findFirst({
        where: { id, clientGroupId: null }
      });
    } else {
      asset = await prisma.assets.findFirst({
        where: { id, clientGroupId: userGroup }
      });
    }
    
    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
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
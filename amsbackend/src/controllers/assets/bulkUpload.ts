import { Request, Response } from "express";
import { logAudit } from "../../models/Audit";
export async function bulkUploadAssetsController(req: Request, res: Response) {
  const user = req.user!;
  try {
    const isAppAdmin = req.user?.role === "app_admin";
    const isSingle = req.user?.accountType === "single";
    const userGroup = req.user?.clientGroupId;

    // Company users MUST have a clientGroupId
    if (!isAppAdmin && !isSingle && userGroup == null) {
      return res.status(400).json({ message: "Missing client group on user" });
    }
  
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    // ⭐⭐⭐ AUDIT LOGGING ADDED HERE ⭐⭐⭐
    await logAudit({
      action: "bulk_upload",
      targetType: "asset",
      targetId: 0, // bulk upload affects multiple assets
      performedBy: user.username,
      clientGroupId: isSingle ? null : (userGroup ?? null),
      companyId: user.companyId ?? null,
      metadata: {
        filename: req.file.filename,
        mimetype: req.file.mimetype,
        size: req.file.size
      }
    });

    return res.json({ message: "Bulk upload processed successfully" });
  } catch (err) {
    console.error("Bulk upload error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { getPrisma } from "../../prisma/client";
import { deleteFile as removeFile } from "../../services/storageService";
import { logAudit } from "../../models/Audit";

function prismaClient() {
  return getPrisma();
}

// Allowed file columns in DB
const VALID_COLUMNS = [
  "visual_report",
  "detailed_report",
  "assessment",
  "records"
] as const;

type FileColumn = typeof VALID_COLUMNS[number];

export const deleteFileController = async (req: Request, res: Response): Promise<void> => {
  try {
    const assetId = Number(req.params.id);
    const column = req.query.column as FileColumn;
    const user = req.user!;

    // Validate column
    if (!VALID_COLUMNS.includes(column)) {
      res.status(400).json({ success: false, message: "Invalid file column" });
      return;
    }

    // Validate asset ID
    if (!assetId || isNaN(assetId)) {
      res.status(400).json({ success: false, message: "Invalid asset ID" });
      return;
    }

    // Fetch asset
    const asset = await prismaClient().assets.findUnique({
      where: { id: assetId }
    });

    if (!asset) {
      res.status(404).json({ success: false, message: "Asset not found" });
      return;
    }

    // Permission checks
    const isAppAdmin = user.role === "app_admin";
    const isSingle = user.accountType === "single";
    const isCompany = user.accountType === "company";

    if (!isAppAdmin) {
      if (!user.companyId || asset.companyId !== user.companyId) {
        res.status(403).json({ success: false, message: "Not allowed to modify this asset" });
        return;
      }

      if (isSingle && asset.clientGroupId !== null) {
        res.status(403).json({ success: false, message: "Not allowed to modify this asset" });
        return;
      }

      if (
        isCompany &&
        asset.clientGroupId !== null &&
        asset.clientGroupId !== user.clientGroupId
      ) {
        res.status(403).json({ success: false, message: "Not allowed to modify this asset" });
        return;
      }
    }

    // Get current file path
    const currentPath = asset[column] as string | null;

    if (!currentPath) {
      res.status(400).json({ success: false, message: "No file exists to delete" });
      return;
    }

    // ⭐ Convert DB relative path → absolute filesystem path
    const absolutePath = path.join(process.cwd(), currentPath);

    // ⭐ Delete file safely (no crash if file missing)
    try {
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    } catch (err) {
      console.error("File deletion error:", err);
      // continue — we still clear DB even if file missing
    }

    // Clear DB field
    await prismaClient().assets.update({
      where: { id: assetId },
      data: {
        [column]: null
      }
    });

    // Audit log
    await logAudit({
      action: "delete",
      targetType: "asset_file",
      targetId: assetId,
      performedBy: user.username,
      actorUserId: user.id,
      clientGroupId: asset.clientGroupId,
      companyId: asset.companyId ?? null,
      details: {
        column,
        message: `Deleted file from column: ${column}`
      },
      metadata: {
        role: user.role,
        accountType: user.accountType
      }
    });

    res.json({
      success: true,
      message: `File deleted successfully from ${column}`
    });

  } catch (err) {
    console.error("Delete file error:", err);
    res.status(500).json({ success: false, message: "Failed to delete file" });
  }
};

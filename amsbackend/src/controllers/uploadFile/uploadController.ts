import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }
import { saveFile } from "../../services/storageService";
// Shared type for allowed upload columns
type AssetColumn =
  | "visual_report"
  | "detailed_report"
  | "assessment"
  | "records";


export async function uploadFile(req: Request, res: Response) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { rowId, column } = req.body as {
      rowId?: string;
      column?: AssetColumn;
    };
    // Multer stores files in req.files when using upload.fields()
    const files = req.files as { [key: string]: Express.Multer.File[] };
    const file = column ? files[column]?.[0] : undefined;
    if (!file  || !column || !rowId) {
      return res.status(400).json({
        success: false,
        message: "Missing file, rowId, or column",
      });
    }
    const numericRowId = Number(rowId);
    if (
      !Number.isInteger(numericRowId) ||
      numericRowId <= 0 ||
      numericRowId > 2147483647
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid asset ID",
      });
    }
    // 🔒 Load asset for tenant checks
    const asset = await prismaClient().assets.findUnique({
      where: { id: numericRowId },
      select: { companyId: true},
    });

    if (!asset) {
      return res.status(404).json({
        success: false,
        message: "Asset not found",
      });
    }

    // 🔒 Tenant checks
    if (user.role !== "app_admin") {
      if (user.accountType === "single") {
          return res.status(403).json({ success: false, message: "Single Users cannot upload files" });
      } 
     if (user.accountType === "company") {
        if (asset.companyId !== user.companyId) {
          return res.status(403).json({ success: false, message: "Access denied" });
        }
      }
    }
    // ⭐ STEP 3 — Load file column separately
    const assetFiles = await prismaClient().assets.findUnique({
      where: { id: numericRowId },
      select: { [column]: true },
    });
    
// ⭐ NEW — Convert DB value to array
    const rawValue = assetFiles?.[column] as unknown;

    let existingFiles: string[] = [];

if (Array.isArray(rawValue)) {
  if (rawValue.every((v) => typeof v === "string")) {
    existingFiles = rawValue as string[];
  }
} else if (typeof rawValue === "string") {
  existingFiles = [rawValue];
} else {
  existingFiles = [];
}

// Save file to disk (with validation inside)
    const savedPath = await saveFile(file, column);
    // Multer gives us the actual filename
    const fileNameOnly = file.filename;
    let updatedFiles: string[];
     
    if (column === "records") {
      // ⭐ MULTI-FILE APPEND
      if (existingFiles.length >= 20) {
        return res.status(400).json({
          success: false,
          message: "Maximum 20 files allowed for records",
        });
      }

      updatedFiles = [...existingFiles, fileNameOnly];
    } else {
      // ⭐ SINGLE-FILE COLUMNS
      if (existingFiles.length >= 1) {
        return res.status(400).json({
          success: false,
          message: "Only one file allowed. Delete the existing file first.",
        });
      }

      updatedFiles = [fileNameOnly];
    }
    // Update DB
    const updated = await prismaClient().assets.update({
      where: { id: numericRowId },
      data: { [column]: updatedFiles },
    });

    return res.json({
      success: true,
      message: "File uploaded successfully",
      fileUrl: savedPath,
      files: updatedFiles,
      asset: updated,
    });
  } catch (error: any) {
    console.error("Upload error:", error);

    if (error.message === "Invalid file type") {
      return res.status(400).json({
        success: false,
        message: "Invalid file type. Only Excel files are allowed.",
      });
    }

    if (error.message === "File too large") {
      return res.status(400).json({
        success: false,
        message: "File too large. Max size is 5 MB.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error uploading file",
    });
  }
}

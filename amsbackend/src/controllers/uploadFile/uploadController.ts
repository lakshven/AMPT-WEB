import { Request, Response } from "express";
import prisma from "../../prisma/client";
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

    const file = req.file;
    const { rowId, column } = req.body as {
      rowId?: string;
      column?: AssetColumn;
    };

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


    // Save file to disk (with validation inside)
    const savedPath = await saveFile(file, column);

    // Update DB
    const updated = await prisma.assets.update({
      where: { id: Number(rowId) },
      data: { [column]: savedPath },
    });

    return res.json({
      success: true,
      message: "File uploaded successfully",
      fileUrl: savedPath,
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
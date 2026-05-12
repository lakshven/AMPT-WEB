import path from "path";
import { Request, Response } from "express";
import { UPLOAD_DIRS } from "../../services/storageService";

export async function downloadFile(req: Request, res: Response) {
  try {
    const { column, fileName } = req.query;

    if (!column || !fileName) {
      return res.status(400).json({
        success: false,
        message: "Missing column or fileName"
      });
    }

    const baseDir = UPLOAD_DIRS[column as keyof typeof UPLOAD_DIRS];
    const filePath = path.join(baseDir, fileName as string);

    // Set headers for download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fileName}"`
    );
    res.setHeader("Content-Type", "application/octet-stream");

    return res.download(filePath);
  } catch (err) {
    console.error("Download error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to download file"
    });
  }
}

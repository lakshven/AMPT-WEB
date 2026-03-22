import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }

export async function setDefaultFile(req: Request, res: Response) {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { rowId, column } = req.body as {
      rowId?: number;
      column?: "exam_report" | "assessment" | "records";
    };

    if ( !column || !rowId) {
      return res.status(400).json({
        success: false,
        message: "Missing  column or rowId",
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
      select: { companyId: true, },
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
          return res.status(403).json({ success: false, message: "Single Users cannot modify assets" });
      } 
     if (user.accountType === "company") {
        if (asset.companyId !== user.companyId) {
          return res.status(403).json({ success: false, message: "Access denied" });
        }
      }
    }

    // Save "default" as the chosen file
    const updated = await prismaClient().assets.update({
      where: { id: Number(rowId) },
      data: { [column]: "default" },
    });

    return res.json({
      success: true,
      message: "Default file selected successfully",
      asset: updated,
    });
  } catch (error) {
    console.error("Default file error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error selecting default file",
    });
  }
}

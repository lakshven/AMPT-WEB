import path from "node:path";
import fs from "fs";
import { Request, Response } from "express";
import { getPrisma } from "../prisma/client";
function prismaClient() { return getPrisma(); }

const rootDir = process.cwd();

const TYPE_CONFIG = {
  exam_report: {
    field: "exam_report",
    baseDir: path.join(rootDir, "uploads", "exam_report"),
    default: path.join(rootDir, "public", "defaults", "Heritage Railways.xlsx"),
  },
  assessment: {
    field: "assessment",
    baseDir: path.join(rootDir, "uploads", "assessment"),
    default: path.join(rootDir, "public", "defaults", "Heritage Railways.xlsx"),
  },
  records: {
    field: "records",
    baseDir: path.join(rootDir, "uploads", "records"),
    default: path.join(rootDir, "public", "defaults", "Heritage Railways.xlsx"),
  },
} as const;

type FileTypeKey = keyof typeof TYPE_CONFIG;

export const streamExcel = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { type, id } = req.params as { type: FileTypeKey; id: string };
    const config = TYPE_CONFIG[type];

    if (!config) {
      res.status(400).json({ message: "Invalid type" });
      return;
    }

    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
      res.status(400).json({ message: "Invalid asset ID" });
      return;
    }

    // ⭐ FIX: Force TypeScript to treat asset as a single object
    const asset = await prismaClient().assets.findFirst({
      where: { id: numericId },
      select: {
        companyId: true,
        [config.field]: true,
      },
    }) as { companyId: number | null; [key: string]: any } | null;

    if (!asset) {
      res.status(404).json({ message: "Asset not found" });
      return;
    }

    // 🔒 Tenant checks
    if (user.role !== "app_admin") {
      if (user.accountType === "single") {
        res.status(403).json({ message: "Single users cannot access assets" });
        return;
      }

      if (user.accountType === "company") {
        if (asset.companyId !== user.companyId) {
          res.status(403).json({ message: "Access denied" });
          return;
        }
      }
    }

    const relPath = asset[config.field] as string | null;
    let filePath: string;

    if (relPath === "default") {
      filePath = config.default;
    } else if (relPath) {
      const safePath = path.join(config.baseDir, path.basename(relPath));
      filePath = fs.existsSync(safePath) ? safePath : config.default;
    } else {
      filePath = config.default;
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `inline; filename="${path.basename(filePath)}"`);

    const stream = fs.createReadStream(filePath);
    stream.on("error", () => res.status(500).end());
    stream.pipe(res);

  } catch (err) {
    console.error("File streaming error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

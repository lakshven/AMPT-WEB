import path from "node:path";
import fs from "fs";
import { Request, Response } from "express";
import prisma from "../prisma/client";

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

type AssetField = typeof TYPE_CONFIG[keyof typeof TYPE_CONFIG]["field"];

export const streamExcel = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, id } = req.params as { type: keyof typeof TYPE_CONFIG; id: string };
    const config = TYPE_CONFIG[type];

    if (!config) {
      res.status(400).json({ message: "Invalid type" });
      return;
    }

    const asset = await prisma.assets.findUnique({
      where: { id: Number(id) },
      select: { [config.field]: true },
    });

    if (!asset) {
      res.status(404).json({ message: "Asset not found" });
      return;
    }

    const relPath = asset[config.field as keyof typeof asset] as unknown as string | null;

    let filePath: string;

    // ⭐ NEW: If user explicitly selected default file
    if (relPath === "default") {
      filePath = config.default;
    } else if (relPath) {
      const safePath = path.join(config.baseDir, path.basename(relPath));
      filePath = fs.existsSync(safePath) ? safePath : config.default;
    }
    else {
      filePath = config.default;
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `inline; filename="${path.basename(filePath)}"`);

    const stream = fs.createReadStream(filePath);

    stream.on("error", (err) => {
      console.error("Stream error:", err);
      res.status(500).end();
    });

    stream.pipe(res);
  } catch (err) {
    console.error("File streaming error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
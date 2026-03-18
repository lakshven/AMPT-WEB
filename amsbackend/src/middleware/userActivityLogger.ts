import { Request, Response, NextFunction } from "express";
import { getPrisma } from "../prisma/client";
function prismaClient() { return getPrisma(); }

export const userActivityLogger = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) return next();

    const now = new Date();

    // Hour bucket (00:00 → 23:00)
    const hour = now.toTimeString().slice(0, 5); // "14:00"

    // Day of week (0 = Sunday → 6 = Saturday)
    const dayOfWeek = now.getDay();

    // Use full URL for accurate category tracking
    const url = req.originalUrl;

    let category = "general";

    if (url.includes("/api/auth/login")) category = "login";
    else if (url.includes("/api/assets")) category = "asset_update";
    else if (url.includes("/api/issues")) category = "issue_creation";
    else if (url.includes("/api/admin/analytics")) category = "admin_activity";

    await prismaClient().userActivity.upsert({
      where: {
        hour_dayOfWeek_category: {
          hour,
          dayOfWeek,
          category
        }
      },
      update: {
        count: { increment: 1 }
      },
      create: {
        hour,
        dayOfWeek,
        category,
        count: 1,
        userId: req.user.id
      }
    });
  } catch (err) {
    console.error("Failed to log user activity", err);
  }

  next();
};
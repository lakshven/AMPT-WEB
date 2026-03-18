import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }
import { logAudit } from "../../models/Audit";
// ⭐ Unified filter builder (matches Asset Log Table)
function buildDashboardWhere(req: Request) {
  const { clientGroupId, accountType, role } = req.user ?? {};
  const isAppAdmin = role === "app_admin";

  if (isAppAdmin) {
    return { is_deleted: false };
  }

  if (accountType === "single") {
    return {
      is_deleted: false,
      clientGroupId: null
    };
  }

  return {
    is_deleted: false,
    OR: [
      { clientGroupId: clientGroupId },
      { clientGroupId: null }
    ]
  };
}

// ------------------------------------------------------------
// SIMPLE STATS
// ------------------------------------------------------------
export async function getDashboardStats(req: Request, res: Response): Promise<void> {
  try {
    const where = buildDashboardWhere(req);

    const total = await prismaClient().assets.count({ where });
    // ⭐ Audit log
    await logAudit({
      action: "view",
      targetType: "dashboard",
      targetId: 0,
      performedBy: req.user!.username,
      clientGroupId: req.user!.clientGroupId ?? null,
      companyId: req.user!.companyId ?? null,
      metadata: { accessed: "stats" }
    });


    res.json({ total });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Dashboard error:", message);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
}
// ------------------------------------------------------------
// FULL METRICS
// ------------------------------------------------------------
export async function getDashboardMetrics(req: Request, res: Response): Promise<void> {
  try {
    const where = buildDashboardWhere(req);
    // ⭐ Total assets
    const total = await prismaClient().assets.count({ where });
    // ⭐ Completed assets
    const completed = await prismaClient().assets.count({
      where: { ...where, status: "completed" }
    });
    // ⭐ Open assets
    const open = await prismaClient().assets.count({
      where: { ...where, status: "open" }
    });
    // ⭐ Highest risk rating
    const highestRisk = await prismaClient().assets.findFirst({
      where,
      orderBy: { riskRating: "desc" },
      select: { riskRating: true }
    });
    // ⭐ PRIORITIES (AssetIssue)
    const issueWhere =
      req.user?.role === "app_admin"
        ? { status: { not: "completed" } }
        : {
            status: { not: "completed" },
            OR: [
              { clientGroupId: req.user?.clientGroupId },
              { clientGroupId: null }
            ]
          };

    const issues = await prismaClient().assetIssue.findMany({
      where: issueWhere,
      orderBy: { score: "desc" },
      take: 5,
      include: {
        asset: {
          select: {
            id: true,
            structure_name: true,
            structure_no: true,
            location: true
          }
        }
      }
    });

    const topIssues = issues.map((i: typeof issues[number]) => ({
      id: i.id,
      assetId: i.assetId,
      code: i.asset?.structure_no || "",
      title: i.asset?.structure_name || "",
      issue: i.issue,
      score: i.score,
      mitigation: i.mitigation,
      status: i.status,
      asset: {
        id: i.asset?.id,
        structure_name: i.asset?.structure_name,
        location: i.asset?.location
      }
    }));
    // ⭐ Audit log
    await logAudit({
      action: "view",
      targetType: "dashboard",
      targetId: 0,
      performedBy: req.user!.username,
      clientGroupId: req.user!.clientGroupId ?? null,
      companyId: req.user!.companyId ?? null,
      metadata: { accessed: "metrics" }
    });
    res.json({
      metrics: {
        total,
        completed,
        open,
        risk: highestRisk?.riskRating ?? null
      },
      priorities: topIssues,
      mapUrl:
        process.env.MAP_EMBED_URL ||
        "https://www.google.com/maps/embed?pb=..."
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Dashboard error:", message);
    res.status(500).json({ error: "Server error", details: message });
  }
}

// ------------------------------------------------------------
// ⭐ NEW: ROUTE‑ORDERED MAP ASSETS
// ------------------------------------------------------------
export async function getDashboardRouteAssets(req: Request, res: Response): Promise<void> {
  try {
    const where = buildDashboardWhere(req);

    const assets = await prismaClient().assets.findMany({
      where: {
        ...where,
        latitude: { not: null },
        longitude: { not: null }
      },
      orderBy: { routeOrder: "asc" },
      select: {
        id: true,
        structure_no: true,
        structure_name: true,
        location: true,      // ⭐ ADDED
        riskRating: true,    // ⭐ ADDED
        latitude: true,
        longitude: true,
        routeOrder: true
      }
    });

    // ⭐ Audit log
    await logAudit({
      action: "view",
      targetType: "dashboard",
      targetId: 0,
      performedBy: req.user!.username,
      clientGroupId: req.user!.clientGroupId ?? null,
      companyId: req.user!.companyId ?? null,
      metadata: { accessed: "routeAssets" }
    });

    res.json({ assets });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Dashboard route error:", message);
    res.status(500).json({ error: "Failed to fetch route assets" });
  }
}


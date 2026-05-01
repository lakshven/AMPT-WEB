import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }
import { logAudit } from "../../models/Audit";

// ------------------------------------------------------------
// UNIFIED TENANT FILTER (matches Asset Log Table)
// ------------------------------------------------------------
function buildDashboardWhere(req: Request) {
  const { clientGroupId, accountType, role } = req.user ?? {};
  const isAppAdmin = role === "app_admin";

  if (isAppAdmin) {
    return { isDeleted: false };
  }

  if (accountType === "single") {
    return {
      isDeleted: false,
      clientGroupId: null
    };
  }

  return {
    isDeleted: false,
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
// FULL METRICS (UPDATED FOR OPTION 2)
// ------------------------------------------------------------
export async function getDashboardMetrics(req: Request, res: Response): Promise<void> {
  try {
    const assetFilter = buildDashboardWhere(req);

    // ⭐ TOTAL TASKS (WorkItems)
    const total = await prismaClient().workItem.count({
      where: { asset: assetFilter }
    });

    // ⭐ COMPLETED TASKS
    const completed = await prismaClient().workItem.count({
      where: {
        asset: assetFilter,
        status: "Completed"
      }
    });

    // ⭐ OPEN TASKS
    const open = await prismaClient().workItem.count({
      where: {
        asset: assetFilter,
        status: "Open"
      }
    });

    // ⭐ HIGH‑RISK TASKS (CR ≥ 7)
    const highRisk = await prismaClient().workItem.count({
      where: {
        asset: assetFilter,
        current_rating: { gte: 7 }
      }
    });

    // ⭐ TOP PRIORITIES (CR‑BASED)
    const topWorkItems = await prismaClient().workItem.findMany({
      where: {
        asset: assetFilter,
        current_rating: { gte: 7 },
        status: { not: "Completed" }   // ✅ exclude completed items
      },
      orderBy: { current_rating: "desc" },
      take: 5,
      select: {
        id: true,
        asset_id: true,
        work_item: true,
        possible_consequence: true,
        status: true,
        risk_mitigation_proposals: true,
        current_rating: true,
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

    const topPriorities = topWorkItems.map((wi: any) => ({
      id: wi.id,
      assetId: wi.asset_id,
      code: wi.asset?.structure_no,
      title: wi.asset?.structure_name,
      issue: wi.work_item,
      consequence: wi.possible_consequence,
      risk_mitigation_proposals: wi.risk_mitigation_proposals,
      score: wi.current_rating,
      status: wi.status,
      asset: {
        id: wi.asset?.id,
        structure_name: wi.asset?.structure_name,
        location: wi.asset?.location
      }
    }));

    res.json({
      metrics: {
        total,
        completed,
        open,
        highRisk
      },
      priorities: topPriorities,
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
// ROUTE‑ORDERED MAP ASSETS
// ------------------------------------------------------------
export async function getDashboardRouteAssets(req: Request, res: Response): Promise<void> {
  try {
    const where = buildDashboardWhere(req);

    const assets = await prismaClient().assets.findMany({
      where: {
        ...where,
        isDeleted: false,
        latitude: { not: null },
        longitude: { not: null }
      },
      orderBy: { routeOrder: "asc" },
      select: {
        id: true,
        structure_no: true,
        structure_name: true,
        location: true,
        riskRating: true,
        latitude: true,
        longitude: true,
        routeOrder: true,
        workItems: {
          where: { isDeleted: false },
          select: {
            work_item: true,
            risk_mitigation_proposals: true,
            current_rating: true
          }
        }
      }
    });
    // ⭐ Compute highest CR for each asset
    const enrichedAssets = assets.map((asset: any) => {
      const highestCR = asset.workItems.length
        ? Math.max(...asset.workItems.map((wi: any) => wi.current_rating || 0))
        : null;

      return {
        ...asset,
        highestCR
      };
    });
    await logAudit({
      action: "view",
      targetType: "dashboard",
      targetId: 0,
      performedBy: req.user!.username,
      clientGroupId: req.user!.clientGroupId ?? null,
      companyId: req.user!.companyId ?? null,
      metadata: { accessed: "routeAssets" }
    });

    res.json({ assets: enrichedAssets });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Dashboard route error:", message);
    res.status(500).json({ error: "Failed to fetch route assets" });
  }
}

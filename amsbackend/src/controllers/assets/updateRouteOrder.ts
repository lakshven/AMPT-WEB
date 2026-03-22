// controllers/assets/updateRouteOrder.ts
import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }
import { logAudit } from "../../models/Audit";
// ⭐ NEW: Haversine distance (for metadata only — does NOT affect route order)
function haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export async function updateRouteOrder(req: Request, res: Response): Promise<void> {
  try {
    const { assets } = req.body;
    const user = req.user!;

    if (!Array.isArray(assets) || assets.length === 0) {
      res.status(400).json({ error: "Invalid or empty payload" });
      return;
    }

    // Basic shape validation
    const sanitized = assets
      .filter((a) => a && a.id != null)
      .map((a) => ({
        id: Number(a.id),
        routeOrder: Number(a.routeOrder),
      }))
      .filter((a) => !Number.isNaN(a.id) && !Number.isNaN(a.routeOrder));

    if (sanitized.length === 0) {
      res.status(400).json({ error: "No valid assets in payload" });
      return;
    }
        // ⭐ NEW: Fetch coordinates for distance metadata
    const fullAssets = await prismaClient().assets.findMany({
      where: { id: { in: sanitized.map((s) => s.id) } },
      select: {
        id: true,
        latitude: true,
        longitude: true,
        riskRating: true, // ⭐ NEW: risk metadata
        companyId: true,
        clientGroupId: true,     
      },
    });
    // ⭐ Tenant isolation rules
    const isAppAdmin = user.role === "app_admin";
    const isSingle = user.accountType === "single";
    const isCompany = user.accountType === "company";
    const userCompanyId = user.companyId;
    const userGroupId = user.clientGroupId;
    // Company boundary
    if (!isAppAdmin) {
      const invalidCompany = fullAssets.some(a => a.companyId !== userCompanyId);
      if (invalidCompany) {
        res.status(403).json({ error: "One or more assets do not belong to your company" });
        return;
      }
    }
    // Single user → only null-group assets
    if (!isAppAdmin && isSingle) {
      const invalid = fullAssets.some(a => a.clientGroupId !== null);
      if (invalid) {
        res.status(403).json({ error: "Not allowed to reorder these assets" });
        return;
      }
    }

    // Company user → only their group
    if (!isAppAdmin && isCompany) {
      const invalid = fullAssets.some(a =>
        a.clientGroupId !== null && a.clientGroupId !== userGroupId
      );
      if (invalid) {
        res.status(403).json({ error: "Not allowed to reorder these assets" });
        return;
      }
    }
    // ⭐ NEW: Compute distances between consecutive assets (metadata only)
    const sorted = [...sanitized].sort((a, b) => a.routeOrder - b.routeOrder);
    const distances: number[] = [];

    for (let i = 0; i < sorted.length - 1; i++) {
      const a = fullAssets.find((x) => x.id === sorted[i].id);
      const b = fullAssets.find((x) => x.id === sorted[i + 1].id);

      if (
        a?.latitude != null &&
        a?.longitude != null &&
        b?.latitude != null &&
        b?.longitude != null
      ) {
        distances.push(
          haversine(
            Number(a.latitude),
            Number(a.longitude),
            Number(b.latitude),
            Number(b.longitude)
          )
        );
      } else {
        distances.push(0);
      }
    }
   
    // Bulk update in a transaction
    await prismaClient().$transaction(
      sanitized.map((item) =>
        prismaClient().assets.update({
          where: { id: item.id },
          data: { routeOrder: item.routeOrder },
        })
      )
    );

    // Audit log with richer metadata
    await logAudit({
      action: "update",
      targetType: "routeOrder",
      targetId: 0,
      performedBy: user.username,
      clientGroupId: user.clientGroupId ?? null,
      companyId: user.companyId ?? null,
      
      metadata: {
        count: sanitized.length,
        routeChanges: sanitized,
        distancesBetweenPoints: distances, // ⭐ NEW
        totalDistance: distances.reduce((a, b) => a + b, 0), // ⭐ NEW
        riskRatings: fullAssets.map((a) => ({
          id: a.id,
          riskRating: a.riskRating ?? null,
        })),
        source: "map_route_editor",
      },
    });

    res.json({ success: true, message: "Route order updated successfully" });
  } catch (err) {
    console.error("Route order update error:", err);
    res.status(500).json({ error: "Failed to update route order" });
  }
}
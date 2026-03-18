"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRouteOrder = updateRouteOrder;
const client_1 = require("../../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
const Audit_1 = require("../../models/Audit");
// ⭐ NEW: Haversine distance (for metadata only — does NOT affect route order)
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const toRad = (v) => (v * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
async function updateRouteOrder(req, res) {
    try {
        const { assets } = req.body;
        const user = req.user;
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
            },
        });
        // ⭐ NEW: Compute distances between consecutive assets (metadata only)
        const sorted = [...sanitized].sort((a, b) => a.routeOrder - b.routeOrder);
        const distances = [];
        for (let i = 0; i < sorted.length - 1; i++) {
            const a = fullAssets.find((x) => x.id === sorted[i].id);
            const b = fullAssets.find((x) => x.id === sorted[i + 1].id);
            if (a?.latitude != null &&
                a?.longitude != null &&
                b?.latitude != null &&
                b?.longitude != null) {
                distances.push(haversine(Number(a.latitude), Number(a.longitude), Number(b.latitude), Number(b.longitude)));
            }
            else {
                distances.push(0);
            }
        }
        // Bulk update in a transaction
        await prismaClient().$transaction(sanitized.map((item) => prismaClient().assets.update({
            where: { id: item.id },
            data: { routeOrder: item.routeOrder },
        })));
        // Audit log with richer metadata
        await (0, Audit_1.logAudit)({
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
    }
    catch (err) {
        console.error("Route order update error:", err);
        res.status(500).json({ error: "Failed to update route order" });
    }
}
//# sourceMappingURL=updateRouteOrder.js.map
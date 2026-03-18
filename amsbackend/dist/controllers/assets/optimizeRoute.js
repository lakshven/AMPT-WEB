"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optimizeRoute = optimizeRoute;
const client_1 = require("../../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
const Audit_1 = require("../../models/Audit");
// Haversine formula
function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const toRad = (v) => (v * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
async function optimizeRoute(req, res) {
    try {
        const { assetIds } = req.body;
        if (!Array.isArray(assetIds) || assetIds.length === 0) {
            res.status(400).json({ error: "Invalid assetIds" });
            return;
        }
        const assets = await prismaClient().assets.findMany({
            where: { id: { in: assetIds } },
            select: { id: true, latitude: true, longitude: true },
        });
        const visited = [];
        const remaining = [...assets];
        let current = remaining.shift();
        if (!current || current.latitude == null || current.longitude == null) {
            res.status(400).json({ error: "Missing coordinates" });
            return;
        }
        visited.push(current.id);
        while (remaining.length > 0) {
            let nearestIndex = 0;
            let nearestDistance = Infinity;
            for (let i = 0; i < remaining.length; i++) {
                const candidate = remaining[i];
                if (candidate.latitude != null &&
                    candidate.longitude != null &&
                    current.latitude != null &&
                    current.longitude != null) {
                    const d = haversine(Number(current.latitude), Number(current.longitude), Number(candidate.latitude), Number(candidate.longitude));
                    if (d < nearestDistance) {
                        nearestDistance = d;
                        nearestIndex = i;
                    }
                }
            }
            current = remaining.splice(nearestIndex, 1)[0];
            visited.push(current.id);
        }
        // Update routeOrder for optimized assets
        await prismaClient().$transaction(visited.map((id, index) => prismaClient().assets.update({
            where: { id },
            data: { routeOrder: index + 1 },
        })));
        await (0, Audit_1.logAudit)({
            action: "update",
            targetType: "routeOrder",
            targetId: 0,
            performedBy: req.user.username,
            clientGroupId: req.user.clientGroupId ?? null,
            companyId: req.user.companyId ?? null,
            metadata: {
                optimized: true,
                newOrder: visited,
                source: "optimizeRoute",
            },
        });
        // ⭐ FIX: Return ALL assets with coordinates, not only optimized subset
        const allAssets = await prismaClient().assets.findMany({
            where: {
                latitude: { not: null },
                longitude: { not: null },
                is_deleted: false,
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
            },
        });
        res.json({ assets: allAssets });
    }
    catch (err) {
        console.error("Optimize route error:", err);
        res.status(500).json({ error: "Failed to optimize route" });
    }
}
//# sourceMappingURL=optimizeRoute.js.map
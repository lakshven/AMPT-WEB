"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = getDashboardStats;
exports.getDashboardMetrics = getDashboardMetrics;
exports.getDashboardRouteAssets = getDashboardRouteAssets;
const client_1 = __importDefault(require("../../prisma/client"));
const Audit_1 = require("../../models/Audit");
// ⭐ Unified filter builder (matches Asset Log Table)
function buildDashboardWhere(req) {
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
async function getDashboardStats(req, res) {
    try {
        const where = buildDashboardWhere(req);
        const total = await client_1.default.assets.count({ where });
        // ⭐ Audit log
        await (0, Audit_1.logAudit)({
            action: "view",
            targetType: "dashboard",
            targetId: 0,
            performedBy: req.user.username,
            clientGroupId: req.user.clientGroupId ?? null,
            companyId: req.user.companyId ?? null,
            metadata: { accessed: "stats" }
        });
        res.json({ total });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Dashboard error:", message);
        res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
}
// ------------------------------------------------------------
// FULL METRICS
// ------------------------------------------------------------
async function getDashboardMetrics(req, res) {
    try {
        const where = buildDashboardWhere(req);
        // ⭐ Total assets
        const total = await client_1.default.assets.count({ where });
        // ⭐ Completed assets
        const completed = await client_1.default.assets.count({
            where: { ...where, status: "completed" }
        });
        // ⭐ Open assets
        const open = await client_1.default.assets.count({
            where: { ...where, status: "open" }
        });
        // ⭐ Highest risk rating
        const highestRisk = await client_1.default.assets.findFirst({
            where,
            orderBy: { riskRating: "desc" },
            select: { riskRating: true }
        });
        // ⭐ PRIORITIES (AssetIssue)
        const issueWhere = req.user?.role === "app_admin"
            ? { status: { not: "completed" } }
            : {
                status: { not: "completed" },
                OR: [
                    { clientGroupId: req.user?.clientGroupId },
                    { clientGroupId: null }
                ]
            };
        const issues = await client_1.default.assetIssue.findMany({
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
        const topIssues = issues.map((i) => ({
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
        await (0, Audit_1.logAudit)({
            action: "view",
            targetType: "dashboard",
            targetId: 0,
            performedBy: req.user.username,
            clientGroupId: req.user.clientGroupId ?? null,
            companyId: req.user.companyId ?? null,
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
            mapUrl: process.env.MAP_EMBED_URL ||
                "https://www.google.com/maps/embed?pb=..."
        });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Dashboard error:", message);
        res.status(500).json({ error: "Server error", details: message });
    }
}
// ------------------------------------------------------------
// ⭐ NEW: ROUTE‑ORDERED MAP ASSETS
// ------------------------------------------------------------
async function getDashboardRouteAssets(req, res) {
    try {
        const where = buildDashboardWhere(req);
        const assets = await client_1.default.assets.findMany({
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
                location: true, // ⭐ ADDED
                riskRating: true, // ⭐ ADDED
                latitude: true,
                longitude: true,
                routeOrder: true
            }
        });
        // ⭐ Audit log
        await (0, Audit_1.logAudit)({
            action: "view",
            targetType: "dashboard",
            targetId: 0,
            performedBy: req.user.username,
            clientGroupId: req.user.clientGroupId ?? null,
            companyId: req.user.companyId ?? null,
            metadata: { accessed: "routeAssets" }
        });
        res.json({ assets });
    }
    catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("Dashboard route error:", message);
        res.status(500).json({ error: "Failed to fetch route assets" });
    }
}
//# sourceMappingURL=dashboardController.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchAuditLogs = searchAuditLogs;
const client_1 = __importDefault(require("../../prisma/client"));
async function searchAuditLogs(req, res) {
    try {
        const q = String(req.query.q || "").trim();
        if (!q) {
            return res.json({ logs: [] });
        }
        // Step 1: Search fields Prisma CAN filter
        const logs = await client_1.default.audit.findMany({
            where: {
                OR: [
                    { action: { contains: q, mode: "insensitive" } },
                    { performedBy: { contains: q, mode: "insensitive" } }
                ]
            },
            orderBy: { createdAt: "desc" }
        });
        // Step 2: Search metadata manually (Prisma cannot do this)
        const metadataMatches = await client_1.default.audit.findMany({
            orderBy: { createdAt: "desc" }
        });
        const filteredMetadata = metadataMatches.filter((log) => {
            if (!log.metadata)
                return false;
            try {
                return JSON.stringify(log.metadata)
                    .toLowerCase()
                    .includes(q.toLowerCase());
            }
            catch {
                return false;
            }
        });
        // Step 3: Merge + remove duplicates
        const merged = [...logs, ...filteredMetadata];
        const unique = Array.from(new Map(merged.map((l) => [l.id, l])).values());
        return res.json({ logs: unique });
    }
    catch (err) {
        console.error("Search audit logs error:", err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
//# sourceMappingURL=searchLogs.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSummary = void 0;
const client_1 = require("../../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
const getSummary = async (req, res) => {
    try {
        const { clientGroupId, accountType, role } = req.user ?? {};
        const isAppAdmin = role === "app_admin";
        let whereClause = "";
        if (isAppAdmin) {
            whereClause = "1=1";
        }
        else if (accountType === "single") {
            whereClause = `"clientGroupId" IS NULL`;
        }
        else {
            whereClause = `"clientGroupId" = ${clientGroupId} OR "clientGroupId" IS NULL`;
        }
        const query = `
      SELECT 
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE risk_rating >= 7) AS high_risk
      FROM assets
      WHERE ${whereClause}
    `;
        const result = await prismaClient().$queryRawUnsafe(query);
        const row = result[0] ?? { total: BigInt(0), high_risk: BigInt(0) };
        res.json({
            total: Number(row.total),
            high_risk: Number(row.high_risk)
        });
    }
    catch (err) {
        console.error('Summary fetch error:', err);
        res.status(500).send('Error fetching summary');
    }
};
exports.getSummary = getSummary;
//# sourceMappingURL=summary.js.map
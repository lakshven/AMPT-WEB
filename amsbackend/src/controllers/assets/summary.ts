import { Request, Response } from 'express';
import { getPrisma } from '../../prisma/client';
function prismaClient() { return getPrisma(); }

export const getSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientGroupId, accountType, role, companyId } = req.user ?? {};
    const isAppAdmin = role === "app_admin";

    // ⭐ Build safe WHERE clause with parameters
    const conditions: string[] = [];
    const params: any[] = [];

    // ⭐ Always enforce company boundary unless app admin
    if (!isAppAdmin) {
      conditions.push(`"companyId" = $1`);
      params.push(companyId);
    }

    // ⭐ Group rules (same logic as your original code)
    if (!isAppAdmin) {
      if (accountType === "single") {
        conditions.push(`"clientGroupId" IS NULL`);
      } else {
        conditions.push(`("clientGroupId" = $2 OR "clientGroupId" IS NULL)`);
        params.push(clientGroupId);
      }
    }

    // If admin → no restrictions
    const whereSQL = conditions.length > 0 ? conditions.join(" AND ") : "1=1";

    const query = `
      SELECT 
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE risk_rating >= 7) AS high_risk
      FROM assets
      WHERE ${whereSQL}
    `;

    // ⭐ Prisma‑safe parameterized query
    const result = await prismaClient().$queryRawUnsafe(query, ...params) as {
      total: bigint;
      high_risk: bigint;
    }[];

    const row = result[0] ?? { total: BigInt(0), high_risk: BigInt(0) };

    res.json({
      total: Number(row.total),
      high_risk: Number(row.high_risk)
    });

  } catch (err) {
    console.error('Summary fetch error:', err);
    res.status(500).send('Error fetching summary');
  }
};
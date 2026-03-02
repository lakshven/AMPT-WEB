import { Request, Response } from 'express';
import  prisma  from '../../prisma/client';

export const getSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientGroupId, accountType, role } = req.user ?? {};
    const isAppAdmin = role === "app_admin";

    let whereClause = "";

    if (isAppAdmin) {
      whereClause = "1=1";
    } else if (accountType === "single") {
      whereClause = `"clientGroupId" IS NULL`;
    } else {
      whereClause = `"clientGroupId" = ${clientGroupId} OR "clientGroupId" IS NULL`;
    }
    const query = `
      SELECT 
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE risk_rating >= 7) AS high_risk
      FROM assets
      WHERE ${whereClause}
    `;
   const result = await prisma.$queryRawUnsafe(query) as {
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
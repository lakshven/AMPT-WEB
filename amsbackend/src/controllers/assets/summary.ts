import { Request, Response } from 'express';
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }

export const getSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const { clientGroupId, accountType, role, companyId } = req.user ?? {};
    const isAppAdmin = role === "app_admin";

    // ⭐ Build asset filter (same logic as dashboard)
    const assetFilter: any = { isDeleted: false };

    if (!isAppAdmin) {
      assetFilter.companyId = companyId;

      if (accountType === "single") {
        assetFilter.clientGroupId = null;
      } else {
        assetFilter.OR = [
          { clientGroupId: clientGroupId },
          { clientGroupId: null }
        ];
      }
    }

    // ⭐ Total assets
    const total = await prismaClient().assets.count({
      where: assetFilter
    });

    // ⭐ High‑risk tasks (CR ≥ 7)
    const highRisk = await prismaClient().workItem.count({
      where: {
        asset: assetFilter,
        current_rating: { gte: 7 }
      }
    });

    res.json({
      total,
      highRisk
    });

  } catch (err) {
    console.error('Summary fetch error:', err);
    res.status(500).send('Error fetching summary');
  }
};

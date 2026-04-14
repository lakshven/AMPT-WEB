import { Request, Response } from 'express';
import { restoreAsset } from '../../models/Assets'; // ✅ must be .js for ESM
import { getPrisma } from '../../prisma/client';
function prismaClient() { return getPrisma(); }
import { logAudit } from '../../models/Audit';
export const restoreAssetController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const user = req.user!;
  // ✅ Convert string → number
  const assetId = Number(id);
  if (isNaN(assetId)) {
    res.status(400).json({ success: false, message: 'Invalid asset ID' });
    return;
  }
  const isSingle = req.user?.accountType === "single";
  const isCompany = req.user?.accountType === "company";
  const isAppAdmin = req.user?.role === "app_admin";
  const userGroup = req.user?.clientGroupId;
  const userCompanyId = req.user?.companyId;
  // ⭐ Company users MUST have a group (but NOT app_admin)
  if (!isSingle && !isAppAdmin && (userGroup ===null)) {
    res.status(400).json({ success: false, message: "Missing client group on user" });
    return;
  }

  try {
    // Fetch asset to check ownership
    const existing = await prismaClient().assets.findUnique({
      where: { id: assetId },
      select: { 
        clientGroupId: true, 
        companyId: true,
        structure_no: true,
        structure_name: true,
        isDeleted: true }
    });

    if (!existing) {
      res.status(404).json({ success: false, message: "Asset not found" });
      return;
    }

    if (!existing.isDeleted) {
      res.status(400).json({ success: false, message: "Asset is not deleted" });
      return;
    }
    // ⭐ Critical tenant isolation: company boundary
    if (!isAppAdmin) {
      if (!userCompanyId || existing.companyId !== userCompanyId) {
        res.status(403).json({ success: false, message: "Not allowed to restore this asset" });
        return;
      }
    }
    
   // ⭐ Ownership rules
    if (!isAppAdmin) {
      // single_user → can only restore null-group assets
      if (isSingle && existing.clientGroupId !== null) {
        res.status(403).json({ success: false, message: "Not allowed to restore this asset" });
        return;
      }

      // company users → can only restore assets in their own group
      if (isCompany &&
        existing.clientGroupId !== null &&
        existing.clientGroupId !== userGroup) {
        res.status(403).json({ success: false, message: "Not allowed to restore this asset" });
        return;
      }
    }
    const result = await restoreAsset(assetId, userGroup ?? null, isAppAdmin);

    if (!result) {
      res.status(404).json({
        success: false,
        message: 'Asset not found or not deleted'
      });
      return;
    }
     // ⭐⭐⭐ AUDIT LOGGING ADDED HERE ⭐⭐⭐
    await logAudit({
      action: "restore",
      targetType: "asset",
      targetId: assetId,
      performedBy: user.username,
      actorUserId: user.id,
      clientGroupId: existing.clientGroupId,   // correct for all roles
      companyId: existing.companyId ?? null,
      details: {
        restored: true,
        structure_no: existing.structure_no,
        structure_name: existing.structure_name
      },
      metadata: {
        restoredFromDeleted: true,
        role: user.role,
        accountType: user.accountType
      }
    });

  res.json(result);

  } catch (err) {
    console.error('Restore asset error:', err);
    res.status(500).json({
      success: false,
      message: 'Restore failed'
    });
  }
};

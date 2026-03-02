import prisma  from "../prisma/client";

// Helper: build correct where clause
function buildWhere(clientGroupId: number | null, isDeleted: boolean, isAppAdmin: boolean) {
   if (isAppAdmin) {
    // ⭐ app_admin → sees ALL assets
    return { is_deleted: isDeleted };
  }

  if (clientGroupId === null) {
    // ⭐ single_user → only assets with clientGroupId = null
    return {
      is_deleted: isDeleted,
      clientGroupId: null
    };
  }
  // ⭐ company users → group assets + legacy
  return {
    is_deleted: isDeleted,
    OR: [
      { clientGroupId },
      { clientGroupId: null }
    ] as any
  };
} 
// GET ALL ASSETS
export async function getAssets(clientGroupId: number | null, isAppAdmin: boolean) {
  return prisma.assets.findMany({
    where: buildWhere(clientGroupId, false, isAppAdmin),
    orderBy: { id: "desc" }
  });
}

// GET ASSET BY ID
export async function getAssetById(id: number, clientGroupId: number | null, isAppAdmin: boolean) {
  const asset = await prisma.assets.findFirst({
    where: {
      id,
      ...buildWhere(clientGroupId, false, isAppAdmin)
    }
  });
  if (!asset) {
    return {
      isNewAsset: true,
      asset: null
    };
  }
  return {
    isNewAsset: false,
    asset
  };
}
// CREATE ASSET
export async function createAsset(assetData: any, clientGroupId: number | null, isAppAdmin: boolean) {
  return prisma.assets.create({
    data: {
      elr: assetData.elr,
      structure_no: assetData.structure_no,
      mileage: assetData.mileage,
      structure_type: assetData.structure_type,
      spans: assetData.spans,
      structure_name: assetData.structure_name,
      location: assetData.location,
      carries: assetData.carries,
      material_type: assetData.material_type,
      work_item: assetData.work_item,
      possible_consequence: assetData.possible_consequence,
      current_likelihood: assetData.current_likelihood,
      current_severity: assetData.current_severity,
      current_rating: assetData.current_rating,
      current_date_logged: assetData.current_date_logged,
      risk_mitigation_proposals: assetData.risk_mitigation_proposals,
      mitigation_likelihood: assetData.mitigation_likelihood,
      mitigation_severity: assetData.mitigation_severity,
      mitigation_rating: assetData.mitigation_rating,
      mitigation_completion: assetData.mitigation_completion,
      status: assetData.status,
      detailed_exam_years: assetData.detailed_exam_years,
      last_exam: assetData.last_exam,
      next_exam: assetData.next_exam,
      visual_report: assetData.visual_report,
      detailed_report: assetData.detailed_report,
      assessment: assetData.assessment,
      records: assetData.records,
      riskRating: assetData.risk_rating,
      latitude: assetData.latitude,
      longitude: assetData.longitude,
      clientGroupId: clientGroupId
    }
  });
}
// UPDATE ASSET
export async function updateAsset(id: number, assetData: any, clientGroupId: number | null, isAppAdmin: boolean) {
  const asset = await prisma.assets.findFirst({
    where: {
      id,
      ...buildWhere(clientGroupId, false, isAppAdmin)
    }
  });

  if (!asset) return null;

  return prisma.assets.update({
    where: { id },
    data: {

      structure_no: assetData.structure_no,
      mileage: assetData.mileage,
      structure_type: assetData.structure_type,
      spans: assetData.spans,
      structure_name: assetData.structure_name,
      location: assetData.location,
      carries: assetData.carries,
      material_type: assetData.material_type,
      work_item: assetData.work_item,
      possible_consequence: assetData.possible_consequence,
      current_likelihood: assetData.current_likelihood,
      current_severity: assetData.current_severity,
      current_rating: assetData.current_rating,
      current_date_logged: assetData.current_date_logged,
      risk_mitigation_proposals: assetData.risk_mitigation_proposals,
      mitigation_likelihood: assetData.mitigation_likelihood,
      mitigation_severity: assetData.mitigation_severity,
      mitigation_rating: assetData.mitigation_rating,
      mitigation_completion: assetData.mitigation_completion,
      status: assetData.status,
      detailed_exam_years: assetData.detailed_exam_years,
      last_exam: assetData.last_exam,
      next_exam: assetData.next_exam,
      visual_report: assetData.visual_report,
      detailed_report: assetData.detailed_report,
      assessment: assetData.assessment,
      records: assetData.records,
      riskRating: assetData.risk_rating,
      latitude: assetData.latitude,
      longitude: assetData.longitude
    }
  });
}
// DELETE ASSET (SOFT DELETE)
export async function deleteAsset(id: number, deletedBy: string, clientGroupId: number | null, isAppAdmin: boolean) {
  const asset = await prisma.assets.findFirst({
    where: { 
      id, 
      ...buildWhere(clientGroupId, false, isAppAdmin)
     }
  });

  if (!asset) return null;

  await prisma.assets.update({
    where: { id },
    data: { is_deleted: true }
  });

  await prisma.asset_deletion_log.create({
    data: {
      asset_id: id,
      deleted_by: deletedBy,
      asset_snapshot: asset as any
    }
  });

  const updatedAsset = await prisma.assets.findUnique({ where: { id } });

  return {
    success: true,
    message: "Soft deleted successfully",
    asset: updatedAsset
  };
}
// RESTORE ASSET
export async function restoreAsset(id: number, clientGroupId: number | null, isAppAdmin: boolean) {
  const asset = await prisma.assets.findFirst({
    where: {
      id,
      ...buildWhere(clientGroupId, true, isAppAdmin)
    }
  });

  if (!asset) return null;

  await prisma.assets.update({
    where: { id },
    data: { is_deleted: false }
  });

  const updatedAsset = await prisma.assets.findUnique({ where: { id } });

  return {
    success: true,
    message: "Asset restored successfully",
    asset: updatedAsset
  };
}
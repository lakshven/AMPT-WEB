import { getPrisma } from "../prisma/client";
function prismaClient() { return getPrisma(); }

/* ============================================================
   DELETE ASSET (SOFT DELETE)
   Used by: controllers/assets/remove.ts
   ============================================================ */
export async function deleteAsset(
  id: number,
  deletedBy: string,
  clientGroupId: number | null,
  isAppAdmin: boolean
) {
  // Find asset within tenant boundaries
  const asset = await prismaClient().assets.findFirst({
    where: {
      id,
      isDeleted: false,
      ...(isAppAdmin
        ? {}
        : clientGroupId === null
        ? { clientGroupId: null }
        : { OR: [{ clientGroupId }, { clientGroupId: null }] })
    }
  });

  if (!asset) return null;

  // Soft delete
  await prismaClient().assets.update({
    where: { id },
    data: { isDeleted: true }
  });

  // Log deletion snapshot
  await prismaClient().asset_deletion_log.create({
    data: {
      asset_id: id,
      deleted_by: deletedBy,
      asset_snapshot: asset as any
    }
  });

  const updatedAsset = await prismaClient().assets.findUnique({ where: { id } });

  return {
    success: true,
    message: "Soft deleted successfully",
    asset: updatedAsset
  };
}

/* ============================================================
   RESTORE ASSET
   Used by: controllers/assets/restore.ts
   ============================================================ */
export async function restoreAsset(
  id: number,
  clientGroupId: number | null,
  isAppAdmin: boolean
) {
  // Find deleted asset within tenant boundaries
  const asset = await prismaClient().assets.findFirst({
    where: {
      id,
      isDeleted: true,
      ...(isAppAdmin
        ? {}
        : clientGroupId === null
        ? { clientGroupId: null }
        : { OR: [{ clientGroupId }, { clientGroupId: null }] })
    }
  });

  if (!asset) return null;

  // Restore
  await prismaClient().assets.update({
    where: { id },
    data: { isDeleted: false }
  });

  const updatedAsset = await prismaClient().assets.findUnique({ where: { id } });

  return {
    success: true,
    message: "Asset restored successfully",
    asset: updatedAsset
  };
}

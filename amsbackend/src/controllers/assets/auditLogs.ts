import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }

export async function viewAssetAuditLogsController(req: Request, res: Response) {
  try {
    const assetId = Number(req.params.id);
    if (isNaN(assetId)) {
      return res.status(400).json({ message: "Invalid asset ID" });
    }

    const isAppAdmin = req.user?.role === "app_admin";
    const isSingle = req.user?.accountType === "single";
    const userGroup = req.user?.clientGroupId;
    const userCompanyId = req.user?.companyId;
    // Validate asset ownership
    const asset = await prismaClient().assets.findUnique({
      where: { id: assetId },
      select: { clientGroupId: true, companyId: true }
    });

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }
    // ⭐ Critical tenant isolation: company boundary
    if (!isAppAdmin) {
      if (!userCompanyId) {
        return res.status(403).json({ message: "User has no company assigned" });
      }
      if (asset.companyId !== userCompanyId) {
        return res.status(403).json({ message: "Not allowed to view logs for this asset" });
      }
    }
    if (!isAppAdmin) {
      if (isSingle && asset.clientGroupId !== null) {
        return res.status(403).json({ message: "Not allowed to view logs for this asset" });
      }

      if (!isSingle && asset.clientGroupId !== userGroup) {
        return res.status(403).json({ message: "Not allowed to view logs for this asset" });
      }
    }

    // Direct asset logs
    const directLogs = await prismaClient().audit.findMany({
      where: {
        targetType: "asset",
        targetId: assetId
      },
      orderBy: { createdAt: "desc" }
    });

    // Route-order logs
    const routeOrderLogs = await prismaClient().audit.findMany({
      where: { targetType: "routeOrder" },
      orderBy: { createdAt: "desc" }
    });

    // Safely filter route-order logs
    const filteredRouteLogs = routeOrderLogs.filter((log) => {
      const meta = log.metadata;

      if (!meta || typeof meta !== "object" || Array.isArray(meta)) {
        return false;
      }

      const changes = (meta as any).routeChanges;
      if (!Array.isArray(changes)) {
        return false;
      }

      return changes.some((c: any) => c.id === assetId);
    });

    // Merge + sort
    const logs = [...directLogs, ...filteredRouteLogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return res.json({ logs });
  } catch (err) {
    console.error("Audit log error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}
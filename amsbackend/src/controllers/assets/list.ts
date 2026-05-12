import { Request, Response } from "express";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }
import { getFileUrl } from "../../services/fileService";
import { normalizeLocation } from "../../utils/normalizeLocation";
import { resolveLocation } from "../../services/locationResolver";
/* ============================================================
   GET ASSETS — GROUPED MODE (asset + workItems[])
   ============================================================ */
export const getAssets = async (req: Request, res: Response): Promise<void> => {
  try {
    const includeDeleted = req.query.includeDeleted === "true";
    const search = (req.query.search as string) || "";
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "20", 10);
    const skip = (page - 1) * limit;

    const isSingle = req.user?.accountType === "single";
    const isCompany = req.user?.accountType === "company";
    const isAppAdmin = req.user?.role === "app_admin";
    const userCompanyId = req.user?.companyId;

    // ⭐ ALWAYS use a unified AND array
    const AND: any[] = [];

    /* ============================================================
       TENANT ISOLATION
       ============================================================ */
    if (!isAppAdmin) {
      if (!userCompanyId) {
        res.status(403).json({ message: "User has no company assigned" });
        return;
      }
      AND.push({ companyId: userCompanyId });
    }

    // Deleted filter (applies to all roles)
    AND.push({ isDeleted: includeDeleted });

    if (isSingle) {
      AND.push({ clientGroupId: null });
    }

    if (isCompany) {
      if (!req.user?.clientGroupId) {
        res.status(403).json({ message: "User has no client group assigned" });
        return;
      }

      // ⭐ OR must be nested inside AND
      AND.push({
        OR: [
          { clientGroupId: req.user.clientGroupId },
          { clientGroupId: null }
        ]
      });
    }

    /* ============================================================
       SEARCH
       ============================================================ */
    if (search.trim() !== "") {
      AND.push({
        OR: [
          { structure_no: { contains: search, mode: "insensitive" } },
          { structure_name: { contains: search, mode: "insensitive" } },
          { location: { contains: search, mode: "insensitive" } },
          { carries: { contains: search, mode: "insensitive" } },
          { material_type: { contains: search, mode: "insensitive" } }
        ]
      });
    }

    /* ============================================================
       FILTERS
       ============================================================ */
    const filtersRaw = req.query.filters as string | undefined;
    let filters: Record<string, string> = {};

    if (filtersRaw) {
      try {
        const parsed = JSON.parse(filtersRaw);
        if (parsed && typeof parsed === "object") filters = parsed;
      } catch {
        console.warn("Invalid filters JSON:", filtersRaw);
      }
    }

    const dropdownFields = new Set([
      "structure_type",
      "spans",
      "carries",
      "over",
      "material_type",
      "detailed_exam_years"
    ]);

    const dateFields = new Set(["last_exam", "next_exam"]);

    Object.entries(filters).forEach(([key, value]) => {
      if (!value || String(value).trim() === "") return;

      if (key.endsWith("_from")) {
        const field = key.replace("_from", "");
        if (dateFields.has(field)) {
          AND.push({ [field]: { gte: new Date(value) } });
        }
        return;
      }

      if (key.endsWith("_to")) {
        const field = key.replace("_to", "");
        if (dateFields.has(field)) {
          AND.push({ [field]: { lte: new Date(value) } });
        }
        return;
      }

      if (dropdownFields.has(key)) {
        AND.push({ [key]: { equals: value } });
        return;
      }

      if (dateFields.has(key)) {
        AND.push({ [key]: { equals: new Date(value) } });
        return;
      }

      AND.push({
        [key]: { contains: value, mode: "insensitive" }
      });
    });

    /* ============================================================
       SORTING
       ============================================================ */
    const sortByRaw = (req.query.sortBy as string) || "id";
    const sortOrderRaw = (req.query.sortOrder as string) || "desc";

    const allowedSortFields = [
      "id",
      "elr",
      "structure_no",
      "structure_name",
      "location",
      "last_exam",
      "next_exam"
    ];

    const sortBy = allowedSortFields.includes(sortByRaw) ? sortByRaw : "id";
    const sortOrder: "asc" | "desc" = sortOrderRaw === "asc" ? "asc" : "desc";

    /* ============================================================
       FETCH ASSETS + WORK ITEMS
       ============================================================ */
    const assets = await prismaClient().assets.findMany({
      where: { AND },
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        workItems: {
          orderBy: { current_date_logged: "desc" }
        }
      }
    });
    // ⭐ Convert file names → URLs for ALL assets
    const transformed = assets.map((asset: any) => ({
      ...asset,
      visual_report: Array.isArray(asset.visual_report) ? asset.visual_report : [],
      detailed_report: Array.isArray(asset.detailed_report) ? asset.detailed_report : [],
      records: Array.isArray(asset.records) ? asset.records : [],
      assessment: Array.isArray(asset.assessment) ? asset.assessment : []
   }));
    res.json({
      assets: transformed,
      total: transformed.length,
      page,
      limit
    });

  } catch (err) {
    console.error("Get assets error:", err);
    res.status(500).send("Error fetching assets");
  }
};


/* ============================================================
   GET ASSET LOCATIONS
   ============================================================ */
export const getAssetLocations = async (req: Request, res: Response): Promise<void> => {
  try {
    const isSingle = req.user?.accountType === "single";
    const isCompany = req.user?.accountType === "company";
    const isAppAdmin = req.user?.role === "app_admin";
    const userCompanyId = req.user?.companyId;

    let where: any = { isDeleted: false };

    if (!isAppAdmin) {
      if (!userCompanyId) {
        res.status(403).json({ message: "User has no company assigned" });
        return;
      }
      where.companyId = userCompanyId;
    }

    if (isSingle) {
      where.clientGroupId = null;
    } else if (isCompany) {
      if (!req.user?.clientGroupId) {
        res.status(403).json({ message: "User has no client group assigned" });
        return;
      }
      where.clientGroupId = req.user.clientGroupId;
    }

    const rows = await prismaClient().assets.findMany({
      where,
      select: {
        id: true,
        structure_no: true,
        structure_name: true,
        location: true,
        latitude: true,
        longitude: true
      }
    });

    const assets = await Promise.all(
      rows.map(async (asset: typeof rows[number]) => {
        if ((!asset.latitude || !asset.longitude) && asset.location?.trim() !== "") {
          try {
            const normalizedLocation = normalizeLocation(asset.location);
            const resolved = await resolveLocation(normalizedLocation);
              
              if (resolved.latitude !== null && resolved.longitude !== null) {
              asset.latitude = resolved.latitude;
              asset.longitude = resolved.longitude;

              await prismaClient().assets.update({
                where: { id: asset.id },
                data: { 
                       latitude: resolved.latitude, 
                       longitude: resolved.longitude 
                     }
              });
            }
          } catch (geoErr: any) {
            console.error(`Geocoding failed for ${asset.location}:`, geoErr?.message ?? geoErr);
          }
        }
        return asset;
      })
    );

    res.json(assets);

  } catch (err) {
    console.error("Get asset locations error:", err);
    res.status(500).json({ error: "Failed to fetch asset locations" });
  }
};
export const getAssetById = async (req: Request, res: Response): Promise<void> => {
    try {
    const id = Number(req.params.id);

    const asset = await prismaClient().assets.findUnique({
      where: { id },
      include: {
        workItems: {
          orderBy: { current_date_logged: "desc" }
        }
      }
    });

    if (!asset) {
      res.status(404).json({ success: false, message: "Asset not found" });
      return;
    }
    // ⭐ ADD THESE HEADERS TO STOP 304 CACHING
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      "Pragma": "no-cache",
      "Expires": "0",
    });

    res.json({
      success: true,
      asset: {
        ...asset,
        visual_report: asset.visual_report || [],
        detailed_report: asset.detailed_report || [],
        records: asset.records || [],
        assessment: asset.assessment || []
      }
    });
    } catch (err) {
      console.error("Get asset by ID error:", err);
      res.status(500).json({ success: false, message: "Failed to fetch asset" });
    }
    };

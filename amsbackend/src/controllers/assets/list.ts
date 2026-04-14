import { Request, Response } from "express";
import axios from "axios";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }

import { normalizeLocation } from "../../utils/normalizeLocation";

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

    let where: any = {};

    /* ============================================================
       TENANT ISOLATION
       ============================================================ */
    if (!isAppAdmin) {
      if (!userCompanyId) {
        res.status(403).json({ message: "User has no company assigned" });
        return;
      }
      where.companyId = userCompanyId;
    }

    if (isAppAdmin) {
      where.isDeleted = includeDeleted ? true : false;
    } else if (isSingle) {
      where.clientGroupId = null;
      where.isDeleted = includeDeleted ? true : false;
    } else if (isCompany) {
      if (!req.user?.clientGroupId) {
        res.status(403).json({ message: "User has no client group assigned" });
        return;
      }
      where.OR = [
        { clientGroupId: req.user.clientGroupId },
        { clientGroupId: null }
      ];
      where.isDeleted = includeDeleted ? true : false;
    }

    /* ============================================================
       SEARCH
       ============================================================ */
    const andConditions = [];
    if (search.trim() !== "") {
      andConditions.push({
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
          const existing = where[field] || {};
          where[field] = { ...existing, gte: new Date(value) };
        }
        return;
      }

      if (key.endsWith("_to")) {
        const field = key.replace("_to", "");
        if (dateFields.has(field)) {
          const existing = where[field] || {};
          where[field] = { ...existing, lte: new Date(value) };
        }
        return;
      }

      if (dropdownFields.has(key)) {
        andConditions.push({ [key]: { equals: value } });
        return;
      }

      if (dateFields.has(key)) {
        andConditions.push({ [key]: { equals: new Date(value) } });
        return;
      }

      andConditions.push({
        [key]: { contains: value, mode: "insensitive" }
      });
    });

    if (andConditions.length > 0) {
      where.AND = where.AND ? [...where.AND, ...andConditions] : andConditions;
    }

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
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        workItems: {
          orderBy: { current_date_logged: "desc" }
        }
      }
    });

    res.json({
      assets,
      total: assets.length,
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

            const geoRes = await axios.get(
              "https://nominatim.openstreetmap.org/search",
              {
                params: { q: normalizedLocation, format: "json", limit: 1 },
                headers: { "User-Agent": "AssetManager/1.0 (lakshmiangular8@gmail.com)" }
              }
            );

            if (Array.isArray(geoRes.data) && geoRes.data.length > 0) {
              const lat = geoRes.data[0].lat;
              const lon = geoRes.data[0].lon;

              asset.latitude = lat;
              asset.longitude = lon;

              await prismaClient().assets.update({
                where: { id: asset.id },
                data: { latitude: lat, longitude: lon }
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

import { Request, Response } from "express";
import axios from "axios";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }

import { normalizeLocation } from "../../utils/normalizeLocation";
import { logAudit } from "../../models/Audit";
import { resolveLocation } from "../../services/locationResolver";
import { saveFile, deleteFile, UPLOAD_DIRS } from "../../services/storageService";

type AssetFiles = {
  visual_report?: Express.Multer.File[];
  detailed_report?: Express.Multer.File[];
  assessment?: Express.Multer.File[];
  records?: Express.Multer.File[];
};

export const addAsset = async (req: Request, res: Response): Promise<void> => {
  const user = req.user!;
  const body = req.body;

  const {
    elr,
    structure_no,
    mileage,
    structure_type,
    spans,
    structure_name,
    location,
    carries,
    over,
    material_type,
    detailed_exam_years,
    last_exam,
    next_exam,
    risk_rating,
    workItems
  } = body;

  const files = req.files as AssetFiles | undefined;

  let uploadedFiles: any = {};

  try {
    /* ============================================================
            SAVE FILES
       ============================================================ */
    const saveIfExists = async (fileArr: Express.Multer.File[] | undefined, key: keyof typeof UPLOAD_DIRS) => {
      if (!fileArr?.[0]) return null;
      const saved = await saveFile(fileArr[0], key);
      uploadedFiles[key] = saved;
      return saved;
    };

    const visual_report = await saveIfExists(files?.visual_report, "visual_report");
    const detailed_report = await saveIfExists(files?.detailed_report, "detailed_report");
    const assessment = await saveIfExists(files?.assessment, "assessment");
    // ⭐ MULTI-FILE SUPPORT FOR RECORDS
    let records: string[] = [];

    if (files?.records && Array.isArray(files.records)) {
    for (const file of files.records) {
     const saved = await saveFile(file, "records");
     records.push(saved);
   }
     uploadedFiles["records"] = records;
   }


    /* ============================================================
       GEOCODING
       ============================================================ */
    let lat: number | null = null;
    let lon: number | null = null;

    if (location) {
      try {
        const normalized = await normalizeLocation(location);
        const resolved = await resolveLocation(normalized);

        lat = resolved.latitude ?? null;
        lon = resolved.longitude ?? null;

        //if (lat === null || lon === null) {
          //const geoRes = await axios.get(
           // "https://nominatim.openstreetmap.org/search",
            //{
              //params: { q: normalized, format: "json", limit: 1 },
              //headers: { "User-Agent": "AssetManager/1.0 (support@example.com)" }
            //}
          //);

          //const geoData = geoRes.data?.[0];
          //if (geoData) {
            //lat = Number(geoData.lat) || null;
            //lon = Number(geoData.lon) || null;
          //}
        //}
      } catch (err) {
        console.error("Geocoding error:", err);
      }
    }

    const geocodeWarning = lat === null || lon === null;

    /* ============================================================
       TENANT ISOLATION
       ============================================================ */
    const isAppAdmin = user.role === "app_admin";
    const isCompany = user.accountType === "company";
    const isSingle = user.accountType === "single";

    if (!isAppAdmin && !user.companyId) {
      res.status(403).json({ error: "User has no company assigned" });
      return;
    }

    let finalGroupId: number | null = null;

    if (isSingle) finalGroupId = null;
    else if (isCompany) finalGroupId = user.clientGroupId;
    else if (isAppAdmin) finalGroupId = body.clientGroupId ?? null;

    /* ============================================================
       ROUTE ORDER
       ============================================================ */
    const last = await prismaClient().assets.findFirst({
      where: {
        companyId: user.companyId ?? undefined,
        routeOrder: { not: null }
      },
      orderBy: { routeOrder: "desc" },
      select: { routeOrder: true }
    });

    const nextRouteOrder = last?.routeOrder ? last.routeOrder + 1 : 1;

    const safeDate = (v: any) => {
      if (!v) return null;
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    };

    const parsedRiskRating =
      risk_rating && !isNaN(Number(risk_rating))
        ? Number(risk_rating)
        : null;

    /* ============================================================
       TRANSACTION: CREATE ASSET + WORK ITEMS
       ============================================================ */
    const newAsset = await prismaClient().$transaction(async (tx: any) => {
      const createdAsset = await tx.assets.create({
        data: {
          elr,
          structure_no,
          mileage,
          structure_type,
          spans,
          structure_name,
          location,
          carries,
          over,
          material_type,
          detailed_exam_years,
          last_exam: safeDate(last_exam),
          next_exam: safeDate(next_exam),
          // ⭐ IMPORTANT: always send arrays, never null
          visual_report: visual_report ? [visual_report] : [],
          detailed_report: detailed_report ? [detailed_report] : [],
          assessment: assessment ? [assessment] : [],
          records: records ?? [],

          riskRating: parsedRiskRating,
          latitude: lat,
          longitude: lon,
          geocodeWarning,
          clientGroupId: finalGroupId,
          routeOrder: nextRouteOrder,
          companyId: user.companyId ?? null
        }
      });

      if (Array.isArray(workItems)) {
        for (const wi of workItems) {
          await tx.workItem.create({
            data: {
              // id: wi.id || crypto.randomUUID(),
              asset_id: createdAsset.id,
              work_item: wi.work_item ?? "",
              possible_consequence: wi.possible_consequence ?? "",
              current_likelihood: Number(wi.current_likelihood ?? 1),
              current_severity: Number(wi.current_severity ?? 1),
              current_rating:
                Number(wi.current_likelihood ?? 1) *
                Number(wi.current_severity ?? 1),
              current_date_logged: safeDate(wi.current_date_logged) ?? new Date(),
              risk_mitigation_proposals: wi.risk_mitigation_proposals ?? "",
              mitigation_likelihood: Number(wi.mitigation_likelihood ?? 1),
              mitigation_severity: Number(wi.mitigation_severity ?? 1),
              mitigation_rating:
                Number(wi.mitigation_likelihood ?? 1) *
                Number(wi.mitigation_severity ?? 1),
              mitigation_completion: safeDate(wi.mitigation_completion),
              status: wi.status ?? "Open"
            }
          });
        }
      }

      return createdAsset;
    });

    /* ============================================================
       FETCH FINAL ASSET
       ============================================================ */
    const finalAsset = await prismaClient().assets.findUnique({
      where: { id: newAsset.id },
      include: { workItems: true }
    });

    /* ============================================================
       AUDIT LOG
       ============================================================ */
    await logAudit({
      action: "create",
      targetType: "asset",
      targetId: newAsset.id,
      performedBy: user.username,
      actorUserId: user.id,
      clientGroupId: finalGroupId,
      companyId: user.companyId ?? null,
      details: {
        location,
        geocoded: { latitude: lat, longitude: lon },
        routeOrder: nextRouteOrder
      },
      metadata: {
        createdFields: Object.keys(body),
        uploadedFiles,
        role: user.role,
        accountType: user.accountType
      }
    });

    res.json({
      success: true,
      message: "Asset added successfully",
      asset: finalAsset
    });

  } catch (err) {
    console.error("Add asset error:", err);

    for (const key of Object.keys(uploadedFiles)) {
      deleteFile(uploadedFiles[key]);
    }

    res.status(500).json({ error: "Insert failed" });
  }
};

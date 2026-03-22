import { Request, Response } from "express";
import axios from "axios";
import {getPrisma} from "../../prisma/client";
function prismaClient() { return getPrisma();}
import { normalizeLocation } from "../../utils/normalizeLocation";
import { logAudit } from "../../models/Audit";
import { detectNorthingEasting } from "../../utils/coordinateUtils";
import { resolveLocation } from "../../services/locationResolver";
import { saveFile } from "../../services/storageService";

type AssetFiles = {
  visual_report?: Express.Multer.File[];
  detailed_report?: Express.Multer.File[];
  assessment?: Express.Multer.File[];
  records?: Express.Multer.File[];
};

export const addAsset = async (req: Request, res: Response): Promise<void> => {
  const asset = req.body;
  const user = req.user!;

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
    work_item,
    possible_consequence,
    current_likelihood,
    current_severity,
    current_rating,
    current_date_logged,
    risk_mitigation_proposals,
    mitigation_likelihood,
    mitigation_severity,
    mitigation_rating,
    mitigation_completion,
    status,
    detailed_exam_years,
    last_exam,
    next_exam,
    risk_rating,
  } = req.body;

  const files = req.files as AssetFiles | undefined;

  const visual_report = files?.visual_report?.[0]
    ? await saveFile(files.visual_report[0], "visual_report")
    : null;

  const detailed_report = files?.detailed_report?.[0]
    ? await saveFile(files.detailed_report[0], "detailed_report")
    : null;

  const assessment = files?.assessment?.[0]
    ? await saveFile(files.assessment[0], "assessment")
    : null;

  const records = files?.records?.[0]
    ? await saveFile(files.records[0], "records")
    : null;

  try {
    let lat: number | null = null;
    let lon: number | null = null;

    const ne = location ? detectNorthingEasting(location) : null;
    if (ne) {
      console.log("Detected Northing/Easting (future support):", ne);
    }

    // Geocoding is best-effort; it must not break asset creation
    if (location) {
      try {
        const normalizedLocation = await normalizeLocation(location);

        const resolved = await resolveLocation(normalizedLocation);

        if (resolved.latitude !== null && resolved.longitude !== null) {
          lat = resolved.latitude;
          lon = resolved.longitude;
        }

        if (lat === null || lon === null) {
          const geoRes = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
              params: {
                q: normalizedLocation,
                format: "json",
                limit: 1,
              },
              headers: {
                "User-Agent": "AssetManager/1.0 (lakshmiangular8@gmail.com)",
              },
            }
          );

          const geoData = geoRes.data?.[0];
          if (geoData) {
            const parsedLat = Number(geoData.lat);
            const parsedLon = Number(geoData.lon);
            lat = Number.isNaN(parsedLat) ? null : parsedLat;
            lon = Number.isNaN(parsedLon) ? null : parsedLon;
          } else {
            console.warn(`No geocoding result for: ${normalizedLocation}`);
          }
        }
      } catch (geoErr) {
        console.error("Geocoding error (non-fatal):", geoErr);
      }
    }

    const geocodeWarning = lat === null || lon === null;

    const isSingle = req.user?.accountType === "single";
    const isCompany = req.user?.accountType === "company";
    const isAppAdmin = req.user?.role === "app_admin";
    const userCompanyId = req.user?.companyId;

    // ⭐ Critical tenant isolation: company boundary
    if (!isAppAdmin) {
    if (!userCompanyId) {
       res.status(403).json({ error: "User has no company assigned" });
      return;
      }
    }

    if (isCompany && !isAppAdmin) {
      if (req.user?.clientGroupId == null) {
        res.status(400).json({ error: "Missing client group on user" });
        return;
      }
    }

    let finalGroupId: number | null = null;

    if (isSingle) {
      finalGroupId = null;
    } else if (isCompany) {
      finalGroupId = req.user!.clientGroupId;
    } else if (isAppAdmin) {
      finalGroupId = asset.clientGroupId ?? null;
    }

    const last = await prismaClient().assets.findFirst({
      where: { routeOrder: { not: null } },
      orderBy: { routeOrder: "desc" },
      select: { routeOrder: true },
    });

    const nextRouteOrder = last?.routeOrder ? last.routeOrder + 1 : 1;

    // Safe parsing for risk_rating → riskRating (Int?)
    let parsedRiskRating: number | null = null;
    if (risk_rating !== undefined && risk_rating !== null && risk_rating !== "") {
      const n = Number(risk_rating);
      if (!Number.isNaN(n) && n >= -2147483648 && n <= 2147483647) {
        parsedRiskRating = n;
      } else {
        parsedRiskRating = null;
      }
    }

    const safeDate = (value: any): Date | null => {
      if (!value) return null;
      const d = new Date(value);
      return Number.isNaN(d.getTime()) ? null : d;
    };
    const newAsset = await prismaClient().assets.create({
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
        work_item,
        possible_consequence,
        current_likelihood,
        current_severity,
        current_rating,
        current_date_logged: safeDate(current_date_logged),
        risk_mitigation_proposals,
        mitigation_likelihood,
        mitigation_severity,
        mitigation_rating,
        mitigation_completion: safeDate(mitigation_completion),
        status,
        detailed_exam_years,
        last_exam: safeDate(last_exam),
        next_exam: safeDate(next_exam),
        visual_report,
        detailed_report,
        assessment,
        records,
        riskRating: parsedRiskRating,
        latitude: lat,
        longitude: lon,
        geocodeWarning,
        clientGroupId: finalGroupId,
        routeOrder: nextRouteOrder,
        companyId: user.companyId ?? null,
      },
    });

    await logAudit({
      action: "create",
      targetType: "asset",
      targetId: newAsset.id,
      performedBy: user.username,
      actorUserId: user.id,
      clientGroupId: finalGroupId,
      companyId: user.companyId ?? null,
      details: {
        location: asset.location,
        geocoded: { latitude: lat, longitude: lon },
        routeOrder: nextRouteOrder,
      },
      metadata: {
        createdFields: Object.keys(req.body),
        uploadedFiles: {
          visual_report,
          detailed_report,
          assessment,
          records,
        },
        role: user.role,
        accountType: user.accountType,
      },
    });

    res.json({
      success: true,
      message: "Asset added successfully",
      asset: newAsset,
    });
  } catch (err) {
    console.error("Add asset error:", err);
    res.status(500).json({ error: "Insert failed" });
  }
};

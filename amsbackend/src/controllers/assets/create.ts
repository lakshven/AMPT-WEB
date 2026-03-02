import { Request, Response } from "express";
import axios from "axios";
import prisma from "../../prisma/client";
import { normalizeLocation } from "../../utils/normalizeLocation";
import { logAudit } from "../../models/Audit";
import { detectNorthingEasting } from "../../utils/coordinateUtils";
import { resolveLocation } from "../../services/locationResolver";
import { saveFile } from "../../services/storageService";


// Extend Multer typing
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
    risk_rating
  } = req.body;

  const files = req.files as AssetFiles | undefined;

  // ⭐ Save files using storageService (individual folders)
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

    if (location) {
      const normalizedLocation = await normalizeLocation(location);

      // Step A: Resolve and store ReferenceLocation entry
      const resolved = await resolveLocation(normalizedLocation);

      if (resolved.latitude !== null && resolved.longitude !== null) {
        lat = resolved.latitude;
        lon = resolved.longitude;
      }

      // Only run Nominatim if resolver did NOT return coordinates
      if (lat === null || lon === null) {
        const geoRes = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: {
              q: normalizedLocation,
              format: "json",
              limit: 1
            },
            headers: {
              "User-Agent": "AssetManager/1.0 (lakshmiangular8@gmail.com)"
            }
          }
        );

        const geoData = geoRes.data?.[0];
        if (geoData) {
          lat = Number(geoData.lat) || null;
          lon = Number(geoData.lon) || null;
        } else {
          console.warn(`No geocoding result for: ${normalizedLocation}`);
        }
      }
    }
        const geocodeWarning = lat === null || lon === null;
    const isSingle = req.user?.accountType === "single";
    const isCompany = req.user?.accountType === "company";
    const isAppAdmin = req.user?.role === "app_admin";

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

    const last = await prisma.assets.findFirst({
      where: { routeOrder: { not: null } },
      orderBy: { routeOrder: "desc" },
      select: { routeOrder: true }
    });

    const nextRouteOrder = last?.routeOrder ? last.routeOrder + 1 : 1;
        // ✅ Safe parsing for risk_rating → riskRating (Int?)
    let parsedRiskRating: number | null = null;
    if (risk_rating !== undefined && risk_rating !== null && risk_rating !== "") {
      const n = Number(risk_rating);
      if (!Number.isNaN(n) && n >= -2147483648 && n <= 2147483647) {
        parsedRiskRating = n;
      } else {
        parsedRiskRating = null; // ignore invalid/huge values
      }
    }

    const newAsset = await prisma.assets.create({
      data: {
        elr,
        structure_no,
        mileage,
        structure_type,
        spans,
        structure_name,
        location,
        carries,
        material_type,
        work_item,
        possible_consequence,
        current_likelihood,
        current_severity,
        current_rating,
        current_date_logged: current_date_logged ? new Date(current_date_logged) : null,
        risk_mitigation_proposals,
        mitigation_likelihood,
        mitigation_severity,
        mitigation_rating,
        mitigation_completion: mitigation_completion ? new Date(mitigation_completion) : null,
        status,
        detailed_exam_years,
        last_exam: last_exam ? new Date(last_exam) : null,
        next_exam: next_exam ? new Date(next_exam) : null,
        visual_report,
        detailed_report,
        assessment,
        records,
        riskRating: risk_rating ? Number(risk_rating) : null,
        latitude: lat,
        longitude: lon,
        geocodeWarning,
        clientGroupId: finalGroupId,
        routeOrder: nextRouteOrder
      }
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
        routeOrder: nextRouteOrder
      },
      metadata: {
        createdFields: Object.keys(req.body),
        uploadedFiles: {
          visual_report,
          detailed_report,
          assessment,
          records
        },
        role: user.role,
        accountType: user.accountType
      }
    });

    res.json({
      success: true,
      message: "Asset added successfully",
      asset: newAsset
    });
  } catch (err) {
    console.error("Add asset error:", err);
    res.status(500).json({ error: "Insert failed" });
  }
};
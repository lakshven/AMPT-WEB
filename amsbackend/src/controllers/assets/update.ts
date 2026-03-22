import { Request, Response } from "express";
import axios from "axios";
// import prisma from "../../prisma/client";
import {getPrisma} from "../../prisma/client";
function prismaClient(){return getPrisma();}
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

const safeDate = (value: any): Date | null => {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const updateAsset = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const assetId = Number(id);
    const user = req.user!;
    let geocodeWarning = false;

    if (isNaN(assetId)) {
      res.status(400).json({ error: "Invalid asset ID" });
      return;
    }

    const isSingle = req.user?.accountType === "single";
    const isCompany = req.user?.accountType === "company";
    const isAppAdmin = req.user?.role === "app_admin";
    const userCompanyId = req.user?.companyId;

    const hasGroup =
      req.user?.clientGroupId !== null &&
      req.user?.clientGroupId !== undefined;

    if (isCompany && !isAppAdmin && !hasGroup) {
      res.status(400).json({ error: "Missing client group on user" });
      return;
    }

    const asset = req.body;
    const files = req.files as AssetFiles | undefined;

    const uploaded_visual_report = files?.visual_report?.[0]
      ? await saveFile(files.visual_report[0], "visual_report")
      : null;

    const uploaded_detailed_report = files?.detailed_report?.[0]
      ? await saveFile(files.detailed_report[0], "detailed_report")
      : null;

    const uploaded_assessment = files?.assessment?.[0]
      ? await saveFile(files.assessment[0], "assessment")
      : null;

    const uploaded_records = files?.records?.[0]
      ? await saveFile(files.records[0], "records")
      : null;
    const existing = await prismaClient().assets.findUnique({
      where: { id: assetId },
      select: {
        latitude: true,
        longitude: true,
        location: true,
        clientGroupId: true,
        companyId: true,
        routeOrder: true,
      },
    });

    if (!existing) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }
    // ⭐ Critical tenant isolation: company boundary
    if (!isAppAdmin) {
      if (!userCompanyId || existing.companyId !== userCompanyId) {
        res.status(403).json({ error: "Not allowed to update this asset" });
        return;
      }
    }
    if (!isAppAdmin) {
      if (isSingle && existing.clientGroupId !== null) {
        res.status(403).json({ error: "Not allowed to update this asset" });
        return;
      }

    if (
        isCompany &&
        existing.clientGroupId !== null &&
        existing.clientGroupId !== req.user!.clientGroupId
      ) {
        res.status(403).json({ error: "Not allowed to update this asset" });
        return;
      }
    }

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
      visual_report,
      detailed_report,
      assessment,
      records,
      risk_rating,
      latitude,
      longitude,
    } = asset;
   
    const existingLat = existing?.latitude ?? null;
    const existingLon = existing?.longitude ?? null;
    const existingLocation = existing?.location ?? null;

    let lat: number | null =
      typeof latitude === "string" && latitude.trim() !== ""
        ? Number(latitude)
        : existingLat;

    let lon: number | null =
      typeof longitude === "string" && longitude.trim() !== ""
        ? Number(longitude)
        : existingLon;

    if (Number.isNaN(lat as number)) lat = existingLat;
    if (Number.isNaN(lon as number)) lon = existingLon;

    const ne = detectNorthingEasting(location);
    if (ne) {
      console.log("Detected Northing/Easting (future support):", ne);
    }

    const normalizedLocation = location
      ? await normalizeLocation(location)
      : "";

    const normalizedExistingLocation = existingLocation
      ? await normalizeLocation(existingLocation)
      : "";

    if (normalizedLocation && normalizedLocation.trim() !== "") {
      try {
        const resolved = await resolveLocation(normalizedLocation);
        if (resolved.latitude !== null && resolved.longitude !== null) {
          lat = resolved.latitude;
          lon = resolved.longitude;
        }
      } catch (e) {
        console.warn("Resolver error during update (non-fatal):", e);
      }
    }

    const shouldGeocode =
      normalizedLocation &&
      normalizedLocation.trim() !== "" &&
      normalizedLocation !== normalizedExistingLocation;

    if (shouldGeocode) {
      try {
        const geoRes = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: { q: normalizedLocation, format: "json", limit: 1 },
            headers: {
              "User-Agent": "AssetManager/1.0 (lakshmiangular8@gmail.com)",
            },
          }
        );

        const geoData = geoRes.data?.[0];

        if (geoData) {
          const parsedLat = Number(geoData.lat);
          const parsedLon = Number(geoData.lon);
          lat = Number.isNaN(parsedLat) ? lat : parsedLat;
          lon = Number.isNaN(parsedLon) ? lon : parsedLon;
        } else {
          geocodeWarning = true;
          console.warn(`No geocoding result for: ${normalizedLocation}`);
        }
      } catch (e: any) {
        console.warn("Geocoding failed during update:", e?.message ?? e);
      }
    }

    geocodeWarning = lat === null || lon === null;

    let mapUrl =
      "https://www.google.com/maps/embed?pb=!2m3!1f0!2f0!3f0";

    if (lat !== null && lon !== null) {
      mapUrl = `https://www.google.com/maps?q=${lat},${lon}&z=14&output=embed`;
    }

    const safeRiskRating =
      (() => {
        if (risk_rating === undefined || risk_rating === null || risk_rating === "") return null;
        const n = Number(risk_rating);
        return !Number.isNaN(n) && n >= -2147483648 && n <= 2147483647 ? n : null;
      })();
    const updated = await prismaClient().assets.update({
      where: {
        id: assetId,
      },
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
        visual_report: uploaded_visual_report ?? visual_report,
        detailed_report: uploaded_detailed_report ?? detailed_report,
        assessment: uploaded_assessment ?? assessment,
        records: uploaded_records ?? records,
        riskRating: safeRiskRating,
        latitude: lat,
        longitude: lon,
        geocodeWarning,
      },
    });

    await logAudit({
      action: "update",
      targetType: "asset",
      targetId: assetId,
      performedBy: user.username,
      actorUserId: user.id,
      clientGroupId: existing.clientGroupId,
      companyId: existing.companyId ?? null,
      details: {
        geocodeWarning,
        oldLocation: existingLocation,
        newLocation: location,
        oldLat: existingLat,
        oldLon: existingLon,
        newLat: lat,
        newLon: lon,
      },
      metadata: {
        updatedFields: Object.keys(req.body),
        role: user.role,
        accountType: user.accountType,
      },
    });

    res.json({
      success: true,
      message: "Asset updated successfully",
      asset: updated,
      mapUrl,
      geocodeWarning,
    });
  } catch (err) {
    console.error("Update asset error:", err);
    res.status(500).json({ error: "Update failed" });
  }
};
import { Request, Response } from "express";
import axios from "axios";
import { getPrisma } from "../../prisma/client";
function prismaClient() { return getPrisma(); }

import { normalizeLocation } from "../../utils/normalizeLocation";
import { logAudit } from "../../models/Audit";
import { resolveLocation } from "../../services/locationResolver";
import { saveFile } from "../../services/storageService";

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
    const assetId = Number(req.params.id);
    const user = req.user!;

    const existing = await prismaClient().assets.findUnique({
      where: { id: assetId },
      include: { workItems: true }
    });

    if (!existing) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }

    const isAppAdmin = user.role === "app_admin";
    const isSingle = user.accountType === "single";
    const isCompany = user.accountType === "company";

    if (!isAppAdmin) {
      if (!user.companyId || existing.companyId !== user.companyId) {
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
        existing.clientGroupId !== user.clientGroupId
      ) {
        res.status(403).json({ error: "Not allowed to update this asset" });
        return;
      }
    }
    //  ⭐ BLOCK EDITOR FROM PERMANENT DELETE
    if (
      user.role === "editor" &&
      (req.body._permanentDelete === true || req.body._permanentDelete === "true")
    ) {
       res.status(403).json({
        success: false,
        message: "Editor is not allowed to permanently delete assets"
      });
      return;
    }
    // ⭐ NEW: Handle asset permanent delete
    if (req.body._permanentDelete === true || req.body._permanentDelete === "true") 
     {
      await prismaClient().$transaction(async (tx) => {
      // 1️⃣ Delete work items
      await tx.workItem.deleteMany({
      where: { asset_id: assetId }
    });

    // 2️⃣ Delete asset deletion logs (THIS WAS MISSING)
    await tx.asset_deletion_log.deleteMany({
      where: { asset_id: assetId }
    });

    // 3️⃣ Delete the asset
    await tx.assets.delete({
      where: { id: assetId }
    });
   });

   await logAudit({
    action: "delete",
    targetType: "asset",
    targetId: assetId,
    performedBy: user.username,
    actorUserId: user.id,
    clientGroupId: existing.clientGroupId,
    companyId: existing.companyId ?? null,
    details: {
      reason: "Permanent delete from UI"
    },
    metadata: {
      role: user.role,
      accountType: user.accountType
    }
   });

    res.json({
     success: true,
     message: "Asset permanently deleted"
    });
    return;
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
      detailed_exam_years,
      last_exam,
      next_exam,
      risk_rating,
      workItems
    } = req.body;

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

    // ⭐ MULTI-FILE SUPPORT FOR RECORDS
    let uploaded_records: string[] | undefined = undefined;

    if (files?.records && Array.isArray(files.records)) {
     uploaded_records = [];
     for (const file of files.records) {
       const saved = await saveFile(file, "records");
       uploaded_records.push(saved);
     }
    }


    let lat = existing.latitude;
    let lon = existing.longitude;
    let geocodeWarning = false;

    const normalizedLocation = location ? await normalizeLocation(location) : "";

    if (normalizedLocation && normalizedLocation.trim() !== "") {
      try {
        const resolved = await resolveLocation(normalizedLocation);
        if (resolved.latitude !== null && resolved.longitude !== null) {
          lat = resolved.latitude;
          lon = resolved.longitude;
        } else {
          const geoRes = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
              params: { q: normalizedLocation, format: "json", limit: 1 },
              headers: {
                "User-Agent": "AssetManager/1.0 (support@example.com)"
              }
            }
          );

          const geoData = geoRes.data?.[0];
          if (geoData) {
            lat = Number(geoData.lat) || lat;
            lon = Number(geoData.lon) || lon;
          } else {
            geocodeWarning = true;
          }
        }
      } catch {
        geocodeWarning = true;
      }
    }

    const updatedAsset = await prismaClient().$transaction(async (tx: any) => {
      const updated = await tx.assets.update({
        where: { id: assetId },
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
          visual_report: uploaded_visual_report ?? undefined,
          detailed_report: uploaded_detailed_report ?? undefined,
          assessment: uploaded_assessment ?? undefined,
          records: uploaded_records !== undefined ? uploaded_records : existing.records,
          riskRating:
            risk_rating !== undefined && risk_rating !== null && risk_rating !== ""
              ? Number(risk_rating)
              : null,
          latitude: lat,
          longitude: lon,
          geocodeWarning
        }
      });

      /* ============================================================
         WORK ITEMS — SOFT DELETE + UPDATE + CREATE
         ============================================================ */
      if (Array.isArray(workItems)) {
        const existingWorkItems = existing.workItems;
        const existingIds = new Set<number>(
          existingWorkItems.map((w: any) => Number(w.id))
        );
        const incomingIds = new Set<number>();

        for (const wi of workItems) {
          const rawId = wi.id;
          const numericId =
            rawId !== undefined &&
            rawId !== null &&
            String(rawId).trim() !== "" &&
            !isNaN(Number(rawId))
              ? Number(rawId)
              : null;

          const currentLikelihood = Number(wi.current_likelihood ?? 1);
          const currentSeverity = Number(wi.current_severity ?? 1);
          const mitigationLikelihood = Number(wi.mitigation_likelihood ?? 1);
          const mitigationSeverity = Number(wi.mitigation_severity ?? 1);
          const isDeleted = wi.isDeleted === true;

          if (numericId !== null && existingIds.has(numericId)) {
            incomingIds.add(numericId);

            await tx.workItem.update({
              where: { id: numericId },
              data: {
                work_item: wi.work_item ?? "",
                possible_consequence: wi.possible_consequence ?? "",
                current_likelihood: currentLikelihood,
                current_severity: currentSeverity,
                current_rating: currentLikelihood * currentSeverity,
                current_date_logged:
                  safeDate(wi.current_date_logged) ?? new Date(),
                risk_mitigation_proposals: wi.risk_mitigation_proposals ?? "",
                mitigation_likelihood: mitigationLikelihood,
                mitigation_severity: mitigationSeverity,
                mitigation_rating: mitigationLikelihood * mitigationSeverity,
                mitigation_completion: safeDate(wi.mitigation_completion),
                status: wi.status ?? "Open",
                isDeleted
              }
            });
          } else {
            await tx.workItem.create({
              data: {
                asset_id: assetId,
                work_item: wi.work_item ?? "",
                possible_consequence: wi.possible_consequence ?? "",
                current_likelihood: currentLikelihood,
                current_severity: currentSeverity,
                current_rating: currentLikelihood * currentSeverity,
                current_date_logged:
                  safeDate(wi.current_date_logged) ?? new Date(),
                risk_mitigation_proposals: wi.risk_mitigation_proposals ?? "",
                mitigation_likelihood: mitigationLikelihood,
                mitigation_severity: mitigationSeverity,
                mitigation_rating: mitigationLikelihood * mitigationSeverity,
                mitigation_completion: safeDate(wi.mitigation_completion),
                status: wi.status ?? "Open",
                isDeleted
              }
            });
          }
        }

       //* IDs that existed before but are NOT in incoming list anymore/*}
        //* 👉 These were permanently deleted in the UI/*}
        const toHardDelete = [...existingIds].filter((id) => !incomingIds.has(id));
        if(user.role !== "editor") {
        if (toHardDelete.length > 0) {
          await tx.workItem.deleteMany({
            where: {
              id: { in: toHardDelete },
              asset_id: assetId
            }
          });
        }
      }
     }
      return updated;
    });

    const finalAsset = await prismaClient().assets.findUnique({
      where: { id: assetId },
      include: {
        workItems: {
          orderBy: { current_date_logged: "desc" }
        }
      }
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
        newLocation: location,
        newLat: lat,
        newLon: lon
      },
      metadata: {
        updatedFields: Object.keys(req.body),
        role: user.role,
        accountType: user.accountType
      }
    });

    res.json({
      success: true,
      message: "Asset updated successfully",
      asset: finalAsset,
      geocodeWarning
    });
  } catch (err) {
    console.error("Update asset error:", err);
    res.status(500).json({ error: "Update failed" });
  }
};

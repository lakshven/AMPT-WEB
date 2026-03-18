"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAsset = void 0;
const axios_1 = __importDefault(require("axios"));
const client_1 = require("../../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
const normalizeLocation_1 = require("../../utils/normalizeLocation");
const Audit_1 = require("../../models/Audit");
const coordinateUtils_1 = require("../../utils/coordinateUtils");
const locationResolver_1 = require("../../services/locationResolver");
const storageService_1 = require("../../services/storageService");
const updateAsset = async (req, res) => {
    try {
        const { id } = req.params;
        const assetId = Number(id);
        const user = req.user;
        let geocodeWarning = false;
        if (isNaN(assetId)) {
            res.status(400).json({ error: "Invalid asset ID" });
            return;
        }
        const isSingle = req.user?.accountType === "single";
        const isCompany = req.user?.accountType === "company";
        const isAppAdmin = req.user?.role === "app_admin";
        const hasGroup = req.user?.clientGroupId !== null &&
            req.user?.clientGroupId !== undefined;
        // ⭐ Company users MUST have a clientGroupId (but NOT single_user or app_admin)
        if (isCompany && !isAppAdmin && !hasGroup) {
            res.status(400).json({ error: "Missing client group on user" });
            return;
        }
        const asset = req.body;
        // ⭐ Add this here
        const files = req.files;
        // ⭐ Save new files (if uploaded)
        const uploaded_visual_report = files?.visual_report?.[0]
            ? await (0, storageService_1.saveFile)(files.visual_report[0], "visual_report")
            : null;
        const uploaded_detailed_report = files?.detailed_report?.[0]
            ? await (0, storageService_1.saveFile)(files.detailed_report[0], "detailed_report")
            : null;
        const uploaded_assessment = files?.assessment?.[0]
            ? await (0, storageService_1.saveFile)(files.assessment[0], "assessment")
            : null;
        const uploaded_records = files?.records?.[0]
            ? await (0, storageService_1.saveFile)(files.records[0], "records")
            : null;
        // 1) Fetch existing asset + ownership validation
        const existing = await prismaClient().assets.findUnique({
            where: { id: assetId },
            select: {
                latitude: true,
                longitude: true,
                location: true,
                clientGroupId: true,
                companyId: true,
                routeOrder: true
            }
        });
        if (!existing) {
            res.status(404).json({ error: "Asset not found" });
            return;
        }
        if (!isAppAdmin) {
            // ⭐ single_user → can only update assets with clientGroupId = null
            if (isSingle && existing.clientGroupId !== null) {
                res.status(403).json({ error: "Not allowed to update this asset" });
                return;
            }
            // ⭐ company users → can only update assets in their own group
            if (isCompany &&
                existing.clientGroupId !== null &&
                existing.clientGroupId !== req.user.clientGroupId) {
                res.status(403).json({ error: "Not allowed to update this asset" });
                return;
            }
        }
        const { elr, structure_no, mileage, structure_type, spans, structure_name, location, carries, material_type, work_item, possible_consequence, current_likelihood, current_severity, current_rating, current_date_logged, risk_mitigation_proposals, mitigation_likelihood, mitigation_severity, mitigation_rating, mitigation_completion, status, detailed_exam_years, last_exam, next_exam, visual_report, detailed_report, assessment, records, risk_rating, latitude, longitude } = asset;
        const existingLat = existing?.latitude ?? null;
        const existingLon = existing?.longitude ?? null;
        const existingLocation = existing?.location ?? null;
        // ✅ 2) Prepare lat/lon (prefer incoming, fall back to existing)
        let lat = typeof latitude === "string" && latitude.trim() !== ""
            ? Number(latitude)
            : existingLat;
        let lon = typeof longitude === "string" && longitude.trim() !== ""
            ? Number(longitude)
            : existingLon;
        // Detect future NE coordinates (does NOT change behavior now)
        const ne = (0, coordinateUtils_1.detectNorthingEasting)(location);
        if (ne) {
            console.log("Detected Northing/Easting (future support):", ne);
            // Future: convert NE → lat/lon
        }
        // ✅ 3) Normalize both new + existing locations (for change detection)
        const normalizedLocation = location
            ? await (0, normalizeLocation_1.normalizeLocation)(location)
            : "";
        // ⭐ Step A: Resolve and store ReferenceLocation entry
        if (normalizedLocation && normalizedLocation.trim() !== "") {
            const resolved = await (0, locationResolver_1.resolveLocation)(normalizedLocation);
            // Only override if resolver produced real coordinates
            if (resolved.latitude !== null && resolved.longitude !== null) {
                lat = resolved.latitude;
                lon = resolved.longitude;
            }
        }
        const normalizedExistingLocation = existingLocation
            ? await (0, normalizeLocation_1.normalizeLocation)(existingLocation)
            : "";
        // ✅ 4) Decide if geocoding is needed
        const shouldGeocode = normalizedLocation &&
            normalizedLocation.trim() !== "" &&
            (normalizedLocation !== normalizedExistingLocation);
        if (shouldGeocode) {
            try {
                const geoRes = await axios_1.default.get("https://nominatim.openstreetmap.org/search", {
                    params: { q: normalizedLocation, format: "json", limit: 1 },
                    headers: {
                        "User-Agent": "AssetManager/1.0 (lakshmiangular8@gmail.com)"
                    }
                });
                const geoData = geoRes.data?.[0];
                if (geoData) {
                    lat = Number(geoData.lat) || null;
                    lon = Number(geoData.lon) || null;
                }
                else {
                    geocodeWarning = true;
                    console.warn(`No geocoding result for: ${normalizedLocation}`);
                }
            }
            catch (e) {
                console.warn("Geocoding failed during update:", e.message);
            }
        }
        // ✅ 4.5) Final decision: is this location invalid?
        geocodeWarning = lat === null || lon === null;
        // ✅ 5) Build a map URL that frontend can use
        let mapUrl = "https://www.google.com/maps/embed?pb=!2m3!1f0!2f0!3f0";
        // 📍 If we have coordinates, center map on the asset
        if (lat !== null && lon !== null) {
            mapUrl = `https://www.google.com/maps?q=${lat},${lon}&z=14&output=embed`;
        }
        const safeRiskRating = (() => {
            if (risk_rating === undefined || risk_rating === null || risk_rating === "")
                return null;
            const n = Number(risk_rating);
            return !Number.isNaN(n) && n >= -2147483648 && n <= 2147483647 ? n : null;
        })();
        // ✅ 6) Perform update using Prisma
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
                material_type,
                work_item,
                possible_consequence,
                current_likelihood,
                current_severity,
                current_rating,
                current_date_logged: current_date_logged
                    ? new Date(current_date_logged)
                    : null,
                risk_mitigation_proposals,
                mitigation_likelihood,
                mitigation_severity,
                mitigation_rating,
                mitigation_completion: mitigation_completion
                    ? new Date(mitigation_completion)
                    : null,
                status,
                detailed_exam_years,
                last_exam: last_exam ? new Date(last_exam) : null,
                next_exam: next_exam ? new Date(next_exam) : null,
                // ⭐ Correct file update logic
                visual_report: uploaded_visual_report ?? visual_report,
                detailed_report: uploaded_detailed_report ?? detailed_report,
                assessment: uploaded_assessment ?? assessment,
                records: uploaded_records ?? records,
                // ✅ FIXED — safe risk_rating
                riskRating: safeRiskRating,
                latitude: lat,
                longitude: lon,
                geocodeWarning
            }
        });
        // ⭐⭐⭐ AUDIT LOGGING ADDED HERE ⭐⭐⭐
        await (0, Audit_1.logAudit)({
            action: "update",
            targetType: "asset",
            targetId: assetId,
            performedBy: user.username,
            actorUserId: user.id,
            clientGroupId: existing.clientGroupId, // correct for all roles
            companyId: existing.companyId ?? null,
            details: {
                geocodeWarning,
                oldLocation: existingLocation,
                newLocation: location,
                oldLat: existingLat,
                oldLon: existingLon,
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
            asset: updated,
            mapUrl,
            geocodeWarning
        });
    }
    catch (err) {
        console.error("Update asset error:", err);
        res.status(500).json({ error: "Update failed" });
    }
};
exports.updateAsset = updateAsset;
//# sourceMappingURL=update.js.map
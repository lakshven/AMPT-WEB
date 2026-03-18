"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addAsset = void 0;
const axios_1 = __importDefault(require("axios"));
const client_1 = require("../../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
const normalizeLocation_1 = require("../../utils/normalizeLocation");
const Audit_1 = require("../../models/Audit");
const coordinateUtils_1 = require("../../utils/coordinateUtils");
const locationResolver_1 = require("../../services/locationResolver");
const storageService_1 = require("../../services/storageService");
const addAsset = async (req, res) => {
    const asset = req.body;
    const user = req.user;
    const { elr, structure_no, mileage, structure_type, spans, structure_name, location, carries, material_type, work_item, possible_consequence, current_likelihood, current_severity, current_rating, current_date_logged, risk_mitigation_proposals, mitigation_likelihood, mitigation_severity, mitigation_rating, mitigation_completion, status, detailed_exam_years, last_exam, next_exam, risk_rating } = req.body;
    const files = req.files;
    // ⭐ Save files using storageService (individual folders)
    const visual_report = files?.visual_report?.[0]
        ? await (0, storageService_1.saveFile)(files.visual_report[0], "visual_report")
        : null;
    const detailed_report = files?.detailed_report?.[0]
        ? await (0, storageService_1.saveFile)(files.detailed_report[0], "detailed_report")
        : null;
    const assessment = files?.assessment?.[0]
        ? await (0, storageService_1.saveFile)(files.assessment[0], "assessment")
        : null;
    const records = files?.records?.[0]
        ? await (0, storageService_1.saveFile)(files.records[0], "records")
        : null;
    try {
        let lat = null;
        let lon = null;
        const ne = location ? (0, coordinateUtils_1.detectNorthingEasting)(location) : null;
        if (ne) {
            console.log("Detected Northing/Easting (future support):", ne);
        }
        if (location) {
            const normalizedLocation = await (0, normalizeLocation_1.normalizeLocation)(location);
            // Step A: Resolve and store ReferenceLocation entry
            const resolved = await (0, locationResolver_1.resolveLocation)(normalizedLocation);
            if (resolved.latitude !== null && resolved.longitude !== null) {
                lat = resolved.latitude;
                lon = resolved.longitude;
            }
            // Only run Nominatim if resolver did NOT return coordinates
            if (lat === null || lon === null) {
                const geoRes = await axios_1.default.get("https://nominatim.openstreetmap.org/search", {
                    params: {
                        q: normalizedLocation,
                        format: "json",
                        limit: 1
                    },
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
        let finalGroupId = null;
        if (isSingle) {
            finalGroupId = null;
        }
        else if (isCompany) {
            finalGroupId = req.user.clientGroupId;
        }
        else if (isAppAdmin) {
            finalGroupId = asset.clientGroupId ?? null;
        }
        const last = await prismaClient().assets.findFirst({
            where: { routeOrder: { not: null } },
            orderBy: { routeOrder: "desc" },
            select: { routeOrder: true }
        });
        const nextRouteOrder = last?.routeOrder ? last.routeOrder + 1 : 1;
        // ✅ Safe parsing for risk_rating → riskRating (Int?)
        let parsedRiskRating = null;
        if (risk_rating !== undefined && risk_rating !== null && risk_rating !== "") {
            const n = Number(risk_rating);
            if (!Number.isNaN(n) && n >= -2147483648 && n <= 2147483647) {
                parsedRiskRating = n;
            }
            else {
                parsedRiskRating = null; // ignore invalid/huge values
            }
        }
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
        await (0, Audit_1.logAudit)({
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
    }
    catch (err) {
        console.error("Add asset error:", err);
        res.status(500).json({ error: "Insert failed" });
    }
};
exports.addAsset = addAsset;
//# sourceMappingURL=create.js.map
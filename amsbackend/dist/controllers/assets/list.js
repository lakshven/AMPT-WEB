"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAssetLocations = exports.getAssets = void 0;
const axios_1 = __importDefault(require("axios"));
const client_1 = require("../../prisma/client");
function prismaClient() { return (0, client_1.getPrisma)(); }
const normalizeLocation_1 = require("../../utils/normalizeLocation");
const getAssets = async (req, res) => {
    try {
        const includeDeleted = req.query.includeDeleted === 'true';
        const search = req.query.search || "";
        const page = parseInt(req.query.page || "1", 10);
        const limit = parseInt(req.query.limit || "20", 10);
        const skip = (page - 1) * limit;
        const isSingle = req.user?.accountType === "single";
        const isCompany = req.user?.accountType === "company";
        const isAppAdmin = req.user?.role === "app_admin";
        // ROLE‑BASED FILTERING
        let where = {};
        if (isAppAdmin) {
            if (!includeDeleted)
                where.is_deleted = false;
        }
        else if (isSingle) {
            where.clientGroupId = null;
            if (!includeDeleted)
                where.is_deleted = false;
        }
        else if (isCompany) {
            if (!req.user?.clientGroupId) {
                res.status(403).json({ message: "User has no client group assigned" });
                return;
            }
            // ⭐ FIX: Show both old (null) and new (grouped) assets
            where.OR = [
                { clientGroupId: req.user.clientGroupId },
                { clientGroupId: null }
            ];
            if (!includeDeleted)
                where.is_deleted = false;
        }
        // ⭐ SEARCH FILTER (minimal, safe)
        const andConditions = [];
        if (search.trim() !== "") {
            andConditions.push({
                OR: [
                    { structure_no: { contains: search, mode: "insensitive" } },
                    { structure_name: { contains: search, mode: "insensitive" } },
                    { location: { contains: search, mode: "insensitive" } },
                    { carries: { contains: search, mode: "insensitive" } },
                    { material_type: { contains: search, mode: "insensitive" } },
                    { status: { contains: search, mode: "insensitive" } }
                ]
            });
        }
        // COLUMN-LEVEL FILTERING (Option A)
        // filters is a JSON string in req.query.filters
        // e.g. filters={"status":"Open","structure_type":"Bridge","current_date_logged_from":"2024-01-01"}
        const filtersRaw = req.query.filters;
        let filters = {};
        if (filtersRaw) {
            try {
                const parsed = JSON.parse(filtersRaw);
                if (parsed && typeof parsed === "object") {
                    filters = parsed;
                }
            }
            catch (e) {
                console.warn("Invalid filters JSON:", filtersRaw);
            }
        }
        // Fields that behave like dropdowns (exact match)
        const dropdownFields = new Set([
            "structure_type",
            "spans",
            "carries",
            "material_type",
            "work_item",
            "possible_consequence",
            "current_likelihood",
            "current_severity",
            "current_rating",
            "mitigation_likelihood",
            "mitigation_severity",
            "mitigation_rating",
            "status",
            "detailed_exam_years"
        ]);
        // Date fields that can have ranges
        const dateFields = new Set([
            "current_date_logged",
            "mitigation_completion",
            "last_exam",
            "next_exam"
        ]);
        // Apply filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value === undefined || value === null || String(value).trim() === "") {
                return;
            }
            // Handle date ranges: field_from / field_to
            if (key.endsWith("_from")) {
                const field = key.replace("_from", "");
                if (dateFields.has(field)) {
                    const existing = where[field] || {};
                    where[field] = {
                        ...existing,
                        gte: new Date(value)
                    };
                }
                return;
            }
            if (key.endsWith("_to")) {
                const field = key.replace("_to", "");
                if (dateFields.has(field)) {
                    const existing = where[field] || {};
                    where[field] = {
                        ...existing,
                        lte: new Date(value)
                    };
                }
                return;
            }
            // Dropdown fields → exact match
            if (dropdownFields.has(key)) {
                andConditions.push({
                    [key]: { equals: value }
                });
                return;
            }
            // Date field exact (rare, usually ranges)
            if (dateFields.has(key)) {
                andConditions.push({
                    [key]: { equals: new Date(value) }
                });
                return;
            }
            // Default: text contains (insensitive)
            andConditions.push({
                [key]: { contains: value, mode: "insensitive" }
            });
        });
        if (andConditions.length > 0) {
            // Preserve any existing where.AND if present
            if (where.AND) {
                where.AND = [...where.AND, ...andConditions];
            }
            else {
                where.AND = andConditions;
            }
        }
        // ⭐ SORTING SUPPORT
        const sortByRaw = req.query.sortBy || "id";
        const sortOrderRaw = req.query.sortOrder || "desc";
        const allowedSortFields = [
            "id",
            "elr",
            "structure_no",
            "structure_name",
            "location",
            "status",
            "current_rating",
            "mitigation_rating",
            "last_exam",
            "next_exam",
            "current_date_logged"
        ];
        const sortBy = allowedSortFields.includes(sortByRaw) ? sortByRaw : "id";
        const sortOrder = sortOrderRaw === "asc" ? "asc" : "desc";
        // ⭐ TOTAL COUNT (for pagination)
        const total = await prismaClient().assets.count({ where });
        const result = await prismaClient().assets.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            select: {
                id: true,
                elr: true,
                structure_no: true,
                mileage: true,
                structure_type: true,
                spans: true,
                structure_name: true,
                location: true,
                carries: true,
                material_type: true,
                work_item: true,
                possible_consequence: true,
                current_likelihood: true,
                current_severity: true,
                current_rating: true,
                current_date_logged: true,
                risk_mitigation_proposals: true,
                mitigation_likelihood: true,
                mitigation_severity: true,
                mitigation_rating: true,
                mitigation_completion: true,
                status: true,
                detailed_exam_years: true,
                last_exam: true,
                next_exam: true,
                // ⭐ UPDATED FILE FIELDS
                visual_report: true,
                detailed_report: true,
                assessment: true,
                records: true,
                riskRating: true,
                latitude: true,
                longitude: true,
                clientGroupId: true,
                is_deleted: true
            },
        });
        // Keep the same transformation logic (fixed default paths)
        const assets = result.map((a) => ({
            ...a,
            visual_report: a.visual_report,
            detailed_report: a.detailed_report,
            assessment: a.assessment,
            records: a.records,
            latitude: a.latitude ? parseFloat(String(a.latitude)) : null,
            longitude: a.longitude ? parseFloat(String(a.longitude)) : null
        }));
        // ⭐ return object, not array
        res.json({
            assets,
            total,
            page,
            limit
        });
    }
    catch (err) {
        console.error('Get assets error:', err);
        res.status(500).send('Error fetching assets');
    }
};
exports.getAssets = getAssets;
const getAssetLocations = async (req, res) => {
    try {
        const isSingle = req.user?.accountType === "single";
        const isCompany = req.user?.accountType === "company";
        const isAppAdmin = req.user?.role === "app_admin";
        let where = { is_deleted: false };
        if (isSingle) {
            where.clientGroupId = null;
        }
        else if (isCompany) {
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
        const assets = await Promise.all(rows.map(async (asset) => {
            // Only geocode if lat/lon missing and location is valid
            if ((!asset.latitude || !asset.longitude) && (asset.location && asset.location.trim() !== '')) {
                try {
                    const normalizedLocation = (0, normalizeLocation_1.normalizeLocation)(asset.location);
                    const geoRes = await axios_1.default.get('https://nominatim.openstreetmap.org/search', {
                        params: { q: normalizedLocation, format: 'json', limit: 1 },
                        headers: {
                            'User-Agent': 'AssetManager/1.0 (lakshmiangular8@gmail.com)' // required
                        }
                    });
                    console.log('Geocode response:', geoRes.data);
                    if (Array.isArray(geoRes.data) && geoRes.data.length > 0) {
                        const lat = geoRes.data[0].lat;
                        const lon = geoRes.data[0].lon;
                        asset.latitude = lat;
                        asset.longitude = lon;
                        await prismaClient().assets.update({
                            where: { id: asset.id },
                            data: {
                                latitude: lat,
                                longitude: lon
                            }
                        });
                    }
                    else {
                        console.warn(`No geocoding result for: ${asset.location}`);
                    }
                }
                catch (geoErr) {
                    console.error(`Geocoding failed for ${asset.location}:`, geoErr?.message ?? geoErr);
                }
            }
            return asset;
        }));
        res.json(assets);
    }
    catch (err) {
        console.error('Get asset locations error:', err);
        res.status(500).json({ error: 'Failed to fetch asset locations' });
    }
};
exports.getAssetLocations = getAssetLocations;
//# sourceMappingURL=list.js.map
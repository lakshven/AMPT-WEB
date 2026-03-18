"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveLocation = resolveLocation;
// src/services/locationResolver.ts
const coordinateUtils_1 = require("../utils/coordinateUtils");
const osgb36_1 = require("../utils/osgb36");
async function geocodeAddress(input) {
    return {
        latitude: null,
        longitude: null,
        description: "address lookup not implemented",
    };
}
function convertOSGB36(input) {
    const result = (0, osgb36_1.osgb36ToWgs84)(input);
    if (!result) {
        return {
            latitude: null,
            longitude: null,
            osgb36: input,
        };
    }
    return {
        latitude: result.lat,
        longitude: result.lon,
        osgb36: input,
    };
}
function convertEN(easting, northing) {
    const result = (0, osgb36_1.osgb36ToWgs84)({ easting, northing });
    if (!result) {
        return {
            latitude: null,
            longitude: null,
            easting,
            northing,
        };
    }
    return {
        latitude: result.lat,
        longitude: result.lon,
        easting,
        northing,
    };
}
async function lookupUPRN(input) {
    return {
        latitude: null,
        longitude: null,
        uprn: input,
    };
}
async function resolveW3W(input) {
    return {
        latitude: null,
        longitude: null,
        description: "what3words lookup not implemented",
    };
}
async function resolveReferenceCode(input) {
    return {
        latitude: null,
        longitude: null,
        referenceCode: input,
    };
}
async function resolveLocation(rawInput) {
    const type = detectType(rawInput);
    const result = await convertToLatLong(rawInput, type);
    const { getPrisma } = await Promise.resolve().then(() => __importStar(require("../prisma/client")));
    function prismaClient() { return getPrisma(); }
    const saved = await prismaClient().referenceLocation.create({
        data: {
            rawInput,
            type,
            referenceCode: result.referenceCode || null,
            latitude: result.latitude || null,
            longitude: result.longitude || null,
            easting: result.easting || null,
            northing: result.northing || null,
            osgb36: result.osgb36 || null,
            uprn: result.uprn || null,
            description: result.description || null,
            sourceSystem: "web_form",
        },
    });
    return {
        latitude: saved.latitude,
        longitude: saved.longitude,
    };
}
function detectType(input) {
    if (/^\d{1,3}\.\d+,\s*-?\d{1,3}\.\d+$/.test(input))
        return "latlng";
    if (/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(input))
        return "postcode";
    if (/^\d{6,12}$/.test(input))
        return "uprn";
    if (input.includes("."))
        return "what3words";
    if (/^\d{5,6},\s*\d{5,6}$/.test(input))
        return "easting_northing";
    if (/^[A-Z]{2}\s*\d{3,5}\s*\d{3,5}$/i.test(input))
        return "osgb36";
    if (/UK-[A-Z]{3}-/.test(input))
        return "refcode";
    return "address";
}
async function convertToLatLong(input, type) {
    switch (type) {
        case "latlng":
            const [lat, lng] = input.split(",");
            return { latitude: parseFloat(lat), longitude: parseFloat(lng) };
        case "postcode":
        case "address":
            return await geocodeAddress(input);
        case "osgb36":
            return convertOSGB36(input);
        case "easting_northing":
            const en = (0, coordinateUtils_1.detectNorthingEasting)(input);
            if (!en)
                return { latitude: null, longitude: null };
            return convertEN(en.easting, en.northing);
        case "uprn":
            return await lookupUPRN(input);
        case "what3words":
            return await resolveW3W(input);
        case "refcode":
            return await resolveReferenceCode(input);
        default:
            return { latitude: null, longitude: null };
    }
}
//# sourceMappingURL=locationResolver.js.map
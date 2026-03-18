// src/services/locationResolver.ts
import { detectNorthingEasting } from "../utils/coordinateUtils";
import { osgb36ToWgs84 } from "../utils/osgb36";

type ResolvedLocation = {
  latitude: number | null;
  longitude: number | null;
  referenceCode?: string | null;
  easting?: number | null;
  northing?: number | null;
  osgb36?: string | null;
  uprn?: string | null;
  description?: string | null;
};

async function geocodeAddress(input: string): Promise<ResolvedLocation> {
  return {
    latitude: null,
    longitude: null,
    description: "address lookup not implemented",
  };
}

function convertOSGB36(input: string): ResolvedLocation {
  const result = osgb36ToWgs84(input);

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

function convertEN(easting: number, northing: number): ResolvedLocation {
  const result = osgb36ToWgs84({ easting, northing });

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

async function lookupUPRN(input: string): Promise<ResolvedLocation> {
  return {
    latitude: null,
    longitude: null,
    uprn: input,
  };
}

async function resolveW3W(input: string): Promise<ResolvedLocation> {
  return {
    latitude: null,
    longitude: null,
    description: "what3words lookup not implemented",
  };
}

async function resolveReferenceCode(input: string): Promise<ResolvedLocation> {
  return {
    latitude: null,
    longitude: null,
    referenceCode: input,
  };
}

export async function resolveLocation(rawInput: string) {
  const type = detectType(rawInput);
  const result = await convertToLatLong(rawInput, type);
  const {getPrisma} = await import("../prisma/client");
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

function detectType(input: string) {
  if (/^\d{1,3}\.\d+,\s*-?\d{1,3}\.\d+$/.test(input)) return "latlng";
  if (/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i.test(input)) return "postcode";
  if (/^\d{6,12}$/.test(input)) return "uprn";
  if (input.includes(".")) return "what3words";
  if (/^\d{5,6},\s*\d{5,6}$/.test(input)) return "easting_northing";
  if (/^[A-Z]{2}\s*\d{3,5}\s*\d{3,5}$/i.test(input)) return "osgb36";
  if (/UK-[A-Z]{3}-/.test(input)) return "refcode";
  return "address";
}

async function convertToLatLong(input: string, type: string) {
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
      const en = detectNorthingEasting(input);
      if (!en) return { latitude: null, longitude: null };
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

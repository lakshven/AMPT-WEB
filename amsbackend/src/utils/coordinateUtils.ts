// src/utils/coordinateUtils.ts

export function detectNorthingEasting(
  input?: string | null
): { northing: number; easting: number } | null {
  if (!input || typeof input !== "string") return null;

  const match = input.match(/(\d{5,7})\s+(\d{5,7})/);
  if (!match) return null;

  const easting = Number(match[1]);
  const northing = Number(match[2]);

  if (isNaN(easting) || isNaN(northing)) return null;

  return { easting, northing };
}
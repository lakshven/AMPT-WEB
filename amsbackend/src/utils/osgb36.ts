// src/utils/osgb36.ts

// Converts OS Grid References (lettered or numeric) OR raw EN to WGS84 lat/lon
export function osgb36ToWgs84(
  input: string | { easting: number; northing: number }
) {
  let parsed: { easting: number; northing: number } | null = null;

  if (typeof input === "string") {
    parsed = parseGridRef(input);
  } else {
    parsed = input;
  }

  if (!parsed) return null;

  const { easting, northing } = parsed;

  const airy1830 = {
    a: 6377563.396,
    b: 6356256.909,
    F0: 0.9996012717,
    lat0: (49 * Math.PI) / 180,
    lon0: (-2 * Math.PI) / 180,
    N0: -100000,
    E0: 400000,
  };

  const { a, b, F0, lat0, lon0, N0, E0 } = airy1830;
  const e2 = (a * a - b * b) / (a * a);
  const n = (a - b) / (a + b);

  let lat = lat0;
  let M = 0;
  const N = northing;
  const E = easting;

  while (true) {
    lat = (N - N0 - M) / (a * F0) + lat;

    const Ma = (1 + n + (5 / 4) * n * n + (5 / 4) * n * n * n) * (lat - lat0);
    const Mb =
      (3 * n + 3 * n * n + (21 / 8) * n * n * n) *
      Math.sin(lat - lat0) *
      Math.cos(lat + lat0);
    const Mc =
      ((15 / 8) * n * n + (15 / 8) * n * n * n) *
      Math.sin(2 * (lat - lat0)) *
      Math.cos(2 * (lat + lat0));
    const Md =
      (35 / 24) *
      n *
      n *
      n *
      Math.sin(3 * (lat - lat0)) *
      Math.cos(3 * (lat + lat0));

    const Mnew = b * F0 * (Ma - Mb + Mc - Md);

    if (Math.abs(N - N0 - Mnew) < 0.00001) {
      M = Mnew;
      break;
    }

    M = Mnew;
  }

  const sinLat = Math.sin(lat);
  const cosLat = Math.cos(lat);
  const nu = (a * F0) / Math.sqrt(1 - e2 * sinLat * sinLat);
  const rho =
    (a * F0 * (1 - e2)) / Math.pow(1 - e2 * sinLat * sinLat, 1.5);
  const eta2 = nu / rho - 1;

  const tanLat = Math.tan(lat);
  const secLat = 1 / cosLat;

  const dE = E - E0;

  const latOs =
    lat -
    (tanLat / (2 * rho * nu)) * dE * dE +
    (tanLat / (24 * rho * Math.pow(nu, 3))) *
      (5 + 3 * tanLat * tanLat + eta2 - 9 * tanLat * tanLat * eta2) *
      Math.pow(dE, 4) -
    (tanLat / (720 * rho * Math.pow(nu, 5))) *
      (61 + 90 * tanLat * tanLat + 45 * Math.pow(tanLat, 4)) *
      Math.pow(dE, 6);

  const lonOs =
    lon0 +
    (secLat / nu) * dE -
    (secLat / (6 * Math.pow(nu, 3))) *
      (nu / rho + 2 * tanLat * tanLat) *
      Math.pow(dE, 2) +
    (secLat / (120 * Math.pow(nu, 5))) *
      (5 + 28 * tanLat * tanLat + 24 * Math.pow(tanLat, 4)) *
      Math.pow(dE, 4);

  const { latitude, longitude } = helmertTransform(latOs, lonOs);

  return {
    lat: latitude,
    lon: longitude,
  };
}

// Parses both lettered and numeric OS grid references
function parseGridRef(input: string) {
  const trimmed = input.trim().toUpperCase();

  // 1) Numeric pair: "520412 167981"
  const numericPair = /^(\d{3,6})\s+(\d{3,6})$/.exec(trimmed);
  if (numericPair) {
    return {
      easting: parseInt(numericPair[1], 10),
      northing: parseInt(numericPair[2], 10),
    };
  }

  // 2) Pure numeric: "520412167981"
  const clean = trimmed.replace(/\s+/g, "");
  if (/^\d{6,10}$/.test(clean)) {
    const half = clean.length / 2;
    return {
      easting: parseInt(clean.slice(0, half), 10),
      northing: parseInt(clean.slice(half), 10),
    };
  }

  // 3) Lettered: "TQ1780069000", "TQ178690", "TQ 17800 69000"
  const match = /^([A-Z]{2})(\d{2,10})$/.exec(clean);
  if (!match) return null;

  const letters = match[1];
  const digits = match[2];

  const pad = digits.length / 2;

  const e = parseInt(digits.slice(0, pad).padEnd(5, "0"), 10);
  const n = parseInt(digits.slice(pad).padEnd(5, "0"), 10);

  const l1 = letters.charCodeAt(0) - 65;
  const l2 = letters.charCodeAt(1) - 65;

  const row = 19 - Math.floor(l1 / 5) * 5 - Math.floor(l2 / 5);
  const col = (l1 % 5) * 5 + (l2 % 5);

  return {
    easting: col * 100000 + e,
    northing: row * 100000 + n,
  };
}

// Helmert transform OSGB36 → WGS84
function helmertTransform(lat: number, lon: number) {
  const H = 0;
  const a = 6377563.396;
  const b = 6356256.909;
  const e2 = (a * a - b * b) / (a * a);

  const sinLat = Math.sin(lat);
  const cosLat = Math.cos(lat);
  const sinLon = Math.sin(lon);
  const cosLon = Math.cos(lon);

  const nu = a / Math.sqrt(1 - e2 * sinLat * sinLat);

  const x1 = (nu + H) * cosLat * cosLon;
  const y1 = (nu + H) * cosLat * sinLon;
  const z1 = ((1 - e2) * nu + H) * sinLat;

  const tx = 446.448;
  const ty = -125.157;
  const tz = 542.06;
  const rx = (0.1502 / 3600) * (Math.PI / 180);
  const ry = (0.247 / 3600) * (Math.PI / 180);
  const rz = (0.8421 / 3600) * (Math.PI / 180);
  const s = 20.4894 * 1e-6;

  const x2 = tx + (1 + s) * x1 + -rz * y1 + ry * z1;
  const y2 = ty + rz * x1 + (1 + s) * y1 + -rx * z1;
  const z2 = tz + -ry * x1 + rx * y1 + (1 + s) * z1;

  const a2 = 6378137.0;
  const b2 = 6356752.3141;
  const e22 = (a2 * a2 - b2 * b2) / (a2 * a2);

  const p = Math.sqrt(x2 * x2 + y2 * y2);
  let latWgs = Math.atan2(z2, p * (1 - e22));
  let latPrev;

  do {
    latPrev = latWgs;
    const nu2 = a2 / Math.sqrt(1 - e22 * Math.sin(latWgs) * Math.sin(latWgs));
    latWgs = Math.atan2(z2 + e22 * nu2 * Math.sin(latWgs), p);
  } while (Math.abs(latWgs - latPrev) > 1e-10);

  const lonWgs = Math.atan2(y2, x2);

  return {
    latitude: latWgs * (180 / Math.PI),
    longitude: lonWgs * (180 / Math.PI),
  };
}
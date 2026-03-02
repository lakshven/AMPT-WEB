"use strict";
// src/utils/coordinateUtils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectNorthingEasting = detectNorthingEasting;
function detectNorthingEasting(input) {
    if (!input || typeof input !== "string")
        return null;
    const match = input.match(/(\d{5,7})\s+(\d{5,7})/);
    if (!match)
        return null;
    const easting = Number(match[1]);
    const northing = Number(match[2]);
    if (isNaN(easting) || isNaN(northing))
        return null;
    return { easting, northing };
}
//# sourceMappingURL=coordinateUtils.js.map
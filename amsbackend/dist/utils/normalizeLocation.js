"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeLocation = normalizeLocation;
const axios_1 = __importDefault(require("axios"));
const didyoumean_1 = __importDefault(require("didyoumean"));
let countries = [];
async function loadCountries() {
    if (countries.length === 0) {
        try {
            const res = await axios_1.default.get("https://restcountries.com/v3.1/all?fields=name");
            countries = res.data.map((c) => c.name.common);
        }
        catch {
            countries = [];
        }
    }
}
async function normalizeLocation(loc) {
    await loadCountries();
    if (!loc)
        return "";
    // Basic cleanup only
    let cleaned = loc
        .trim()
        .replace(/\s+/g, " ")
        .replace(/\s*,\s*/g, ", ")
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "");
    // Split by commas (preserve structure)
    const parts = cleaned.split(",").map((p) => p.trim());
    // Only correct the LAST part if it's a country
    const last = parts[parts.length - 1];
    const suggestion = (0, didyoumean_1.default)(last, countries);
    if (suggestion) {
        parts[parts.length - 1] = suggestion;
    }
    return parts.join(", ");
}
//# sourceMappingURL=normalizeLocation.js.map
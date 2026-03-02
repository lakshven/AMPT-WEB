import axios from "axios";
import didYouMean from "didyoumean";

let countries: string[] = [];

async function loadCountries(): Promise<void> {
  if (countries.length === 0) {
    try {
      const res = await axios.get("https://restcountries.com/v3.1/all?fields=name");
      countries = res.data.map((c: any) => c.name.common);
    } catch {
      countries = [];
    }
  }
}

export async function normalizeLocation(loc: string | null | undefined): Promise<string> {
  await loadCountries();

  if (!loc) return "";

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
  const suggestion = didYouMean(last, countries);

  if (suggestion) {
    parts[parts.length - 1] = suggestion;
  }

  return parts.join(", ");
}
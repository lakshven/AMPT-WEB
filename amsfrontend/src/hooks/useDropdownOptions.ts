import { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { DropdownOptions } from "../types/dropdowns";

export function useDropdownOptions() {
  const [options, setOptions] = useState<DropdownOptions>({});

  useEffect(() => {
    axiosInstance
      .get("/dropdown/all")   // ⭐ Correct backend route
      .then((res) => {
        const data = res.data || {};
      const sorted: DropdownOptions = {};

        Object.keys(data).forEach((key) => {
          const arr = data[key];

          if (Array.isArray(arr)) {
            sorted[key] = [...arr].sort((a, b) => {
              const na = Number(a);
              const nb = Number(b);

              // ⭐ Numeric sort (1 → 10)
              if (!isNaN(na) && !isNaN(nb)) return na - nb;

              // ⭐ Alphabetical fallback
              return String(a).localeCompare(String(b));
            });
          }
        });


        setOptions(sorted);
      })
      .catch((err) => {
        console.error("Error fetching dropdown options:", err);
      });
  }, []);

  return options;
}

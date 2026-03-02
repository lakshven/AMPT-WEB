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

        setOptions(data);
      })
      .catch((err) => {
        console.error("Error fetching dropdown options:", err);
      });
  }, []);

  return options;
}
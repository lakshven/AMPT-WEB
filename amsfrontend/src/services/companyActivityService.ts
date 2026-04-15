import axiosInstance from "../utils/axiosInstance";

// ----------------------
// Filter Types
// ----------------------

export interface ActivityLogFilters {
  performedBy?: string | null;
  action?: string | null;
  from?: string | null;
  to?: string | null;
  sort?: string;
  order?: "asc" | "desc";
  page?: number | null;
  limit?: number | null;
}

// ----------------------
// Response Types
// ----------------------

export interface ActivityLogItem {
  id: number;
  performedBy: string;
  action: string;
  timestamp: string;
  details?: string | null;
}

export interface ActivityLogResponse {
  data: ActivityLogItem[];   // ⭐ MUST be "data"
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ----------------------
// API Call
// ----------------------

export const getCompanyActivityLogs = async (
  filters: ActivityLogFilters
): Promise<ActivityLogResponse> => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      params.append(key, String(value));
    }
  });

  const res = await axiosInstance.get(
    `/company-admin/activity-logs?${params.toString()}`
  );

  return res.data; // ⭐ backend returns { data, pagination }
};
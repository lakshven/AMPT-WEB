import axiosInstance from "../utils/axiosInstance";

// ----------------------
// Response Types
// ----------------------

export interface CompanyStatsResponse {
  totalUsers: number;
  totalActivity: number;
  activeUsers: number;
}

export interface CompanyAlert {
  id: number;
  type?: string | null;
  message: string;
  severity?: string | null;
  createdAt: string;
}

// ----------------------
// API Calls
// ----------------------

export const getCompanyStats = async (): Promise<CompanyStatsResponse> => {
  const res = await axiosInstance.get("/company-admin/stats");
  return res.data;
};

export const getCompanyAlerts = async (): Promise<CompanyAlert[]> => {
  const res = await axiosInstance.get("/company-admin/alerts");
  return res.data;
};
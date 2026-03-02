import axiosInstance from "../utils/axiosInstance";

export interface CompanyAnalyticsResponse {
  categoryUsage: { category: string | null; count: number | null }[];
  hourlyActivity: { hour: string | null; count: number | null }[];
  weeklyActivity: { dayOfWeek: number | null; count: number | null }[];
  topUsers: { userName: string | null; totalActions: number | null }[];
}

export const getCompanyAnalytics = async (): Promise<CompanyAnalyticsResponse> => {
  const res = await axiosInstance.get("/company-admin/analytics");
  return res.data;
};